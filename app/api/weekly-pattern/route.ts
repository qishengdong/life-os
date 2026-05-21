/**
 * /api/weekly-pattern · 5/20 ship · C2
 *
 * GET  · 拉本周 pattern (仅周六/周日 + 本周 ≥3 pulse + 未显示过)
 *        Response: { pattern: WeeklyPatternResult | null }
 *
 * POST · 记录用户反应
 *        Body: { action: 'view' | 'dismiss' | 'respond' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import {
  getWeeklyPatternForUser,
  recordWeeklyPatternAction,
} from '@/lib/weekly-pattern/detector';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    const pattern = await getWeeklyPatternForUser(userId);
    return NextResponse.json({ pattern });
  } catch (e) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: 'invalid uid' }, { status: 401 });
    }
    console.error('[api/weekly-pattern GET] error:', e);
    return NextResponse.json({ pattern: null });
  }
}

const ActionSchema = z.object({
  action: z.enum(['view', 'dismiss', 'respond']),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid body' }, { status: 400 });
    }
    await recordWeeklyPatternAction(userId, parsed.data.action);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: 'invalid uid' }, { status: 401 });
    }
    console.error('[api/weekly-pattern POST] error:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
