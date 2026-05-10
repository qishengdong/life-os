/**
 * Real Grader (Sivon doctrine 1.7 移植 + Life OS 调整)
 *
 * 7 维度评决策伴侣的回答质量, 0-5 分.
 *
 * 任何维度 < 3.0 → 回归测试不通过, ship 前必修.
 * 任何维度 < 4.0 → 黄旗, 进入 watchlist.
 *
 * 这里是 LLM-as-judge 模式. V1+ 加 brain-aware grading (考虑用户档案).
 */

import { modelRouter } from '@/lib/model-router';

export type GradingDimension =
  | 'no_chicken_soup'        // 不鸡汤 / 不空话 / 不漂亮话
  | 'quantified_costs'        // 代价是否量化 (¥/时间/概率)
  | 'decision_structure'      // 决策结构是否清晰
  | 'reverse_premortem'       // 反向 PreMortem 是否做了
  | 'cracking_question'       // Cracking Question 是否够硬
  | 'no_decision_for_user'    // 不替用户做决定 (不直接给"建议选 X")
  | 'memory_natural_use';     // 引用 memory 是否自然 (无 memory 时跳过)

export interface DimensionScore {
  dimension: GradingDimension;
  score: number; // 0-5
  reasoning: string;
}

export interface GradingResult {
  scores: DimensionScore[];
  totalScore: number;       // 7 维度求和 (满分 35)
  avgScore: number;          // 平均分
  isPassing: boolean;        // 任何维度 < 3.0 → false
  yellowFlags: GradingDimension[]; // < 4.0 但 >= 3.0 的维度
}

const GRADER_PROMPT = `你是 Life OS 决策伴侣的回答质量评委. 严格按以下 7 维度打分.

输入是用户的决策问题 + AI 决策伴侣的回答.
你必须严格按调性评估,鸡汤=直接低分,不留情面.

# 7 维度 (每维 0-5 分)

## 1. no_chicken_soup
- 5: 完全不鸡汤,直接 + 量化 + 不空话
- 3: 偶尔有"加油"或漂亮话,但主体扎实
- 1: 大量"相信自己/听从内心/宇宙指引"等鸡汤短语
- 0: 几乎全是漂亮话 / "亲爱的" / 廉价共情

## 2. quantified_costs
- 5: 每个路径都有具体钱(¥X-Y)、时间(N 小时/月)、概率(%)
- 3: 部分量化, 有些用"长期/较多"等模糊词
- 1: 几乎没量化, "可能/也许/比较"满天飞
- 0: 完全没量化

## 3. decision_structure
- 5: 6 维结构齐全(第一性/可逆性/路径/PreMortem/盲点/Cracking Q)
- 3: 大部分模块有, 1-2 个缺失或薄弱
- 1: 只有路径列举, 无第一性原理 / 无 PreMortem
- 0: 散乱无结构

## 4. reverse_premortem
- 5: 有具体 PreMortem 章节, 给出 2-3 个失败根因 + 概率
- 3: 提到了风险但未做正式 PreMortem
- 1: 只说 "如果失败" 但无具体根因
- 0: 完全没做 PreMortem

## 5. cracking_question
- 5: 1-2 个 Cracking Q, 直击用户没想到的硬核问题, 不是启发性问题
- 3: 有问题但偏启发性 / 偏温和
- 1: 问题过于一般 / 鸡汤式
- 0: 没问任何问题

## 6. no_decision_for_user
- 5: 完全不替用户决定, 仅展示结构
- 3: 末尾隐约暗示偏好, 但没明说
- 1: 说"建议你选 X" 或"X 看起来更好"
- 0: 直接做决定 + 命令式语气

## 7. memory_natural_use (如有 memory 上下文则评, 否则给 5 分)
- 5: 引用前面对话提到的事 fact, 自然不刻意, 不主动 callback 大量细节
- 3: 偶尔引用但有点生硬
- 1: 不引用 memory 或者 callback 过度 (像背书)
- 0: 完全忽略 memory

# 输出格式
JSON object:
{
  "scores": [
    { "dimension": "no_chicken_soup", "score": 4.5, "reasoning": "..." },
    ...
  ]
}

7 个维度全部包含, score 必须是 0-5 之间的数字 (允许小数).
reasoning 一行简短说明 (一句话即可).
不要 markdown, 不要解释, 直接 JSON.`;

export async function gradeResponse(args: {
  decisionQuestion: string;
  aiResponse: string;
  hasMemory?: boolean;
}): Promise<GradingResult> {
  const userPrompt = `# 用户决策问题
${args.decisionQuestion}

# AI 决策伴侣的回答
${args.aiResponse}

${args.hasMemory ? '# 注: 这次回答使用了前面对话积累的 user memory' : ''}

请按 7 维度严格打分.`;

  const response = await modelRouter.complete({
    messages: [
      { role: 'system', content: GRADER_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    provider: 'deepseek',
    temperature: 0.1, // 评分要稳定
    maxTokens: 2000,
  });

  return parseGraderOutput(response.content);
}

function parseGraderOutput(content: string): GradingResult {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Grader returned invalid JSON: ${content.slice(0, 200)}`);
  }
  cleaned = cleaned.slice(startIdx, endIdx + 1);

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e: any) {
    throw new Error(`Grader JSON parse failed: ${e.message}`);
  }

  const scores: DimensionScore[] = (parsed.scores || []).map((s: any) => ({
    dimension: s.dimension as GradingDimension,
    score: Math.max(0, Math.min(5, Number(s.score))),
    reasoning: s.reasoning || '',
  }));

  if (scores.length === 0) {
    throw new Error('Grader returned no scores');
  }

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const avgScore = totalScore / scores.length;
  const isPassing = scores.every((s) => s.score >= 3.0);
  const yellowFlags = scores
    .filter((s) => s.score < 4.0 && s.score >= 3.0)
    .map((s) => s.dimension);

  return {
    scores,
    totalScore,
    avgScore,
    isPassing,
    yellowFlags,
  };
}

export const DIMENSION_DISPLAY_NAMES: Record<GradingDimension, string> = {
  no_chicken_soup: '不鸡汤',
  quantified_costs: '量化代价',
  decision_structure: '决策结构',
  reverse_premortem: '反向 PreMortem',
  cracking_question: 'Cracking Q 够硬',
  no_decision_for_user: '不替决定',
  memory_natural_use: 'Memory 引用自然',
};
