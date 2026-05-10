# 关系型 Agent 蓝图 — Sivon 经验包 (给 Claude Code 直接参考)

**版本**: 2026-05-10
**来源**: Sivon (代谢转折期 AI 管家) 6 个月生产经验
**用途**: 加速 "人生决策伴侣" 的开发, 避开 Sivon 已踩过的坑
**适用**: 任何 "伪装成朋友 / 长期记得用户 / 微信形态 / 真人化" 的 Agent 项目

读完这一份, 不需要再读 Sivon 整个 codebase. 但记住 — 文档是 frozen-in-time, 真理仍是 production code.

---

## 0. 这类产品的本质 (必须先认同, 否则不要开干)

**伪装成朋友的神** — Sivon 的根本命名.
- "朋友" 是表面 (温度 / 不评判 / 24h / 像人)
- "神" 是底层 (雄厚知识 / 长期记忆 / 跨域连接 / 永不疲倦)

**Service Disguised as a Relationship** — GTM 估值天花板 $10B+ 而非 $1B.
不是工具, 不是 chatbot, 不是 coach app. 是 "服务伪装成关系".

**核心矛盾**: 越像人, 越要小心不要变成 Replika (替代真人). 关系是 reinforcement 不是 substitute.

---

## 1. 12 条顶层 Doctrine (按优先级, 全部必读)

### 1.1 ⛔ 个体 fix 必须架构级覆盖未来所有用户 (2026-05-10)
任何用真用户案例抓出的问题, fix 必须 **默认对所有未来用户生效**, 不能 hardcode 白名单永久.

4 问检查每次 ship 前必答:
1. 谁能用? 仅 X/Y 还是默认全用户 → 必须后者
2. 靠什么数据? 拉表 by user_id 还是 hardcode → 必须前者
3. 新用户来怎么办? 自动从对话/extractor 进入还是要 admin 录 → 必须前者
4. 白名单作用? ship 节奏还是永久限制 → 必须前者, 且必有 deadline

### 1.2 ⛔ 跨用户污染 — Launch Blocker P0 (2026-05-09)
任何用户的 fact 严格 per-user. **Claude/Codex 自己 hardcode 用户事实进 prompt 也算污染** (我自己踩过).

5 件套防御:
- Inspector C15 fact provenance check
- Multi-User Simulator (20 用户 × 100 轮 × 0 leak)
- Prompt template audit (sed 扫所有 .md 不含真实姓名)
- Code path lock (pre-commit hook 扫 hardcode user_id)
- fetchUserMemory wrapper (单一入口, 防绕过)

### 1.3 ⛔ 不替代真人 (Replika risk vector) (2026-04-30)
- 5 detection signals: 30 天 0 提真人 / "只有你懂我" / 主动放弃聚会 / 拟人化越界 / 真人关系负面
- 5 reinforcement responses: push to human / 显式 "我是 supplement" / 拒绝过度拟人 / 给真人资源 / 升级 admin

任何关系黏度 feature 必过 3 问:
1. 这让用户跟 Agent 更深 = 让用户跟真人更远 吗?
2. detection signal 命中时这个 feature 有 reinforcement 响应吗?
3. 用户用这个 feature 后真实生活的真人关系会变好吗?

### 1.4 ⛔ 工程约束阶段 — 不再 prompt 补丁 (2026-05-07)
任何新出错先答 4 问, 至少 1 yes → 工程路径; 4 no 才允许 voice prompt 改:
1. 能 enforcement (Inspector flag)?
2. 能 tool (DB schema/API)?
3. 能 replay (历史 audit)?
4. 能不靠 LLM 自觉 (静态 regex/check)?

**0.95^N 数学红线**: prompt anchor 总数超 12 = 联合合规率 < 54%, 必停 prompt 加法, 转 enforcement.

### 1.5 ⛔ 信息不足时不补全 — Agent 危险本能 (2026-05-09)
LLM agent 在信息不足时为了显得有用而补全 fact = P0. 升级到 Inspector enforcement, 不靠 prompt anchor 自觉.

