/**
 * /api/letters/[id]
 *
 * GET   — 单封信 (含 reply 如果就绪)
 * POST  — retry (仅 failed 状态)
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import {
  getLetterById,
  resetLetterToPending,
  updateLetterReply,
  markLetterFailed,
} from '@/lib/letters/store';
import { generateReply } from '@/lib/letters/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// retry 也走同步 LLM, 跟 POST /api/letters 一致
export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ============================================================================
// GET — 单封信
// ============================================================================

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = resolveUserId(req);
    const { id } = await ctx.params;
    const letterId = parseInt(id, 10);
    if (isNaN(letterId)) {
      return NextResponse.json({ error: 'letter id 必须是数字' }, { status: 400 });
    }

    const letter = getLetterById(letterId, userId);
    if (!letter) {
      return NextResponse.json({ error: '信件不存在或无权访问' }, { status: 404 });
    }

    return NextResponse.json({ letter });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ============================================================================
// POST — retry (仅 failed)
// ============================================================================

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = resolveUserId(req);
    const { id } = await ctx.params;
    const letterId = parseInt(id, 10);
    if (isNaN(letterId)) {
      return NextResponse.json({ error: 'letter id 必须是数字' }, { status: 400 });
    }

    const letter = getLetterById(letterId, userId);
    if (!letter) {
      return NextResponse.json({ error: '信件不存在或无权访问' }, { status: 404 });
    }
    if (letter.status !== 'failed') {
      return NextResponse.json(
        { error: `只能 retry 失败的信件 (当前状态: ${letter.status})` },
        { status: 400 },
      );
    }

    // 重置 + 同步重跑 LLM (Vercel serverless 不能 fire-and-forget)
    let reset = resetLetterToPending({ letterId, userId });
    if (!reset) {
      return NextResponse.json({ error: 'retry 失败 (无法重置状态)' }, { status: 500 });
    }

    try {
      const result = await generateReply({
        userId,
        userContent: letter.userContent,
        letterNumber: letter.letterNumber,
      });
      if (result.success && result.reply) {
        reset = updateLetterReply({
          letterId,
          replyContent: result.reply,
          tokensUsed: result.tokensUsed,
          modelUsed: result.modelUsed,
          durationMs: result.durationMs,
          canonQuotesUsed: result.canonQuotesUsed,
          brainFactsUsed: result.brainFactsUsed,
          frameworkMatched: result.framework,
        });
      } else {
        reset = markLetterFailed({
          letterId,
          reason: result.error || 'retry 仍失败',
          durationMs: result.durationMs,
        });
      }
    } catch (e: any) {
      console.error('[letters retry] pipeline failed:', e);
      reset = markLetterFailed({ letterId, reason: e?.message || '后台异常' });
    }

    return NextResponse.json({ success: true, letter: reset });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
