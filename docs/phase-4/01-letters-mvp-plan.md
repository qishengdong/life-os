# Phase 4a · Letters MVP — 完整 sprint plan

**Sprint 周期**: 1 周 (7 个工作日)
**Goal**: 让 KEY 第一次有"高频日常入口". 用户可以每天写一封信, KEY 用编辑回信. 出版物形式, 不是 chat. 这是 KEY 真正的护城河起点.

---

## 1. 核心交互定义

### 写信 (用户侧)

**入口路径**:
```
/letters           ← 信件流主页 (列表 + "写新信" CTA)
/letters/new       ← 写信页 (空信纸)
/letters/[id]      ← 单封信详情 (用户写的 + KEY 回的, 并列显示)
```

**写信页 (`/letters/new`)**:
- 一张空白信纸 (paper texture, A4 比例, 内边距宽)
- 顶部: 日期 `2026 · 5 · 13 · 周二 · 致 KEY 编辑部` (像信抬头)
- 中间: 一个 `<textarea>` 但是看起来不像 textarea — 没有 border, paper-cursor blink, font-serif 阅读字号, 行距 1.75
- 占位符: 无 (拒绝 "今天怎么样?", 太鸡汤). 默认空白
- 字数计数: 极小, 右下角, 灰色, 不强调
- 提交: 一个 "寄出" 按钮, burgundy 印章风格, 提交后跳到 `/letters/[id]?status=pending`

**等回信状态**:
- 显示一个 "KEY 编辑部正在阅读你的来信..." 提示
- 这是有意的 — 我们要给"距离感"
- 大约 3-10 分钟后 (V1 简化为 5-30 秒, 后续可加真延迟)
- 状态 polling: 每 5 秒 poll 一次, 看回信是否就绪
- 不允许 streaming, 一次性出现完整的信

**收信 (`/letters/[id]`)**:
- 上半: 用户写的信 (信纸纹理, 字号正常)
- 中间: 一个 fleuron divider (✦)
- 下半: KEY 回的信:
  - 称呼 (J. / Mr. X / 默认 "致读者")
  - 3-5 段正文 (font-serif, line-height 1.75)
  - 至少 1 个引用块 (引自 Canon — 即使 V1 没有 canon, 也用 hardcoded examples)
  - 落款: `KEY Editorial Office`
  - 编号: `LE-20260513-001` (Letter Edition)
  - 印章 (复用 BriefSeal round-cn variant, size=72)

### 信件流 (`/letters`)
- 顶部: "写一封新的" CTA (burgundy 印章按钮)
- 下方: 历史信件列表, 每条:
  - 日期 (大字号 burgundy)
  - 用户开头 30 字 (节选)
  - KEY 回信开头 30 字 (节选)
  - 编号 `LE-...`
  - 状态标 (pending / 已回信)
- 像翻一本"通信集"

---

## 2. 数据库 schema

新表:

```sql
CREATE TABLE letters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- 用户写的
  user_content TEXT NOT NULL,             -- 用户写的信全文
  user_char_count INTEGER,                -- 字数 (CN counting)

  -- KEY 回的
  reply_content TEXT,                     -- KEY 回信全文 (null = pending)
  reply_char_count INTEGER,
  reply_authored_at INTEGER,              -- 回信完成时间 (unix sec)

  -- Metadata
  letter_number TEXT NOT NULL UNIQUE,     -- LE-YYYYMMDD-NNN
  status TEXT NOT NULL DEFAULT 'pending', -- pending / replied / failed
  failure_reason TEXT,                    -- if status=failed

  -- Pipeline metadata
  tokens_used INTEGER,
  model_used TEXT,
  duration_ms INTEGER,

  -- Canon retrieval audit (空在 V1, 接上 4b 后开始记)
  canon_quotes_used TEXT,                 -- JSON array of canon quote IDs
  brain_facts_used TEXT,                  -- JSON array of fact IDs
  framework_matched TEXT,                 -- 匹配的 framework / sub-framework

  -- 时间
  authored_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_letters_user ON letters(user_id, authored_at DESC);
CREATE INDEX idx_letters_status ON letters(status);
CREATE UNIQUE INDEX idx_letters_number ON letters(letter_number);
```