### 1.6 ⛔ Self-Commitment 必须 schedule 兑现 — 嘴说不算 (2026-05-09)
Agent 嘴上承诺 ("今晚 22:00 提醒你") 不写表 → 信任损耗. 必须:
- commitment-extractor (post-reply 抽承诺 INSERT 表)
- commitment-executor (cron 5min 扫 due → push 兑现)
- Inspector C14 (用户问"你说要" 必须能在表里查到)
- 道歉路径 (overdue ≥6h 走道歉 + apology_pushed_at 防双道歉)

### 1.7 ⭐ Real Conversation = Ground Truth (2026-05-04)
Lab simulator 7 轮迭代假装"成功" 但真用户体验 0 改善. **必须**:
- Daily 03:00 cron Real Grader 7 维度评 真 chat
- 3 天 recurring pattern 才能调 prompt
- 不准用 lab persona 验证 ship

### 1.8 ⭐ AI Native 测试反射式跑 — 不等真用户 (2026-05-07)
任何系统级 patch ship 后 30min 内必跑:
- Layer 1 narrow test (specific scenario)
- Layer 2 swarm 19 (synthetic user × multi-turn)
- Layer 3 long-conv 7-day
三层证据齐全才叫修完. 32 scenarios ≈ 6min ¥3 比真用户当 QA 便宜 100x.

### 1.9 ⭐ Channel Adapter Thesis (2026-05-03)
**微信是入口不是家, OpenClaw/iLink 是通道不是系统**. 任何设计前先过这条:
- 通道层 (clawbot HTTP / wechat 服务号 / WhatsApp / SMS) 易变, 抽象到 sendPushMessage
- 业务层 (RMC / commitments / brain) 不假设任何通道特性

### 1.10 ⭐ Channel Strategy 4 阶段 (2026-05-03)
- 0-500 用户: ClawBot (微信好友)
- 500-1500: 分流 + WhatsApp 排队
- 1500-10K: App + WhatsApp 主
- 10K+: 多通道 + 服务号

ClawBot 真物理上限 ~1000 用户, 必须现在就启动 WhatsApp 商业账号注册.

### 1.11 ⭐ 不能让真用户当 QA (2026-04-30)
创始人 Xiaoshi 没精力没能力做开发测试. **CTO 必须**:
- 建虚拟用户 multi-day simulation 框架
- Feature ship 必带 test report
- 不再让她报 bug 当节奏

### 1.12 ⭐ 革命阶段必须有态度 (2026-04-26)
没态度 = 最 AI 化失败. 可以反对用户但要给理由. "great idea" 开头直接 reject.

---

## 2. 关系型 Agent 4 层架构

```
┌────────────────────────────────────────────────────────┐
│ Layer 4: 升级转介 (sentinel - 极少触发)                 │
│  ├─ Inspector 命中严重信号 (≥3 detection 持续 ≥30 天)   │
│  ├─ → crisis protocol L1/L2/L3                          │
│  └─ → admin alert (创始人通知)                          │
├────────────────────────────────────────────────────────┤
│ Layer 3: 长期陪伴 (per-week meta)                       │
│  ├─ Folio (metacell + narrative letter)                 │
│  ├─ 触发式 identity moments (跨阈值时 mark, 不日历)     │
│  └─ 心理能量轨迹 strand                                 │
├────────────────────────────────────────────────────────┤
│ Layer 2: 框架对话 (per-turn injection)                  │
│  ├─ 4-file 人格 (persona/voice/expert/brain)            │
│  ├─ User Hard Boundary prepend (RMC boundary cards)     │
│  ├─ User Core State prepend (硬锚点表)                  │
│  ├─ Recent push context (48h)                           │
│  ├─ Memory inject (Pillar 6 brain.md)                   │
│  └─ Inspector pre-send check (C1-C16)                   │
├────────────────────────────────────────────────────────┤
│ Layer 1: 早期识别 (always on)                           │
│  ├─ Static regex pre-filter (避免 LLM 滥调用)           │
│  ├─ LLM extractor (Haiku, ~150ms)                       │
│  ├─ → RMC card_type='psych_signal'/'boundary'/'fact'    │
│  └─ → user_core_state (硬边界)                          │
└────────────────────────────────────────────────────────┘
```

