/**
 * Sunday Review Cron Endpoint
 *
 * Vercel Cron (GET) 自动调用 (周日 12:00 UTC = 20:00 BJT, 见 vercel.json):
 *   GET /api/cron/sunday-review (auto: Authorization: Bearer CRON_SECRET)
 *
 * 手动测试 (POST 也支持):
 *   curl -X POST https://keypoint.life/api/cron/sunday-review \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 * 工作:
 *   1. 找过去 7 天 ≥3 条 Pulse 的用户
 *   2. 跳过本周已生成的 review
 *   3. 给每个用户生成 review
 *   4. 写入 sunday_reviews 表
 *   5. 发邮件通知 (dry-run mode by default)
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateReview } from '@/lib/sunday-review/generator';
import { saveReview, getWeekRange } from '@/lib/sunday-review/store';
import { sendSundayReviewNotification } from '@/lib/email/sender';
import { getDb } from '@/lib/db';
import { detectPatternsForUser } from '@/lib/insights/detector';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return true; // dev: allow
  return authHeader === `Bearer ${expectedSecret}`;
}

async function runSundayReviewWork() {
  const { weekStart, weekEnd } = getWeekRange();
  const db = await getDb();

  // 找过去 7 天 ≥3 Pulse 的用户, 且本周没生成 review
  const candidates = (await db
    .prepare(
      `SELECT u.id AS user_id,
              COUNT(p.id) AS pulse_count
       FROM users u
       JOIN daily_pulses p ON p.user_id = u.id
       WHERE p.created_at >= ? AND p.created_at <= ?
       GROUP BY u.id
       HAVING pulse_count >= 3
         AND u.id NOT IN (
           SELECT user_id FROM sunday_reviews WHERE week_start = ?
         )`
    )
    .all(weekStart, weekEnd, weekStart)) as Array<{ user_id: number; pulse_count: number }>;

  const results: any[] = [];
  for (const c of candidates) {
    try {
      const result = await generateReview({
        userId: c.user_id,
        weekStart,
        weekEnd,
      });
      if (result.success) {
        saveReview({
          userId: c.user_id,
          weekStart,
          weekEnd,
          content: result.content,
          pulseCount: result.pulseCount,
          decisionCount: result.decisionCount,
          tokensUsed: result.tokensUsed,
        });
        // 发邮件 (fire-and-forget, dry-run mode OK)
        const emailResult = await sendSundayReviewNotification({
          userId: c.user_id,
          weekStart,
          weekEnd,
          reviewContent: result.content,
          pulseCount: result.pulseCount,
        });
        // JOB-022 · 同一周期跑 pattern detection (Vercel Hobby 限 2 crons, 合并)
        let patternResult: any = null;
        try {
          patternResult = await detectPatternsForUser({
            userId: c.user_id,
            weekStart,
            lookbackWeeks: 4,
          });
        } catch (e) {
          console.error('[cron/sunday-review] pattern detect failed:', e);
        }

        results.push({
          userId: c.user_id,
          status: 'generated',
          charCount: result.charCount,
          pulseCount: result.pulseCount,
          durationMs: result.durationMs,
          emailStatus: 'status' in emailResult ? emailResult.status : 'skipped',
          patternCandidates: patternResult?.candidatesGenerated ?? 0,
          patternPassedC30: patternResult?.passedC30 ?? 0,
        });
      } else {
        results.push({ userId: c.user_id, status: 'skipped', reason: result.error });
      }
    } catch (e: any) {
      results.push({ userId: c.user_id, status: 'error', error: e.message });
    }
    // 防 rate limit · pattern detect 后多等一下
    await new Promise((r) => setTimeout(r, 1500));
  }

  return NextResponse.json({
    success: true,
    weekStart,
    weekEnd,
    candidates: candidates.length,
    generated: results.filter((r) => r.status === 'generated').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
    errors: results.filter((r) => r.status === 'error').length,
    results,
  });
}

/** Vercel cron 自动 GET. 授权 → 跑工作, 否则返回 dry-run 状态. */
export async function GET(req: NextRequest) {
  if (isAuthorized(req)) {
    return runSundayReviewWork();
  }
  // diagnostic: 列 candidates 不实跑
  const { weekStart, weekEnd } = getWeekRange();
  const db = await getDb();
  const candidates = (await db
    .prepare(
      `SELECT u.id AS user_id, u.user_uid, COUNT(p.id) AS pulse_count
       FROM users u JOIN daily_pulses p ON p.user_id = u.id
       WHERE p.created_at >= ? AND p.created_at <= ?
       GROUP BY u.id HAVING pulse_count >= 3`,
    )
    .all(weekStart, weekEnd)) as any[];
  const existingReviews = (await db
    .prepare(`SELECT user_id FROM sunday_reviews WHERE week_start = ?`)
    .all(weekStart)) as Array<{ user_id: number }>;
  const reviewedSet = new Set(existingReviews.map((r) => r.user_id));
  return NextResponse.json({
    mode: 'dry-run (not authorized for live)',
    weekRange: { weekStart, weekEnd },
    eligibleForGeneration: candidates.filter((c) => !reviewedSet.has(c.user_id)).length,
    candidatePreview: candidates.slice(0, 10),
  });
}

/** Manual trigger via POST (curl). */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runSundayReviewWork();
}
