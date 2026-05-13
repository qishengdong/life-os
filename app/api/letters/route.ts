/**
 * /api/letters
 *
 * GET   — 用户全部信 (列表)
 * POST  — 用户写新信, 立刻返回 pending 状态; 后台异步生成 KEY 回信
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import {
  createLetter,
  listLettersByUser,
  countLettersByUser,
  updateLetterReply,
  markLetterFailed,
} from '@/lib/letters/store';
import { generateReply } from '@/lib/letters/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// GET — 信件流
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);

    const letters = listLettersByUser(userId, Math.min(limit, 200));
    const counts = countLettersByUser(userId);

    return NextResponse.json({
      letters,
      counts,
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ============================================================================
// POST — 写新信
// ============================================================================

const PostSchema = z.object({
  content: z
    .string()
    .min(20, '信件太短 — 至少 20 字, 写一段话就好')
    .max(8000, '信件太长 — 最多 8000 字'),
  displayName: z.string().max(40).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const body = await req.json();
    const parsed = PostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || '输入格式错误' },
        { status: 400 },
      );
    }

    // 立刻创建 pending letter, 不等 LLM
    const letter = createLetter({ userId, userContent: parsed.data.content });

    // Fire-and-forget LLM 回信 — 不阻塞 response
    // 用户可以 polling /api/letters/[id] 看状态
    void (async () => {
      try {
        const result = await generateReply({
          userId,
          userContent: parsed.data.content,
          letterNumber: letter.letterNumber,
          displayName: parsed.data.displayName,
        });

        if (result.success && result.reply) {
          updateLetterReply({
            letterId: letter.id,
            replyContent: result.reply,
            tokensUsed: result.tokensUsed,
            modelUsed: result.modelUsed,
            durationMs: result.durationMs,
            canonQuotesUsed: result.canonQuotesUsed,
            brainFactsUsed: result.brainFactsUsed,
            frameworkMatched: result.framework,
          });
        } else {
          markLetterFailed({
            letterId: letter.id,
            reason: result.error || '生成失败 (未知原因)',
            durationMs: result.durationMs,
          });
        }
      } catch (e: any) {
        console.error('[letters POST] background reply failed:', e);
        markLetterFailed({
          letterId: letter.id,
          reason: e?.message || '后台异常',
        });
      }
    })();

    return NextResponse.json(
      {
        success: true,
        letter,
      },
      { status: 201 },
    );
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
