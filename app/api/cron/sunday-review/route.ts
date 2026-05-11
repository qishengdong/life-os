/**
 * Sunday Review Cron Endpoint
 *
 * 真实部署时, 通过系统 cron 或 GitHub Actions 周日 20:00 调用:
 *   curl -X POST https://lifeos.cn/api/cron/sunday-review \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 * 工作:
 *   1. 找过去 7 天 ≥3 条 Pulse 的用户
 *   2. 跳过本周已生成的 review
 *   3. 给每个用户生成 review
 *   4. 写入 sunday_reviews 表
 *   5. (V1.5) 发邮件通知
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateReview } from '@/lib/sunday-review/generator';
import { saveReview, getWeekRange } from '@/lib/sunday-review/store';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Auth: 简单 bearer token (env CRON_SECRET)
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret) {
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    // 开发环境无 CRON_SECRET 时允许调用, 但 log warning
    console.warn('[cron/sunday-review] CRON_SECRET not set — allowing unauth call (dev only)');
  }

  const { weekStart, weekEnd } = getWeekRange();
  const db = getDb();

  // 找过去 7 天 ≥3 Pulse 的用户, 且本周没生成 review
  const candidates = db
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
    .all(weekStart, weekEnd, weekStart) as Array<{ user_id: number; pulse_count: number }>;

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
        results.push({
          userId: c.user_id,
          status: 'generated',
          charCount: result.charCount,
          pulseCount: result.pulseCount,
          durationMs: result.durationMs,
        });
      } else {
        results.push({ userId: c.user_id, status: 'skipped', reason: result.error });
      }
    } catch (e: any) {
      results.push({ userId: c.user_id, status: 'error', error: e.message });
    }
    // 防 rate limit
    await new Promise((r) => setTimeout(r, 500));
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

// GET 用于测试: 返回 candidate 列表但不实际生成
export async function GET(req: NextRequest) {
  const { weekStart, weekEnd } = getWeekRange();
  const db = getDb();

  const candidates = db
    .prepare(
      `SELECT u.id AS user_id, u.user_uid,
              COUNT(p.id) AS pulse_count
       FROM users u
       JOIN daily_pulses p ON p.user_id = u.id
       WHERE p.created_at >= ? AND p.created_at <= ?
       GROUP BY u.id
       HAVING pulse_count >= 3`
    )
    .all(weekStart, weekEnd) as any[];

  const existingReviews = db
    .prepare(`SELECT user_id FROM sunday_reviews WHERE week_start = ?`)
    .all(weekStart) as Array<{ user_id: number }>;
  const reviewedSet = new Set(existingReviews.map((r) => r.user_id));

  return NextResponse.json({
    weekRange: { weekStart, weekEnd },
    candidates: candidates.map((c) => ({
      ...c,
      hasReviewThisWeek: reviewedSet.has(c.user_id),
    })),
    eligibleForGeneration: candidates.filter((c) => !reviewedSet.has(c.user_id)).length,
  });
}
