/**
 * GET /api/brain/insights · 拉当前用户的 insights + last run 信息
 *
 * JOB-020.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { listInsights, getLastInsightRun } from '@/lib/insights/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const includeArchived =
      new URL(req.url).searchParams.get('include') === 'archived';
    const insights = listInsights(userId, { includeArchived });
    const lastRun = getLastInsightRun(userId);
    return NextResponse.json({ insights, lastRun });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ insights: [], lastRun: null }, { status: 200 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
