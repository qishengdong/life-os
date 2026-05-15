/**
 * POST /api/admin/login — 验证 username + password, 设 session cookie
 * GET  /api/admin/login — 当前登录状态 + admin 是否已 setup
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPassword } from '@/lib/admin/passwords';
import {
  findUserByUsername,
  findUserById,
  updateLastLogin,
  isSetupCompleted,
} from '@/lib/admin/users-store';
import {
  makeSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SEC,
  verifySessionCookie,
} from '@/lib/admin/sessions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // password verify ~100-200ms; 30s plenty

const Schema = z.object({
  username: z.string().min(1).max(80),
  password: z.string().min(1).max(200),
});

// ============================================================================
// POST · 登录
// ============================================================================

export async function POST(req: NextRequest) {
  // setup 未完成 → 引导用户去 setup
  if (!isSetupCompleted()) {
    return NextResponse.json(
      { error: 'admin 未 setup, 去 /admin/setup 创建第一个 owner', needsSetup: true },
      { status: 503 },
    );
  }

  // validate body
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: '用户名或密码格式错误' }, { status: 400 });
  }
  const { username, password } = parsed.data;

  // 查用户
  const user = findUserByUsername(username);
  if (!user) {
    // 故意 sleep 抵御 brute force / user enum
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: '用户名或密码不对' }, { status: 401 });
  }

  // 验证密码
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: '用户名或密码不对' }, { status: 401 });
  }

  // 更新 lastLoginAt (best-effort)
  try {
    updateLastLogin(user.id);
  } catch {}

  // 发 session cookie
  const sessionCookie = makeSessionCookie(user.id);
  const res = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      email: user.email,
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

// ============================================================================
// GET · 当前登录状态
// ============================================================================

export async function GET(req: NextRequest) {
  const setupOk = isSetupCompleted();
  if (!setupOk) {
    return NextResponse.json({
      authed: false,
      needsSetup: true,
      adminEnabled: false,
    });
  }

  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = verifySessionCookie(cookie);
  if (!payload) {
    return NextResponse.json({ authed: false, adminEnabled: true });
  }
  const user = findUserById(payload.adminId);
  if (!user || !user.active) {
    return NextResponse.json({ authed: false, adminEnabled: true });
  }

  return NextResponse.json({
    authed: true,
    adminEnabled: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    },
  });
}
