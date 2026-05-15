import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

/**
 * DB path 解析顺序:
 *   1. process.env.DATABASE_PATH (production / Vercel 必填, e.g. /tmp/life-os.db)
 *   2. ./data/life-os.db (本地 dev 默认)
 *
 * Vercel filesystem 是 read-only 除了 /tmp, 必须设 DATABASE_PATH=/tmp/life-os.db
 * 同时 mkdirSync 必须放到 getDb() lazy 调用里, 不能在 module load 阶段做.
 */
function resolveDbPath(): string {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  return path.join(process.cwd(), 'data', 'life-os.db');
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dbPath = resolveDbPath();
  const dbDir = path.dirname(dbPath);

  // Lazy mkdir — 只在第一次 getDb 时创建目录
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  } catch (e) {
    // Vercel 不可写目录会到这, 但 /tmp 应该 always 可写. 抛出真错误便于排查
    throw new Error(`Cannot create DB dir ${dbDir}: ${(e as Error).message}`);
  }

  // Vercel /tmp cold start: 如果目标 DB 不存在, 从 seed 文件复制 (含 sample briefs)
  // 本地 dev: seed 文件不影响 (data/life-os.db 已存在的情况下不会覆盖)
  if (!fs.existsSync(dbPath)) {
    const seedPath = path.join(process.cwd(), 'scripts', 'seed-data', 'life-os-seed.db');
    if (fs.existsSync(seedPath)) {
      try {
        fs.copyFileSync(seedPath, dbPath);
        console.log(`[DB] Seeded from ${seedPath} → ${dbPath}`);
      } catch (e) {
        console.warn(`[DB] Seed copy failed: ${(e as Error).message}, starting empty`);
      }
    }
  }

  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  // ===== Initial schema (idempotent) =====
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      birth_date TEXT,
      gender TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      ai_response TEXT,
      model_used TEXT,
      tokens_input INTEGER,
      tokens_output INTEGER,
      framework TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);
    CREATE INDEX IF NOT EXISTS idx_decisions_created_at ON decisions(created_at);
  `);

  // ===== Migration v2: user_uid (替换 birth_date+gender 复合键) =====
  // 修复 doctrine 1.2 跨用户污染漏洞 — 不能再用 birth_date+gender 当用户 ID
  const userColumns = _db.pragma('table_info(users)') as Array<{ name: string }>;
  const hasUserUid = userColumns.some((c) => c.name === 'user_uid');

  if (!hasUserUid) {
    _db.exec(`ALTER TABLE users ADD COLUMN user_uid TEXT;`);
    // 为已有用户(若有)生成 UUID
    const orphanUsers = _db
      .prepare(`SELECT id FROM users WHERE user_uid IS NULL OR user_uid = ''`)
      .all() as Array<{ id: number }>;
    const upd = _db.prepare(`UPDATE users SET user_uid = ? WHERE id = ?`);
    for (const u of orphanUsers) {
      upd.run(crypto.randomUUID(), u.id);
    }
    _db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uid ON users(user_uid);`);
    console.log(`[DB Migration v2] Added user_uid, migrated ${orphanUsers.length} legacy users`);
  }

  // ===== Memory Layer 0: user_core_state (硬锚点, prompt 第 0 行 prepend) =====
  // 严重永久 fact: "我不吃午餐", "我是独生女", "我老婆反对接父母同住" 等
  _db.exec(`
    CREATE TABLE IF NOT EXISTS user_core_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      kind TEXT NOT NULL,                 -- 'family_structure' / 'eating_pattern' / 'financial_constraint' / etc
      fact_text TEXT NOT NULL,            -- 注入 prompt 的人话
      violation_pattern TEXT,             -- regex 用于 Inspector C16 detect 违反
      severity TEXT DEFAULT 'hard' CHECK(severity IN ('hard','soft')),
      status TEXT DEFAULT 'active' CHECK(status IN ('active','deprecated','user_overrode')),
      source TEXT DEFAULT 'llm_extract' CHECK(source IN ('admin','user_self','llm_extract')),
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_core_state_user ON user_core_state(user_id, status);
  `);

  // ===== Memory Layer 1: relationship_memory_cards (RMC, 中等结构化) =====
  // 5 类卡: factual / boundary / episodic / relational / psych_signal
  _db.exec(`
    CREATE TABLE IF NOT EXISTS relationship_memory_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      card_type TEXT NOT NULL CHECK(card_type IN ('factual','boundary','episodic','relational','psych_signal')),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0.7 CHECK(confidence >= 0.0 AND confidence <= 1.0),
      source TEXT NOT NULL DEFAULT 'llm_extract',
      source_decision_id INTEGER,         -- 来自哪次决策对话(如适用)
      tags TEXT,                          -- JSON array of tags
      last_verified_at INTEGER DEFAULT (unixepoch()),
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (source_decision_id) REFERENCES decisions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_rmc_user_type ON relationship_memory_cards(user_id, card_type);
    CREATE INDEX IF NOT EXISTS idx_rmc_confidence ON relationship_memory_cards(user_id, confidence DESC);
  `);

  // ===== Memory Layer 2: relationship_open_loops (待跟进事件) =====
  _db.exec(`
    CREATE TABLE IF NOT EXISTS relationship_open_loops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      kind TEXT,                           -- 'follow_up' / 'review' / 'check_in' / 'commitment'
      status TEXT DEFAULT 'open' CHECK(status IN ('open','resolved','cancelled')),
      due_at INTEGER,
      source_decision_id INTEGER,
      created_at INTEGER DEFAULT (unixepoch()),
      resolved_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (source_decision_id) REFERENCES decisions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_open_loops_user ON relationship_open_loops(user_id, status);
  `);

  // ===== Memory Layer 3: user_brain (软记忆叙事, per-user) =====
  // Sivon 用 Cloudflare R2 存 markdown. Life OS V0 用 SQLite text 字段简化.
  // 后续 V1+ 可迁到 R2 或独立文件
  _db.exec(`
    CREATE TABLE IF NOT EXISTS user_brain (
      user_id INTEGER PRIMARY KEY,
      content TEXT,                        -- markdown 内容
      version INTEGER DEFAULT 1,
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // ===== Email infra (Day 15) =====
  // users 表加 email 相关字段 (本质迁移, ADD COLUMN safe)
  const usersExtra = _db.pragma('table_info(users)') as Array<{ name: string }>;
  const userColNames = new Set(usersExtra.map((c) => c.name));
  if (!userColNames.has('email')) {
    _db.exec(`ALTER TABLE users ADD COLUMN email TEXT;`);
  }
  if (!userColNames.has('email_verified_at')) {
    _db.exec(`ALTER TABLE users ADD COLUMN email_verified_at INTEGER;`);
  }
  if (!userColNames.has('email_preferences')) {
    // JSON: { sunday_review: true, outcome_due: true, welcome: true, commitment: true }
    _db.exec(`ALTER TABLE users ADD COLUMN email_preferences TEXT DEFAULT '{"sunday_review":true,"outcome_due":true,"welcome":true,"commitment":true}';`);
  }

  // emails_sent 审计表
  _db.exec(`
    CREATE TABLE IF NOT EXISTS emails_sent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      email_type TEXT NOT NULL,           -- 'welcome' / 'sunday_review' / 'outcome_due' / 'commitment_reminder'
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      body_text TEXT,
      body_html TEXT,
      send_mode TEXT DEFAULT 'dry-run' CHECK(send_mode IN ('dry-run','smtp','resend')),
      status TEXT DEFAULT 'queued' CHECK(status IN ('queued','sent','failed','dry-run')),
      error_message TEXT,
      provider_message_id TEXT,
      opened_at INTEGER,
      clicked_at INTEGER,
      sent_at INTEGER,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_emails_user ON emails_sent(user_id, sent_at DESC);
    CREATE INDEX IF NOT EXISTS idx_emails_type ON emails_sent(email_type, status);
  `);

  // ===== Outcome Ledger — V1 续费证明 (Layer 4: Decision Outcome Tracking) =====
  // 每个 decision 创建 3 个 checkpoint (30/90/365 day), 到期 surface 给用户回答
  _db.exec(`
    CREATE TABLE IF NOT EXISTS decision_outcomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      decision_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      checkpoint_days INTEGER NOT NULL CHECK(checkpoint_days IN (30, 90, 365)),
      due_at INTEGER NOT NULL,            -- decision.created_at + N days
      asked_at INTEGER,                    -- 用户被问的时间 (NULL = 未问)
      user_response TEXT,                  -- 用户的回答
      outcome_judgment TEXT CHECK(outcome_judgment IN ('as-expected', 'better', 'worse', 'mixed', 'too-early', 'cancelled')),
      ai_reflection TEXT,                  -- AI 综合 reflection
      pattern_insight TEXT,                -- 跨决策 pattern (V2)
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (decision_id) REFERENCES decisions(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(decision_id, checkpoint_days)
    );

    CREATE INDEX IF NOT EXISTS idx_outcomes_user_due ON decision_outcomes(user_id, due_at, asked_at);
    CREATE INDEX IF NOT EXISTS idx_outcomes_decision ON decision_outcomes(decision_id);
  `);

  // ===== Sunday Review — V1 付费感峰值 (Layer 2: Weekly Pattern) =====
  // 每周日生成 800-1200 字 pattern recognition
  // 回答 3 问: 反复提到什么 / 没说出口的张力 / 下周注意什么
  _db.exec(`
    CREATE TABLE IF NOT EXISTS sunday_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      week_start INTEGER NOT NULL,         -- 这周周一 unix timestamp (本地 00:00)
      week_end INTEGER NOT NULL,           -- 这周周日 23:59 unix timestamp
      content TEXT NOT NULL,                -- 完整 markdown
      pulse_count INTEGER DEFAULT 0,
      decision_count INTEGER DEFAULT 0,
      char_count INTEGER DEFAULT 0,
      tokens_used INTEGER,
      read_at INTEGER,                     -- 用户首次阅读时间 (NULL = 未读)
      generated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, week_start)          -- 每周每用户唯一
    );

    CREATE INDEX IF NOT EXISTS idx_review_user ON sunday_reviews(user_id, week_start DESC);
  `);

  // ===== Daily Pulse — V1 lock-in 核心 (doctrine_pulse_is_signal_not_diary) =====
  // 每条 Pulse 是 5 类轮换问题之一的答, 不是日记
  _db.exec(`
    CREATE TABLE IF NOT EXISTS daily_pulses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question_id TEXT NOT NULL,        -- 'sinking' / 'avoidance' / 'drainage' / 'hidden-big' / 'body-signal'
      content TEXT NOT NULL,             -- 用户原话 5-200 字
      tags TEXT,                          -- JSON array of 10 类标签
      ai_response TEXT,                   -- 30-80 字 思考伴侣回应
      rmc_episodic_id INTEGER,            -- 关联到 RMC episodic 卡
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (rmc_episodic_id) REFERENCES relationship_memory_cards(id)
    );

    CREATE INDEX IF NOT EXISTS idx_pulses_user ON daily_pulses(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_pulses_question ON daily_pulses(user_id, question_id);
  `);

  // ===== Self-Commitments (Sivon doctrine 1.6) =====
  // AI 嘴上承诺必须写表, 避免"信任损耗"
  _db.exec(`
    CREATE TABLE IF NOT EXISTS life_os_commitments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      commitment_text TEXT NOT NULL,
      commitment_kind TEXT,                  -- 'follow_up' / 'review' / 'check_in' / 'reminder'
      promised_at INTEGER DEFAULT (unixepoch()),
      due_at INTEGER,                        -- 何时该兑现 (NULL = 无明确期限)
      due_phrase TEXT,                       -- 用户原话里的时间短语 ("30 天后" "下次见面")
      source_decision_id INTEGER,
      status TEXT DEFAULT 'pending'
        CHECK(status IN ('pending','fulfilled','overdue','cancelled','superseded')),
      fulfilled_at INTEGER,
      apology_pushed_at INTEGER,             -- 道歉路径已触发 (避免双道歉)
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (source_decision_id) REFERENCES decisions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_commit_user_status ON life_os_commitments(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_commit_due ON life_os_commitments(due_at, status);
  `);

  // ===== Real Grader 自动测试结果 =====
  _db.exec(`
    CREATE TABLE IF NOT EXISTS grader_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_label TEXT,
      persona_count INTEGER,
      total_score REAL,
      avg_score REAL,
      mode TEXT CHECK(mode IN ('synthetic','real_chat')),
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS grader_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER NOT NULL,
      persona TEXT,
      decision_question TEXT,
      ai_response TEXT,
      dimension TEXT NOT NULL,             -- 'no_chicken_soup' / 'quantified_costs' / ...
      score REAL NOT NULL CHECK(score >= 0 AND score <= 5),
      reasoning TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (run_id) REFERENCES grader_runs(id)
    );

    CREATE INDEX IF NOT EXISTS idx_grader_scores_run ON grader_scores(run_id);
    CREATE INDEX IF NOT EXISTS idx_grader_scores_dim ON grader_scores(dimension);
  `);

  // ===== Inspector audit log =====
  _db.exec(`
    CREATE TABLE IF NOT EXISTS inspector_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      decision_id INTEGER,
      check_code TEXT NOT NULL,            -- 'C1' / 'C2' / ... / 'C15'
      severity TEXT CHECK(severity IN ('low','high','p0')),
      action TEXT CHECK(action IN ('shadow','flag','block')),
      matched_text TEXT,
      detail TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (decision_id) REFERENCES decisions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_audit_user ON inspector_audit(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_check ON inspector_audit(check_code);
  `);

  // Migration: framework column on decisions (extracted from model_used)
  const decisionColumns = _db.pragma('table_info(decisions)') as Array<{ name: string }>;
  const hasFramework = decisionColumns.some((c) => c.name === 'framework');
  if (!hasFramework) {
    _db.exec(`ALTER TABLE decisions ADD COLUMN framework TEXT;`);
    // 从老的 model_used 字段反向解析框架名 (格式: provider/model/framework)
    _db.exec(`
      UPDATE decisions
      SET framework = CASE
        WHEN model_used LIKE '%/%/%' THEN substr(model_used, instr(model_used, '/') + instr(substr(model_used, instr(model_used, '/') + 1), '/') + 1)
        ELSE 'general'
      END
      WHERE framework IS NULL;
    `);
    console.log('[DB Migration] Added framework column to decisions');
  }

  // ===== Migration v17: decision_briefs table (Day 17 publication-grade output) =====
  // 跟 decisions 表分开 — decisions 是单 LLM call 老路径, decision_briefs 是新两 pass 管线
  _db.exec(`
    CREATE TABLE IF NOT EXISTS decision_briefs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      decision_id INTEGER,             -- 可选: 关联 decisions 表 (如果同时双写)
      brief_number TEXT NOT NULL UNIQUE,
      topic TEXT NOT NULL,
      framework TEXT NOT NULL,
      brief_json TEXT NOT NULL,        -- DecisionBrief 序列化 JSON (full)
      rendered_markdown TEXT,          -- 渲染好的 markdown (BriefRenderer 也可以从 JSON 重渲, 这里缓存一份)
      total_char_count INTEGER,
      editor_pass_used INTEGER DEFAULT 0,
      tokens_used INTEGER,
      duration_analyst_ms INTEGER,
      duration_editor_ms INTEGER,
      authored_at INTEGER DEFAULT (unixepoch()),
      is_sample INTEGER DEFAULT 0,     -- 1 = 公开 sample brief (用于 /sample-brief 页)
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (decision_id) REFERENCES decisions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_briefs_user ON decision_briefs(user_id, authored_at DESC);
    CREATE INDEX IF NOT EXISTS idx_briefs_sample ON decision_briefs(is_sample, authored_at DESC);
    CREATE INDEX IF NOT EXISTS idx_briefs_number ON decision_briefs(brief_number);
  `);

  // ===== Migration v22: invites table (Day 22 — invite-only beta) =====
  _db.exec(`
    CREATE TABLE IF NOT EXISTS invites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      recipient_name TEXT,
      recipient_email TEXT,
      invited_by TEXT DEFAULT 'founder',
      note TEXT,
      redeemed_by_user_id INTEGER,
      redeemed_at INTEGER,
      revoked_at INTEGER,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (redeemed_by_user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
    CREATE INDEX IF NOT EXISTS idx_invites_redeemed ON invites(redeemed_by_user_id);
    CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(redeemed_at, revoked_at);
  `);

  // ============================================================
  // Letters (Phase 4a) — 用户跟 KEY 的日常通信
  // ============================================================
  _db.exec(`
    CREATE TABLE IF NOT EXISTS letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,

      -- 用户写的来信
      user_content TEXT NOT NULL,
      user_char_count INTEGER,

      -- KEY 回的信 (null = pending)
      reply_content TEXT,
      reply_char_count INTEGER,
      reply_authored_at INTEGER,

      -- Metadata
      letter_number TEXT NOT NULL UNIQUE,        -- LE-YYYYMMDD-NNN
      status TEXT NOT NULL DEFAULT 'pending',     -- pending / replied / failed
      failure_reason TEXT,

      -- Pipeline metadata
      tokens_used INTEGER,
      model_used TEXT,
      duration_ms INTEGER,

      -- 4a 留接口给 4b canon retrieval
      canon_quotes_used TEXT,                     -- JSON array of canon quote IDs
      brain_facts_used TEXT,                      -- JSON array of brain fact IDs
      framework_matched TEXT,                     -- 匹配的 framework / sub-framework

      authored_at INTEGER DEFAULT (unixepoch()),

      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_letters_user ON letters(user_id, authored_at DESC);
    CREATE INDEX IF NOT EXISTS idx_letters_status ON letters(status);
    CREATE INDEX IF NOT EXISTS idx_letters_number ON letters(letter_number);
  `);

  // Migration: users.access_status (Day 22)
  const usersColsV22 = _db.pragma('table_info(users)') as Array<{ name: string }>;
  const hasAccessStatus = usersColsV22.some((c) => c.name === 'access_status');
  if (!hasAccessStatus) {
    _db.exec(`ALTER TABLE users ADD COLUMN access_status TEXT DEFAULT 'guest';`);
    console.log('[DB Migration v22] Added users.access_status');
  }

  // ============================================================
  // JOB-001 · Onboarding intake answers + onboarding completion flag
  // ============================================================
  _db.exec(`
    CREATE TABLE IF NOT EXISTS intake_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      step TEXT NOT NULL,                 -- 'identity' / 'life-stage' / 'values' / 'pressing-decisions' / 'expectations'
      answers TEXT NOT NULL,              -- JSON object · 各步定义见 lib/intake/types.ts
      version INTEGER DEFAULT 1,           -- 同一步多次填可以递增 (V0 单版本)
      completed_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, step)                -- 每用户每步一份, REPLACE 覆盖
    );

    CREATE INDEX IF NOT EXISTS idx_intake_user ON intake_answers(user_id);
  `);

  // users.onboarding_completed_at — 5 步全做完时 set, 用于路由 gate
  const usersColsJob001 = _db.pragma('table_info(users)') as Array<{ name: string }>;
  if (!usersColsJob001.some((c) => c.name === 'onboarding_completed_at')) {
    _db.exec(`ALTER TABLE users ADD COLUMN onboarding_completed_at INTEGER;`);
    console.log('[DB Migration JOB-001] Added users.onboarding_completed_at');
  }

  // ============================================================
  // JOB-018 · brain_insights · AI 在用户身上看见的 pattern
  // 借鉴 Sivon "Linda 看见自己 v0 spec" — grounded 硬约束.
  // ============================================================
  _db.exec(`
    CREATE TABLE IF NOT EXISTS brain_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,

      -- pattern 类型 (6 类)
      pattern_type TEXT NOT NULL CHECK(pattern_type IN (
        'topic_frequency',     -- 反复出现的主题 (例: 6 次提到母亲)
        'temporal',            -- 时间规律 (例: 凌晨多焦虑, 周日晚多重大决策)
        'avoidance',           -- 回避模式 (例: 一聊职业转身就转话题)
        'role_strain',         -- 角色张力 (例: 母亲/女儿/职业人三重身份冲突)
        'growth_marker',       -- 成长信号 (例: 从"我必须" → "我可以选择")
        'relation_defensive'   -- 关系防御 (例: 提到 X 时永远先自责)
      )),

      -- 显示文本 (生成时 LLM 写, 后续用户可改)
      title TEXT NOT NULL,
      description TEXT NOT NULL,         -- AI 描述这个 pattern · 200-400 字

      -- Grounded 证据 (Inspector C30 硬约束: 至少 3 条 evidence)
      evidence_pulse_ids TEXT,           -- JSON array of daily_pulses.id
      evidence_decision_ids TEXT,        -- JSON array of decisions.id
      evidence_outcome_ids TEXT,         -- JSON array of decision_outcomes.id
      evidence_rmc_ids TEXT,             -- JSON array of relationship_memory_cards.id
      evidence_count INTEGER NOT NULL DEFAULT 0,  -- 总证据数 (拒收 <3 的 insight)

      -- 状态 + 用户操作
      status TEXT NOT NULL DEFAULT 'unreviewed'
        CHECK(status IN ('unreviewed','confirmed','corrected','archived','rejected')),
      user_correction TEXT,              -- 用户纠正版本 (correction 时)
      confidence REAL DEFAULT 0.7 CHECK(confidence >= 0 AND confidence <= 1),

      -- Pipeline metadata
      detected_at INTEGER DEFAULT (unixepoch()),
      reviewed_at INTEGER,
      detection_run_id INTEGER,          -- 哪次 weekly run 产出的

      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_insights_user_status
      ON brain_insights(user_id, status, detected_at DESC);
    CREATE INDEX IF NOT EXISTS idx_insights_type
      ON brain_insights(user_id, pattern_type);
  `);

  // ============================================================
  // JOB-027 · AI Native Test v3 · 跑结果存储
  // ============================================================
  _db.exec(`
    CREATE TABLE IF NOT EXISTS test_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT,                              -- 'pre-launch' / 'daily-fleet' / 'manual'
      mode TEXT CHECK(mode IN ('layer_a_only','layer_ac','layer_abc')) NOT NULL,
      total_cases INTEGER NOT NULL,
      passed_a INTEGER DEFAULT 0,
      passed_c INTEGER DEFAULT 0,
      passed_b INTEGER DEFAULT 0,
      tokens_used INTEGER DEFAULT 0,
      duration_ms INTEGER,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS test_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER NOT NULL,
      scenario_id TEXT NOT NULL,           -- e.g. "F01-T1-decision"
      persona_id TEXT NOT NULL,
      trap_type TEXT NOT NULL,
      stage TEXT NOT NULL,
      ai_output TEXT,                       -- 完整 AI 输出 (供 dashboard 看)
      layer_a_pass INTEGER NOT NULL,        -- 0/1
      layer_a_fails TEXT,                   -- JSON array
      layer_c_pass INTEGER,                 -- 0/1 · NULL = 没跑
      layer_c_focus_avg REAL,
      layer_c_overall_avg REAL,
      layer_c_scores TEXT,                  -- JSON
      layer_c_comment TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (run_id) REFERENCES test_runs(id)
    );

    CREATE INDEX IF NOT EXISTS idx_test_results_run ON test_results(run_id);
    CREATE INDEX IF NOT EXISTS idx_test_results_scenario ON test_results(scenario_id);
  `);

  // 每次 weekly run 的 audit
  _db.exec(`
    CREATE TABLE IF NOT EXISTS brain_insight_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      week_start INTEGER NOT NULL,
      insights_generated INTEGER DEFAULT 0,
      insights_passed_c30 INTEGER DEFAULT 0,   -- 通过 evidence_count >= 3 守护
      pulses_seen INTEGER DEFAULT 0,
      decisions_seen INTEGER DEFAULT 0,
      tokens_used INTEGER,
      duration_ms INTEGER,
      error TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, week_start)
    );

    CREATE INDEX IF NOT EXISTS idx_insight_runs_user ON brain_insight_runs(user_id, created_at DESC);
  `);

  return _db;
}

// ============================================================================
// Decision Brief storage helpers (Day 17)
// ============================================================================
export function saveBrief(args: {
  userId: number;
  decisionId?: number;
  briefJson: string;          // 已 JSON.stringify 的 DecisionBrief
  briefNumber: string;
  topic: string;
  framework: string;
  renderedMarkdown?: string;
  totalCharCount: number;
  editorPassUsed: boolean;
  tokensUsed: number;
  durationAnalystMs: number;
  durationEditorMs: number;
  isSample?: boolean;
}): number {
  const db = getDb();
  const res = db
    .prepare(
      `INSERT INTO decision_briefs (
         user_id, decision_id, brief_number, topic, framework,
         brief_json, rendered_markdown, total_char_count,
         editor_pass_used, tokens_used, duration_analyst_ms, duration_editor_ms, is_sample
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      args.userId,
      args.decisionId ?? null,
      args.briefNumber,
      args.topic,
      args.framework,
      args.briefJson,
      args.renderedMarkdown ?? null,
      args.totalCharCount,
      args.editorPassUsed ? 1 : 0,
      args.tokensUsed,
      args.durationAnalystMs,
      args.durationEditorMs,
      args.isSample ? 1 : 0
    );
  return res.lastInsertRowid as number;
}

