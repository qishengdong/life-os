/**
 * GET /api/onboarding/status
 *
 * 返回当前用户 onboarding 状态:
 *   { completed: boolean, completedAt: number | null, hasUser: boolean }
 *
 * 调用方: /onboarding 页 mount 时检查, 完成的用户跳走避免重填.
 *         其它页 (如 /letters /pulse) 检查 gate, 未 onboard 跳来 /onboarding.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { isOnboardingComplete, getUser } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    const completed = await isOnboardingComplete(userId);
    const user = await getUser(userId);
    return NextResponse.json({
      completed,
      completedAt: completed ? user?.onboarding_completed_at ?? null : null,
      hasUser: !!user,
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ completed: false, hasUser: false }, { status: 200 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
