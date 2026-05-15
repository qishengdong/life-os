/**
 * Next.js middleware — admin route gate.
 *
 * 放行 (无需 cookie):
 *   - /admin/login
 *   - /admin/setup
 *   - /admin/invite-accept (受邀人接受邀请用)
 *
 * 其它 /admin/* 路由: 检查 cookie 存在 + 格式. 失败 → 重定向 /admin/login.
 *
 * 注意: middleware 跑在 edge runtime, 不能 import node crypto 做 HMAC.
 * 这里仅做存在性 + 格式预检查; 真正的签名验证在每个 API route 里用 lib/admin/auth 做.
 *
 * Cookie 名: admin_session (v2 auth, multi-user).
 */

import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_session';

const PUBLIC_ADMIN_PATHS = [
  '/admin/login',
  '/admin/setup',
  '/admin/invite-accept',
];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // 放行公开 admin 路由 (登录 / setup / 接受邀请)
  for (const p of PUBLIC_ADMIN_PATHS) {
    if (pathname === p || pathname.startsWith(p + '/')) return NextResponse.next();
  }

  // 受保护路由: 检查 cookie 格式 (v2:<adminId>:<issuedAt>:<sig>)
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const looksValid = cookie && /^v2:user_[a-f0-9]+:\d+:[a-f0-9]{32}$/.test(cookie);

  if (!looksValid) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
