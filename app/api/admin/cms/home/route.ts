/**
 * GET  /api/admin/cms/home — 加载当前 home.json 内容
 * POST /api/admin/cms/home — 保存编辑 (写本地 + 发布到 GitHub)
 *
 * body shape:
 *   {
 *     content: HomeContent (完整 JSON),
 *     publish: boolean (true = 同时 commit 到 GitHub)
 *     commitMessage?: string (覆盖默认 commit message)
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCookie, ADMIN_COOKIE_NAME } from '@/lib/admin/auth';
import { loadHomeContent, writeHomeContent, validateHomeContent } from '@/lib/content/home';
import { commitFileToGitHub } from '@/lib/admin/github';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adminGuard(req: NextRequest): NextResponse | null {
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

// ============================================================================
// GET — 加载当前内容
// ============================================================================
export async function GET(req: NextRequest) {
  const guard = adminGuard(req);
  if (guard) return guard;

  try {
    const content = loadHomeContent();
    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ============================================================================
// POST — 保存 + (可选) 发布
// ============================================================================
export async function POST(req: NextRequest) {
  const guard = adminGuard(req);
  if (guard) return guard;

  try {
    const body = await req.json();
    const { content, publish, commitMessage } = body;

    // 1. validate
    try {
      validateHomeContent(content);
    } catch (e: any) {
      return NextResponse.json({ error: `验证失败: ${e.message}` }, { status: 400 });
    }

    // 2. 写本地文件 (在 Vercel 上, /var/task 只读, 这步会失败 — 但发布走 GitHub 不靠本地)
    let localSaved = false;
    try {
      writeHomeContent(content);
      localSaved = true;
    } catch (e) {
      // Vercel 只读 fs — 本地保存失败正常, 走 GitHub commit
      console.warn('[cms] local write failed (expected on Vercel):', e);
    }

    // 3. 如果 publish=true, commit 到 GitHub
    let publishResult: any = null;
    if (publish) {
      if (!process.env.GITHUB_TOKEN) {
        return NextResponse.json(
          { error: 'GITHUB_TOKEN 未配置, 无法发布' },
          { status: 500 },
        );
      }
      try {
        const formatted = JSON.stringify(content, null, 2) + '\n';
        publishResult = await commitFileToGitHub({
          path: 'lib/content/data/home.json',
          content: formatted,
          message: commitMessage || `cms(home): 更新内容 via /admin/cms`,
        });
      } catch (e: any) {
        return NextResponse.json(
          { error: `GitHub commit 失败: ${e.message}`, localSaved },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      localSaved,
      publish: !!publish,
      publishResult,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
