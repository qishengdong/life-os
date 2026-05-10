/**
 * Inspector v0
 *
 * Sivon doctrine 1.4: 不再 prompt 加补丁, 转 enforcement.
 *
 * 工作流:
 *   1. LLM stream 完成 → 调用 runInspector(ctx)
 *   2. 跑全部 5 个 check
 *   3. shadow 模式 (V0): 全部入 audit 表, 不 block, 不 retry
 *   4. active 模式 (V1+): 命中 P0 → block + retry / fallback 中性
 *
 * 切换 shadow → active 的 protocol:
 *   - shadow 7 天稳定 (假阳性率 < 5%)
 *   - white-list-only 7 天 (仅创始人账号 active)
 *   - active 全开
 */

import { getDb } from '@/lib/db';
import { runAllChecks } from './checks';
import type {
  InspectorContext,
  InspectorReport,
  CheckResult,
  Severity,
  Action,
} from './types';

const SEVERITY_ORDER: Record<Severity, number> = { low: 0, high: 1, p0: 2 };

export function runInspector(ctx: InspectorContext): InspectorReport {
  const allResults = runAllChecks(ctx);
  const hits = allResults.filter((r) => r.hit);

  // 决定推荐 action
  let worstSeverity: Severity | null = null;
  let recommendedAction: Action = 'shadow';

  if (hits.length > 0) {
    for (const hit of hits) {
      if (worstSeverity === null || SEVERITY_ORDER[hit.severity] > SEVERITY_ORDER[worstSeverity]) {
        worstSeverity = hit.severity;
      }
    }

    // V0 永远 shadow. V1+ 这里根据 mode 决定 action.
    const mode = process.env.LIFEOS_INSPECTOR_MODE || 'shadow';
    if (mode === 'active' && worstSeverity === 'p0') {
      recommendedAction = 'block';
    } else if (mode === 'active' && worstSeverity === 'high') {
      recommendedAction = 'flag';
    } else {
      recommendedAction = 'shadow';
    }
  }

  // 写 audit
  writeAuditEntries(ctx, hits, recommendedAction);

  return {
    decisionId: ctx.decisionId,
    userId: ctx.userId,
    totalChecks: allResults.length,
    hits,
    worstSeverity,
    recommendedAction,
    createdAt: Math.floor(Date.now() / 1000),
  };
}

function writeAuditEntries(
  ctx: InspectorContext,
  hits: CheckResult[],
  action: Action
): void {
  if (hits.length === 0) return;

  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO inspector_audit
       (user_id, decision_id, check_code, severity, action, matched_text, detail)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  for (const hit of hits) {
    stmt.run(
      ctx.userId,
      ctx.decisionId,
      hit.code,
      hit.severity,
      action,
      hit.matchedText ?? null,
      hit.detail ?? null
    );
  }
}

/**
 * 查询某用户最近 N 天的 audit 记录(用于 admin 面板 / shadow 监控)
 */
export function getRecentAudit(userId: number, sinceDaysAgo = 7) {
  const db = getDb();
  const sinceTs = Math.floor(Date.now() / 1000) - sinceDaysAgo * 86400;
  return db
    .prepare(
      `SELECT id, decision_id, check_code, severity, action, matched_text, detail, created_at
       FROM inspector_audit
       WHERE user_id = ? AND created_at >= ?
       ORDER BY created_at DESC`
    )
    .all(userId, sinceTs);
}

/**
 * Shadow 模式总览(全部用户聚合, 用于检验假阳性率)
 */
export function getShadowSummary(sinceDaysAgo = 7) {
  const db = getDb();
  const sinceTs = Math.floor(Date.now() / 1000) - sinceDaysAgo * 86400;
  return db
    .prepare(
      `SELECT check_code, severity, COUNT(*) as hits
       FROM inspector_audit
       WHERE created_at >= ?
       GROUP BY check_code, severity
       ORDER BY hits DESC`
    )
    .all(sinceTs);
}

export type { InspectorReport, CheckResult, InspectorContext };
