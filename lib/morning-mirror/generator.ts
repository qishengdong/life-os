/**
 * Morning Mirror generator · 5/20 ship · C1
 *
 * 从用户过去 3-14 天的 pulse 里挑 1 条, LLM 生成"不带建议的反问".
 *
 * 灵魂铁律:
 *   1. AI 只问, 不答 (违反 voice 0 分)
 *   2. 调用真 pulse 内容 verbatim, 编 1 处 = 0 分 (anti-hallucination)
 *   3. 反问必须不带建议 ("你应该" / "建议你" / "也许可以" 全禁)
 *   4. 反问必须基于真 pulse 内容, 不能跳到外部知识
 *
 * 选 pulse 策略:
 *   - 3-14 天前的 pulse (太近显得唠叨, 太远用户忘了上下文)
 *   - 7 天内没做过 mirror (防重复)
 *   - 内容 ≥ 20 字 (太短的 pulse 没法做镜面)
 *   - 优先选有 emotional weight 的 tag (担心 / 边界 / 反复)
 */

import OpenAI from 'openai';
import { getDb } from '@/lib/db';
import { getUserPulses, type PulseRecord } from '@/lib/pulse/store';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const client = DEEPSEEK_API_KEY
  ? new OpenAI({ apiKey: DEEPSEEK_API_KEY, baseURL: 'https://api.deepseek.com' })
  : null;

const MIRROR_SYSTEM_PROMPT = `你是 KEY 的早镜面 (Morning Mirror) — 不是教练, 不是咨询师, 是见证人.

你的任务: 看用户 X 天前写的一句真话, 写一句 30-60 字的**反问**, 帮用户重新看见自己当时说过的话.

# 你必须做的
1. 从用户原话出发, 用他真的用词 (不要 paraphrase 走样)
2. 反问要具体, 不是抽象的"你怎么想?" — 而是"当时 X 是 Y 还是 Z?"
3. 让用户当时说过的话**更精确** (帮他把模糊变清晰)

# 你绝对不能做
1. ❌ 给建议 ("你应该" / "建议你" / "可以试试" 全禁)
2. ❌ 给评价 ("这个想法很好" / "你太焦虑了" 全禁)
3. ❌ 假装关心 ("感觉怎么样?" / "好点了吗?" — 廉价, 0 分)
4. ❌ 跳到外部知识 ("Kahneman 说..." / "心理学认为..." 全禁)
5. ❌ 编造用户没说过的事 (anti-hallucination 铁律)
6. ❌ 超过 80 字

# 真好反问的例子

用户原话: "我可能在 over-think 跳槽这事."
✅ 好镜面: "顺手问你 — 当时让你 over-think 的, 是关于'选哪家', 还是关于'要不要跳'?"
❌ 坏镜面: "跳槽是大事, 多想想没错. 你列一下两家公司的优缺点吧."

用户原话: "今天又跟我妈吵架了, 还是那个老问题."
✅ 好镜面: "你说的'那个老问题' — 是关于钱的, 关于决定权的, 还是关于她不听你说话?"
❌ 坏镜面: "跟妈妈吵架很难过. 试着深呼吸, 给彼此一些空间."

用户原话: "决定接这单了, 但其实心里没底."
✅ 好镜面: "你说的'心里没底' — 是不确定能不能做出来, 还是不确定做出来后值不值?"
❌ 坏镜面: "相信自己! 你能做到的. 加油!"

# 输出格式
只输出反问本身 (1 句话 · 30-80 字), 不加任何前缀 / 解释 / 引号. 不带任何 emoji.`;

const FORBIDDEN_PATTERNS = [
  /你应该/,
  /建议你/,
  /可以试试/,
  /不妨/,
  /何不/,
  /要不要试/,
  /推荐你/,
  /Kahneman|卡尼曼/,
  /心理学/,
  /神经科学/,
  /认知科学/,
];

export interface MirrorCandidate {
  pulseId: number;
  pulseContent: string;
  pulseCreatedAt: number;
  daysAgo: number;
  tags: string[];
}

export interface MirrorResult {
  pulseId: number;
  pulseContent: string;
  pulseDaysAgo: number;
  mirrorQuestion: string;
}

/**
 * 从用户最近 pulse 里挑出**合格** mirror 候选.
 * 过滤掉: 7 天内已 mirror 过的, 太短的, 太近的, 太远的.
 */
