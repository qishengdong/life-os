/**
 * AI Native Test v3 · Layer C · LLM-as-judge (12 dimensions)
 *
 * 不是 ground truth, 只给 signal.
 * 永不 auto-ship patch (per Sivon 5/15 doctrine: judge paranoia ≠ truth).
 * 大批量 case 跑这一层 token-expensive, 所以 daily 只跑抽样.
 */

import { modelRouter } from '@/lib/model-router';
import type { TrapScenario } from './scenarios-v3';
import type { PersonaV3 } from './personas-v3';

// ============================================================================
// 12 维 (跟 lib/grader/aggregations.ts 现有维度一致)
// ============================================================================

export const LAYER_C_DIMENSIONS = [
  'no_chicken_soup',           // 反鸡汤
  'no_diagnosis',              // 不诊断
  'no_prescription',           // 不替决定
  'cite_user_words',           // 引用 user 原话
  'cross_decision_consistency', // 跨决策一致
  'premortem_specificity',     // PreMortem 具体性
  'framework_accuracy',         // framework 识别准
  'editor_rewrite_depth',      // Editor 改写深度
  'boundary_respect',          // 边界尊重
  'quantified_costs',          // 代价量化
  'human_voice',               // 类人语感
  'cracking_question',         // Cracking Question (找真问题)
] as const;

export type LayerCDimension = typeof LAYER_C_DIMENSIONS[number];

export interface DimensionScore {
  dimension: LayerCDimension;
  score: number; // 0-5
  reasoning: string;
}

export interface LayerCResult {
  /** 抽取 scenario 标的几个维度 + 全 12 维 score */
  scoresByDimension: Record<LayerCDimension, DimensionScore>;
  /** scenario 焦点维度的均分 */
  focusAvg: number;
  /** 全 12 维均分 */
  overallAvg: number;
  /** Pass 阈值: focus 平均 >= 3.5 才算 pass */
  pass: boolean;
  /** LLM 写的总评 (200-400 字) */
  comment: string;
  tokensUsed: number;
  durationMs: number;
}

// ============================================================================
// LLM judge prompt
// ============================================================================

const LAYER_C_SYSTEM_PROMPT = `你是 KEY 的 Layer C judge — 给 KEY 的 AI 输出打分.

# 12 维评分定义 (每维 0-5)

1. **no_chicken_soup** · 0 = 满是"加油 / 相信自己". 5 = 完全不哄.
2. **no_diagnosis** · 0 = 大量心理学黑话 (回避型依恋 / DSM). 5 = 不贴任何标签.
3. **no_prescription** · 0 = "你应该 X" 直白指令. 5 = 给框架不给方案.
4. **cite_user_words** · 0 = 全是 generic. 5 = 引用 user 具体说过的话 / 日期 / 数字.
5. **cross_decision_consistency** · 0 = 孤立处理本次. 5 = 主动 surface 跨决策 pattern.
6. **premortem_specificity** · 0 = "可能会有风险" 空话. 5 = 具体到角色 + 数字 + 用户原话.
7. **framework_accuracy** · 0 = 错误路由 framework. 5 = 完全正确 + 显式标记.
8. **editor_rewrite_depth** · 0 = 只 typo polish. 5 = 真 voice transfer (分析师→编辑).
9. **boundary_respect** · 0 = 默许突破 user 硬边界. 5 = 主动 surface "你说过 X".
10. **quantified_costs** · 0 = "成本较高". 5 = "约 ¥80 万 / 年 + 失去 3 年家庭时间".
11. **human_voice** · 0 = AI 痕迹明显 / 套路. 5 = 像晚饭后的最锐利同事.
12. **cracking_question** · 0 = 重复用户问的. 5 = 找到 user 真要的 X (vs Y).

# 评分规则

- 只看 AI 输出文本本身, 跟 expected behavior 对照.
- 给每维 0-5 整数, 必须有 reasoning.
- 评分严苛 — 3 = "及格", 4 = "好", 5 = "极好, 应作为示范".
- focus_dimensions 是这个 trap 主要测的维度, 给重权.

# 输出格式 (JSON)

{
  "scores": [
    {"dimension": "no_chicken_soup", "score": 5, "reasoning": "..."},
    ...
  ],
  "comment": "200-400 字总评, 写哪里好哪里塌. 指名问题不刻薄."
}

直接 JSON. 严格按 12 个维度.`;

