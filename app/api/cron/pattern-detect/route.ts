/**
 * Weekly Pattern Detection Cron
 *
 * Vercel cron auto-call: 周一 02:00 UTC = 10:00 BJT, 见 vercel.json
 * 见 lib/insights/detector.ts.
 *
 * 工作:
 *   1. 找过去 4 周有 ≥6 pulses 或 ≥2 decisions 的所有用户
 *   2. 跳过本周已跑过的 (brain_insight_runs UNIQUE user_id + week_start)
 *   3. 给每个用户跑 detectPatternsForUser (LLM, C30 守护)
 *   4. audit run 结果入 brain_insight_runs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { detectPatternsForUser } from '@/lib/insights/detector';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return true; // dev
  return authHeader === `Bearer ${expectedSecret}`;
}

/** 本周 week_start = 本周一 00:00 BJT (UTC+8). */
function getThisWeekStart(): number {
  const now = new Date();
  const bjtMs = now.getTime() + (8 * 60 * 60 * 1000);
  const bjtNow = new Date(bjtMs);
  // 周一 = ISO 1. Sunday = 0 → adjust to ISO
  const day = bjtNow.getUTCDay() === 0 ? 7 : bjtNow.getUTCDay();
  const daysFromMonday = day - 1;
  const monday = new Date(bjtMs - daysFromMonday * 86400000);
  monday.setUTCHours(0, 0, 0, 0);
  // BJT 周一 00:00 = UTC 周日 16:00 → 减 8 小时
  return Math.floor((monday.getTime() - 8 * 60 * 60 * 1000) / 1000);
}

async function runPatternDetection() {
  const db = getDb();
  const weekStart = getThisWeekStart();
  const lookbackSince = weekStart - 4 * 7 * 86400;

  // 找过去 4 周有数据的用户 (≥6 pulse 或 ≥2 decision), 跳过本周已跑过
  const candidates = db
    .prepare(
      `SELECT u.id AS user_id,
              (SELECT COUNT(*) FROM daily_pulses WHERE user_id = u.id AND created_at >= ?) AS pulse_count,
              (SELECT COUNT(*) FROM decisions WHERE user_id = u.id AND created_at >= ?) AS decision_count
       FROM users u
       WHERE u.id IN (
         SELECT user_id FROM daily_pulses WHERE created_at >= ?
         UNION
         SELECT user_id FROM decisions WHERE created_at >= ?
       )
         AND u.id NOT IN (SELECT user_id FROM brain_insight_runs WHERE week_start = ?)`,
    )
    .all(lookbackSince, lookbackSince, lookbackSince, lookbackSince, weekStart) as Array<{
    user_id: number;
    pulse_count: number;
    decision_count: number;
  }>;

  const results: any[] = [];
  for (const c of candidates) {
    if (c.pulse_count < 6 && c.decision_count < 2) {
      results.push({
        userId: c.user_id,
        status: 'skipped_insufficient_data',
        pulseCount: c.pulse_count,
        decisionCount: c.decision_count,
      });
      continue;
    }
    try {
      const res = await detectPatternsForUser({
        userId: c.user_id,
        weekStart,
        lookbackWeeks: 4,
      });
      results.push({
        userId: c.user_id,
        status: res.success ? 'detected' : 'error',
        candidates: res.candidatesGenerated,
        passedC30: res.passedC30,
        durationMs: res.durationMs,
        error: res.error,
      });
    } catch (e: any) {
      results.push({ userId: c.user_id, status: 'error', error: e.message });
    }
    // 防 rate limit
    await new Promise((r) => setTimeout(r, 800));
  }

  return NextResponse.json({
    success: true,
    weekStart,
    candidateCount: candidates.length,
    detected: results.filter((r) => r.status === 'detected').length,
    skipped: results.filter((r) => r.status === 'skipped_insufficient_data').length,
    errors: results.filter((r) => r.status === 'error').length,
    results,
  });
}

export async function GET(req: NextRequest) {
  if (isAuthorized(req)) {
    return runPatternDetection();
  }
  // diagnostic — 列 candidates 不实跑
  const db = getDb();
  const weekStart = getThisWeekStart();
  const lookbackSince = weekStart - 4 * 7 * 86400;
  const candidates = db
    .prepare(
      `SELECT u.id AS user_id,
              (SELECT COUNT(*) FROM daily_pulses WHERE user_id = u.id AND created_at >= ?) AS pulse_count,
              (SELECT COUNT(*) FROM decisions WHERE user_id = u.id AND created_at >= ?) AS decision_count
       FROM users u
       WHERE u.id IN (
         SELECT user_id FROM daily_pulses WHERE created_at >= ?
         UNION
         SELECT user_id FROM decisions WHERE created_at >= ?
       )`,
    )
    .all(lookbackSince, lookbackSince, lookbackSince, lookbackSince) as any[];
  return NextResponse.json({
    mode: 'dry-run',
    weekStart,
    candidates,
    eligibleForDetection: candidates.filter(
      (c: any) => c.pulse_count >= 6 || c.decision_count >= 2,
    ).length,
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runPatternDetection();
}
