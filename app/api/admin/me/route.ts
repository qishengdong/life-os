/**
 * GET /api/admin/me — 返回当前登录的 admin user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = getAdminFromRequest(req);
  if (!user) {
    return NextResponse.json({ authed: false }, { status: 401 });
  }
  return NextResponse.json({
    authed: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      email: user.email,
      lastLoginAt: user.lastLoginAt,
    },
  });
}
