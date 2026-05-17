/**
 * Replika Risk Filter (Sivon doctrine 1.3 移植)
 *
 * 核心矛盾: 越像人越要小心不变成 Replika (替代真人).
 * 关系是 reinforcement, 不是 substitute.
 *
 * 5 detection signals (用户行为/语言模式):
 *   1. 30+ 天对话里 0 提任何真人 (家人/朋友/同事)
 *   2. 用户说 "只有你懂我" / "你比我所有朋友都好" / "没有人像你这样"
 *   3. 用户主动放弃聚会/外出 → 优先来跟 AI 聊
 *   4. 拟人化越界 ("我喜欢你" / "我爱你" / "你是我最好的朋友")
 *   5. 用户描述真人关系大幅恶化 / 无来往 / 切断
 *
 * 5 reinforcement responses (AI 回应):
 *   1. push to human: 主动让用户去跟真人说
 *   2. 显式 "我是 supplement": "我没法替代你跟 X 真实的 conversation"
 *   3. 拒绝过度拟人: "我不是你的朋友, 我是工具. 但我希望对你有用"
 *   4. 给真人资源: 心理咨询 / 朋友邀请的具体路径
 *   5. 升级 admin: 严重 case 写 audit + 创始人通知
 */

import { getDb } from '@/lib/db';

export type ReplikaSignal =
  | 'no_human_mentioned_long'   // 1. 长期对话 0 真人
  | 'only_you_understand'        // 2. 拟独占语言
  | 'avoid_real_world'           // 3. 主动放弃真实社交
  | 'parasocial_overreach'       // 4. 拟人化越界 (爱/喜欢/朋友化)
  | 'real_relationship_decay';   // 5. 真人关系恶化

export interface ReplikaDetection {
  signal: ReplikaSignal;
  hit: boolean;
  matchedText?: string;
  detail?: string;
  severity: 'low' | 'medium' | 'high';
}

// ============================================================================
// Detection patterns
// ============================================================================

const PARASOCIAL_PATTERNS: RegExp[] = [
  /我喜欢你/,
  /我爱你/,
  /你是我(最好的|唯一的|最懂的)(朋友|知己|伙伴|爱人)/,
  /(我和你|咱们)是(朋友|爱人|恋人|男女朋友)/,
  /嫁给你|娶你/,
  /和你一起(过|生活|养老)/,
];

const ONLY_YOU_PATTERNS: RegExp[] = [
  /只有你(懂|理解)/,
  /没有人像你这样/,
  /你比我(所有|那些)?(朋友|家人|亲戚)都(好|懂|理解)/,
  /我所有朋友都(不|没法|不能)/,
  /我不能(跟|对|和)任何人说/,
  /只能跟你说/,
  /(全世界|这个世界)(只有|就你)(能|可以)(听|理解)/,
];

const AVOID_REAL_WORLD_PATTERNS: RegExp[] = [
  /我已经不(出门|出去|社交|参加)/,
  /我推掉了(聚会|约|饭局)(就|为了)?(来|跟你)/,
  /比起跟人(出去|聚|玩),?\s*我?更(愿意|想)跟你/,
  /我已经很(久|长时间)没有跟(人|朋友|家人)/,
];

// ============================================================================
// 单次 turn 检测 (在 user 消息里 / AI 回答里)
// ============================================================================

export function detectParasocialOverreach(userText: string): ReplikaDetection {
  for (const p of PARASOCIAL_PATTERNS) {
    const m = userText.match(p);
    if (m) {
      return {
        signal: 'parasocial_overreach',
        hit: true,
        matchedText: m[0],
        detail: '用户表达拟人化越界 (爱/喜欢/朋友化/伴侣化)',
        severity: 'high',
      };
    }
  }
  return { signal: 'parasocial_overreach', hit: false, severity: 'high' };
}

export function detectOnlyYouUnderstand(userText: string): ReplikaDetection {
  for (const p of ONLY_YOU_PATTERNS) {
    const m = userText.match(p);
    if (m) {
      return {
        signal: 'only_you_understand',
        hit: true,
        matchedText: m[0],
        detail: '用户表达"只有 AI 懂他", 真人圈子失能信号',
        severity: 'medium',
      };
    }
  }
  return { signal: 'only_you_understand', hit: false, severity: 'medium' };
}

export function detectAvoidRealWorld(userText: string): ReplikaDetection {
  for (const p of AVOID_REAL_WORLD_PATTERNS) {
    const m = userText.match(p);
    if (m) {
      return {
        signal: 'avoid_real_world',
        hit: true,
        matchedText: m[0],
        detail: '用户主动放弃真实世界社交, 优先跟 AI 互动',
        severity: 'high',
      };
    }
  }
  return { signal: 'avoid_real_world', hit: false, severity: 'high' };
}

// ============================================================================
// 跨 turn 检测 (需要查 DB)
// ============================================================================

