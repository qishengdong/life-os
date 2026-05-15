/**
 * PATCH /api/brain/open-loop/[id] · 标记 resolved / cancelled
 *
 * JOB-012.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { resolveOpenLoop } from '@/lib/memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = resolveUserId(req);
    const { id } = await ctx.params;
    const body = await req.json();
    const status: 'resolved' | 'cancelled' = body.status === 'cancelled' ? 'cancelled' : 'resolved';
    const ok = resolveOpenLoop({ userId, id: parseInt(id, 10), status });
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
