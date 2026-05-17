import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import {
  addPulse,
  getUserPulses,
  getUserPulseCount,
  getThisWeekPulseCount,
  getTodayPulseCount,
} from '@/lib/pulse/store';
import { processPulse } from '@/lib/pulse/tagger';
import { getNextQuestion, type PulseQuestionId, PULSE_QUESTIONS } from '@/lib/pulse/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// GET /api/pulse — 拉今天该问的问题 + 用户最近 Pulse 列表 + counts
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    const pulseCount = await getUserPulseCount(userId);
    const todayPulseCount = await getTodayPulseCount(userId);
    const weekPulseCount = await getThisWeekPulseCount(userId);
    const todayQuestion = getNextQuestion(pulseCount);

    const url = new URL(req.url);
    const includeHistory = url.searchParams.get('history') === '1';
    const history = includeHistory ? await getUserPulses(userId, 30) : [];

    return NextResponse.json({
      todayQuestion,
      stats: {
        totalPulses: pulseCount,
        todayPulses: todayPulseCount,
        weekPulses: weekPulseCount,
      },
      history,
      availableQuestions: PULSE_QUESTIONS,
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ============================================================================
// POST /api/pulse — 提交 Pulse, 自动 tag + AI 回应 + 写入 RMC
// ============================================================================

const RequestSchema = z.object({
  questionId: z.enum(['sinking', 'avoidance', 'drainage', 'hidden-big', 'body-signal']),
  content: z.string().min(5, 'Pulse 太短了 — 至少 5 字').max(500, 'Pulse 太长了 — 最多 500 字, 大决定请用 Decision Deep Dive'),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || '输入格式错误' },
        { status: 400 }
      );
    }

    const { questionId, content } = parsed.data;

    // 处理 Pulse: 标签 + 回应 + 写 RMC
    const result = await processPulse({
      userId,
      questionId: questionId as PulseQuestionId,
      content,
    });

    // 持久化 Pulse 本体 (链接到刚创建的 RMC 卡)
    const pulseId = await addPulse({
      userId,
      questionId: questionId as PulseQuestionId,
      content,
      tags: result.tags,
      aiResponse: result.aiResponse,
      rmcEpisodicId: result.rmcEpisodicId,
    });

    // 返回 stats + 回应 + 下一个问题
    const newPulseCount = await getUserPulseCount(userId);
    const nextQuestion = getNextQuestion(newPulseCount);

    return NextResponse.json({
      success: true,
      pulseId,
      aiResponse: result.aiResponse,
      tags: result.tags,
      durationMs: result.durationMs,
      stats: {
        totalPulses: newPulseCount,
        todayPulses: await getTodayPulseCount(userId),
        weekPulses: await getThisWeekPulseCount(userId),
      },
      nextQuestion,
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    console.error('[API /pulse] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