迁移文件: `lib/db/migrations/0XX-letters.sql` (按现有命名规则)

---

## 3. Letter pipeline (后端 LLM)

`lib/letters/pipeline.ts` 新文件:

```typescript
export async function generateReply({
  userId,
  userContent,
  letterNumber,
}: {
  userId: number;
  userContent: string;
  letterNumber: string;
}): Promise<{
  success: boolean;
  reply?: string;
  framework?: string;
  canonQuotes?: string[];
  brainFacts?: string[];
  tokensUsed?: number;
  durationMs?: number;
  error?: string;
}>
```

### 流程 (V1, 4a 只做这个)

```
1. 接收 user content
   ↓
2. (Optional, V1 跳过) classify framework / sub-framework
   仅做轻量分类: parent-care / marriage / work / 自我 / 关系 / 金钱 / ...
   一个简短 LLM call, ~200 tokens
   ↓
3. 从 brain retrieval 相关历史 (现有 brain consolidator API)
   top 3-5 facts, 跟 user_content embedding 相似
   ↓
4. (4a V1 hardcoded, 4b 接上 canon retrieval)
   V1: 根据 framework 从一个 hardcoded `LETTER_CANON_SEED` 选 1-2 句引文
   V2 (4b): 从 canon_quotes 表 embedding 检索 top-3
   ↓
5. 构造 prompt:
   - System: KEY voice spec (见下)
   - Context: 用户历史 facts + canon 引文
   - User: 当前来信
   ↓
6. LLM call (Claude 3.5 Sonnet 或 GPT-4o, 单 pass)
   target output 400-1000 字, 不能更长
   ↓
7. Validate:
   - 字数在范围 (400-1000)
   - 至少 1 个引文 (canon 出现)
   - 至少 1 个 "你说过" / "上次" / 时间锚 (brain 出现)
   - 没有 banned phrases (见下)
   ↓
8. 返回 reply
```

### KEY Letter Voice Spec (system prompt 核心)

```
你是 KEY 编辑部的资深编辑, 给一位长期通信的读者回信.

你的位置:
- 不是治疗师 (不诊断, 不规劝)
- 不是朋友 (不"加油", 不"挺住")
- 不是 AI 助手 (不"我可以帮你...")
- 你是一位读过书、有判断、有距离的编辑

你的语言:
- 中文为主, 偶尔点缀英文短语 / 拉丁原文 (如 ad hoc / sine qua non)
- 段落 3-5 个, 每段 80-200 字
- 句子有长有短, 但不堆砌
- 不用 emoji
- 不用感叹号 (除非引用)
- 不用问号堆叠 ("你觉得呢? 你怎么想?")

你的内容必须包含:
- 至少 1 个引文 (出处 + 一句话) — 我会在 context 里给你 1-2 个候选, 你择一
- 至少 1 个对用户过往的回响 ("上次你提到 ..." / "我记得你写过 ...")
- 至少 1 个克制的提问或观察 (不预测未来, 不判决对错)

你绝对不能:
- 用 "我理解你的感受" / "你不孤单" / 任何泛化共情
- 给具体建议 ("你可以试试...")
- 评价对错 ("你这样想是对的")
- 用 "首先 / 其次 / 最后" 这种 list 结构
- 提到自己是 AI / LLM / 编辑部以外的身份
- 流露任何"加油" / "挺住" / "你能行" 暗示

格式:
- 回信开头: "J." 或读者自选称谓 (V1 默认 "致读者")
- 主体段落
- 结尾不签名 (落款由系统加, 你只写正文)
- 不要用 markdown (不要 **bold** / # heading)
```

### Banned phrases (自动 reject)

```typescript
const BANNED = [
  '我理解你的感受',
  '你不孤单',
  '加油',
  '挺住',
  '我可以帮你',
  '首先',
  '其次',
  '希望你',
  '不要灰心',
  // ... 完整 30 条
];
```

如果输出含任何一条, 重试一次. 重试还失败, 改给保守 fallback 回信 ("信收到, 这一封我读了三遍 ... 给我一些时间想想再回").

### V1 Canon seed (V1 hardcoded, 给 letter pipeline 用)

