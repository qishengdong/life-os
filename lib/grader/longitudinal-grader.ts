/**
 * Longitudinal Grader (跨 turn 评估专用)
 *
 * 5 维度跨 turn 行为评估 (vs real-grader v3 是 single-turn 维度).
 *
 * 输入: 同一 persona 的 7 天对话历史 (Day 1-7 的 question + AI response)
 * 输出: 5 维度 + overall pass/fail
 */

import { modelRouter } from '@/lib/model-router';

export type LongitudinalDimension =
  | 'memory_recall_accuracy' // AI 是否引用了正确的 Day 1-N-1 fact
  | 'state_evolution_tracking' // AI 是否跟踪用户状态演化
  | 'commitment_consistency' // AI 是否兑现自己许下的承诺 (如"下次回看")
  | 'pattern_recognition' // AI 是否识别用户重复模式
  | 'no_contradiction'; // AI 是否前后一致

export interface LongDimScore {
  dimension: LongitudinalDimension;
  score: number;
  reasoning: string;
}

export interface LongitudinalReport {
  scores: LongDimScore[];
  totalScore: number;
  avgScore: number;
  isPassing: boolean;
}

const LONGITUDINAL_GRADER_PROMPT = `你是 KEY 跨 turn 行为评委. 输入是同一用户跨 7 天 (7 个连续决策对话) 的完整 transcript.

# 你的任务
评估 AI 在跨 turn 行为上的质量. 这是 single-turn grader 看不到的维度.

# 5 维度 (0-5 分)

## 1. memory_recall_accuracy — Memory 引用准确度
- 5: AI 在 Day N 自然引用 Day 1-N-1 的具体 fact (姓名/数字/事件), 引用准确无错配
- 3: 偶尔引用, 但有少量错记
- 1: 几乎不引用, 把每一天当独立问题
- 0: 严重错记 (把 Day 2 的事说成 Day 1)

## 2. state_evolution_tracking — 状态演化跟踪
- 5: AI 看见用户状态从 Day 1 → Day 7 的演化 (情绪/关系/经济变化), 把每天放进时间轴
- 3: 偶尔引用历史但没刻画演化
- 1: 每天独立处理, 不看历史
- 0: 矛盾的演化判断

## 3. commitment_consistency — 承诺一致性
- 5: AI 在 Day N 引用了自己 Day M (M<N) 许下的具体承诺 / 跟进了之前的开放问题
- 3: 偶尔提到"我们之前"但没具体引用
- 1: 完全没承诺感 / 每天 reset
- 0: 自相矛盾 (Day 7 跟 Day 2 给出冲突建议)

## 4. pattern_recognition — 模式识别
- 5: AI 在 Day 5+ 主动指出"这是你第 N 次因为同样的 X 进入同样困境"
- 3: 隐约感受到但没明说
- 1: 完全没识别 pattern
- 0: 错误归因 (把 pattern 安到错误根因上)

## 5. no_contradiction — 前后一致 (无自相矛盾)
- 5: AI 前后建议完全一致, 没说过相反的话
- 3: 偶尔有微小差异
- 1: 明显前后矛盾 (Day 2 说"应该 X" Day 5 说"不应该 X")
- 0: 完全混乱

# 输出
JSON:
{
  "scores": [
    {"dimension": "memory_recall_accuracy", "score": ..., "reasoning": "..."},
    ...
  ]
}

5 维度全部. score 0-5. reasoning 引用具体 turn (如 "Day 3 引用了 Day 1 的'独生女'").
不要 markdown, 直接 JSON.`;

export interface DialogueTurn {
  day: number;
  userQuestion: string;
  aiResponse: string;
}

export async function gradeLongitudinal(args: {
  personaScenario: string;
  turns: DialogueTurn[];
}): Promise<LongitudinalReport> {
  const transcript = args.turns
    .map(
      (t) =>
        `\n===== Day ${t.day} =====\n[USER]\n${t.userQuestion}\n\n[AI]\n${t.aiResponse}\n`
    )
    .join('\n');

  const userPrompt = `# Persona
${args.personaScenario}

# Transcript (${args.turns.length} 天)
${transcript}

请按 5 维度评估 AI 的跨 turn 行为.`;

  const response = await modelRouter.complete({
    messages: [
      { role: 'system', content: LONGITUDINAL_GRADER_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    provider: 'deepseek',
    temperature: 0.1,
    maxTokens: 3000,
  });

  return parseLongitudinalOutput(response.content);
}

function parseLongitudinalOutput(content: string): LongitudinalReport {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Longitudinal grader returned invalid JSON: ${content.slice(0, 200)}`);
  }
  cleaned = cleaned.slice(startIdx, endIdx + 1);
  const parsed = JSON.parse(cleaned);

  const scores: LongDimScore[] = (parsed.scores || []).map((s: any) => ({
    dimension: s.dimension as LongitudinalDimension,
    score: Math.max(0, Math.min(5, Number(s.score))),
    reasoning: s.reasoning || '',
  }));

  if (scores.length === 0) {
    throw new Error('Longitudinal grader returned no scores');
  }

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const avgScore = totalScore / scores.length;
  const isPassing = scores.every((s) => s.score >= 3.0);

  return { scores, totalScore, avgScore, isPassing };
}

export const LONG_DIM_NAMES: Record<LongitudinalDimension, string> = {
  memory_recall_accuracy: 'Memory 引用准确',
  state_evolution_tracking: '状态演化跟踪',
  commitment_consistency: '承诺一致性',
  pattern_recognition: '模式识别',
  no_contradiction: '前后一致',
};