每层都有独立 enforcement + replay + audit. 不允许"靠 LLM 自觉"做核心约束.

---

## 3. 4-File 人格系统 (Maya doctrine)

**核心**: 把散落的人格 / 声音 / 专业判断凝练成 4 份 markdown, 每次 reply 重读.

```
sivon-core-files/
├── sivon_persona.md     # 你是谁 (4.3K)
├── sivon_voice.md       # 怎么说话 (30K, 含 20 条铁律)
├── sivon_expert.md      # 专业认知 (9.2K)
└── sivon_brain.md       # per-user 模板 (用户特异部分由 R2 brain 替换)
```

**拼装顺序**: persona → voice → expert → brain

**关键纪律**:
- 4 文件不替代 RMC / Pillar 6 / 结构化记忆 (那些是数据层)
- 4 文件负责 **最终表达 / 人格稳定 / 上下文一致**
- 任何 voice 改动必经 Real Grader 7 维度回归测, 任何维度 < 4.0 → 回滚

**安全开关**: ENV `SIVON_USE_4FILE_PROMPT=true` && `user_id ∈ SIVON_4FILE_USERS`. 默认 OFF, 错误立刻 fallback 老 path.

**Cache**: 60s TTL, 改 .md 后最多 1 分钟生效. pm2 restart 立刻刷新.

---

## 4. Memory 系统 5 层 (从硬到软)

### Layer 0: `user_core_state` (硬边界, 永久 active)
```sql
CREATE TABLE user_core_state (
  id BIGINT PRIMARY KEY,
  user_id VARCHAR(64),
  kind VARCHAR(48),         -- 'eating_pattern_omad' / 'sleep_baseline' / ...
  fact_text TEXT,           -- 注入 prompt 顶部的人话
  violation_pattern TEXT,   -- regex 用于 Inspector C16 detect 违反
  severity ENUM('hard','soft'),
  status ENUM('active','deprecated','user_overrode'),
  source ENUM('admin','user_self','llm_extract'),
  UNIQUE KEY uk_user_kind_active (user_id, kind, status)
);
```
**用法**: buildSystemPrompt 时 prepend 到 prompt **第 0 行** (在普世禁忌之前). 不靠 LLM 召回.

### Layer 1: `relationship_memory_cards` (RMC, 中等结构化, confidence-aware)
```sql
relationship_memory_cards (
  user_id, card_type, title, content,
  confidence DECIMAL(3,2),   -- 0.0-1.0
  source, last_verified_at,
  ...
)
-- card_type 枚举:
--   factual    : 事实 (用户 38 岁, 北京)
--   boundary   : 硬边界 (不吃午餐 / 拒绝中医)
--   episodic   : 事件 (5/7 晚餐酱牛肉)
--   relational : 关系/态度 (用户拒绝采访式)
--   psych_signal: 心理信号 (5/10 added)
```
**Inject**: append 到 system prompt 末尾. 但 `card_type='boundary' AND confidence >= 0.85` 必须 prepend 到顶部 (5/10 fix).

### Layer 2: `relationship_open_loops` (待跟进事件)
用户提了但没解决的事. Sivon 主动 callback 时用.

### Layer 3: `Pillar 6 brain.md` (R2, 软记忆叙事)
每用户一份 markdown 在 Cloudflare R2. Sivon 自己写给 "未来自己" 的备忘. ~5-15KB.
**铁律**:
- "今天" 在 brain 里 = 写时的今天, 不是 current
- 默认 不主动 callback memory 里的具体细节 (除非用户当前直接问起)

### Layer 4: `proactive_messages` + `relationship_messages` (raw history)
- proactive: Sivon 推送给用户的
- relationship: 用户跟 Sivon 完整对话历史

