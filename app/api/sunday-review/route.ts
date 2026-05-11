import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import {
  getCurrentWeekReview,
  getUserReviews,
  saveReview,
  markReviewRead,
  hasUnreadReview,
  getWeekRange,
} from '@/lib/sunday-review/store';
import { generateReview } from '@/lib/sunday-review/generator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// GET /api/sunday-review — 拉这周的 review + 历史
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const url = new URL(req.url);

    const current = getCurrentWeekReview(userId);
    const history = getUserReviews(userId, 12);
    const hasUnread = hasUnreadReview(userId);

    // 自动 markRead 当前周 (如果指定 mark=1)
    if (url.searchParams.get('mark') === '1' && current && !current.readAt) {
      markReviewRead(current.id);
    }

    return NextResponse.json({
      currentWeek: current,
      history,
      hasUnread,
      weekRange: getWeekRange(),
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ============================================================================
// POST /api/sunday-review — 手动触发本周 review (admin / 测试)
// 真实运营时由 cron 调用 (Day 14+ 加 cron)
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const { weekStart, weekEnd } = getWeekRange();

    // 如果已经有这周 review, 默认不重复跑 (除非 force=1)
    const url = new URL(req.url);
    const force = url.searchParams.get('force') === '1';
    const existing = getCurrentWeekReview(userId);
    if (existing && !force) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: '本周 review 已存在 (用 ?force=1 重新生成)',
        review: existing,
      });
    }

    const result = await generateReview({ userId, weekStart, weekEnd });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || '生成失败',
        pulseCount: result.pulseCount,
      }, { status: 400 });
    }

    const reviewId = saveReview({
      userId,
      weekStart,
      weekEnd,
      content: result.content,
      pulseCount: result.pulseCount,
      decisionCount: result.decisionCount,
      tokensUsed: result.tokensUsed,
    });

    return NextResponse.json({
      success: true,
      reviewId,
      charCount: result.charCount,
      pulseCount: result.pulseCount,
      decisionCount: result.decisionCount,
      tokensUsed: result.tokensUsed,
      durationMs: result.durationMs,
      content: result.content,
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    console.error('[API /sunday-review POST] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