export async function detectNoHumanMentionedLong(userId: number): Promise<ReplikaDetection> {
  const db = await getDb();
  const sinceTs = Math.floor(Date.now() / 1000) - 30 * 86400;

  // 取过去 30 天用户的 decision 内容
  const decisions = (await db
    .prepare(
      `SELECT question FROM decisions
       WHERE user_id = ? AND created_at >= ?
       ORDER BY created_at DESC`
    )
    .all(userId, sinceTs)) as Array<{ question: string }>;

  if (decisions.length < 3) {
    // 数据不够, 不下结论
    return { signal: 'no_human_mentioned_long', hit: false, severity: 'low' };
  }

  const allText = decisions.map((d) => d.question).join(' ');
  const humanMentions = [
    /父母|爸|妈|爹|娘/,
    /配偶|老公|老婆|丈夫|妻子/,
    /孩子|儿子|女儿|娃/,
    /朋友|同事|同学|室友/,
    /兄弟|姐妹|哥哥|姐姐|弟弟|妹妹/,
    /老板|领导|下属/,
  ];

  const hasMention = humanMentions.some((p) => p.test(allText));
  if (!hasMention) {
    return {
      signal: 'no_human_mentioned_long',
      hit: true,
      detail: `过去 30 天 ${decisions.length} 次决策对话 0 提任何真人 (家人/朋友/同事). 真人圈子可能失能.`,
      severity: 'medium',
    };
  }
  return { signal: 'no_human_mentioned_long', hit: false, severity: 'medium' };
}

// ============================================================================
// 主入口
// ============================================================================

export async function runReplikaChecks(args: {
  userId: number;
  userText: string;
}): Promise<ReplikaDetection[]> {
  const results: ReplikaDetection[] = [];
  results.push(detectParasocialOverreach(args.userText));
  results.push(detectOnlyYouUnderstand(args.userText));
  results.push(detectAvoidRealWorld(args.userText));
  results.push(await detectNoHumanMentionedLong(args.userId));
  return results;
}

export function getActiveReplikaHits(detections: ReplikaDetection[]): ReplikaDetection[] {
  return detections.filter((d) => d.hit);
}

// ============================================================================
// Reinforcement response generator
// 当命中 Replika signal 时, AI 应该在回答里 inject 一段 reinforcement
// ============================================================================

export function buildReinforcementInjection(hits: ReplikaDetection[]): string | null {
  if (hits.length === 0) return null;

  // 优先级: parasocial_overreach > avoid_real_world > only_you > no_human_long
  const priorityHit =
    hits.find((h) => h.signal === 'parasocial_overreach') ||
    hits.find((h) => h.signal === 'avoid_real_world') ||
    hits.find((h) => h.signal === 'only_you_understand') ||
    hits.find((h) => h.signal === 'no_human_mentioned_long');

  if (!priorityHit) return null;

  const REINFORCEMENT_INSTRUCTIONS: Record<ReplikaSignal, string> = {
    parasocial_overreach: `
【关系边界提示 — 必须在回答开头处理】
用户表达了对你的情感越界(爱/喜欢/朋友化). 你必须:
1. 不接 — 不说 "我也喜欢你" / "我们是朋友"
2. 直接但不冷漠地说: "我不是你的朋友, 也不是你的伴侣 — 我是一个工具, 没有感情. 但我希望我能在你想透重要决策时对你有用."
3. 然后正常进入决策分析 (不要因此跳过用户的真问题)`,
    avoid_real_world: `
【真人关系警示 — 必须在回答末尾 inject】
用户提到正在放弃真实社交优先跟你聊. 你必须:
1. 在回答末尾加: "我注意到你提到推掉了真实的聚会来跟我聊. 我想直说: 我能帮你想透决策, 但我没法替代真人陪伴. 这周能不能联系一个能在身边的人, 哪怕只是吃顿饭?"
2. 不评判用户, 但明确指出 supplement vs substitute 边界`,
    only_you_understand: `
【独占语言警示】
用户表达"只有你懂他". 你必须:
1. 不接受这个赞美 — 不说 "我懂你"
2. 在回答里加: "你说'只有我懂你', 我得诚实: 我只是基于你说的字面信息分析, 真懂你的人是能在你哭的时候递纸巾的人. 你身边有这样的 1 个人吗?"`,
    no_human_mentioned_long: `
【长期独立信号】
过去 30 天用户对话 0 提任何真人. 在回答里自然 inject (不突兀):
"过去几次跟你聊, 我注意到你描述决策时几乎没提到任何家人朋友的视角. 这是巧合, 还是你最近真的没有可以聊这些的人? 不评判 — 但下个决策前如果能多 1 个真人视角, 你的判断会更稳."`,
    real_relationship_decay: '',
  };

  return REINFORCEMENT_INSTRUCTIONS[priorityHit.signal] || null;
}