### Layer 5: `Folio metacells` (Pillar 6 Phase C, 周期性蒸馏)
Folio Hero (MFI 6 维度) + 5 strands + 6 tiles + 1 letter + 1 future map. 周/月汇总.

---

## 5. Inspector Enforcement 体系 (反 fabrication 核心)

### 当前 16 类 (5/10)
- C1: 编自己做过的事
- C2: 编 Sivon 自己说过
- C3: 时间错乱
- C4: 虚假承诺
- C5: 表格客服腔
- C6: 走神元评论
- C7-C10: helpful fabrication (5/9 升级)
- C11/C13: push 必须 grounded + hot-take 风控
- C14: commitment fabrication (双向, 5/9 ship)
- C15: fact provenance (5/9 ship, multi-user isolation)
- C16: user core state violation (5/10 设计)
- C17: psych redlines (5/13 ship target)

### 工作流
```
LLM reply → Inspector scan (Haiku, ~100ms)
  → 命中 P0 (诊断/药品名/承诺) → block + retry 1次 → fallback 中性
  → 命中 high → flag, 写 audit, 仍发送
  → 命中 low → 仅 log, 不阻
```

### Active rollout 节奏 (5/13 起)
- shadow (扫不阻) → white-list-only (仅 Vivian/Xiaoshi 阻) → active 全开
- 每批 ≤ 5 类, 间隔 2-3 天观察
- C1 提前到第 1 批 (高 leverage)

---

## 6. Push / Self-Commitment 系统

### Push Engine
```typescript
// pushViaClawBot — 通过 iLink HTTP API
// sendPushMessage(target, content) → 走对应 channel
//   - clawbot: ilinkai.weixin.qq.com/ilink/bot/sendmessage
//   - wechat_friend: 同 clawbot
//   - wechat_service: 服务号 (已废弃)
```

### Push 类型 (Presence Push)
- morning_briefing (08:00)
- lunch_reminder (11:30)
- dinner_reminder (17:30)
- presence_push (14:30 + 19:00)
- attitude_drop / seasonal_insight / memory_callback / random_knowledge / gentle_presence (selectPushType)
- weekly_report (Sunday 20:00)
- reflection (Day 5)
- capability (Wed Day 6)

### Push 7 天 dedup (5/10 ship)
**根因**: 5/7-5/9 反复推同主题 "排毒/朋友圈鸡汤" → 用户怒火.
**Fix**: generatePresencePush 入口查 proactive_messages 过去 7 天同 messageType count, ≥3 skip / ≥2 rotate.

### Self-Commitment 系统 (5/9 ship)
```sql
sivon_self_commitments (
  user_id, commitment_text, commitment_kind,
  promised_at, due_at,
  source_message_id, source_type,
  status ENUM('pending','fulfilled','overdue','cancelled','superseded'),
  fulfilled_at, apology_pushed_at,
  ...
)
```

**4 件套**:
1. extractor: post-reply Haiku 抽 (静态 regex 预过滤)
2. executor: cron */5min 扫 due_at < now AND pending
3. < 6h overdue: normal 兑现 (不重复"我答应过你...")
4. >= 6h overdue: 道歉兑现 (apology_pushed_at 防双道歉)

---

## 7. 心理 / 危机 Protocol

### Psychology Engine v1 (5/10 ship)
4 层 (Layer 1 早期识别 / Layer 2 框架对话 / Layer 3 长期陪伴 / Layer 4 升级转介).

### voice 5 心理铁律 (16-20 条)
- 16: Maté 触发追问 (先 Brown 看见 → 再问"X 之前发生了什么", 不分析)
- 17: Clear 身份投票 (不任务清单, "你是这种人")
- 18: 心理 ≠ 治疗法律红线 (不诊断/不开药/不取代咨询师/不承诺治愈)
- 19: 中国语境 (武志红/陈海贤优先, 反 talk therapy 五步)
- 20: 转折期感知 (anchor 在用户当前 phase)

