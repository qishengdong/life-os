/**
 * PATCH /api/brain/card/[id] · 改 RMC 卡 title/content/confidence
 * DELETE /api/brain/card/[id] · 删 RMC 卡 (硬删)
 * POST /api/brain/card/[id] · 确认正确 (reverify, 更新 last_verified_at)
 *
 * JOB-012.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { updateMemoryCard, deleteMemoryCard, reverifyCard } from '@/lib/memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await resolveUserId(req);
    const { id } = await ctx.params;
    const body = await req.json();
    const r = await updateMemoryCard({
      userId,
      id: parseInt(id, 10),
      title: body.title,
      content: body.content,
      confidence: body.confidence,
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
    const { userId } = await resolveUserId(req);
    const { id } = await ctx.params;
    const ok = await deleteMemoryCard({ userId, id: parseInt(id, 10) });
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** POST = 确认 (verify) 这条卡, 不动内容. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await resolveUserId(req);
    const { id } = await ctx.params;
    const ok = await reverifyCard({ userId, id: parseInt(id, 10) });
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
