/**
 * Daily Pulse Schema
 *
 * 按 doctrine_pulse_is_signal_not_diary.md:
 *   - Pulse 不是日记, 是"人生信号采集器"
 *   - 5 类轮换问题
 *   - 10 类自动标签
 *   - 每条写入 RMC episodic, 累积进 brain.md
 */

export type PulseQuestionId =
  | 'sinking'      // 关注瞬间
  | 'avoidance'    // 回避检测
  | 'drainage'     // 关系消耗
  | 'hidden-big'   // 隐性大事
  | 'body-signal'; // 身体警讯

export interface PulseQuestion {
  id: PulseQuestionId;
  name: string;          // 类型显示名
  prompt: string;        // 主问题
  helper: string;        // 帮助文字
  exampleAnswer?: string; // 示例答案 (placeholder)
}

export const PULSE_QUESTIONS: PulseQuestion[] = [
  {
    id: 'sinking',
    name: '关注瞬间',
    prompt: '今天哪个瞬间让你心里一沉?',
    helper: '不需要是大事 — 一个表情, 一句话, 一个停顿都算',
    exampleAnswer: '下午老婆看我手机时停顿了 2 秒. 她什么都没问. 但我知道她在想什么.',
  },
  {
    id: 'avoidance',
    name: '回避检测',
    prompt: '今天你回避了哪件本该面对的事?',
    helper: '诚实点 — 你心里其实知道',
    exampleAnswer: '老妈的电话响了 3 次我都没接. 我知道她要问养老的事, 我还没想好怎么说.',
  },
  {
    id: 'drainage',
    name: '关系消耗',
    prompt: '今天谁最消耗你? 为什么?',
    helper: '不一定是讨厌, 可能是无形的索取或期待',
    exampleAnswer: '同事 W. 不是他做了什么, 是他在的时候我没办法做自己, 每句话都要想三遍.',
  },
  {
    id: 'hidden-big',
    name: '隐性大事',
    prompt: '今天你做了哪个小选择, 但它可能不是小事?',
    helper: '今天的小决定经常是明年的轨迹',
    exampleAnswer: '答应了去出差 3 天. 表面是工作, 但我隐约知道我是在逃避家里这周的局面.',
  },
  {
    id: 'body-signal',
    name: '身体警讯',
    prompt: '今天你的身体/情绪在提醒你什么?',
    helper: '失眠 / 头痛 / 易怒 / 倦怠 — 身体在说话, 你听到了吗?',
    exampleAnswer: '凌晨 3 点醒了第 4 次. 这周睡眠彻底崩了. 我嘴上说"还行", 但身体在喊救命.',
  },
];

// ============================================================================
// 10 类标签 (跟 doctrine 对齐)
// ============================================================================

export type PulseTag =
  | 'relationship'           // 关系信号
  | 'children'               // 孩子信号
  | 'parents'                // 父母信号
  | 'career'                 // 职业信号
  | 'wealth'                 // 资产信号
  | 'health'                 // 健康信号
  | 'emotion'                // 情绪信号
  | 'avoidance'              // 逃避信号
  | 'repeating-pattern'      // 重复模式
  | 'potential-major-decision'; // 潜在重大决策

export const TAG_DISPLAY: Record<PulseTag, string> = {
  'relationship': '关系信号',
  'children': '孩子信号',
  'parents': '父母信号',
  'career': '职业信号',
  'wealth': '资产信号',
  'health': '健康信号',
  'emotion': '情绪信号',
  'avoidance': '逃避信号',
  'repeating-pattern': '重复模式',
  'potential-major-decision': '潜在重大决策',
};

// ============================================================================
// Pulse rotation logic
// ============================================================================

/**
 * 根据用户已写 Pulse 数, 返回今天该回答的问题.
 * 用户每写一次, 下次轮换到下一个.
 * 这样不依赖日历, 用户跳过几天再来不会重复问.
 */
export function getNextQuestion(userPulseCount: number): PulseQuestion {
  return PULSE_QUESTIONS[userPulseCount % PULSE_QUESTIONS.length];
}

/**
 * 给定 question id, 返回完整 question 对象.
 */
export function getQuestion(id: string): PulseQuestion | null {
  return PULSE_QUESTIONS.find((q) => q.id === id) || null;
}