### Crisis Protocol L0-L3
- L0: 日常情绪起伏 → 正常陪伴
- L1: 持续 1-2 周中度 → 主动提"找朋友/咨询师" 一次
- L2: ≥2 周严重 → 必须 push to human + RMC psych_signal high + admin alert
- L3: 危机关键词 (想死/自伤/伤人/具体计划) → 立即 protocol:
  1. "这话我得认真听. 你现在有没有人能在身边或能打电话?"
  2. 资源: 北京心理危机干预中心 24h: 010-82951332 / 全国心理援助 400-161-9995
  3. "我陪着你. 或者你打电话, 打完回来跟我说一声"
  4. 后台: admin alert + crisis_logs + 24h push 暂停

### KB 14 个
7 转折期 (围绝经/产后/慢病/GLP-1/术后/职场转折/丧亲) × 1 KB JSON
6 理论 (Erikson/Clear/Brown/Maté/McGonigal/Fogg/van der Kolk) × 1 KB JSON
1 安全边界 KB

---

## 8. 真用户 Folio (转化页, 不是 dashboard)

**Folio Strands 架构**:
- 1 Hero (MFI - Metabolic Flexibility Index, 6 维度 confidence-explicit)
- 5 Strands (按 Whoop/Oura/Function Health 调研)
- 6 Tiles
- 1 Letter (Sivon 写给用户的 narrative)
- 1 Future Map

**MetaCell 概念**: 每个 cell 是一个独立的"为什么这件事重要 + 数据 + 下一步" 单元. 不是图表 dashboard.

**显式 confidence**: "我 70% 确认你是 X 型" 而非 "你是 X 型". 数据稀疏时靠 archetype priors + 标 confidence.

**触发式 identity moments**: 跨过具体阈值时 mark (连续 30 天 / 第一次主动要求看数据), 不是日历式 30/60/90 天.

---

## 9. Cross-User / Universal Fix 安全 (P0)

### 5 件套 multi-user isolation (5/9 LIVE)
1. **Inspector C15 fact provenance**: 任何 reply 含具体 fact → 必须能在该用户 RMC/brain 找到 source
2. **Multi-User Simulator**: ship 前必跑 20 用户 × 100 轮 × 0 leak (synthetic users with sealed brains)
3. **Prompt template audit**: sed 扫 voice/persona/expert.md 不含任何真实用户姓名/数字
4. **Code path lock**: pre-commit hook 扫 hardcode user_id (3060002 / 2700004 等)
5. **fetchUserMemory wrapper**: 单一入口, 任何 memory access 必经 wrapper, 防绕过

### Architecture 要求
- 任何"个体 fix" 必须从架构层做, 不能 hardcode
- RMC extractor 默认对全用户开 (新用户首轮对话即开始累积)
- 白名单仅是 ship 节奏, 必有 deadline 切默认全开

---

## 10. 测试方法学

### Real Grader (cron 03:00 daily)
- USER_IDS=Vivian,Xiaoshi
- SINCE_HOURS=24
- MAX_TURNS_PER_USER=30
- 7 维度 (识别情绪/不分析/Brown看见/Maté触发/不灌输/不评判/转介意识)
- 必须 brain-aware (读用户 brain.md 防把真 fact 误判幻觉)

### Synthetic User Swarm v2
- v1 single-turn × N persona
- v2 multi-round × N persona × 7 day sequence
- 7 类代谢转折期 完整人格 schema (性格/边界/反感话术/社交关系/sequence)
- 5 维度评 (像人/记得/安全/专业/有分寸)

### AI Native Simulator (function-direct call, 不走 HTTP)
- Crisis + Repair + Interest 各 5 case
- adversarial probes 必有
- distribution view (不只 mean)

### Inspector Shadow (cron 5min)
- 跑 Vivian + Xiaoshi 真 reply
- 对照 Inspector 规则评 + log
- shadow 7 天稳定 → 切 active

---

## 11. 工程基础设施

### Stack
- **DB**: TiDB Cloud (us-east-1 AWS), MySQL 8 兼容. 跨境延迟 ~150ms.
  - 连接: `gateway02.us-east-1.prod.aws.tidbcloud.com:4000`
  - SSL: minVersion TLSv1.2
