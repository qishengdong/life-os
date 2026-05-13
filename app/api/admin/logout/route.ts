/**
 * POST /api/admin/logout — 清 cookie
 */

import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return res;
}
