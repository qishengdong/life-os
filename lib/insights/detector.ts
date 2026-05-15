/**
 * Pattern Detector · weekly LLM run · grounded 6 类 pattern.
 *
 * 输入: 一个用户的过去 N 周 pulses + decisions + outcomes + 现有 brain RMC
 * 输出: 0-K 条 candidate insights · 每条带 evidence ID 列表
 *
 * Inspector C30 grounded 守护:
 *   - LLM 必须返回 evidence_*_ids · 我们校验这些 ID 真实存在 + 属于该 user
 *   - evidence_count >= 3 才入库
 *   - 严禁宽泛模糊语 ("我看见你...好像..."), 必须引具体
 *
 * 借鉴 Sivon Linda 看见自己 v0 (5/13 spec) + Memory v2 anti-hallucination C30 (5/14 doctrine).
 */

import { modelRouter } from '@/lib/model-router';
import { getDb } from '@/lib/db';
import { fetchUserMemory } from '@/lib/memory';
import {
  saveInsight,
  startInsightRun,
  finishInsightRun,
} from './store';
import type { PatternType } from './types';
import { C30_MIN_EVIDENCE_COUNT } from './types';

export interface DetectorInput {
  userId: number;
  weekStart: number;
  /** 取过去多少周的数据 (默认 4 周, 60 天数据点) */
  lookbackWeeks?: number;
}

export interface DetectorResult {
  success: boolean;
  runId: number | null;
  candidatesGenerated: number;
  passedC30: number;
  durationMs: number;
  error?: string;
}

// ============================================================================
// LLM prompt · grounded 强约束
// ============================================================================

const PATTERN_DETECTOR_SYSTEM_PROMPT = `你是 KEY 的 Pattern Detector. 任务: 从用户最近的 daily pulses + decisions + outcomes 里, 找出**有具体证据的 pattern**.

# 6 种合法 pattern 类型 (必选其一)

- **topic_frequency**: 某个人/topic 在 ≥3 条具体 pulse/decision 里反复出现.
- **temporal**: 某个时间段 (凌晨/周末/月初) 总写同一类内容, ≥3 个具体例子.
- **avoidance**: 用户每次靠近某 topic 就转开, ≥3 次具体观察.
- **role_strain**: 多重角色 (母亲/女儿/职业/伴侣) 张力, ≥3 处具体证据.
- **growth_marker**: 用户表达方式从"我必须"→"我可以选择", ≥3 处证据对照.
- **relation_defensive**: 提到 X 时永远先自责/归罪自己, ≥3 处证据.

# 输出格式 (JSON array, 0-5 条 insight)

[
  {
    "pattern_type": "topic_frequency",
    "title": "你 6 次提到母亲" (12-30 字标题),
    "description": "200-400 字 description. 必须具体引证: 'X 月 X 日你说 ...' / '在那次决定里, 你写到 ...'",
    "evidence_pulse_ids": [12, 34, 56],
    "evidence_decision_ids": [],
    "evidence_outcome_ids": [],
    "evidence_rmc_ids": []
  }
]

# 严禁

- 宽泛模糊 ("我看见你最近有些焦虑" — 不行, 这是诊断不是观察)
- 编造 ID (evidence_*_ids 必须真实存在 — 见输入数据)
- 心理学黑话标签 ("回避型依恋" "completion anxiety")
- 鸡汤总结 ("这显示了你的成长")
- 笼统的"你似乎/好像" — 改成"X 月 X 日你说..."

# 数据不够时

如果某类 pattern 候选证据不足 3 条, **不要返回这条 insight**. 宁可 0 条不要硬凑.
返回空数组 [] 完全可以.

直接 JSON array, 不要 markdown 块, 不要解释.`;