```typescript
// lib/letters/canon-seed.ts
export const LETTER_CANON_SEED: Record<string, Array<{quote: string; author: string; source: string}>> = {
  'parent-care': [
    {
      quote: '我们尽力赡养他们, 不是因为他们曾让我们成人, 而是因为他们曾尽力让自己不打扰我们.',
      author: '木心',
      source: '《文学回忆录》',
    },
    // ... 5-8 条
  ],
  'marriage': [...],
  'work-meaning': [...],
  'self': [...],
  // 6-8 个 framework × 5-8 条 = ~40-60 条
};
```

这是 4a 的"V1 知识库 stub". 4b 时 swap 成真 canon retrieval.

---

## 4. API 设计

```
POST /api/letters
  body: { content: string }
  headers: x-user-uid
  → 201 { letterId, letterNumber, status: 'pending' }
  → 后台异步 generateReply, 同时返回 letter row

GET /api/letters
  headers: x-user-uid
  → { letters: [...] } (用户全部信)

GET /api/letters/[id]
  headers: x-user-uid
  → letter detail (含 reply 如果就绪)

POST /api/letters/[id]/retry
  (admin / 用户重试 KEY 回信; 仅 status=failed 时允许)
```

`POST /api/letters` 必须**非阻塞**返回 — letter row 创建 + 后台 fire-and-forget pipeline call. 这样用户立刻看到 pending 状态.

---

## 5. UI 详细规格

### `/letters` 信件流页 — 布局清单

从上到下:

1. **顶 nav**: KEY wordmark (左) · 返回 Home (右)
2. **Eyebrow**: `· KEY EDITORIAL OFFICE · LETTERS ·` (uppercase, 字距 0.3em, burgundy)
3. **H1**: "我们的通信集" (editorial-xl, font-serif)
4. **Subtitle**: "那些跟谁都说不出口的, 写给 KEY. 我们 3-10 分钟回信. 永远不评价." (italic, ink-700)
5. **CTA**: `[ 写一封新的信 → ]` burgundy 印章风格按钮 (复用 V3 BriefSeal mark)
6. **分隔**: fleuron-double-rule
7. **信件列表** (每条卡片):
   - 大日期: `2026 · 5 · 13 · 周二` (font-serif xl, burgundy)
   - Issue tag: `LE-20260513-001` (mono small)
   - 用户开头节选 (30 字 + "..." font-serif)
   - KEY 回信开头节选 (30 字 + "..." font-serif italic ink-500)
   - 右下: `✓ 已回 · 阅读 →` 或 `⏳ KEY 在读 · 5 分钟内`

### `/letters/new` 写信页 — 布局清单

从上到下:

1. **顶 nav**: KEY wordmark · 返回 `/letters`
2. **信抬头** (小字):
   - 日期 `2026 · 5 · 13 · 周二`
   - 收信方 `致 KEY 编辑部`
3. **空白信纸** (核心):
   - 一张 paper-texture div, max-w-prose-xl, py-16, 内边距宽
   - 内嵌一个 textarea, 但**不显示 textarea 边框** (border-0 outline-0 resize-none)
   - 字体: font-serif text-reading editorial-leading
   - cursor: 自定义 burgundy blink (复用 globals.css `.ink-cursor`)
   - 占位符: **无** (拒绝 "今天怎么样?" 这种 prompt)
   - 自动聚焦, 自动扩展高度
4. **字数计数** (极小, 右下角, ink-300 灰色): `348 字`
5. **寄出按钮**:
   - burgundy 印章风格 (复用 btn-seal class)
   - 文案 "寄出 →" (不是 "提交" 或 "发送")
   - 提交后跳 `/letters/[id]?status=pending`

### `/letters/[id]` 信件详情 — 布局清单

从上到下:

1. **顶 nav**: KEY wordmark · 返回 `/letters`
2. **Issue 编号**: `· LE-20260513-001 ·` 居中 small caps
3. **「我的信」section** (我写的):
   - Eyebrow `我的信` uppercase tiny
   - 信纸 paper texture 卡片
   - 内: 抬头 (日期 + 致 KEY 编辑部) + 全文 (font-serif, 行距 1.75)
   - 不带印章
