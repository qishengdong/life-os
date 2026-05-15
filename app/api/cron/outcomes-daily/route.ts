/**
 * Daily Outcomes Cron — 每天扫 due outcomes 发提醒邮件
 *
 * Vercel Cron (GET) 自动调用 (每天 01:00 UTC = 09:00 BJT, 见 vercel.json):
 *   GET /api/cron/outcomes-daily (auto: Authorization: Bearer CRON_SECRET)
 *
 * 手动测试 (POST 也支持):
 *   curl -X POST https://keypoint.life/api/cron/outcomes-daily \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 * 工作:
 *   1. 找今天到期 (due_at <= now AND asked_at IS NULL) AND 之前没发过提醒邮件的 outcomes
 *   2. 给每个 outcome 发邮件给用户
 *   3. 24h 去重 (检查 emails_sent 表)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendOutcomeDueNotification } from '@/lib/email/sender';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return true;
  return authHeader === `Bearer ${expectedSecret}`;
}

async function runOutcomesDailyWork() {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  // 找 due + asked_at IS NULL + 用户有 email 的 outcomes
  // V0: 简单实现, 没去重 (每天都会重发未答的). V1.5 加 reminded_at 字段限频率.
  const dueOutcomes = db
    .prepare(
      `SELECT
         o.id AS outcome_id, o.user_id, o.checkpoint_days, o.due_at,
         d.id AS decision_id, d.question AS decision_question, d.created_at AS decision_created_at,
         u.email
       FROM decision_outcomes o
       JOIN decisions d ON d.id = o.decision_id
       JOIN users u ON u.id = o.user_id
       WHERE o.due_at <= ?
         AND o.asked_at IS NULL
         AND u.email IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM emails_sent e
           WHERE e.user_id = u.id
             AND e.email_type = 'outcome_due'
             AND e.created_at >= ? -- 同一 outcome 24h 内不重发
         )
       LIMIT 50`
    )
    .all(now, now - 86400) as any[];

  const results: any[] = [];
  for (const o of dueOutcomes) {
    try {
      const r = await sendOutcomeDueNotification({
        userId: o.user_id,
        checkpointDays: o.checkpoint_days,
        decisionCreatedAt: o.decision_created_at,
        decisionQuestion: o.decision_question,
      });
      results.push({
        outcomeId: o.outcome_id,
        userId: o.user_id,
        checkpointDays: o.checkpoint_days,
        status: 'status' in r ? r.status : 'skipped',
      });
    } catch (e: any) {
      results.push({
        outcomeId: o.outcome_id,
        userId: o.user_id,
        status: 'error',
        error: e.message,
      });
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  return NextResponse.json({
    success: true,
    candidates: dueOutcomes.length,
    results,
  });
}

/** Vercel cron 自动 GET. 授权 → 跑工作, 否则返回 dry-run 状态. */
export async function GET(req: NextRequest) {
  if (isAuthorized(req)) {
    return runOutcomesDailyWork();
  }
  // diagnostic
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const dueOutcomes = db
    .prepare(
      `SELECT o.id AS outcome_id, o.user_id, o.checkpoint_days,
              datetime(o.due_at, 'unixepoch', '+8 hours') AS due_local,
              substr(d.question, 1, 80) AS question, u.email
       FROM decision_outcomes o
       JOIN decisions d ON d.id = o.decision_id
       JOIN users u ON u.id = o.user_id
       WHERE o.due_at <= ? AND o.asked_at IS NULL
       LIMIT 50`,
    )
    .all(now) as any[];
  return NextResponse.json({
    mode: 'dry-run (not authorized for live)',
    dueOutcomes,
    count: dueOutcomes.length,
  });
}

/** Manual trigger via POST (curl). */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runOutcomesDailyWork();
}