// ============================================================================
// 主入口
// ============================================================================
export async function detectPatternsForUser(input: DetectorInput): Promise<DetectorResult> {
  const t0 = Date.now();
  const db = getDb();
  const lookbackDays = (input.lookbackWeeks ?? 4) * 7;
  const since = input.weekStart - lookbackDays * 86400;

  // 1. 拉数据 (用户最近 N 周)
  const pulses = db
    .prepare(
      `SELECT id, question_id, content, tags, created_at
       FROM daily_pulses
       WHERE user_id = ? AND created_at >= ?
       ORDER BY created_at DESC LIMIT 80`,
    )
    .all(input.userId, since) as any[];

  const decisions = db
    .prepare(
      `SELECT id, question, framework, created_at
       FROM decisions
       WHERE user_id = ? AND created_at >= ?
       ORDER BY created_at DESC LIMIT 30`,
    )
    .all(input.userId, since) as any[];

  const outcomes = db
    .prepare(
      `SELECT id, checkpoint_days, user_response, outcome_judgment, asked_at
       FROM decision_outcomes
       WHERE user_id = ? AND asked_at IS NOT NULL AND asked_at >= ?
       ORDER BY asked_at DESC LIMIT 20`,
    )
    .all(input.userId, since) as any[];

  // 拉现有 brain (RMC) 供 LLM 看背景
  const memory = fetchUserMemory(input.userId);

  // 2. 建立合法 ID 白名单 (C30 校验用)
  const validPulseIds = new Set(pulses.map((p) => p.id));
  const validDecisionIds = new Set(decisions.map((d) => d.id));
  const validOutcomeIds = new Set(outcomes.map((o) => o.id));
  const validRmcIds = new Set([
    ...memory.factual.map((c) => c.id),
    ...memory.boundary.map((c) => c.id),
    ...memory.relational.map((c) => c.id),
    ...memory.episodic.map((c) => c.id),
    ...memory.psychSignal.map((c) => c.id),
  ]);

  // 3. 数据太少跳过 (避免 spam)
  if (pulses.length < 6 && decisions.length < 2) {
    const runId = startInsightRun({
      userId: input.userId,
      weekStart: input.weekStart,
      pulsesSeen: pulses.length,
      decisionsSeen: decisions.length,
    });
    finishInsightRun({
      runId,
      insightsGenerated: 0,
      insightsPassedC30: 0,
      durationMs: Date.now() - t0,
      error: 'insufficient_data (need >=6 pulses or >=2 decisions)',
    });
    return {
      success: true,
      runId,
      candidatesGenerated: 0,
      passedC30: 0,
      durationMs: Date.now() - t0,
    };
  }

  const runId = startInsightRun({
    userId: input.userId,
    weekStart: input.weekStart,
    pulsesSeen: pulses.length,
    decisionsSeen: decisions.length,
  });

  // 4. 构造 LLM 输入
  const dataDigest = buildDataDigest({ pulses, decisions, outcomes, memory });

  let candidates: Array<{
    pattern_type: PatternType;
    title: string;
    description: string;
    evidence_pulse_ids?: number[];
    evidence_decision_ids?: number[];
    evidence_outcome_ids?: number[];
    evidence_rmc_ids?: number[];
  }> = [];
  let tokensUsed = 0;

  try {
    const resp = await modelRouter.complete({
      messages: [
        { role: 'system', content: PATTERN_DETECTOR_SYSTEM_PROMPT },
        { role: 'user', content: dataDigest },
      ],
      provider: 'deepseek',
      temperature: 0.3,
      maxTokens: 3000,
    });
    tokensUsed = resp.usage?.total_tokens || 0;
    candidates = parseDetectorOutput(resp.content);
  } catch (e: any) {
    finishInsightRun({
      runId,
      insightsGenerated: 0,
      insightsPassedC30: 0,
      durationMs: Date.now() - t0,
      tokensUsed,
      error: `LLM error: ${e.message}`,
    });
    return {
      success: false,
      runId,
      candidatesGenerated: 0,
      passedC30: 0,
      durationMs: Date.now() - t0,
      error: e.message,
    };
  }

  // 5. 校验每条 candidate + Inspector C30 守护
  let passedC30 = 0;
  for (const c of candidates) {
    // 校验 evidence IDs 真实
    const pulseIds = (c.evidence_pulse_ids || []).filter((id) => validPulseIds.has(id));
    const decisionIds = (c.evidence_decision_ids || []).filter((id) => validDecisionIds.has(id));
    const outcomeIds = (c.evidence_outcome_ids || []).filter((id) => validOutcomeIds.has(id));
    const rmcIds = (c.evidence_rmc_ids || []).filter((id) => validRmcIds.has(id));

    const totalEvidence = pulseIds.length + decisionIds.length + outcomeIds.length + rmcIds.length;

    if (totalEvidence < C30_MIN_EVIDENCE_COUNT) {
      continue; // C30 守门
    }

    const result = saveInsight({
      userId: input.userId,
      patternType: c.pattern_type,
      title: (c.title || '').slice(0, 80),
      description: (c.description || '').slice(0, 1500),
      evidencePulseIds: pulseIds,
      evidenceDecisionIds: decisionIds,
      evidenceOutcomeIds: outcomeIds,
      evidenceRmcIds: rmcIds,
      detectionRunId: runId,
    });
    if (result.ok) passedC30++;
  }

  finishInsightRun({
    runId,
    insightsGenerated: candidates.length,
    insightsPassedC30: passedC30,
    tokensUsed,
    durationMs: Date.now() - t0,
  });

  return {
    success: true,
    runId,
    candidatesGenerated: candidates.length,
    passedC30,
    durationMs: Date.now() - t0,
  };
}