4. **Fleuron divider** (中间): 一个 fleuron ✦ 居中, 上下大量留白
5. **「KEY 编辑部 回信」section**:
   - Eyebrow `KEY 编辑部 回信` uppercase tiny burgundy
   - 信纸 paper texture 卡片 (略带 burgundy hairline 顶部, 区别"来信")
   - 内:
     - 称呼 (J. 或 "致读者") drop cap
     - 3-5 段正文 (font-serif, 行距 1.75)
     - 至少 1 个引用 blockquote (canon 引文 + 出处)
     - "你之前写过 ..." brain 回响段
     - 落款 + Issue 编号
     - 印章 (BriefSeal round-cn size=64 右下浮动)
   - **整封一次性显示** — 不允许 streaming, 不允许气泡

视觉守则: 信纸的 paper texture 跟全站 grain 叠加, 让信"真有质感". `/letters/[id]` 阅读时滚动到底等于"读完一封信", 不是 chat 历史下拉.

---

## 6. 实施清单 (按天)

| Day | 任务 | 交付 |
|---|---|---|
| Day 1 | DB migration `letters` table + `lib/letters/store.ts` (CRUD) | typecheck pass, 单元测试 |
| Day 2 | `lib/letters/pipeline.ts` 单 pass LLM + voice spec system prompt | 能跑一个 toy 输入出回信 |
| Day 2 | `lib/letters/canon-seed.ts` 6 framework × 6 条 = 36 条引文种子 | 文件 |
| Day 3 | API routes: `POST/GET /api/letters`, `GET /api/letters/[id]` | curl 能跑通 |
| Day 4 | UI: `/letters` 信件流页 (列表 + CTA) | screenshot |
| Day 5 | UI: `/letters/new` 写信页 (信纸视觉) | screenshot |
| Day 6 | UI: `/letters/[id]` 详情页 (信件 + 回信 + 印章) | screenshot |
| Day 7 | Voice spec 迭代 — 写 20 条测试输入, 调到回信全部符合 voice. banned phrase 检测. retry 逻辑. | 20/20 测试通过 |
| 收尾 | 首页 hero CTA rebalance — letters 第一, brief 第二 | commit + push |

---

## 7. 风险 + 应对

| 风险 | 应对 |
|---|---|
| LLM 输出泛化共情 ("我理解你的感受") | banned phrases hard filter + retry; retry 失败给保守 fallback |
| LLM 编引文 (假 quote) | V1 强制只用 LETTER_CANON_SEED 里的引文, prompt 严格. V2 (4b) 用 canon retrieval, 引文必来自真 DB |
| 用户写得太短 (< 30 字) | 仍然回, 但 KEY 回信也短 (200-400 字). 不强制最低字数 |
| 用户写很长 (> 5000 字) | OK, KEY 回信也可长. 但 LLM context window 留余地 (16K tokens) |
| 等回信用户跳走 | V1 polling 5s, 加 push notification (browser API) 提示"信回来了" |
| LLM 失败 / 超时 | status='failed', UI 显示 "信件未送达, [重试]". 用户可主动 retry |

---

## 8. 不在 4a (放到后续 phase)

- ❌ Canon library retrieval (4b)
- ❌ Letter ↔ Pulse 互通 (4c)
- ❌ Letter ↔ Brain 主题聚合 (4c)
- ❌ Sunday Review V2 (看 letters) (4d)
- ❌ KEY 主动 outreach (用户连续 3 天没写, KEY 主动来信) — Phase 5+ 考虑
- ❌ Reply chain (用户对 KEY 回信再回) — V1 一来一回, V2 考虑

---

## 9. 成功标准 (4a 结束时)

- ✅ 用户可以在 `/letters/new` 写信
- ✅ KEY 在 30 秒内 (V1) 回信完成
- ✅ 回信符合 voice spec (人工 review 20 条样本, 0 条 banned phrase)
- ✅ 信件历史在 `/letters` 流式可读
- ✅ 整个体验是"出版物 + 信件", 不是 chatbot 气泡
- ✅ 至少 3 个内部测试用户 (你 + 我模拟 + alpha 测) 写过 ≥ 5 封信

完成后, 进 4b Canon library.
