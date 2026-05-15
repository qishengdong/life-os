/**
 * GET  /api/admin/invite/[token] — 查邀请信息 (公开, 受邀人访问)
 * POST /api/admin/invite/[token]/accept — 受邀人设密码, 创建账号
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword, passwordStrength } from '@/lib/admin/passwords';
import {
  findInviteByToken,
  isInviteValid,
  loadAdminConfig,
  saveAdminConfig,
  generateUserId,
  makeCommitterEmail,
} from '@/lib/admin/users-store';
import { makeSessionCookie, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from '@/lib/admin/sessions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

interface RouteContext {
  params: Promise<{ token: string }>;
}

// ============================================================================
// GET — 查邀请
// ============================================================================

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { token } = await ctx.params;
  const invite = findInviteByToken(token);
  if (!invite) {
    return NextResponse.json({ error: '邀请不存在或已删除' }, { status: 404 });
  }
  if (!isInviteValid(invite)) {
    return NextResponse.json(
      {
        error: invite.usedAt ? '邀请已被使用' : '邀请已过期',
        invite: {
          username: invite.username,
          displayName: invite.displayName,
          role: invite.role,
          isUsed: !!invite.usedAt,
          isExpired: !invite.usedAt && invite.expiresAt < Math.floor(Date.now() / 1000),
        },
      },
      { status: 410 },
    );
  }
  return NextResponse.json({
    invite: {
      username: invite.username,
      displayName: invite.displayName,
      role: invite.role,
      note: invite.note,
      expiresAt: invite.expiresAt,
    },
  });
}

// ============================================================================
// POST — 受邀人接受 (设密码)
// ============================================================================

const Body = z.object({
  password: z.string().min(8).max(200),
  // 允许受邀人改 displayName (但 username 由邀请方定, 不能改)
  displayName: z.string().min(1).max(40).optional(),
});

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { token } = await ctx.params;
  const invite = findInviteByToken(token);

  if (!invite) {
    return NextResponse.json({ error: '邀请不存在' }, { status: 404 });
  }
  if (!isInviteValid(invite)) {
    return NextResponse.json(
      { error: invite.usedAt ? '邀请已被使用' : '邀请已过期' },
      { status: 410 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: '密码或显示名格式不对' }, { status: 400 });
  }
  const { password, displayName } = parsed.data;

  const strength = passwordStrength(password);
  if (!strength.ok) {
    return NextResponse.json({ error: '密码: ' + strength.reasons.join(', ') }, { status: 400 });
  }

  // 创建用户 + 标记邀请已使用
  const cfg = loadAdminConfig();

  // 防 race: 再次检查邀请没被同时消费
  const liveInvite = cfg.invites.find((i) => i.token === token);
  if (!liveInvite || liveInvite.usedAt) {
    return NextResponse.json({ error: '邀请已被使用' }, { status: 410 });
  }

  const userId = generateUserId();
  const email = makeCommitterEmail(liveInvite.username);
  const now = Math.floor(Date.now() / 1000);
  const finalDisplayName = displayName || liveInvite.displayName;

  cfg.users.push({
    id: userId,
    username: liveInvite.username,
    displayName: finalDisplayName,
    passwordHash: await hashPassword(password),
    role: liveInvite.role,
    email,
    createdAt: now,
    lastLoginAt: now,
    active: true,
  });

  liveInvite.usedAt = now;
  liveInvite.usedByAdminId = userId;

  try {
    await saveAdminConfig(cfg, {
      commitMessage: `admin: ${finalDisplayName} accepted invite (${liveInvite.role})`,
      author: { username: liveInvite.username, displayName: finalDisplayName, email },
    });
  } catch (e: any) {
    return NextResponse.json({ error: `保存失败: ${e.message}` }, { status: 500 });
  }

  // 自动登录
  const sessionCookie = makeSessionCookie(userId);
  const res = NextResponse.json({
    success: true,
    user: {
      id: userId,
      username: liveInvite.username,
      displayName: finalDisplayName,
      role: liveInvite.role,
      email,
    },
  });
  res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SEC,
    path: '/',
  });
  return res;
}
