/**
 * GET /api/decision/brief/[number] — 拉单份 brief
 *
 * 公开样品 brief (is_sample=1) 不需要鉴权.
 * 私人 brief 需要 user_id 匹配.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { getBriefByNumber } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number: briefNumber } = await params;

  const row = getBriefByNumber(briefNumber);
  if (!row) {
    return NextResponse.json({ error: '简报不存在' }, { status: 404 });
  }

  // 公开 sample brief — 不验身份
  if (row.is_sample === 1) {
    return NextResponse.json({
      brief: JSON.parse(row.brief_json),
      renderedMarkdown: row.rendered_markdown,
      isSample: true,
      meta: {
        totalCharCount: row.total_char_count,
        editorPassUsed: row.editor_pass_used === 1,
        authoredAt: row.authored_at,
      },
    });
  }

  // 私人 brief — 验身份
  try {
    const { userId } = resolveUserId(req);
    if (row.user_id !== userId) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }
    return NextResponse.json({
      brief: JSON.parse(row.brief_json),
      renderedMarkdown: row.rendered_markdown,
      isSample: false,
      meta: {
        totalCharCount: row.total_char_count,
        editorPassUsed: row.editor_pass_used === 1,
        authoredAt: row.authored_at,
      },
    });
  } catch (e) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    throw e;
  }
}
