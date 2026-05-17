/**
 * POST /api/auth/recover
 *
 * 用户在新设备 (换 iPhone / Mac / 清 Safari) 输入恢复码, server 把 user.user_uid 改成新设备
 * 的 localStorage UUID, 历史 brain / decisions / letters 自动跟过来.
 *
 * Body: { recoveryCode: "KEY-XXXX-XXXX" }
 * Headers: X-User-UID (新设备当前 localStorage UUID)
 *
 * Response: { ok: true, message } 200 or { error } 400/404
 *
 * 注意: 这个 endpoint 不需要 user 已 invited — 因为新设备 cold start 时只有空白 UUID,
 *       恢复完才能拿回 access_status='invited' (它在 user 行上, 跟 user_uid 绑).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { swapUserUidByRecoveryCode } from '@/lib/auth/recovery-code';
import { UID_HEADER } from '@/lib/client-uid';
import { setRecoveredCookies } from '@/lib/auth/cookies';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({
  recoveryCode: z.string().min(8).max(30),
});

export async function POST(req: NextRequest) {
  try {
    const newUserUid = req.headers.get(UID_HEADER) || '';
    if (!newUserUid || newUserUid.length < 8) {
      return NextResponse.json({ error: '缺少设备身份, 请刷新页面' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '请输入恢复码' }, { status: 400 });
    }

    const result = await swapUserUidByRecoveryCode({
      recoveryCode: parsed.data.recoveryCode,
      newUserUid,
    });
    if (!result) {
      return NextResponse.json({ error: '恢复码不对. 检查一下是不是有空格/大小写问题.' }, { status: 404 });
    }

    const res = NextResponse.json({
      ok: true,
      message: '欢迎回来. 你的 brain / 历史决策 / 信件都还在.',
    });
    setRecoveredCookies(res);
    return res;
  } catch (e: any) {
    console.error('[auth/recover] error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
