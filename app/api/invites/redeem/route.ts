/**
 * POST /api/invites/redeem — 用户兑换邀请码
 *
 * Body: { code: "KE-XXXX-XXXX" or "LO-XXXX-XXXX" (legacy) }
 * Headers: X-User-UID (必须, 已经在 cookie/localStorage 里)
 *
 * 流程:
 *   1. resolve user (从 UID 创建 / 拿现有 user_id)
 *   2. normalize + 校验码格式
 *   3. 走 redeemInvite() 事务 — 标 invite 已用 + 标 user access_status='invited'
 *   4. 返回结果
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import {
  redeemInvite,
  normalizeInviteCode,
  isValidInviteCodeFormat,
  getUserAccessStatus,
} from '@/lib/invites';
import { ensureRecoveryCode } from '@/lib/auth/recovery-code';
import { setInvitedCookie } from '@/lib/auth/cookies';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({
  code: z.string().min(8).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '请输入邀请码' }, { status: 400 });
    }

    // 已经 invited 了 — 幂等返回成功 (也回传 recovery_code, 万一用户重新看)
    const currentStatus = await getUserAccessStatus(userId);
    if (currentStatus === 'invited') {
      const recoveryCode = await ensureRecoveryCode(userId);
      const res = NextResponse.json({
        ok: true,
        alreadyInvited: true,
        recoveryCode,
      });
      setInvitedCookie(res);
      return res;
    }
    if (currentStatus === 'suspended') {
      return NextResponse.json(
        { error: '账户已暂停, 联系 hello@lifeos.cn' },
        { status: 403 }
      );
    }

    // 清洗 + 格式校验
    const normalized = normalizeInviteCode(parsed.data.code);
    if (!isValidInviteCodeFormat(normalized)) {
      return NextResponse.json(
        { error: '邀请码格式不对. 应为 KE-XXXX-XXXX' },
        { status: 400 }
      );
    }

    // 兑换
    const result = await redeemInvite({ code: normalized, userId });
    if (!result.ok) {
      const reasonMap: Record<string, string> = {
        not_found: '邀请码不存在',
        already_redeemed: '这个邀请码已经被用过了',
        revoked: '这个邀请码已被撤销, 联系 hello@lifeos.cn',
      };
      return NextResponse.json(
        { error: reasonMap[result.reason] || '兑换失败' },
        { status: 400 }
      );
    }

    // 兑换成功 · 生成恢复码 (一次性 · 屏幕显示 · 用户必须截图)
    const recoveryCode = await ensureRecoveryCode(userId);

    const res = NextResponse.json({
      ok: true,
      message: '邀请码已激活. 欢迎进入 KEY.',
      invitedToUser: {
        recipientName: result.invite.recipientName,
        invitedBy: result.invite.invitedBy,
      },
      recoveryCode, // 客户端必须 surface + 强制 confirm "我已截图"
    });
    setInvitedCookie(res);
    return res;
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json(
        { error: '缺少用户身份, 请刷新页面' },
        { status: 400 }
      );
    }
    console.error('[invites/redeem] error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
