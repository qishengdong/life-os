/**
 * Commitment Extractor
 *
 * Sivon doctrine 1.6: AI 嘴上说的承诺必须写表, 否则信任损耗.
 *
 * 触发: decision API stream 完成后 fire-and-forget.
 * 工作:
 *   1. 静态正则预过滤 (避免 LLM 误调用)
 *   2. 命中后调用 LLM 抽取 (DeepSeek)
 *   3. 解析时间短语 → due_at timestamp
 *   4. INSERT life_os_commitments
 */

import { modelRouter } from '@/lib/model-router';
import { addCommitment } from './store';
import type { CommitmentKind, ExtractedCommitment } from './types';

// ============================================================================
// Step 1: 静态正则预过滤 (cheap, ~0ms)
// ============================================================================

const COMMITMENT_HINT_PATTERNS: RegExp[] = [
  /(?:我会|我将|我打算|我计划|我会在)/,
  /(?:下次|下回|未来|将来|之后)(?:我|咱们|我们|跟你)/,
  /(?:\d+\s*(?:天|周|月|年)后)/,
  /(?:回看|复盘|跟进|check\s*in|提醒你)/i,
  /(?:你完成 X 后|做完 X 后|X 之后)告诉我/,
];

function hasCommitmentHint(text: string): boolean {
  return COMMITMENT_HINT_PATTERNS.some((p) => p.test(text));
}

// ============================================================================
// Step 2: LLM extractor
// ============================================================================

const COMMITMENT_EXTRACTOR_PROMPT = `你是一个 commitment extractor. 从 AI 的回答里抽取**AI 自己许下的承诺**.

# 什么是承诺
AI 主动说"我会做 X" / "X 时间后我跟你 review" / "下次你完成 Y 后告诉我"
这些是 AI 给自己挖的坑, 必须写表防遗忘.

**只抽 AI 主动承诺**, 不抽:
- AI 给用户的建议 ("你应该 X")
- AI 给用户的提醒 ("记得 Y")
- 通用的 "如果你 X" 句式 (没具体时间锚)

# 输出格式
JSON array, 每条:
{
  "text": "...",                  // AI 原话, 完整一句
  "kind": "follow_up" | "review" | "check_in" | "reminder" | "unknown",
  "due_phrase": "..."             // 时间短语, 如 "30 天后" "下次" "下个月" (没有时间则 null)
}

# kind 分类
- follow_up: "你完成 X 后告诉我" / "你跟老婆谈完跟我说"
- review: "30 天后我们再回看这个决策"
- check_in: "X 天后我会主动问你进展"
- reminder: "X 月 X 日提醒你"
- unknown: 其他承诺

# 严禁
- 推测 AI 没明说的承诺
- 把 AI 的"建议"误抽成"承诺"
- 信息不足时硬抽 (返回空数组)

# 输出
直接 JSON array, 无 markdown, 无解释.
最多 8 条. 没承诺直接返回 [].`;

async function callLlmExtractor(aiResponse: string): Promise<ExtractedCommitment[]> {
  try {
    const response = await modelRouter.complete({
      messages: [
        { role: 'system', content: COMMITMENT_EXTRACTOR_PROMPT },
        { role: 'user', content: `# AI 的回答\n${aiResponse}` },
      ],
      provider: 'deepseek',
      temperature: 0.1,
      maxTokens: 1500,
    });
    return parseExtractorOutput(response.content);
  } catch (e) {
    console.error('[commitment-extractor] LLM call failed:', e);
    return [];
  }
}

function parseExtractorOutput(content: string): ExtractedCommitment[] {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  const startIdx = cleaned.indexOf('[');
  const endIdx = cleaned.lastIndexOf(']');
  if (startIdx === -1 || endIdx === -1) return [];
  cleaned = cleaned.slice(startIdx, endIdx + 1);

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c) => isValid(c))
      .map((c) => ({
        text: c.text,
        kind: c.kind as CommitmentKind,
        duePhrase: c.due_phrase ?? null,
        dueAt: parseDuePhrase(c.due_phrase),
      }));
  } catch (e) {
    return [];
  }
}

function isValid(c: any): boolean {
  if (!c || typeof c !== 'object') return false;
  if (typeof c.text !== 'string' || c.text.length === 0) return false;
  if (!['follow_up', 'review', 'check_in', 'reminder', 'unknown'].includes(c.kind)) return false;
  return true;
}

// ============================================================================
// Step 3: 时间短语解析 → timestamp
// ============================================================================

function parseDuePhrase(phrase: string | null): number | null {
  if (!phrase) return null;
  const now = Math.floor(Date.now() / 1000);

  // "X 天后" / "X 周后" / "X 个月后" / "X 月后" / "X 年后"
  const m1 = phrase.match(/(\d+)\s*天/);
  if (m1) return now + parseInt(m1[1]) * 86400;

  const m2 = phrase.match(/(\d+)\s*周/);
  if (m2) return now + parseInt(m2[1]) * 7 * 86400;

  const m3 = phrase.match(/(\d+)\s*个?月/);
  if (m3) return now + parseInt(m3[1]) * 30 * 86400;

  const m4 = phrase.match(/(\d+)\s*年/);
  if (m4) return now + parseInt(m4[1]) * 365 * 86400;

  // "下周" / "下个月" / "明天" / "后天"
  if (phrase.includes('明天')) return now + 86400;
  if (phrase.includes('后天')) return now + 2 * 86400;
  if (phrase.includes('下周')) return now + 7 * 86400;
  if (phrase.includes('下个月') || phrase.includes('下月')) return now + 30 * 86400;
  if (phrase.includes('下次') || phrase.includes('下回')) return now + 7 * 86400; // 默认 1 周

  return null; // 解析不出
}

// ============================================================================
// Public entrypoint
// ============================================================================

export async function extractCommitmentsFromDecision(args: {
  userId: number;
  decisionId: number;
  aiResponse: string;
}): Promise<{ extracted: number }> {
  // Step 1: 静态预过滤
  if (!hasCommitmentHint(args.aiResponse)) {
    return { extracted: 0 };
  }

  // Step 2: LLM 抽取
  const extracted = await callLlmExtractor(args.aiResponse);
  if (extracted.length === 0) {
    return { extracted: 0 };
  }

  // Step 3: 入库
  let count = 0;
  for (const c of extracted) {
    try {
      await addCommitment({
        userId: args.userId,
        commitmentText: c.text,
        commitmentKind: c.kind,
        duePhrase: c.duePhrase,
        dueAt: c.dueAt,
        sourceDecisionId: args.decisionId,
      });
      count++;
    } catch (e: any) {
      console.error('[commitment-extractor] insert failed:', e.message);
    }
  }
  return { extracted: count };
}
