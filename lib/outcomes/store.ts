/**
 * Decision Outcomes 存取层
 *
 * Layer 4 of 4-layer architecture: 决策结果账本 (Outcome Ledger)
 *
 * 每个 decision 自动创建 3 个 checkpoint outcome rows (30 / 90 / 365 day).
 * 用户开页时 surface due 的 outcomes, 用户回答后 AI 生成 reflection.
 */

import { getDb } from '@/lib/db';

export type CheckpointDays = 30 | 90 | 365;
export type OutcomeJudgment =
  | 'as-expected'
  | 'better'
  | 'worse'
  | 'mixed'
  | 'too-early'
  | 'cancelled';

export interface OutcomeRecord {
  id: number;
  decisionId: number;
  userId: number;
  checkpointDays: CheckpointDays;
  dueAt: number;
  askedAt: number | null;
  userResponse: string | null;
  outcomeJudgment: OutcomeJudgment | null;
  aiReflection: string | null;
  patternInsight: string | null;
  createdAt: number;
}

export interface OutcomeWithDecision extends OutcomeRecord {
  decisionQuestion: string;
  decisionFramework: string | null;
  decisionCreatedAt: number;
}

/**
 * 决策创建后自动 schedule 3 个 outcome checkpoint
 */
export async function scheduleOutcomes(
  decisionId: number,
  userId: number,
  decisionCreatedAt: number = Math.floor(Date.now() / 1000)
): Promise<number[]> {
  const db = await getDb();
  const checkpoints: CheckpointDays[] = [30, 90, 365];
  const ids: number[] = [];

  for (const days of checkpoints) {
    const dueAt = decisionCreatedAt + days * 86400;
    try {
      const result = await db
        .prepare(
          `INSERT INTO decision_outcomes (decision_id, user_id, checkpoint_days, due_at)
           VALUES (?, ?, ?, ?)`
        )
        .run(decisionId, userId, days, dueAt);
      ids.push(result.lastInsertRowid as number);
    } catch (e: any) {
      // 已存在 → skip (UNIQUE 约束)
      if (!e.message?.includes('UNIQUE')) {
        console.error('[outcomes] schedule failed:', e);
      }
    }
  }
  return ids;
}

/**
 * 拉用户当前到期的 outcomes (due_at <= now AND asked_at IS NULL)
 */
export async function getDueOutcomes(userId: number): Promise<OutcomeWithDecision[]> {
  const db = await getDb();
  const now = Math.floor(Date.now() / 1000);
  const rows = (await db
    .prepare(
      `SELECT
         o.id, o.decision_id, o.user_id, o.checkpoint_days, o.due_at, o.asked_at,
         o.user_response, o.outcome_judgment, o.ai_reflection, o.pattern_insight, o.created_at,
         d.question AS decision_question, d.framework AS decision_framework, d.created_at AS decision_created_at
       FROM decision_outcomes o
       JOIN decisions d ON d.id = o.decision_id
       WHERE o.user_id = ?
         AND o.due_at <= ?
         AND o.asked_at IS NULL
       ORDER BY o.due_at ASC
       LIMIT 10`
    )
    .all(userId, now)) as any[];
  return rows.map(rowToOutcomeWithDecision);
}

/**
 * 拉用户已回答的 outcomes (用于 dashboard 看历史)
 */
export async function getResolvedOutcomes(userId: number, limit = 30): Promise<OutcomeWithDecision[]> {
  const db = await getDb();
  const rows = (await db
    .prepare(
      `SELECT
         o.id, o.decision_id, o.user_id, o.checkpoint_days, o.due_at, o.asked_at,
         o.user_response, o.outcome_judgment, o.ai_reflection, o.pattern_insight, o.created_at,
         d.question AS decision_question, d.framework AS decision_framework, d.created_at AS decision_created_at
       FROM decision_outcomes o
       JOIN decisions d ON d.id = o.decision_id
       WHERE o.user_id = ?
         AND o.asked_at IS NOT NULL
       ORDER BY o.asked_at DESC
       LIMIT ?`
    )
    .all(userId, limit)) as any[];
  return rows.map(rowToOutcomeWithDecision);
}

/**
 * 拉一个 decision 的所有 outcomes (pending + resolved)
 */
