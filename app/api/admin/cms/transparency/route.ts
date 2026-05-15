import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import {
  loadTransparencyContent,
  writeTransparencyContent,
  validateTransparencyContent,
} from '@/lib/content/transparency';
import { commitFileToGitHub } from '@/lib/admin/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  try { return NextResponse.json({ content: loadTransparencyContent() }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const user = auth;
  try {
    const { content, publish } = await req.json();
    try { validateTransparencyContent(content); }
    catch (e: any) { return NextResponse.json({ error: `验证失败: ${e.message}` }, { status: 400 }); }

    let localSaved = false;
    try { writeTransparencyContent(content); localSaved = true; } catch {}

    let publishResult: any = null;
    if (publish) {
      if (!process.env.GITHUB_TOKEN) {
        return NextResponse.json({ error: 'GITHUB_TOKEN 未配置' }, { status: 500 });
      }
      try {
        publishResult = await commitFileToGitHub({
          path: 'lib/content/data/transparency.json',
          content: JSON.stringify(content, null, 2) + '\n',
          message: `cms(transparency): 更新内容 (by ${user.displayName} · ${user.username})`,
          committer: { name: user.displayName, email: user.email },
        });
      } catch (e: any) {
        return NextResponse.json({ error: `GitHub commit 失败: ${e.message}`, localSaved }, { status: 500 });
      }
    }
    return NextResponse.json({ success: true, localSaved, publish: !!publish, publishResult });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
