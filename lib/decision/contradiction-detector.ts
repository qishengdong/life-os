/**
 * Contradiction Detector — Inspector C16 的前置注入版本
 *
 * 跟其他 Inspector check 不同:
 *   - C1-C15: post-generation 审查 AI 输出有没有编 / 错
 *   - C16: pre-generation 检测**用户**自己跨决策的矛盾, 强制 Brief 在
 *          Section III (当前张力) 或 IV (利益相关者) 里 surface 它们
 *
 * "Surface conflicts, don't average them" — ChatGPT CLAUDE.md rule 7
 *
 * 流程:
 *   1. 拿当前决策输入 + 用户 brain / RMC 上下文
 *   2. 一次小 LLM call 找 0-3 个矛盾点
 *   3. 注入到 analyst pass 的 user message, 强制 Brief 写到
 *   4. 同时写入 inspector_audit (C16) 供后续审计
 *
 * 设计原则:
 *   - 只 surface 真正的矛盾, 不 surface 表面差异 (假阳性会让用户失去信任)
 *   - 给出具体引用 (用户原话 + 来源 attribution)
 *   - 不替用户判断 — 仅 surface, 让用户自己面对
 */

import { modelRouter } from '@/lib/model-router';
import { getDb } from '@/lib/db';

// ============================================================================
// 类型
// ============================================================================
export interface Contradiction {
  /** 用户之前说过的话, 直引 */
  pastStatement: string;
  /** 来源 attribution (e.g. "brain.md 边界声明" / "2026 年 1 月 13 日 Pulse") */
  attribution: string;
  /** 跟当前决策的具体矛盾点 (一句话, 客观描述, 不评判) */
  contradictionWith: string;
  /** 严重度: 必须 surface vs 建议 mention */
  severity: 'must_surface' | 'should_mention';
}

export interface ContradictionDetectionResult {
  contradictions: Contradiction[];
  /** 检测耗时 (ms) */
  durationMs: number;
  /** token 使用 */
  tokensUsed: number;
  /** 是否调过 LLM (memory 为空时跳过, 不必跑) */
  llmCalled: boolean;
}

// ============================================================================
// System prompt
// ============================================================================
const DETECTOR_SYSTEM_PROMPT = `# 你的身份
你是 KEY 的矛盾检测器. 你的工作是 — 在用户做一个新决策时, 检测他当前
的输入是否跟他**自己**之前说过的话存在矛盾.

# 矛盾的定义 (严格)
1. **边界违反**: 用户之前明确说过 "X 是我做不到的 / X 是不可能的", 现在的决策
   涉及 X 但完全没承认
2. **承诺反转**: 用户之前在 Pulse / 决策里明确说"我要做 Y", 现在的决策没承认这个
3. **事实回避**: 用户之前提到过一个具体事实 (e.g. "我太太反对 X"), 现在的决策
   讨论涉及这件事但没纳入考量
4. **价值冲突**: 用户之前表达过一个核心价值 (e.g. "我永远不让孩子重复我的童年"),
   当前决策的方向跟这个价值冲突

# 什么不是矛盾 (避免假阳性)
- 决策内容跟历史不直接相关
- 用户表达犹豫 (犹豫不是矛盾)
- 历史是几个月前的轻量提及, 不是核心立场
- 当前决策只是"我在考虑", 还没决定

# 输出格式 — 严格 JSON
\`\`\`json
{
  "contradictions": [
    {
      "pastStatement": "直引用户原话 (不超过 50 字)",
      "attribution": "来源 (e.g. 'brain.md 家庭结构 / 2026 年 1 月 13 日 Pulse / 上一个决策')",
      "contradictionWith": "跟当前决策的矛盾点, 一句话, 客观描述 (不超过 60 字)",
      "severity": "must_surface | should_mention"
    }
  ]
}
\`\`\`

- 0-3 个 contradiction. **没有就空数组**, 不要硬凑.
- 宁可少不要假阳性 — 一个错的 contradiction 比 0 个还差.
- 不输出 JSON 之外任何文字, 不要 \`\`\`json 包裹.`;