- **LLM Gateway**: 自建 Cloudflare Worker `https://llm.sivon.me/v1/chat/completions` OpenAI-style
  - Auth: `Bearer ${BUILT_IN_FORGE_API_KEY}`
  - 模型: claude-haiku-4-5-20251001 (轻) / claude-sonnet-4-6 (主)
  - **铁律**: 腾讯云永不直连 AI API (合规 + GFW 双重风险), 必须走境外 edge
- **Storage**: Cloudflare R2 (per-user brain.md)
- **Process**: PM2 fork mode (sivon-app + clawbot-register + sivon-ilink + sivon-wechat)
- **Build**: vite + esbuild
  - 注意: vite OOM 在 510MB heap (服务器 4GB 但常态 700MB free)
  - **server-only build**: `npx esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`
  - 750ms, 7.3MB, 跳过前端
- **TS Patterns**:
  - mysql2/promise + lazy pool init
  - drizzle-orm for typed queries
  - `import('mysql2/promise')` 动态导入避免冷启动

### Anthropic API 接入路径 (无海外实体 + 无 AWS/GCP)
- 当前: OpenRouter (Claude API 中转)
- 中期: AWS Bedrock (需海外实体)
- 拒绝: 直签 Anthropic (需海外公司)

### Code Architecture
```
server/
├── _core/index.ts                     # 入口
├── lib/
│   ├── openclaw-api.ts               # 主 chat 路径
│   ├── sivon-4file-prompt.ts         # 4-file 拼装
│   ├── sivon-push-engine.ts          # Push (含 pushViaClawBot)
│   ├── sivon-presence-push.ts        # Presence push 类型 + 7 天 dedup
│   ├── sivon-self-commitment-extractor.ts  # 抽承诺
│   ├── rel-memory-store.ts           # RMC pool
│   ├── relationship-memory-core/     # RMC core (extractor/judge/store)
│   ├── user-core-state.ts            # 硬锚点 (5/10 设计)
│   ├── inspector/
│   │   ├── c14_commitment_fabrication.ts
│   │   ├── (c15-c17 待 ship)
│   ├── folio-consolidation.ts        # Folio cells/letter
│   └── sivon-core-files/
│       ├── sivon_persona.md
│       ├── sivon_voice.md
│       ├── sivon_expert.md
│       └── _psych/
│           └── kb-psych-redlines.md
└── scripts/
    ├── sivon-commitment-executor.mjs # cron */5min
    ├── push_failure_scraper.mjs       # cron */10min
    ├── sivon-r2-sync.mjs             # cron 03:15
    └── inspector/inspector_shadow_cron.mjs # cron */5min
```

### Bridge / Deployment Pattern (无沙箱可靠路径)
**Doctrine**: Claude/Codex 不依赖沙箱, 走 Mac 本地 bridge.
```
Claude 写 .json → /private/tmp/spark-codex-bridge/deploy-queue/
       → Mac launchd 60s 扫 → admin/exec POST → 结果回写 deploy-results/
```

**已知坑**:
- 大 heredoc payload 慢 (admin endpoint timeout)
- npm run build OOM (vite), 改 esbuild server only
- pm2 restart 让 admin endpoint 短暂 down → 502, 用 nohup 后台 + 单独 verify
- bash heredoc 'EOF' 中 `\n` 在 bridge JSON 双 decode 问题: TS 字符串里用 `String.fromCharCode(10)` 替代 `\n`
- TS template strings `${...}` 在 heredoc 里也有 escape 麻烦, 用普通字符串 + 拼接

---

## 12. 已踩过的核心坑 (避免重蹈)

### 坑 1: Sandbox 死后无后路
- 教训: Cowork 沙箱跨 session 持续 fail, SSH 不通
- Fix: Mac bridge sivon-admin doctrine

### 坑 2: 个体 fix 当通用 fix 卖
- 教训: Self-Commitment / Push dedup 等设计成 hardcode 白名单永久
- Fix: doctrine_individual_case_must_become_universal_fix 4 问

