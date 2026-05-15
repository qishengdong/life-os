/**
 * PATCH /api/brain/core-state/[id] · 改硬锚点 fact_text
 * DELETE /api/brain/core-state/[id] · 软删 (mark deprecated)
 *
 * JOB-012.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { updateCoreState, deleteCoreState } from '@/lib/memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = resolveUserId(req);
    const { id } = await ctx.params;
    const body = await req.json();
    const r = updateCoreState({
      userId,
      id: parseInt(id, 10),
      factText: body.factText,
      status: body.status,
    });
    if (!('ok' in r) || r.ok === false) {
      return NextResponse.json({ error: 'not found or not owner' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = resolveUserId(req);
    const { id } = await ctx.params;
    const ok = deleteCoreState({ userId, id: parseInt(id, 10) });
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