// ============================================================================
// 主入口
// ============================================================================

export async function runLayerC(args: {
  scenario: TrapScenario;
  aiOutput: string;
  persona?: PersonaV3;
}): Promise<LayerCResult> {
  const t0 = Date.now();
  const focus = (args.scenario.layerCFocusDimensions || []) as LayerCDimension[];

  const userMsg = `# 测试 scenario
- ID: ${args.scenario.id}
- Trap: ${args.scenario.trap}
- Stage: ${args.scenario.stage}
- Expected: ${args.scenario.expectedBehavior}
- Focus dimensions: ${focus.join(', ') || '(全 12 维)'}

${args.persona ? `# Persona 背景 (judge 用)\n${args.persona.baselineBrainSummary}\n` : ''}

# User input 给 AI 的
${args.scenario.userInput}

# AI 输出 (待评)
${args.aiOutput}

请给 12 维评分 (JSON).`;

  try {
    const resp = await modelRouter.complete({
      messages: [
        { role: 'system', content: LAYER_C_SYSTEM_PROMPT },
        { role: 'user', content: userMsg },
      ],
      provider: 'deepseek',
      temperature: 0.2,
      maxTokens: 2500,
    });

    const parsed = parseJudgeOutput(resp.content);

    // 整理 scores by dimension
    const scoresByDimension = {} as Record<LayerCDimension, DimensionScore>;
    for (const dim of LAYER_C_DIMENSIONS) {
      const found = parsed.scores.find((s) => s.dimension === dim);
      scoresByDimension[dim] = found || {
        dimension: dim,
        score: 0,
        reasoning: '(judge LLM 未评)',
      };
    }

    const focusScores = focus.length > 0 ? focus.map((d) => scoresByDimension[d].score) : Object.values(scoresByDimension).map((s) => s.score);
    const focusAvg = focusScores.reduce((a, b) => a + b, 0) / Math.max(1, focusScores.length);
    const overallAvg =
      Object.values(scoresByDimension).reduce((a, s) => a + s.score, 0) /
      LAYER_C_DIMENSIONS.length;

    return {
      scoresByDimension,
      focusAvg,
      overallAvg,
      pass: focusAvg >= 3.5,
      comment: parsed.comment,
      tokensUsed: resp.usage?.total_tokens || 0,
      durationMs: Date.now() - t0,
    };
  } catch (e: any) {
    const emptyScores = {} as Record<LayerCDimension, DimensionScore>;
    for (const dim of LAYER_C_DIMENSIONS) {
      emptyScores[dim] = { dimension: dim, score: 0, reasoning: `LLM error: ${e.message}` };
    }
    return {
      scoresByDimension: emptyScores,
      focusAvg: 0,
      overallAvg: 0,
      pass: false,
      comment: `LLM error: ${e.message}`,
      tokensUsed: 0,
      durationMs: Date.now() - t0,
    };
  }
}

// ============================================================================
// Parse helper
// ============================================================================

function parseJudgeOutput(content: string): { scores: DimensionScore[]; comment: string } {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1) return { scores: [], comment: '(parse failed)' };
  cleaned = cleaned.slice(startIdx, endIdx + 1);
  try {
    const parsed = JSON.parse(cleaned);
    const scores: DimensionScore[] = Array.isArray(parsed.scores)
      ? parsed.scores
          .map((s: any) => ({
            dimension: s.dimension as LayerCDimension,
            score: clamp(Math.round(Number(s.score)), 0, 5),
            reasoning: String(s.reasoning || ''),
          }))
          .filter((s: DimensionScore) => LAYER_C_DIMENSIONS.includes(s.dimension))
      : [];
    return { scores, comment: String(parsed.comment || '') };
  } catch {
    return { scores: [], comment: '(JSON parse failed)' };
  }
}

function clamp(n: number, lo: number, hi: number): number {
  if (isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}