export function getBriefByNumber(briefNumber: string) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM decision_briefs WHERE brief_number = ?`)
    .get(briefNumber) as any;
}

export function getSampleBriefs(): any[] {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM decision_briefs WHERE is_sample = 1 ORDER BY authored_at DESC`)
    .all() as any[];
}

export function getBriefsForUser(userId: number, limit = 50): any[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, brief_number, topic, framework, total_char_count, authored_at, editor_pass_used
       FROM decision_briefs WHERE user_id = ? ORDER BY authored_at DESC LIMIT ?`
    )
    .all(userId, limit) as any[];
}

// ============================================================================
// User identification (替代旧的 findOrCreateUser)
// ============================================================================

export function findOrCreateUserByUid(userUid: string): number {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE user_uid = ?').get(userUid) as
    | { id: number }
    | undefined;
  if (existing) return existing.id;

  const result = db
    .prepare('INSERT INTO users (user_uid) VALUES (?)')
    .run(userUid);
  return result.lastInsertRowid as number;
}

export function updateUserProfile(
  userId: number,
  profile: { birthDate?: string; gender?: string }
): void {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];
  if (profile.birthDate) {
    fields.push('birth_date = ?');
    values.push(profile.birthDate);
  }
  if (profile.gender) {
    fields.push('gender = ?');
    values.push(profile.gender);
  }
  if (fields.length === 0) return;
  values.push(userId);
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

export function getUser(userId: number) {
  const db = getDb();
  return db
    .prepare(
      'SELECT id, user_uid, birth_date, gender, email, email_verified_at, email_preferences, created_at, onboarding_completed_at, access_status FROM users WHERE id = ?',
    )
    .get(userId) as
    | {
        id: number;
        user_uid: string;
        birth_date: string | null;
        gender: string | null;
        email: string | null;
        email_verified_at: number | null;
        email_preferences: string | null;
        created_at: number;
        onboarding_completed_at: number | null;
        access_status: string | null;
      }
    | undefined;
}

export interface EmailPreferences {
  sunday_review: boolean;
  outcome_due: boolean;
  welcome: boolean;
  commitment: boolean;
}

const DEFAULT_EMAIL_PREFS: EmailPreferences = {
  sunday_review: true,
  outcome_due: true,
  welcome: true,
  commitment: true,
};

export function getUserEmailPrefs(userId: number): EmailPreferences {
  const user = getUser(userId);
  if (!user?.email_preferences) return DEFAULT_EMAIL_PREFS;
  try {
    return { ...DEFAULT_EMAIL_PREFS, ...JSON.parse(user.email_preferences) };
  } catch {
    return DEFAULT_EMAIL_PREFS;
  }
}

export function updateUserEmail(args: {
  userId: number;
  email?: string;
  emailPreferences?: Partial<EmailPreferences>;
}): void {
  const db = getDb();
  const sets: string[] = [];
  const params: any[] = [];
  if (args.email !== undefined) {
    sets.push('email = ?');
    params.push(args.email);
  }
  if (args.emailPreferences !== undefined) {
    const current = getUserEmailPrefs(args.userId);
    const merged = { ...current, ...args.emailPreferences };
    sets.push('email_preferences = ?');
    params.push(JSON.stringify(merged));
  }
  if (sets.length === 0) return;
  params.push(args.userId);
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...params);
}

// ============================================================================
// Decision persistence
// ============================================================================

export function saveDecision(args: {
  userId: number;
  question: string;
  aiResponse: string;
  modelUsed: string;
  framework?: string;
  tokensInput?: number;
  tokensOutput?: number;
}): number {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO decisions (user_id, question, ai_response, model_used, framework, tokens_input, tokens_output)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      args.userId,
      args.question,
      args.aiResponse,
      args.modelUsed,
      args.framework ?? null,
      args.tokensInput ?? null,
      args.tokensOutput ?? null
    );
  return result.lastInsertRowid as number;
}

export function getUserDecisions(userId: number, limit = 100) {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, question, ai_response, model_used, framework,
              tokens_input, tokens_output, created_at
       FROM decisions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .all(userId, limit);
}

// ============================================================================
// JOB-001 · Intake answers persistence
// ============================================================================

export interface IntakeRow {
  id: number;
  user_id: number;
  step: string;
  answers: string; // JSON
  version: number;
  completed_at: number;
}

/** 保存某一步答案 (覆盖式 — 同 user+step 已有就 REPLACE). */
export function saveIntakeStep(args: {
  userId: number;
  step: string;
  answers: unknown; // any JSON-serializable
}): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO intake_answers (user_id, step, answers)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, step) DO UPDATE SET
         answers = excluded.answers,
         version = intake_answers.version + 1,
         completed_at = unixepoch()`,
  ).run(args.userId, args.step, JSON.stringify(args.answers));
}

