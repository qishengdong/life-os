/**
 * GET /api/brain
 *
 * 返回当前用户的完整 brain (5 层 · core_state + 5 类 RMC + open_loops + brain.md).
 * JOB-011 · /brain UI 调这个.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { fetchUserMemory } from '@/lib/memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const memory = fetchUserMemory(userId);
    return NextResponse.json({ memory });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少有效的用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
