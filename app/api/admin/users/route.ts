/**
 * GET  /api/admin/users — 列出所有 admin 账号 (Owner only)
 * POST /api/admin/users/invite — 创建一个邀请 (Owner only) — 见 ./invite/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/admin/auth';
import { loadAdminConfig } from '@/lib/admin/users-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireOwner(req);
  if (auth instanceof NextResponse) return auth;

  const cfg = loadAdminConfig();
  const now = Math.floor(Date.now() / 1000);

  return NextResponse.json({
    users: cfg.users.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      role: u.role,
      email: u.email,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      active: u.active,
    })),
    invites: cfg.invites.map((i) => ({
      token: i.token,
      username: i.username,
      displayName: i.displayName,
      role: i.role,
      note: i.note,
      createdBy: i.createdBy,
      createdAt: i.createdAt,
      expiresAt: i.expiresAt,
      usedAt: i.usedAt,
      isUsed: !!i.usedAt,
      isExpired: !i.usedAt && i.expiresAt < now,
      inviteUrl: i.usedAt ? null : `/admin/invite-accept?token=${i.token}`,
    })),
  });
}
