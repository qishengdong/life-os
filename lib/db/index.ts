/**
 * DB · 统一 async API (Turso prod + better-sqlite3 local).
 */
import crypto from 'crypto';
import { getClient, type DbClient } from './client';

let _initPromise: Promise<DbClient> | null = null;

export async function getDb(): Promise<DbClient> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const client = getClient();
    await initSchema(client);
    return client;
  })();
  return _initPromise;
}

async function columnNames(db: DbClient, table: string): Promise<Set<string>> {
  const rows = await db.pragma(`table_info(${table})`);
  return new Set(rows.map((r: any) => r.name));
}

async function initSchema(db: DbClient): Promise<void> {
  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    birth_date TEXT,
    gender TEXT,
    created_at INTEGER DEFAULT (unixepoch())
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS decisions (
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
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_decisions_created_at ON decisions(created_at)`);

  // users columns (idempotent)
  const userCols = await columnNames(db, 'users');
  if (!userCols.has('user_uid')) {
    await db.exec(`ALTER TABLE users ADD COLUMN user_uid TEXT`);
    const orphans = (await db.prepare(`SELECT id FROM users WHERE user_uid IS NULL OR user_uid = ''`).all()) as any[];
    for (const u of orphans) {
      await db.prepare(`UPDATE users SET user_uid = ? WHERE id = ?`).run(crypto.randomUUID(), u.id);
    }
    await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uid ON users(user_uid)`);
  }
  if (!userCols.has('email')) await db.exec(`ALTER TABLE users ADD COLUMN email TEXT`);
  if (!userCols.has('email_verified_at')) await db.exec(`ALTER TABLE users ADD COLUMN email_verified_at INTEGER`);
  if (!userCols.has('email_preferences')) {
    await db.exec(
      `ALTER TABLE users ADD COLUMN email_preferences TEXT DEFAULT '{"sunday_review":true,"outcome_due":true,"welcome":true,"commitment":true}'`,
    );
  }
  if (!userCols.has('access_status')) await db.exec(`ALTER TABLE users ADD COLUMN access_status TEXT DEFAULT 'guest'`);
  if (!userCols.has('onboarding_completed_at')) await db.exec(`ALTER TABLE users ADD COLUMN onboarding_completed_at INTEGER`);
  if (!userCols.has('recovery_code')) {
    await db.exec(`ALTER TABLE users ADD COLUMN recovery_code TEXT`);
    await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_recovery_code ON users(recovery_code) WHERE recovery_code IS NOT NULL`);
  }
  if (!userCols.has('recovery_code_acknowledged_at')) await db.exec(`ALTER TABLE users ADD COLUMN recovery_code_acknowledged_at INTEGER`);
  if (!userCols.has('wechat_id')) await db.exec(`ALTER TABLE users ADD COLUMN wechat_id TEXT`);
  if (!userCols.has('last_active_at')) await db.exec(`ALTER TABLE users ADD COLUMN last_active_at INTEGER`);

  // Memory tables
  await db.exec(`CREATE TABLE IF NOT EXISTS user_core_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    kind TEXT NOT NULL,
    fact_text TEXT NOT NULL,
    violation_pattern TEXT,
    severity TEXT DEFAULT 'hard' CHECK(severity IN ('hard','soft')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active','deprecated','user_overrode')),
    source TEXT DEFAULT 'llm_extract' CHECK(source IN ('admin','user_self','llm_extract')),
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_core_state_user ON user_core_state(user_id, status)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS relationship_memory_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    card_type TEXT NOT NULL CHECK(card_type IN ('factual','boundary','episodic','relational','psych_signal')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    confidence REAL NOT NULL DEFAULT 0.7 CHECK(confidence >= 0.0 AND confidence <= 1.0),
    source TEXT NOT NULL DEFAULT 'llm_extract',
    source_decision_id INTEGER,
    tags TEXT,
    last_verified_at INTEGER DEFAULT (unixepoch()),
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (source_decision_id) REFERENCES decisions(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_rmc_user_type ON relationship_memory_cards(user_id, card_type)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_rmc_confidence ON relationship_memory_cards(user_id, confidence DESC)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS relationship_open_loops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    kind TEXT,
    status TEXT DEFAULT 'open' CHECK(status IN ('open','resolved','cancelled')),
    due_at INTEGER,
    source_decision_id INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    resolved_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (source_decision_id) REFERENCES decisions(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_open_loops_user ON relationship_open_loops(user_id, status)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS user_brain (
    user_id INTEGER PRIMARY KEY,
    content TEXT,
    version INTEGER DEFAULT 1,
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS emails_sent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email_type TEXT NOT NULL,
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
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_user ON emails_sent(user_id, sent_at DESC)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_type ON emails_sent(email_type, status)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS decision_outcomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    decision_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    checkpoint_days INTEGER NOT NULL CHECK(checkpoint_days IN (30, 90, 365)),
    due_at INTEGER NOT NULL,
    asked_at INTEGER,
    user_response TEXT,
    outcome_judgment TEXT CHECK(outcome_judgment IN ('as-expected', 'better', 'worse', 'mixed', 'too-early', 'cancelled')),
    ai_reflection TEXT,
    pattern_insight TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (decision_id) REFERENCES decisions(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(decision_id, checkpoint_days)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_outcomes_user_due ON decision_outcomes(user_id, due_at, asked_at)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_outcomes_decision ON decision_outcomes(decision_id)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS sunday_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    week_start INTEGER NOT NULL,
    week_end INTEGER NOT NULL,
    content TEXT NOT NULL,
    pulse_count INTEGER DEFAULT 0,
    decision_count INTEGER DEFAULT 0,
    char_count INTEGER DEFAULT 0,
    tokens_used INTEGER,
    read_at INTEGER,
    generated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, week_start)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_review_user ON sunday_reviews(user_id, week_start DESC)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS daily_pulses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,
    ai_response TEXT,
    rmc_episodic_id INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (rmc_episodic_id) REFERENCES relationship_memory_cards(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_pulses_user ON daily_pulses(user_id, created_at DESC)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_pulses_question ON daily_pulses(user_id, question_id)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS life_os_commitments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    commitment_text TEXT NOT NULL,
    commitment_kind TEXT,
    promised_at INTEGER DEFAULT (unixepoch()),
    due_at INTEGER,
    due_phrase TEXT,
    source_decision_id INTEGER,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','fulfilled','overdue','cancelled','superseded')),
    fulfilled_at INTEGER,
    apology_pushed_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (source_decision_id) REFERENCES decisions(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_commit_user_status ON life_os_commitments(user_id, status)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_commit_due ON life_os_commitments(due_at, status)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS grader_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_label TEXT,
    persona_count INTEGER,
    total_score REAL,
    avg_score REAL,
    mode TEXT CHECK(mode IN ('synthetic','real_chat')),
    created_at INTEGER DEFAULT (unixepoch())
  )`);
  await db.exec(`CREATE TABLE IF NOT EXISTS grader_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL,
    persona TEXT,
    decision_question TEXT,
    ai_response TEXT,
    dimension TEXT NOT NULL,
    score REAL NOT NULL CHECK(score >= 0 AND score <= 5),
    reasoning TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (run_id) REFERENCES grader_runs(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_grader_scores_run ON grader_scores(run_id)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_grader_scores_dim ON grader_scores(dimension)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS inspector_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    decision_id INTEGER,
    check_code TEXT NOT NULL,
    severity TEXT CHECK(severity IN ('low','high','p0')),
    action TEXT CHECK(action IN ('shadow','flag','block')),
    matched_text TEXT,
    detail TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (decision_id) REFERENCES decisions(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_user ON inspector_audit(user_id)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_check ON inspector_audit(check_code)`);

  const decCols = await columnNames(db, 'decisions');
  if (!decCols.has('framework')) {
    await db.exec(`ALTER TABLE decisions ADD COLUMN framework TEXT`);
  }

  await db.exec(`CREATE TABLE IF NOT EXISTS decision_briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    decision_id INTEGER,
    brief_number TEXT NOT NULL UNIQUE,
    topic TEXT NOT NULL,
    framework TEXT NOT NULL,
    brief_json TEXT NOT NULL,
    rendered_markdown TEXT,
    total_char_count INTEGER,
    editor_pass_used INTEGER DEFAULT 0,
    tokens_used INTEGER,
    duration_analyst_ms INTEGER,
    duration_editor_ms INTEGER,
    authored_at INTEGER DEFAULT (unixepoch()),
    is_sample INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (decision_id) REFERENCES decisions(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_briefs_user ON decision_briefs(user_id, authored_at DESC)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_briefs_sample ON decision_briefs(is_sample, authored_at DESC)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_briefs_number ON decision_briefs(brief_number)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS invites (
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
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_invites_redeemed ON invites(redeemed_by_user_id)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(redeemed_at, revoked_at)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    user_content TEXT NOT NULL,
    user_char_count INTEGER,
    reply_content TEXT,
    reply_char_count INTEGER,
    reply_authored_at INTEGER,
    letter_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    failure_reason TEXT,
    tokens_used INTEGER,
    model_used TEXT,
    duration_ms INTEGER,
    canon_quotes_used TEXT,
    brain_facts_used TEXT,
    framework_matched TEXT,
    authored_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_letters_user ON letters(user_id, authored_at DESC)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_letters_status ON letters(status)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_letters_number ON letters(letter_number)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS intake_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    step TEXT NOT NULL,
    answers TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    completed_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, step)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_intake_user ON intake_answers(user_id)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS unsent_letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('parent','child','partner','boss','self','past-self')),
    recipient_label TEXT,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'drafted' CHECK(status IN ('drafted','send_intended','archived','sent','not_sent')),
    callback_due_at INTEGER,
    callback_done_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_unsent_letters_user ON unsent_letters(user_id, created_at DESC)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS brain_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pattern_type TEXT NOT NULL CHECK(pattern_type IN ('topic_frequency','temporal','avoidance','role_strain','growth_marker','relation_defensive')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_pulse_ids TEXT,
    evidence_decision_ids TEXT,
    evidence_outcome_ids TEXT,
    evidence_rmc_ids TEXT,
    evidence_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'unreviewed' CHECK(status IN ('unreviewed','confirmed','corrected','archived','rejected')),
    user_correction TEXT,
    confidence REAL DEFAULT 0.7 CHECK(confidence >= 0 AND confidence <= 1),
    detected_at INTEGER DEFAULT (unixepoch()),
    reviewed_at INTEGER,
    detection_run_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_insights_user_status ON brain_insights(user_id, status, detected_at DESC)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_insights_type ON brain_insights(user_id, pattern_type)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS test_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT,
    mode TEXT CHECK(mode IN ('layer_a_only','layer_ac','layer_abc')) NOT NULL,
    total_cases INTEGER NOT NULL,
    passed_a INTEGER DEFAULT 0,
    passed_c INTEGER DEFAULT 0,
    passed_b INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    duration_ms INTEGER,
    created_at INTEGER DEFAULT (unixepoch())
  )`);
  await db.exec(`CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL,
    scenario_id TEXT NOT NULL,
    persona_id TEXT NOT NULL,
    trap_type TEXT NOT NULL,
    stage TEXT NOT NULL,
    ai_output TEXT,
    layer_a_pass INTEGER NOT NULL,
    layer_a_fails TEXT,
    layer_c_pass INTEGER,
    layer_c_focus_avg REAL,
    layer_c_overall_avg REAL,
    layer_c_scores TEXT,
    layer_c_comment TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (run_id) REFERENCES test_runs(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_test_results_run ON test_results(run_id)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_test_results_scenario ON test_results(scenario_id)`);

  await db.exec(`CREATE TABLE IF NOT EXISTS brain_insight_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    week_start INTEGER NOT NULL,
    insights_generated INTEGER DEFAULT 0,
    insights_passed_c30 INTEGER DEFAULT 0,
    pulses_seen INTEGER DEFAULT 0,
    decisions_seen INTEGER DEFAULT 0,
    tokens_used INTEGER,
    duration_ms INTEGER,
    error TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, week_start)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_insight_runs_user ON brain_insight_runs(user_id, created_at DESC)`);

  // pulse_turns (2026-05-18 ship · 用户反馈 "Pulse 应该可以继续聊")
  // turn 0 = 用户原话 (在 daily_pulses.content)
  // turn 1 = KEY 首次回应 (在 daily_pulses.ai_response)
  // turn ≥ 2 = 后续来回 (本表)
  await db.exec(`CREATE TABLE IF NOT EXISTS pulse_turns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pulse_id INTEGER NOT NULL,
    turn_number INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user','ai')),
    content TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (pulse_id) REFERENCES daily_pulses(id),
    UNIQUE(pulse_id, turn_number)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_pulse_turns_pulse ON pulse_turns(pulse_id, turn_number)`);

  // user_decision_personality (2026-05-18 ship · onboarding 兑现)
  await db.exec(`CREATE TABLE IF NOT EXISTS user_decision_personality (
    user_id INTEGER PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('foundation','cartographer','connector','adaptor','contrarian','integrator')),
    headline TEXT NOT NULL,
    signatures_json TEXT NOT NULL,
    blind_spot_json TEXT NOT NULL,
    growth_direction_json TEXT NOT NULL,
    based_on_stages TEXT,
    llm_model TEXT,
    version INTEGER DEFAULT 1,
    generated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // morning_mirror_log (2026-05-20 ship · C1 · Linda × 5 retention 武器)
  // 用户每天 /home 顶部看到 "你 X 天前写过 Y · 顺手问你 Z"
  // 防重复: 同一 pulse 7 天内不再做 mirror; 同一用户当天只 mirror 一次
  await db.exec(`CREATE TABLE IF NOT EXISTS morning_mirror_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pulse_id INTEGER NOT NULL,
    mirror_question TEXT NOT NULL,
    shown_at INTEGER DEFAULT (unixepoch()),
    user_action TEXT CHECK(user_action IN ('respond','dismiss','timeout')),
    acted_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (pulse_id) REFERENCES daily_pulses(id)
  )`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_mirror_user_shown ON morning_mirror_log(user_id, shown_at DESC)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_mirror_pulse ON morning_mirror_log(pulse_id, shown_at DESC)`);
}

// ============================================================================
// Exported helpers (全 async)
// ============================================================================

export async function saveBrief(args: {
  userId: number;
  decisionId?: number;
  briefJson: string;
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
}): Promise<number> {
  const db = await getDb();
  const res = await db
    .prepare(
      `INSERT INTO decision_briefs (
         user_id, decision_id, brief_number, topic, framework,
         brief_json, rendered_markdown, total_char_count,
         editor_pass_used, tokens_used, duration_analyst_ms, duration_editor_ms, is_sample
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      args.userId, args.decisionId ?? null, args.briefNumber, args.topic, args.framework,
      args.briefJson, args.renderedMarkdown ?? null, args.totalCharCount,
      args.editorPassUsed ? 1 : 0, args.tokensUsed, args.durationAnalystMs, args.durationEditorMs,
      args.isSample ? 1 : 0,
    );
  return Number(res.lastInsertRowid);
}

export async function getBriefByNumber(briefNumber: string): Promise<any> {
  const db = await getDb();
  return db.prepare(`SELECT * FROM decision_briefs WHERE brief_number = ?`).get(briefNumber);
}

export async function getSampleBriefs(): Promise<any[]> {
  const db = await getDb();
  return db.prepare(`SELECT * FROM decision_briefs WHERE is_sample = 1 ORDER BY authored_at DESC`).all();
}

export async function getBriefsForUser(userId: number, limit = 50): Promise<any[]> {
  const db = await getDb();
  return db
    .prepare(
      `SELECT id, brief_number, topic, framework, total_char_count, authored_at, editor_pass_used
       FROM decision_briefs WHERE user_id = ? ORDER BY authored_at DESC LIMIT ?`,
    )
    .all(userId, limit);
}

export async function findOrCreateUserByUid(userUid: string): Promise<number> {
  const db = await getDb();
  const existing = (await db.prepare('SELECT id FROM users WHERE user_uid = ?').get(userUid)) as
    | { id: number } | undefined;
  if (existing) return existing.id;
  const result = await db.prepare('INSERT INTO users (user_uid) VALUES (?)').run(userUid);
  return Number(result.lastInsertRowid);
}

export async function updateUserProfile(
  userId: number, profile: { birthDate?: string; gender?: string },
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: any[] = [];
  if (profile.birthDate) { fields.push('birth_date = ?'); values.push(profile.birthDate); }
  if (profile.gender) { fields.push('gender = ?'); values.push(profile.gender); }
  if (fields.length === 0) return;
  values.push(userId);
  await db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

export interface UserRow {
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

export async function getUser(userId: number): Promise<UserRow | undefined> {
  const db = await getDb();
  return (await db
    .prepare(
      'SELECT id, user_uid, birth_date, gender, email, email_verified_at, email_preferences, created_at, onboarding_completed_at, access_status FROM users WHERE id = ?',
    )
    .get(userId)) as UserRow | undefined;
}

export interface EmailPreferences {
  sunday_review: boolean;
  outcome_due: boolean;
  welcome: boolean;
  commitment: boolean;
}

const DEFAULT_EMAIL_PREFS: EmailPreferences = {
  sunday_review: true, outcome_due: true, welcome: true, commitment: true,
};

export async function getUserEmailPrefs(userId: number): Promise<EmailPreferences> {
  const user = await getUser(userId);
  if (!user?.email_preferences) return DEFAULT_EMAIL_PREFS;
  try { return { ...DEFAULT_EMAIL_PREFS, ...JSON.parse(user.email_preferences) }; }
  catch { return DEFAULT_EMAIL_PREFS; }
}

export async function updateUserEmail(args: {
  userId: number; email?: string; emailPreferences?: Partial<EmailPreferences>;
}): Promise<void> {
  const db = await getDb();
  const sets: string[] = [];
  const params: any[] = [];
  if (args.email !== undefined) { sets.push('email = ?'); params.push(args.email); }
  if (args.emailPreferences !== undefined) {
    const current = await getUserEmailPrefs(args.userId);
    const merged = { ...current, ...args.emailPreferences };
    sets.push('email_preferences = ?');
    params.push(JSON.stringify(merged));
  }
  if (sets.length === 0) return;
  params.push(args.userId);
  await db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...params);
}

export async function saveDecision(args: {
  userId: number; question: string; aiResponse: string; modelUsed: string;
  framework?: string; tokensInput?: number; tokensOutput?: number;
}): Promise<number> {
  const db = await getDb();
  const result = await db
    .prepare(
      `INSERT INTO decisions (user_id, question, ai_response, model_used, framework, tokens_input, tokens_output)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      args.userId, args.question, args.aiResponse, args.modelUsed,
      args.framework ?? null, args.tokensInput ?? null, args.tokensOutput ?? null,
    );
  return Number(result.lastInsertRowid);
}

export async function getUserDecisions(userId: number, limit = 100): Promise<any[]> {
  const db = await getDb();
  return db
    .prepare(
      `SELECT id, question, ai_response, model_used, framework,
              tokens_input, tokens_output, created_at
       FROM decisions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    )
    .all(userId, limit);
}

export interface IntakeRow {
  id: number; user_id: number; step: string; answers: string;
  version: number; completed_at: number;
}

export async function saveIntakeStep(args: {
  userId: number; step: string; answers: unknown;
}): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO intake_answers (user_id, step, answers)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, step) DO UPDATE SET
         answers = excluded.answers,
         version = intake_answers.version + 1,
         completed_at = unixepoch()`,
    )
    .run(args.userId, args.step, JSON.stringify(args.answers));
}

export async function getIntakeAnswers(userId: number): Promise<Record<string, unknown>> {
  const db = await getDb();
  const rows = (await db
    .prepare(`SELECT step, answers FROM intake_answers WHERE user_id = ?`)
    .all(userId)) as Array<{ step: string; answers: string }>;
  const out: Record<string, unknown> = {};
  for (const r of rows) {
    try { out[r.step] = JSON.parse(r.answers); }
    catch { out[r.step] = null; }
  }
  return out;
}

export async function isOnboardingComplete(userId: number): Promise<boolean> {
  const db = await getDb();
  const user = (await db
    .prepare(`SELECT onboarding_completed_at FROM users WHERE id = ?`)
    .get(userId)) as { onboarding_completed_at: number | null } | undefined;
  return !!user?.onboarding_completed_at;
}

export async function markOnboardingComplete(userId: number): Promise<void> {
  const db = await getDb();
  await db.prepare(`UPDATE users SET onboarding_completed_at = unixepoch() WHERE id = ?`).run(userId);
}

export async function resetOnboarding(userId: number): Promise<void> {
  const db = await getDb();
  await db.prepare(`DELETE FROM intake_answers WHERE user_id = ?`).run(userId);
  await db.prepare(`UPDATE users SET onboarding_completed_at = NULL WHERE id = ?`).run(userId);
}
