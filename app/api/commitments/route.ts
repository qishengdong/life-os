/**
 * Commitments API
 *
 * GET  /api/commitments         → 该用户全部 commitments
 * GET  /api/commitments?due=1   → 仅 due 的 (V0: 在主页 surface)
 * POST /api/commitments         → 标记 fulfilled / cancelled
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import {
  getUserCommitments,
  getDueCommitments,
  markFulfilled,
  markCancelled,
} from '@/lib/commitments/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    const url = new URL(req.url);
    const dueOnly = url.searchParams.get('due') === '1';

    const commitments = dueOnly ? await getDueCommitments(userId) : await getUserCommitments(userId);

    return NextResponse.json({ commitments });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少有效的用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    const body = await req.json();
    const { commitmentId, action } = body;

    if (!commitmentId || typeof commitmentId !== 'number') {
      return NextResponse.json({ error: '缺少 commitmentId' }, { status: 400 });
    }

    // 安全: 确认 commitment 属于该用户
    const all = await getUserCommitments(userId);
    const owned = all.find((c) => c.id === commitmentId);
    if (!owned) {
      return NextResponse.json({ error: 'Commitment 不存在或不属于你' }, { status: 403 });
    }

    if (action === 'fulfill') {
      await markFulfilled(commitmentId);
    } else if (action === 'cancel') {
      await markCancelled(commitmentId);
    } else {
      return NextResponse.json({ error: '未知 action' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少有效的用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
