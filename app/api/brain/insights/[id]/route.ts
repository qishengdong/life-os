/**
 * PATCH /api/brain/insights/[id] · 用户操作 (confirm / correct / archive / reject)
 *
 * JOB-021.
 *
 * Body: { status: 'confirmed'|'corrected'|'archived'|'rejected', userCorrection?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { updateInsightStatus } from '@/lib/insights/store';
import type { InsightStatus } from '@/lib/insights/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_STATUSES: InsightStatus[] = [
  'confirmed',
  'corrected',
  'archived',
  'rejected',
];

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = resolveUserId(req);
    const { id } = await ctx.params;
    const body = await req.json();

    const status = body.status as InsightStatus;
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `invalid status (expected one of: ${VALID_STATUSES.join(', ')})` },
        { status: 400 },
      );
    }

    const ok = updateInsightStatus({
      userId,
      id: parseInt(id, 10),
      status,
      userCorrection: typeof body.userCorrection === 'string' ? body.userCorrection : undefined,
    });
    if (!ok) return NextResponse.json({ error: 'not found or not owner' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