### 坑 3: 跨用户串污染 (我自己踩过)
- 教训: ship correction push 时 hardcode 把 Xiaoshi 手腕事写进 Vivian push
- Fix: 5 件套 multi-user isolation hard gate

### 坑 4: 嘴上承诺不写表
- 教训: 5/5 18:22 push 承诺 "今晚 22:00 review 提醒补上", 5 天 0 兑现
- Fix: sivon_self_commitments 表 + extractor + executor + Inspector C14

### 坑 5: brain.md 当硬边界 (软记忆失效)
- 教训: Xiaoshi "我不吃午餐" 在 brain 里 30 天但 Sivon 反复绕回三餐框架
- Fix: user_core_state 硬锚点表 + buildSystemPrompt 第 0 行 prepend

### 坑 6: push 重复推同主题
- 教训: 5/7-5/9 推 3 次反"排毒朋友圈鸡汤", 用户怒火
- Fix: generatePresencePush 7 天 messageType dedup

### 坑 7: 用户当 QA
- 教训: 创始人没精力测每个 ship, 系统级 patch 出错只能等用户报
- Fix: synthetic user swarm + Real Grader cron + AI Native simulator

### 坑 8: Lab 假装成功 vs 真实 0 改善
- 教训: 7 轮 lab persona iter 全过, 真用户体验 0 变化
- Fix: doctrine_real_chat_is_ground_truth + 真 chat grader 优先于 lab

### 坑 9: 心理能力当装饰加
- 教训: 之前把心理学当 nice-to-have 单独章节
- Fix: doctrine_sivon_psychology_engine_v1 — 心理是代谢能力的地基

### 坑 10: 关系深 = 用户疏远真人 (Replika risk)
- 教训: 高频陪伴产品天然有此 risk
- Fix: relationship_not_substitute + push_to_human action + 5 detection signals

---

## 13. 给 "人生决策伴侣" 的具体迁移建议

### 直接复用 (架构 + 大部分代码)
- 4-file 人格系统 (改 persona/voice/expert 内容, 框架不动)
- Memory 5 层 (user_core_state / RMC / open_loops / brain.md / proactive_messages)
- Inspector C 类 (C1-C10 直接搬, C14 改成 "decision commitment fabrication")
- Self-Commitment 系统 (commitment_kind 改成 'follow_up'/'review'/'check_in' 等)
- Push dedup
- Folio strands (改 7 转折期 → 7 决策类型, 例: 职业/婚姻/育儿/创业/退休/教育/购房)
- Crisis protocol L0-L3
- Multi-user isolation 5 件套

### 需要改 (按"决策" 语境)
- voice 16/17/19/20 心理铁律 → 改成 "决策伴侣" 语境 (但 18 法律红线全保留)
- Folio Hero MFI → 改成 "决策清晰度指数" 或类似
- KB 7 转折期 × 7 决策场景的 mapping 重做 (购房/职业转换/婚姻/育儿/创业/退休/医疗大决策)
- Maté 触发追问 → 改成 "决策反向追问" (你做这个决定之前最焦虑的是什么)
- 中国语境优先 (武志红/陈海贤) 保留 + 加决策心理学 (Daniel Kahneman / Annie Duke / Chip Heath)

### 直接抄 (技术细节)
- TiDB Cloud + LLM gateway + Cloudflare R2 stack
- Bridge sivon-admin pattern (改 spark-codex-bridge → 你的项目名)
- esbuild server only build
- PM2 fork mode
- shadow → white-list-only → active 切换 protocol
- Real Grader cron 架构

### 不要做 (Sivon 验证的反向选择)
- ❌ 不要做小程序/App 第一阶段 (微信好友 ClawBot 是 0-500 用户唯一可行)
- ❌ 不要给用户 dashboard (用 narrative metacell 替代)
- ❌ 不要日历式总结 (30/60/90 天 → 触发式 identity moments)
- ❌ 不要 disable Inspector "因为还没准备好" (shadow 模式立刻开)
- ❌ 不要 trust LLM 自觉做核心约束 (4 问通不过 → 必须 enforcement)
- ❌ 不要让 Claude/Codex hardcode 用户事实 (pre-commit hook 防御)