/** 取一个用户的全部 intake 答案, 按 step 名 map. */
export function getIntakeAnswers(userId: number): Record<string, unknown> {
  const db = getDb();
  const rows = db
    .prepare(`SELECT step, answers FROM intake_answers WHERE user_id = ?`)
    .all(userId) as Array<{ step: string; answers: string }>;
  const out: Record<string, unknown> = {};
  for (const r of rows) {
    try {
      out[r.step] = JSON.parse(r.answers);
    } catch {
      out[r.step] = null;
    }
  }
  return out;
}

/** 检查 5 步是否全做完 (用于路由 gate). */
export function isOnboardingComplete(userId: number): boolean {
  const db = getDb();
  const user = db
    .prepare(`SELECT onboarding_completed_at FROM users WHERE id = ?`)
    .get(userId) as { onboarding_completed_at: number | null } | undefined;
  return !!user?.onboarding_completed_at;
}

/** 标记 onboarding 完成 (5 步都填完之后). */
export function markOnboardingComplete(userId: number): void {
  const db = getDb();
  db.prepare(`UPDATE users SET onboarding_completed_at = unixepoch() WHERE id = ?`).run(userId);
}

/** 重置 onboarding (用户想重新填). 删 intake_answers 全部 + 清 completed_at. */
export function resetOnboarding(userId: number): void {
  const db = getDb();
  db.prepare(`DELETE FROM intake_answers WHERE user_id = ?`).run(userId);
  db.prepare(`UPDATE users SET onboarding_completed_at = NULL WHERE id = ?`).run(userId);
}