// ============================================================================
// 主入口
// ============================================================================
export async function detectContradictions(args: {
  currentDecision: string;
  memoryContext: string;
}): Promise<ContradictionDetectionResult> {
  const t0 = Date.now();

  // memory context 为空 — 用户首次决策, 没历史可矛盾, 直接返回空
  if (!args.memoryContext || args.memoryContext.trim().length < 50) {
    return {
      contradictions: [],
      durationMs: Date.now() - t0,
      tokensUsed: 0,
      llmCalled: false,
    };
  }

  const userMessage = `# 用户当前决策输入
${args.currentDecision}

# 用户的 brain / 历史记忆
${args.memoryContext}

按 system prompt 的标准检测矛盾, 输出 JSON.`;

  try {
    const resp = await modelRouter.complete({
      messages: [
        { role: 'system', content: DETECTOR_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      provider: 'deepseek',
      temperature: 0.3, // 低温度 — 我们要稳健, 不要创意
      maxTokens: 1500,
    });

    const json = parseJsonBestEffort(resp.content);
    const contradictions: Contradiction[] = Array.isArray(json?.contradictions)
      ? json.contradictions.slice(0, 3).map((c: any) => ({
          pastStatement: String(c.pastStatement || '').slice(0, 200),
          attribution: String(c.attribution || '').slice(0, 100),
          contradictionWith: String(c.contradictionWith || '').slice(0, 200),
          severity: c.severity === 'must_surface' ? 'must_surface' : 'should_mention',
        }))
      : [];

    return {
      contradictions,
      durationMs: Date.now() - t0,
      tokensUsed: resp.usage?.total_tokens || 0,
      llmCalled: true,
    };
  } catch (e: any) {
    console.error('[contradiction-detector] failed:', e);
    return {
      contradictions: [],
      durationMs: Date.now() - t0,
      tokensUsed: 0,
      llmCalled: true,
    };
  }
}

// ============================================================================
// 把 contradiction 渲染成给 Analyst 的注入文本
// ============================================================================
export function renderContradictionsForAnalyst(
  contradictions: Contradiction[]
): string {
  if (contradictions.length === 0) return '';

  const mustSurface = contradictions.filter((c) => c.severity === 'must_surface');
  const shouldMention = contradictions.filter((c) => c.severity === 'should_mention');

  const lines: string[] = [
    '# ⚠️ Inspector C16 — 必须 surface 的矛盾',
    '',
    '以下是用户当前输入 vs 自己之前说过的话之间检测到的矛盾.',
    '**Brief 必须在 Section IV (利益相关者) 或 Section III (当前张力) 里**',
    '**主动 surface 这些矛盾, 不能装作没看到**. 这是契约要求.',
    '',
  ];

  if (mustSurface.length > 0) {
    lines.push('## 必须 surface (用户在直接回避自己的立场):');
    for (const c of mustSurface) {
      lines.push(`- **用户原话**: "${c.pastStatement}"`);
      lines.push(`  - 来源: ${c.attribution}`);
      lines.push(`  - 跟当前决策的矛盾: ${c.contradictionWith}`);
      lines.push('');
    }
  }

  if (shouldMention.length > 0) {
    lines.push('## 建议 mention (但用户没明确避开):');
    for (const c of shouldMention) {
      lines.push(`- "${c.pastStatement}" (${c.attribution}) — ${c.contradictionWith}`);
    }
    lines.push('');
  }

  lines.push(
    '在 Brief 中如何 surface: 不要说教 ("你不应该忽略..."), 用引用 + 提问的方式 ' +
      '("你在 X 时间说过 Y. 这次决策里这件事怎么处理?"). 客观, 不评判, 让用户面对.'
  );

  return lines.join('\n');
}

// ============================================================================
// 写入 inspector_audit (C16)
// ============================================================================
export async function writeC16Audit(args: {
  userId: number;
  decisionId: number | null;
  contradictions: Contradiction[];
}): Promise<void> {
  if (args.contradictions.length === 0) return;

  const db = await getDb();
  const stmt = db.prepare(
    `INSERT INTO inspector_audit
       (user_id, decision_id, check_code, severity, action, matched_text, detail)
     VALUES (?, ?, 'C16', ?, 'flag', ?, ?)`
  );

  for (const c of args.contradictions) {
    stmt.run(
      args.userId,
      args.decisionId,
      c.severity === 'must_surface' ? 'high' : 'low',
      c.pastStatement.slice(0, 200),
      `${c.attribution} → ${c.contradictionWith}`
    );
  }
}

// ============================================================================
// Helpers
// ============================================================================
function parseJsonBestEffort(raw: string): any {
  let s = raw.trim();
  s = s.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON object found');
  s = s.slice(start, end + 1);
  return JSON.parse(s);
}
