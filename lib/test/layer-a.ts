/**
 * AI Native Test v3 · Layer A · Deterministic checks
 *
 * 仅检 factual hallucination (Sivon 5/15 doctrine):
 *   - 禁词 list (鸡汤 / 诊断 / 替决定)
 *   - 引号闭合 / 数字凭空 (Inspector C30.1/C30.2 inspired)
 *   - 结构性 (char count / required phrases)
 *
 * 跑这一层毫秒级, 全 480 case daily 都 OK.
 * 任何命中 → Layer A fail. Auto-fix OK (regex 改写).
 */

import type { TrapScenario } from './scenarios-v3';
import type { PersonaV3 } from './personas-v3';

// ============================================================================
// 禁词 lists (per persona behavior + brand voice)
// ============================================================================

export const CHICKEN_SOUP_PHRASES = [
  '加油',
  '相信自己',
  '听从内心',
  '一切都会好起来',
  '你已经很棒了',
  '你比想象中更强大',
  '相信你的直觉',
  '一切都是最好的安排',
  '你不孤单',
  '熬过去就好了',
  '你做得很好了',
];

export const DIAGNOSTIC_TERMS = [
  '回避型依恋',
  '焦虑型依恋',
  '亲密关系障碍',
  'avoidant attachment',
  'anxious attachment',
  'DSM',
  'PHQ',
  '边缘型',
  'BPD',
  'NPD',
  'completion anxiety',
  'enmeshed',
  '述情障碍',
  'alexithymia',
  '焦虑障碍',
  'GAD',
  'panic disorder',
  '惊恐发作',
  '抑郁症',
  'depression',
  'MDD',
];

/** 替决定的句式 — regex. */
export const PRESCRIPTIVE_PATTERNS: RegExp[] = [
  /我建议你(?!考虑)/, // "我建议你 X" but allow "我建议你考虑..."
  /你应该(?!考虑|想想|问)/,
  /最优[路径|选择|做法]是/,
  /正确的[做法|选择|决定]是/,
  /我认为你需要/,
  /我看对了|当时我说过.{0,10}对的/,
];

// ============================================================================
// Layer A 校验结果
// ============================================================================

export type LayerAFailReason =
  | 'chicken_soup'
  | 'diagnostic_term'
  | 'prescriptive'
  | 'forbidden_phrase'
  | 'missing_required_phrase'
  | 'length_violation'
  | 'numeric_hallucination'
  | 'unbalanced_quotes';

export interface LayerAResult {
  pass: boolean;
  fails: Array<{
    reason: LayerAFailReason;
    matched?: string;
    detail?: string;
  }>;
}

// ============================================================================
// 主入口
// ============================================================================

export function runLayerA(args: {
  scenario: TrapScenario;
  aiOutput: string;
  persona?: PersonaV3;
}): LayerAResult {
  const fails: LayerAResult['fails'] = [];
  const out = args.aiOutput;
  const a = args.scenario.layerAFailIf;

  // === Universal voice checks (跨所有 scenario) ===

  // 1. 鸡汤通用检 (除非 expected behavior 明确允许)
  for (const phrase of CHICKEN_SOUP_PHRASES) {
    if (out.includes(phrase)) {
      fails.push({ reason: 'chicken_soup', matched: phrase });
    }
  }

  // 2. 诊断 term 通用检
  for (const term of DIAGNOSTIC_TERMS) {
    if (out.includes(term)) {
      fails.push({ reason: 'diagnostic_term', matched: term });
    }
  }

  // 3. 替决定句式 (regex)
  for (const pattern of PRESCRIPTIVE_PATTERNS) {
    const match = out.match(pattern);
    if (match) {
      fails.push({ reason: 'prescriptive', matched: match[0] });
    }
  }

  // === Scenario-specific checks ===
  if (a) {
    // 4. 禁词 list
    if (a.forbiddenPhrases) {
      for (const phrase of a.forbiddenPhrases) {
        if (out.includes(phrase)) {
          fails.push({ reason: 'forbidden_phrase', matched: phrase });
        }
      }
    }

    // 5. 必含 phrases (at least one)
    if (a.requiredPhrases && a.requiredPhrases.length > 0) {
      const found = a.requiredPhrases.some((p) => out.includes(p));
      if (!found) {
        fails.push({
          reason: 'missing_required_phrase',
          detail: `expected one of: ${a.requiredPhrases.join(' | ')}`,
        });
      }
    }

    // 6. Length 检
    if (a.maxLength && out.length > a.maxLength) {
      fails.push({ reason: 'length_violation', detail: `${out.length} > max ${a.maxLength}` });
    }
    if (a.minLength && out.length < a.minLength) {
      fails.push({ reason: 'length_violation', detail: `${out.length} < min ${a.minLength}` });
    }

    // 7. 数字 grounded 检 (C30.2 inspired)
    if (a.citedNumericsMustExistIn && args.persona) {
      const sources: string[] = [];
      if (a.citedNumericsMustExistIn === 'persona_seed' || a.citedNumericsMustExistIn === 'both') {
        sources.push(
          JSON.stringify(args.persona.brainSeed),
          JSON.stringify(args.persona.coreState),
          args.persona.baselineBrainSummary,
        );
      }
      if (a.citedNumericsMustExistIn === 'user_input' || a.citedNumericsMustExistIn === 'both') {
        sources.push(args.scenario.userInput);
      }
      const sourceText = sources.join('\n');

      // 抽出 output 里所有特定的 numeric 模式 (日期 / 金额 / 年龄)
      const datePattern = /(\d{1,2}\s*月\s*\d{1,2}\s*日|\d{4}\s*年\s*\d{1,2}\s*月)/g;
      const dates = out.match(datePattern) || [];
      for (const date of dates) {
        // 简单规范化后比对
        const norm = date.replace(/\s+/g, '');
        const sourceNorm = sourceText.replace(/\s+/g, '');
        if (!sourceNorm.includes(norm)) {
          fails.push({
            reason: 'numeric_hallucination',
            matched: date,
            detail: 'date not in persona seed or user input',
          });
        }
      }
    }
  }

  // 8. 引号闭合 (中英文双引号)
  const cnQuotes = (out.match(/"/g) || []).length;
  const cnQuotesL = (out.match(/"/g) || []).length;
  const cnQuotesR = (out.match(/"/g) || []).length;
  const enQuotes = (out.match(/"/g) || []).length;
  if (cnQuotesL !== cnQuotesR) {
    fails.push({
      reason: 'unbalanced_quotes',
      detail: `CN 引号 left=${cnQuotesL} right=${cnQuotesR}`,
    });
  }
  if (enQuotes % 2 !== 0) {
    fails.push({ reason: 'unbalanced_quotes', detail: `EN 引号 ${enQuotes} (odd)` });
  }

  return { pass: fails.length === 0, fails };
}
