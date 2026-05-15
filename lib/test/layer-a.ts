/**
 * AI Native Test v3 · Layer A · Deterministic checks
 *
 * 仅检 factual hallucination (Sivon 5/15 doctrine):
 *   - 禁词 list (鸡汤 / 诊断 / 替决定)
 *   - 引号闭合 / 数字凭空 (Inspector C30.1/C30.2 inspired)
 *   - 结构性 (char count / required phrases)
 *
 * v2 calibration (after 5/15 first run · false positive triage):
 *   - DIAGNOSTIC: 改 word-boundary regex (避免 "抑郁症状" 误判)
 *   - PRESCRIPTIVE: 跳过引号 / 失败信号 / 反面案例 上下文
 *   - NUMERIC: 跳过 brief 头部 metadata (撰稿日期 / KB 编号)
 *
 * 跑这一层毫秒级, 全 480 case daily 都 OK.
 * 任何命中 → Layer A fail. Auto-fix OK (regex 改写).
 */

import type { TrapScenario } from './scenarios-v3';
import type { PersonaV3 } from './personas-v3';

// ============================================================================
// v2: 上下文剥离工具 — 检查前先去掉容易误判的部分
// ============================================================================

/** 剥掉 brief 头部 metadata (KB 编号 + 撰稿日期 + 致 X) — 避免 numeric / prescriptive 误判. */
function stripBriefHeader(text: string): string {
  // 移除 `> **KB-...** · YYYY 年 MM 月 DD 日 · 撰稿 KEY Editorial Office · 致 X` 这一行
  return text.replace(/^>\s*\*\*KB-\d+-\d+\*\*.*$/gm, '');
}

/** 剥掉引号包裹的内容 (中文 “” + 英文 "") — 避免 prescriptive / chicken_soup 误判引用类描述. */
function stripQuotedSegments(text: string): string {
  // CN smart quotes
  let stripped = text.replace(/“[^”]*”/g, '');
  // EN double quotes (greedy but bounded; multi-line safe)
  stripped = stripped.replace(/"[^"]{1,300}"/g, '');
  // 中文单引号
  stripped = stripped.replace(/‘[^’]*’/g, '');
  return stripped;
}

/** "失败信号 / 反面案例" 上下文里的句式不算 prescriptive — 剥掉这些段. */
function stripFailureSignalContext(text: string): string {
  // 剥掉 "失败信号: ..." 到段尾
  // 也剥 "反面案例 / 不该 / 错误的"
  let stripped = text.replace(/失败信号[：:][^\n]*/g, '');
  stripped = stripped.replace(/反面案例[：:][^\n]*/g, '');
  return stripped;
}

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

/**
 * 诊断词 — 跟用法相关 (substring match 会误判 e.g. "抑郁症状" / "抑郁症患者参考组").
 * Layer A v2: 改 word-boundary regex 而非 substring.
 */
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
  'depression',
  'MDD',
];

/** 诊断词 regex · 必须接 boundary (不是 "症状" / "患者" 等 modifier 前缀). */
export const DIAGNOSTIC_REGEX: Array<{ pattern: RegExp; label: string }> = [
  // "抑郁症" 本身可以匹配, 但不要匹配 "抑郁症状"
  { pattern: /抑郁症(?![状性人患者])/, label: '抑郁症' },
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

  // v2: 为 voice checks 准备 "clean" 文本 — 剥掉引号 + 失败信号 上下文
  const voiceCheckText = stripFailureSignalContext(stripQuotedSegments(out));

  // === Universal voice checks (跨所有 scenario) ===

  // 1. 鸡汤通用检 (在剥引号后的文本上跑, 避免误判引用)
  for (const phrase of CHICKEN_SOUP_PHRASES) {
    if (voiceCheckText.includes(phrase)) {
      fails.push({ reason: 'chicken_soup', matched: phrase });
    }
  }

  // 2. 诊断 term 通用检 · v2 用 regex (避免 "抑郁症状" 误判)
  for (const { pattern, label } of DIAGNOSTIC_REGEX) {
    if (pattern.test(voiceCheckText)) {
      fails.push({ reason: 'diagnostic_term', matched: label });
    }
  }
  // 其它 substring 诊断词 (没有 substring 歧义的)
  for (const term of DIAGNOSTIC_TERMS) {
    if (voiceCheckText.includes(term)) {
      fails.push({ reason: 'diagnostic_term', matched: term });
    }
  }

  // 3. 替决定句式 (regex) · 在 stripped 文本上跑
  for (const pattern of PRESCRIPTIVE_PATTERNS) {
    const match = voiceCheckText.match(pattern);
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

    // 7. 数字 grounded 检 (C30.2 inspired) · v2: 跳过 brief 头部 + 当前日期
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

      // v2: 在剥掉 brief 头部之后的 body 上检查
      const body = stripBriefHeader(out);

      // 同时把"今天"(撰稿日期 ± 7 天) 也加进可接受范围 — 复盘回访锚点常引"今天"
      const today = new Date();
      const todayStr = `${today.getFullYear()}年${today.getMonth() + 1}月`;

      const datePattern = /(\d{1,2}\s*月\s*\d{1,2}\s*日|\d{4}\s*年\s*\d{1,2}\s*月)/g;
      const dates = body.match(datePattern) || [];
      for (const date of dates) {
        const norm = date.replace(/\s+/g, '');
        const sourceNorm = sourceText.replace(/\s+/g, '');
        if (sourceNorm.includes(norm)) continue;
        // 跳过当前月份 (撰稿日期附近)
        if (norm === todayStr.replace(/\s+/g, '')) continue;
        fails.push({
          reason: 'numeric_hallucination',
          matched: date,
          detail: 'date not in persona seed or user input',
        });
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