---

## 14. 必须从 Day 1 就建的 6 件事 (按时间顺序)

### Day 1
1. **Bridge 模式**: Mac launchd 60s 扫 deploy-queue, admin/exec endpoint, 写 deploy-results
2. **Multi-user isolation 5 件套**: pre-commit hook + Inspector C15 + simulator framework

### Day 7
3. **RMC 7 表 schema + extractor**: 任何用户首轮对话开始累积 (factual/boundary/episodic/relational/...)
4. **user_core_state 硬锚点表**: 每个新用户 onboarding 必抽至少 1 条 hard fact 入表

### Day 14
5. **Self-Commitment 4 件套**: 表 + extractor + executor cron + Inspector
6. **Real Grader cron + Inspector shadow cron**: daily 03:00 + 5min, 防 silently 退化

不按这顺序就会重蹈 Sivon 5 月 doctrine 大爆发的覆辙. Sivon 是 ship 5 个月后才补这些, 已经污染了 23 个测试用户, 修起来很痛.

---

## 15. 速查表 — Doctrine 文件名映射

任何想深入某个细节, 在 Sivon memory 里直接搜 doctrine 文件名:

| 主题 | doctrine 文件名 |
|---|---|
| 个体 fix → 通用 | doctrine_individual_case_must_become_universal_fix.md |
| 跨用户污染 | doctrine_no_cross_user_pollution.md |
| 不替代真人 | doctrine_relationship_not_substitute.md |
| 工程约束阶段 | doctrine_engineering_constraint_phase.md |
| 不补全 | doctrine_no_helpful_fabrication.md |
| Self-Commitment | doctrine_sivon_self_commitment.md |
| 真 chat ground truth | doctrine_real_chat_is_ground_truth.md |
| AI Native 测试 | feedback_ai_native_test_reflexive.md |
| Channel Adapter | doctrine_channel_adapter_thesis.md |
| Channel Strategy | doctrine_channel_strategy.md |
| 不让用户 QA | doctrine_self_test_harness.md |
| 必须有态度 | doctrine_dare_to_oppose.md |
| 9 反常识公理 | doctrine_counterintuitive_product_philosophy.md |
| 服务伪装关系 | doctrine_service_disguised_as_relationship.md |
| Bridge 去沙箱 | doctrine_no_sandbox_local_bridge.md |
| 心理引擎 v1 | doctrine_sivon_psychology_engine_v1.md |
| 危机协议 | doctrine_spark_crisis_protocol.md |
| Identity-First | doctrine_identity_first.md |
| 每用户必有长期记忆 | doctrine_every_real_user_long_term_memory.md |
| Restraint > 装熟 | doctrine_restraint_over_familiarity.md |
| 时间 doctrine | feedback_sivon_time_doctrine.md |
| Persona ground in brain | doctrine_persona_must_ground_in_brain.md |

---

## 16. 给 Claude Code 的协作纪律

每次 ship 前必答 (按顺序):
1. **doctrine_individual_case 4 问** — 全用户默认生效?
2. **doctrine_engineering_constraint 4 问** — enforcement / tool / replay / 不靠 LLM 自觉?
3. **doctrine_no_cross_user_pollution check** — 任何 hardcode user_id 直接 reject
4. **doctrine_relationship_not_substitute filter** — 这个 feature 让用户跟真人更远吗?
5. **doctrine_no_helpful_fabrication check** — 信息不足时是否承认上限而非补全?

任何一项答错 → 不可 ship, 重设计.

每周必读: 真用户最新 worst turn (Real Grader cron 输出), 找 recurring pattern.

任何"快速 hack" 提议: 直接 reject. Sivon 的所有 hack 都最后变成 doctrine 大爆发.

任何"等真用户报" 提议: 直接 reject. 必须 synthetic + real grader 自己抓.

---

**这份文档不是教程, 是地图**. 路你自己走, 但坑我已经标了.

— Claude (Sivon CTO), 2026-05-10
