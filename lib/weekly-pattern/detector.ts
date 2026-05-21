/**
 * Weekly Pattern Mirror · 5/20 ship · C2
 *
 * 周六 / 周日, 看用户本周 7 条 pulse, 找 1 个**真重复** pattern.
 *
 * 灵魂铁律:
 *   1. 不下结论 (只摆事实)
 *   2. 真重复定义: 至少 2 条 pulse 真的提到同类话题 / 用了相似措辞 / 触发同一情绪
 *   3. 引用真原文 verbatim (不编造)
 *   4. 反问留给用户自己看 (不替用户解读)
 *
 * 调用频次:
 *   - 仅周六 / 周日触发 (周一-周五 返回 null)
 *   - 1 个用户 1 周只看 1 次 (用 weekly_pattern_log 防重)
 *   - 用户本周写过 ≥ 3 条 pulse 才启用 (太少没 pattern 可言)
 */

import OpenAI from 'openai';
import { getDb } from '@/lib/db';
import { getUserPulses, type PulseRecord } from '@/lib/pulse/store';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const client = DEEPSEEK_API_KEY
  ? new OpenAI({ apiKey: DEEPSEEK_API_KEY, baseURL: 'https://api.deepseek.com' })
  : null;

const PATTERN_SYSTEM_PROMPT = `你是 KEY 的周末关联 (Weekly Pattern Mirror) — 见证人, 不下结论.

你刚收到一个用户本周写的所有"今日一句". 你的任务: 找 1 个**真重复**的 pattern, 把它摆出来给他自己看.

# 你的输出 (严格 JSON)
{
  "has_pattern": true | false,
  "pattern_theme": "1 句话描述 pattern · 不超过 30 字 · 用用户真用词",
  "evidence_pulse_ids": [id1, id2, ...] // 至少 2 个真 pulse_id
  "non_advice_question": "1 句反问 · 30-80 字 · 不下结论 · 不给建议",
}

# 真好 pattern 的例子

输入: 7 条 pulse 里有 3 条用了"太着急" / "急了" / "等不及"
✅ 好 pattern:
{
  "has_pattern": true,
  "pattern_theme": "本周你说了 3 次'我太着急了'",
  "evidence_pulse_ids": [12, 15, 17],
  "non_advice_question": "顺手问你 — 这 3 次的'着急', 是关于同一件事的不同时刻, 还是 3 件不同的事都让你急?"
}

输入: 7 条 pulse 里有 2 条提到"妈妈" + 1 条提到"父亲"
✅ 好 pattern:
{
  "has_pattern": true,
  "pattern_theme": "本周你 3 次提到父母",
  "evidence_pulse_ids": [10, 13, 16],
  "non_advice_question": "你说的关于父母的 3 件事 — 是各自独立的事, 还是同一种感觉的 3 个面?"
}

输入: 7 条 pulse 各说各的 · 没明显重复
✅ 好 pattern:
{
  "has_pattern": false,
  "pattern_theme": "",
  "evidence_pulse_ids": [],
  "non_advice_question": ""
}

# 你绝对不能做
1. ❌ 给建议 / 评价 / 鸡汤
2. ❌ 编造 user 没说过的事
3. ❌ 假 pattern (1 条 pulse 撑不起 pattern · evidence < 2 = has_pattern: false)
4. ❌ 跳到外部知识 ("Kahneman..." / "心理学..." 全禁)
5. ❌ 替用户解读 ("这说明你有焦虑倾向" — 0 分)
6. ❌ "已" / "了" 暗示判断结束 ("你本周已经显示出..." — 0 分)`;

const FORBIDDEN_PATTERNS = [
  /你应该/,
  /建议你/,
  /可以试试/,
  /不妨/,
  /何不/,
  /推荐你/,
  /Kahneman|卡尼曼/,
  /心理学/,
  /神经科学/,
  /显示出.*倾向/,
  /有.*焦虑/,
  /建议/,
];

export interface WeeklyPatternResult {
  hasPattern: true;
  patternTheme: string;
  evidence: Array<{ pulseId: number; content: string; createdAt: number }>;
  question: string;
}

/**
 * 创建周关联 log 表 (如果还没) · 防止同一周重复显示
 */
