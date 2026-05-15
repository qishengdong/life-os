/**
 * GET /api/admin/cms/status
 * 返回 CMS 整体状态: GitHub token 是否配, 上次发布时间.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCookie, ADMIN_COOKIE_NAME } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Admin auth
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    githubTokenConfigured: !!process.env.GITHUB_TOKEN,
    lastPublishedAt: null, // TODO: 读 lib/content/data/.last-published (post-publish 写入)
  });
}
