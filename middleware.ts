/**
 * Next.js middleware — admin route gate.
 *
 * 拦截 /admin/* 路由 (但放行 /admin/login). 验 cookie. 不通过 → 重定向 /admin/login.
 *
 * 注意: middleware 跑在 edge runtime, 不能用 node crypto 直接做 HMAC.
 * 这里只做存在性 + 格式检查 (深度防御由 API route 里再次校验完成签名).
 */

import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_auth';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 只管 /admin/* (不管 /admin/login)
  if (!pathname.startsWith('/admin')) return NextResponse.next();
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_NAME)?.value;

  // 边缘: 仅做格式检查 (v1:timestamp:sig). 真正的 HMAC 验签在 API route 里做.
  const looksValid = cookie && /^v1:\d+:[a-f0-9]{32}$/.test(cookie);

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
