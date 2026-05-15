/**
 * POST /api/admin/users/invite — Owner 创建一个新编辑的邀请链接
 *
 * body:
 *   { username, displayName, role: 'editor', note }
 *
 * 返回: invite token + 链接, owner 自己微信发给受邀人.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOwner } from '@/lib/admin/auth';
import { validateUsername } from '@/lib/admin/passwords';
import {
  loadAdminConfig,
  saveAdminConfig,
  generateInviteToken,
  type AdminInvite,
} from '@/lib/admin/users-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const Body = z.object({
  username: z.string().min(3).max(40),
  displayName: z.string().min(1).max(40),
  role: z.enum(['editor', 'owner']).default('editor'),
  note: z.string().max(200).default(''),
});

const INVITE_TTL_DAYS = 7;

export async function POST(req: NextRequest) {
  const auth = requireOwner(req);
  if (auth instanceof NextResponse) return auth;
  const owner = auth;

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || 'invalid input' },
      { status: 400 },
    );
  }

  const { username, displayName, role, note } = parsed.data;

  // username 校验
  const usernameErr = validateUsername(username);
  if (usernameErr) {
    return NextResponse.json({ error: usernameErr }, { status: 400 });
  }
  const norm = username.toLowerCase();

  // 重名检查 (用户 + 未消费邀请)
  const cfg = loadAdminConfig();
  if (cfg.users.some((u) => u.username === norm)) {
    return NextResponse.json({ error: '此用户名已存在' }, { status: 409 });
  }
  if (cfg.invites.some((i) => i.username === norm && !i.usedAt)) {
    return NextResponse.json({ error: '已有此用户名的未消费邀请' }, { status: 409 });
  }

  const now = Math.floor(Date.now() / 1000);
  const invite: AdminInvite = {
    token: generateInviteToken(),
    username: norm,
    displayName,
    role,
    note,
    createdBy: owner.id,
    createdAt: now,
    expiresAt: now + INVITE_TTL_DAYS * 24 * 60 * 60,
    usedAt: null,
    usedByAdminId: null,
  };

  cfg.invites.push(invite);

  try {
    await saveAdminConfig(cfg, {
      commitMessage: `admin: invite ${displayName} (${norm}, ${role}) by ${owner.displayName}`,
      author: { username: owner.username, displayName: owner.displayName, email: owner.email },
    });
  } catch (e: any) {
    return NextResponse.json({ error: `保存失败: ${e.message}` }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    invite: {
      token: invite.token,
      username: invite.username,
      displayName: invite.displayName,
      role: invite.role,
      inviteUrl: `/admin/invite-accept?token=${invite.token}`,
      expiresAt: invite.expiresAt,
    },
  });
}