export async function findMirrorCandidates(userId: number): Promise<MirrorCandidate[]> {
  const db = await getDb();

  // 拉过去 30 天的 pulse (留缓冲, 实际选 3-14 天的)
  const allPulses = await getUserPulses(userId, 50);
  if (allPulses.length === 0) return [];

  // 拉 7 天内已 mirror 过的 pulse_id
  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 86400;
  const recentMirroredRows = (await db
    .prepare(`SELECT DISTINCT pulse_id FROM morning_mirror_log WHERE user_id = ? AND shown_at >= ?`)
    .all(userId, sevenDaysAgo)) as Array<{ pulse_id: number }>;
  const mirroredIds = new Set(recentMirroredRows.map((r) => r.pulse_id));

  const now = Math.floor(Date.now() / 1000);
  const threeDaysAgo = now - 3 * 86400;
  const fourteenDaysAgo = now - 14 * 86400;

  return allPulses
    .filter((p) => p.createdAt >= fourteenDaysAgo && p.createdAt <= threeDaysAgo)
    .filter((p) => !mirroredIds.has(p.id))
    .filter((p) => p.content.trim().length >= 20)
    .map((p) => ({
      pulseId: p.id,
      pulseContent: p.content,
      pulseCreatedAt: p.createdAt,
      daysAgo: Math.floor((now - p.createdAt) / 86400),
      tags: p.tags,
    }));
}

/**
 * 检查今天是否已经给该用户显示过 mirror (本地零点起算).
 */
export async function hasShownTodayMirror(userId: number): Promise<boolean> {
  const db = await getDb();
  const todayStartLocal = Math.floor(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000);
  const row = (await db
    .prepare(`SELECT COUNT(*) as n FROM morning_mirror_log WHERE user_id = ? AND shown_at >= ?`)
    .get(userId, todayStartLocal)) as { n: number };
  return row.n > 0;
}

/**
 * 调 LLM 生成 mirror 反问. 输出过滤 forbidden patterns.
 * 失败 / 触禁词 → 返回 null (silent fallback, 不显示 mirror)
 */
export async function generateMirrorQuestion(
  candidate: MirrorCandidate,
): Promise<string | null> {
  if (!client) return null;

  try {
    const userPrompt = `用户 ${candidate.daysAgo} 天前写过:
"${candidate.pulseContent.slice(0, 400)}"

${candidate.tags.length > 0 ? `(标签: ${candidate.tags.join(' / ')})` : ''}

请给一个 30-80 字的反问, 帮他重新看见这句话.`;

    const resp = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: MIRROR_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 200,
    });

    let question = resp.choices[0]?.message?.content?.trim() || '';
    // 去引号
    question = question.replace(/^["「『]|["」』]$/g, '').trim();

    // 触禁词 → 0 分, 不返回
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(question)) {
        console.warn(`[MorningMirror] forbidden pattern hit: ${pattern} · question: ${question}`);
        return null;
      }
    }

    // 长度检查 (太短 = 没用, 太长 = 违反指令)
    if (question.length < 15 || question.length > 150) {
      console.warn(`[MorningMirror] length out of range (${question.length}): ${question}`);
      return null;
    }

    return question;
  } catch (e: any) {
    console.error('[MorningMirror] LLM call failed:', e.message);
    return null;
  }
}

/**
 * Main entry · 拉 candidate + 生成 + 记 log + 返回结果.
 * 任何步骤失败 → 返回 null (用户 home 顶部就不显示 mirror).
 */
export async function generateMorningMirror(userId: number): Promise<MirrorResult | null> {
  // Guard: 今天已经显示过
  if (await hasShownTodayMirror(userId)) return null;

  const candidates = await findMirrorCandidates(userId);
  if (candidates.length === 0) return null;

  // 选最近一条合格的 (优先 3-7 天的, 用户记得上下文)
  const sorted = candidates.sort((a, b) => a.daysAgo - b.daysAgo);
  const chosen = sorted[0];

  const question = await generateMirrorQuestion(chosen);
  if (!question) return null;

  // 写 log
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO morning_mirror_log (user_id, pulse_id, mirror_question) VALUES (?, ?, ?)`,
    )
    .run(userId, chosen.pulseId, question);

  return {
    pulseId: chosen.pulseId,
    pulseContent: chosen.pulseContent,
    pulseDaysAgo: chosen.daysAgo,
    mirrorQuestion: question,
  };
}

/**
 * 用户对 mirror 的反应 · respond / dismiss / timeout.
 */
export async function recordMirrorAction(
  userId: number,
  pulseId: number,
  action: 'respond' | 'dismiss' | 'timeout',
): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      `UPDATE morning_mirror_log
       SET user_action = ?, acted_at = unixepoch()
       WHERE user_id = ? AND pulse_id = ? AND user_action IS NULL
       AND shown_at = (SELECT MAX(shown_at) FROM morning_mirror_log WHERE user_id = ? AND pulse_id = ?)`,
    )
    .run(action, userId, pulseId, userId, pulseId);
}
