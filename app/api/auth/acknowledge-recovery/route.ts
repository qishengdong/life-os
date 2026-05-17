/**
 * POST /api/auth/acknowledge-recovery
 *
 * 用户在兑换页 confirm "我已截图保存恢复码", server 记录 timestamp.
 * 没 acknowledged 的用户被 middleware 拦回兑换页, 强制保存.
 *
 * Body: {} (用户身份从 X-User-UID header 取)
 */
import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { acknowledgeRecoveryCode, hasAcknowledgedRecoveryCode } from '@/lib/auth/recovery-code';
import { setAckedCookie } from '@/lib/auth/cookies';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    if (await hasAcknowledgedRecoveryCode(userId)) {
      const res = NextResponse.json({ ok: true, alreadyAcknowledged: true });
      setAckedCookie(res);
      return res;
    }
    await acknowledgeRecoveryCode(userId);
    const res = NextResponse.json({ ok: true });
    setAckedCookie(res);
    return res;
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    console.error('[acknowledge-recovery] error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
