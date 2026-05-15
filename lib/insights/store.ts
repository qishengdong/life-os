/**
 * brain_insights DB helpers.
 */

import { getDb } from '@/lib/db';
import {
  type Insight,
  type InsightRun,
  type InsightStatus,
  type PatternType,
  C30_MIN_EVIDENCE_COUNT,
} from './types';

function rowToInsight(row: any): Insight {
  return {
    id: row.id,
    userId: row.user_id,
    patternType: row.pattern_type,
    title: row.title,
    description: row.description,
    evidencePulseIds: tryParseArr(row.evidence_pulse_ids),
    evidenceDecisionIds: tryParseArr(row.evidence_decision_ids),
    evidenceOutcomeIds: tryParseArr(row.evidence_outcome_ids),
    evidenceRmcIds: tryParseArr(row.evidence_rmc_ids),
    evidenceCount: row.evidence_count,
    status: row.status,
    userCorrection: row.user_correction,
    confidence: row.confidence,
    detectedAt: row.detected_at,
    reviewedAt: row.reviewed_at,
    detectionRunId: row.detection_run_id,
  };
}

function tryParseArr(s: string | null): number[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(Number).filter((x) => !isNaN(x)) : [];
  } catch {
    return [];
  }
}

/** 写入 insight · Inspector C30 守门: evidence_count < 3 直接拒收. */
export function saveInsight(args: {
  userId: number;
  patternType: PatternType;
  title: string;
  description: string;
  evidencePulseIds?: number[];
  evidenceDecisionIds?: number[];
  evidenceOutcomeIds?: number[];
  evidenceRmcIds?: number[];
  confidence?: number;
  detectionRunId?: number;
}): { ok: true; id: number } | { ok: false; reason: 'c30_insufficient_evidence' } {
  const evidenceCount =
    (args.evidencePulseIds?.length || 0) +
    (args.evidenceDecisionIds?.length || 0) +
    (args.evidenceOutcomeIds?.length || 0) +
    (args.evidenceRmcIds?.length || 0);

  // C30 grounded 守护: 没有 3 条以上证据的不入库
  if (evidenceCount < C30_MIN_EVIDENCE_COUNT) {
    return { ok: false, reason: 'c30_insufficient_evidence' };
  }

  const db = getDb();
  const res = db
    .prepare(
      `INSERT INTO brain_insights (
        user_id, pattern_type, title, description,
        evidence_pulse_ids, evidence_decision_ids,
        evidence_outcome_ids, evidence_rmc_ids,
        evidence_count, confidence, detection_run_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      args.userId,
      args.patternType,
      args.title,
      args.description,
      JSON.stringify(args.evidencePulseIds || []),
      JSON.stringify(args.evidenceDecisionIds || []),
      JSON.stringify(args.evidenceOutcomeIds || []),
      JSON.stringify(args.evidenceRmcIds || []),
      evidenceCount,
      args.confidence ?? 0.7,
      args.detectionRunId ?? null,
    );
  return { ok: true, id: res.lastInsertRowid as number };
}

/** 取 user 的 insights · 默认排除 archived/rejected. */
export function listInsights(
  userId: number,
  opts: { includeArchived?: boolean; limit?: number } = {},
): Insight[] {
  const db = getDb();
  const where = opts.includeArchived
    ? `user_id = ?`
    : `user_id = ? AND status NOT IN ('archived', 'rejected')`;
  const limit = opts.limit ?? 50;
  const rows = db
    .prepare(
      `SELECT * FROM brain_insights WHERE ${where}
       ORDER BY status = 'unreviewed' DESC, detected_at DESC LIMIT ?`,
    )
    .all(userId, limit) as any[];
  return rows.map(rowToInsight);
}

function ownsInsight(userId: number, id: number): boolean {
  const db = getDb();
  const r = db
    .prepare(`SELECT user_id FROM brain_insights WHERE id = ?`)
    .get(id) as { user_id: number } | undefined;
  return !!r && r.user_id === userId;
}

export function updateInsightStatus(args: {
  userId: number;
  id: number;
  status: InsightStatus;
  userCorrection?: string;
}): boolean {
  if (!ownsInsight(args.userId, args.id)) return false;
  const db = getDb();
  db.prepare(
    `UPDATE brain_insights
       SET status = ?, user_correction = ?, reviewed_at = unixepoch()
     WHERE id = ?`,
  ).run(args.status, args.userCorrection ?? null, args.id);
  return true;
}

// ============================================================================
// Run audit table
// ============================================================================

export function startInsightRun(args: {
  userId: number;
  weekStart: number;
  pulsesSeen: number;
  decisionsSeen: number;
}): number {
  const db = getDb();
  // 同一 (user_id, week_start) 已存在 → 删了重跑
  db.prepare(`DELETE FROM brain_insight_runs WHERE user_id = ? AND week_start = ?`).run(
    args.userId,
    args.weekStart,
  );
  const res = db
    .prepare(
      `INSERT INTO brain_insight_runs (user_id, week_start, pulses_seen, decisions_seen)
       VALUES (?, ?, ?, ?)`,
    )
    .run(args.userId, args.weekStart, args.pulsesSeen, args.decisionsSeen);
  return res.lastInsertRowid as number;
}

export function finishInsightRun(args: {
  runId: number;
  insightsGenerated: number;
  insightsPassedC30: number;
  tokensUsed?: number;
  durationMs?: number;
  error?: string;
}): void {
  const db = getDb();
  db.prepare(
    `UPDATE brain_insight_runs
       SET insights_generated = ?, insights_passed_c30 = ?,
           tokens_used = ?, duration_ms = ?, error = ?
     WHERE id = ?`,
  ).run(
    args.insightsGenerated,
    args.insightsPassedC30,
    args.tokensUsed ?? null,
    args.durationMs ?? null,
    args.error ?? null,
    args.runId,
  );
}

/** 最近一次 run, 用于 UI 显示"上次分析时间". */
export function getLastInsightRun(userId: number): InsightRun | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT * FROM brain_insight_runs WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
    )
    .get(userId) as any;
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    weekStart: row.week_start,
    insightsGenerated: row.insights_generated,
    insightsPassedC30: row.insights_passed_c30,
    pulsesSeen: row.pulses_seen,
    decisionsSeen: row.decisions_seen,
    tokensUsed: row.tokens_used,
    durationMs: row.duration_ms,
    error: row.error,
    createdAt: row.created_at,
  };
}