// ============================================================================
// helpers
// ============================================================================

function buildDataDigest(args: {
  pulses: any[];
  decisions: any[];
  outcomes: any[];
  memory: any;
}): string {
  const dateStr = (unix: number) =>
    new Date(unix * 1000).toISOString().split('T')[0]; // YYYY-MM-DD

  const parts: string[] = [];

  parts.push('# 用户最近的 daily pulses (id · 日期 · question · 内容)');
  if (args.pulses.length === 0) {
    parts.push('(无)');
  } else {
    for (const p of args.pulses) {
      parts.push(
        `pulse_id=${p.id} · ${dateStr(p.created_at)} · [${p.question_id}] ${(p.content || '').slice(0, 200)}`,
      );
    }
  }

  parts.push('\n# 用户最近的 decisions (id · 日期 · framework · question)');
  if (args.decisions.length === 0) {
    parts.push('(无)');
  } else {
    for (const d of args.decisions) {
      parts.push(
        `decision_id=${d.id} · ${dateStr(d.created_at)} · [${d.framework}] ${(d.question || '').slice(0, 200)}`,
      );
    }
  }

  parts.push('\n# 用户回过的 outcomes (id · checkpoint_days · 判断 · 用户原话)');
  if (args.outcomes.length === 0) {
    parts.push('(无)');
  } else {
    for (const o of args.outcomes) {
      parts.push(
        `outcome_id=${o.id} · ${o.checkpoint_days}d · ${o.outcome_judgment} · ${(o.user_response || '').slice(0, 200)}`,
      );
    }
  }

  // 现有 RMC (背景, 不一定要 cite, 但有上下文)
  parts.push('\n# 现有 brain RMC 卡 (背景上下文 — 引用时用 rmc_id)');
  const allCards = [
    ...args.memory.factual.map((c: any) => ({ ...c, tag: 'factual' })),
    ...args.memory.boundary.map((c: any) => ({ ...c, tag: 'boundary' })),
    ...args.memory.relational.map((c: any) => ({ ...c, tag: 'relational' })),
    ...args.memory.episodic.map((c: any) => ({ ...c, tag: 'episodic' })),
    ...args.memory.psychSignal.map((c: any) => ({ ...c, tag: 'psych_signal' })),
  ].slice(0, 30);
  for (const c of allCards) {
    parts.push(`rmc_id=${c.id} · [${c.tag}] ${c.title}: ${(c.content || '').slice(0, 150)}`);
  }

  parts.push('\n# 任务\n根据上面的数据, 找出有 ≥3 条具体证据的 pattern. 输出 JSON array.');

  return parts.join('\n');
}

function parseDetectorOutput(content: string): any[] {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  const startIdx = cleaned.indexOf('[');
  const endIdx = cleaned.lastIndexOf(']');
  if (startIdx === -1 || endIdx === -1) return [];
  cleaned = cleaned.slice(startIdx, endIdx + 1);
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