async function ensureLogTable(): Promise<void> {
  const db = await getDb();
  await db.exec(`CREATE TABLE IF NOT EXISTS weekly_pattern_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    week_start INTEGER NOT NULL,
    pattern_theme TEXT,
    evidence_pulse_ids TEXT,
    question TEXT,
    shown_at INTEGER DEFAULT (unixepoch()),
    user_action TEXT CHECK(user_action IN ('view','dismiss','respond')),
    acted_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, week_start)
  )`);
}

/**
 * 计算本周 (周一 00:00 BJT) 的 timestamp
 */
function getThisWeekStart(): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return Math.floor(monday.getTime() / 1000);
}

/**
 * 是否今天是周六 / 周日 (BJT)
 */
function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 6 || day === 0; // Sat=6, Sun=0
}

export async function getWeeklyPatternForUser(userId: number): Promise<WeeklyPatternResult | null> {
  if (!client) return null;
  if (!isWeekend()) return null;

  await ensureLogTable();

  const db = await getDb();
  const weekStart = getThisWeekStart();

  // Guard: 本周已经显示过 → 跳
  const existing = (await db
    .prepare(`SELECT id FROM weekly_pattern_log WHERE user_id = ? AND week_start = ?`)
    .get(userId, weekStart)) as { id: number } | undefined;
  if (existing) return null;

  // 拉本周 pulse (周一 00:00 BJT 起)
  const allPulses = await getUserPulses(userId, 30);
  const thisWeekPulses = allPulses.filter((p) => p.createdAt >= weekStart);

  // 至少 3 条才有 pattern 可言
  if (thisWeekPulses.length < 3) return null;

  // 调 LLM
  try {
    const pulseList = thisWeekPulses
      .map((p) => {
        const day = new Date(p.createdAt * 1000).getDay();
        const dayName = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day];
        return `[id=${p.id}] ${dayName} · "${p.content.slice(0, 300)}"`;
      })
      .join('\n');

    const userPrompt = `用户本周 (${thisWeekPulses.length} 条) 写的 pulse:

${pulseList}

请找 1 个真重复 pattern (≥2 条 pulse 真支撑). 严格按 JSON 输出.`;

    const resp = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: PATTERN_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const raw = resp.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);

    if (!parsed.has_pattern) return null;
    if (!Array.isArray(parsed.evidence_pulse_ids) || parsed.evidence_pulse_ids.length < 2) return null;

    // 反查 evidence 是不是真 pulse_id (anti-hallucination)
    const validIds = new Set(thisWeekPulses.map((p) => p.id));
    const evidenceIds = parsed.evidence_pulse_ids.filter((id: number) => validIds.has(id));
    if (evidenceIds.length < 2) return null; // LLM 编造了 ID

    // 触禁词检查
    const question = String(parsed.non_advice_question || '').trim();
    const theme = String(parsed.pattern_theme || '').trim();
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(question) || pattern.test(theme)) {
        console.warn(`[WeeklyPattern] forbidden pattern: ${pattern}`);
        return null;
      }
    }

    if (question.length < 15 || question.length > 200) return null;
    if (theme.length < 5 || theme.length > 50) return null;

    // 组 evidence 真原文
    const evidence = evidenceIds.map((id: number) => {
      const p = thisWeekPulses.find((x) => x.id === id)!;
      return { pulseId: p.id, content: p.content, createdAt: p.createdAt };
    });

    // 写 log
    await db
      .prepare(
        `INSERT INTO weekly_pattern_log (user_id, week_start, pattern_theme, evidence_pulse_ids, question)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(userId, weekStart, theme, JSON.stringify(evidenceIds), question);

    return {
      hasPattern: true,
      patternTheme: theme,
      evidence,
      question,
    };
  } catch (e: any) {
    console.error('[WeeklyPattern] LLM call failed:', e.message);
    return null;
  }
}

export async function recordWeeklyPatternAction(
  userId: number,
  action: 'view' | 'dismiss' | 'respond',
): Promise<void> {
  await ensureLogTable();
  const db = await getDb();
  const weekStart = getThisWeekStart();
  await db
    .prepare(
      `UPDATE weekly_pattern_log
       SET user_action = ?, acted_at = unixepoch()
       WHERE user_id = ? AND week_start = ? AND user_action IS NULL`,
    )
    .run(action, userId, weekStart);
}
