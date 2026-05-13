/**
 * POST /api/admin/login — 验证 admin token, 设 cookie
 * GET  /api/admin/login — 检查当前是否已登录
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  verifyAdminToken,
  makeAdminCookieValue,
  verifyAdminCookie,
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE,
  isAdminConfigured,
} from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({ token: z.string().min(8).max(200) });

export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'Admin 功能未启用. 在 .env.local 设 ADMIN_TOKEN (>= 16 字符).' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'token 不对' }, { status: 401 });
    }

    if (!verifyAdminToken(parsed.data.token)) {
      // 故意延迟 — 限速 brute force
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: 'token 不对' }, { status: 401 });
    }

    const cookieValue = makeAdminCookieValue();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ADMIN_COOKIE_MAX_AGE,
      path: '/',
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookieValue = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthed = verifyAdminCookie(cookieValue);
  return NextResponse.json({
    authed: isAuthed,
    adminEnabled: isAdminConfigured(),
  });
}
