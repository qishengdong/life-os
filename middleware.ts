/**
 * Next.js middleware — admin route gate + user route gate.
 *
 * Admin gate:
 *   - 放行: /admin/login, /admin/setup, /admin/invite-accept
 *   - 其它 /admin/*: 检查 admin_session cookie 格式. 失败 → /admin/login
 *
 * User gate:
 *   - 保护路由 (USER_PROTECTED_PATHS) 要求 key_invited=1 cookie
 *   - 没 invited: 重定向 /invite
 *
 * Edge runtime · 不签名 cookie (内测期; API 层有 access_status 真校验).
 */

import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_session';
const USER_COOKIE_INVITED = 'key_invited';

const PUBLIC_ADMIN_PATHS = [
  '/admin/login',
  '/admin/setup',
  '/admin/invite-accept',
];

// 真用户保护路由 · 必须 invited + acked
const USER_PROTECTED_PATHS = [
  '/pulse',
  '/letters/new',
  '/decisions',
  '/onboarding',
  '/history',
  '/brain',
  '/account',
  '/outcomes',
  '/review',
  '/inbox',
  '/unsent',
  '/settings',
  '/your-pattern',  // 5/18 ship · 决策人格画像
  '/home',          // 5/18 ship · 老用户客厅 dashboard
];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ============================================================
  // Admin gate
  // ============================================================
  if (pathname.startsWith('/admin')) {
    for (const p of PUBLIC_ADMIN_PATHS) {
      if (pathname === p || pathname.startsWith(p + '/')) return NextResponse.next();
    }
    const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const looksValid = cookie && /^v2:user_[a-f0-9]+:\d+:[a-f0-9]{32}$/.test(cookie);
    if (!looksValid) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ============================================================
  // User gate
  // ============================================================
  const isProtected = USER_PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
  if (!isProtected) return NextResponse.next();

  const invited = req.cookies.get(USER_COOKIE_INVITED)?.value === '1';

  if (!invited) {
    const inviteUrl = new URL('/invite', req.url);
    inviteUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(inviteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/pulse/:path*',
    '/letters/new/:path*',
    '/decisions/:path*',
    '/onboarding/:path*',
    '/history/:path*',
    '/brain/:path*',
    '/account/:path*',
    '/outcomes/:path*',
    '/review/:path*',
    '/inbox/:path*',
    '/unsent/:path*',
    '/settings/:path*',
    '/your-pattern/:path*',
    '/home/:path*',
  ],
};