export async function getOutcomesForDecision(decisionId: number): Promise<OutcomeRecord[]> {
  const db = await getDb();
  const rows = (await db
    .prepare(
      `SELECT * FROM decision_outcomes WHERE decision_id = ? ORDER BY checkpoint_days ASC`
    )
    .all(decisionId)) as any[];
  return rows.map(rowToOutcome);
}

/**
 * 标记 outcome 已被问 (用户点开看到了, 即使没回答)
 */
export async function markOutcomeAsked(outcomeId: number): Promise<void> {
  const db = await getDb();
  db.prepare(`UPDATE decision_outcomes SET asked_at = unixepoch() WHERE id = ? AND asked_at IS NULL`).run(outcomeId);
}

/**
 * 保存用户回答 + AI reflection
 */
export async function saveOutcomeResponse(args: {
  outcomeId: number;
  userResponse: string;
  outcomeJudgment: OutcomeJudgment;
  aiReflection: string;
  patternInsight?: string;
}): Promise<void> {
  const db = await getDb();
  db.prepare(
    `UPDATE decision_outcomes
     SET user_response = ?,
         outcome_judgment = ?,
         ai_reflection = ?,
         pattern_insight = ?,
         asked_at = COALESCE(asked_at, unixepoch())
     WHERE id = ?`
  ).run(
    args.userResponse,
    args.outcomeJudgment,
    args.aiReflection,
    args.patternInsight ?? null,
    args.outcomeId
  );
}

/**
 * 用户的整体 outcome stats (用于 dashboard "我的决策账本")
 */
export interface OutcomeStats {
  totalDecisions: number;
  totalCheckpoints: number;
  resolvedCheckpoints: number;
  dueCheckpoints: number;
  futureCheckpoints: number;
  judgments: {
    asExpected: number;
    better: number;
    worse: number;
    mixed: number;
    tooEarly: number;
    cancelled: number;
  };
}

export async function getUserOutcomeStats(userId: number): Promise<OutcomeStats> {
  const db = await getDb();
  const totalDecisionsRow = (await db
    .prepare(`SELECT COUNT(*) as n FROM decisions WHERE user_id = ?`)
    .get(userId)) as { n: number };

  const checkpointsRow = (await db
    .prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN asked_at IS NOT NULL THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN asked_at IS NULL AND due_at <= unixepoch() THEN 1 ELSE 0 END) AS due,
        SUM(CASE WHEN asked_at IS NULL AND due_at > unixepoch() THEN 1 ELSE 0 END) AS future
      FROM decision_outcomes
      WHERE user_id = ?
    `)
    .get(userId)) as any;

  const judgments = (await db
    .prepare(`
      SELECT outcome_judgment, COUNT(*) as n
      FROM decision_outcomes
      WHERE user_id = ? AND outcome_judgment IS NOT NULL
      GROUP BY outcome_judgment
    `)
    .all(userId)) as Array<{ outcome_judgment: string; n: number }>;

  const judgmentMap: Record<string, number> = {};
  for (const j of judgments) judgmentMap[j.outcome_judgment] = j.n;

  return {
    totalDecisions: totalDecisionsRow.n,
    totalCheckpoints: checkpointsRow.total || 0,
    resolvedCheckpoints: checkpointsRow.resolved || 0,
    dueCheckpoints: checkpointsRow.due || 0,
    futureCheckpoints: checkpointsRow.future || 0,
    judgments: {
      asExpected: judgmentMap['as-expected'] || 0,
      better: judgmentMap['better'] || 0,
      worse: judgmentMap['worse'] || 0,
      mixed: judgmentMap['mixed'] || 0,
      tooEarly: judgmentMap['too-early'] || 0,
      cancelled: judgmentMap['cancelled'] || 0,
    },
  };
}

// ============================================================================
// Row mappers
// ============================================================================
function rowToOutcome(row: any): OutcomeRecord {
  return {
    id: row.id,
    decisionId: row.decision_id,
    userId: row.user_id,
    checkpointDays: row.checkpoint_days,
    dueAt: row.due_at,
    askedAt: row.asked_at,
    userResponse: row.user_response,
    outcomeJudgment: row.outcome_judgment,
    aiReflection: row.ai_reflection,
    patternInsight: row.pattern_insight,
    createdAt: row.created_at,
  };
}

function rowToOutcomeWithDecision(row: any): OutcomeWithDecision {
  return {
    ...rowToOutcome(row),
    decisionQuestion: row.decision_question,
    decisionFramework: row.decision_framework,
    decisionCreatedAt: row.decision_created_at,
  };
}
