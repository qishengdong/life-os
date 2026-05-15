import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import {
  getDueOutcomes,
  getResolvedOutcomes,
  getUserOutcomeStats,
  markOutcomeAsked,
  saveOutcomeResponse,
} from '@/lib/outcomes/store';
import { processOutcomeResponse, JUDGMENT_DISPLAY } from '@/lib/outcomes/processor';
import { getDb } from '@/lib/db';
import { addMemoryCard, addOpenLoop } from '@/lib/memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// GET /api/outcomes — due + resolved + stats
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const due = getDueOutcomes(userId);
    const resolved = getResolvedOutcomes(userId, 30);
    const stats = getUserOutcomeStats(userId);

    return NextResponse.json({
      due,
      resolved,
      stats,
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ============================================================================
// POST /api/outcomes — 用户回答 outcome
// ============================================================================
const RequestSchema = z.object({
  outcomeId: z.number(),
  userResponse: z.string().min(20, '回答太短了, 至少 20 字').max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || '输入格式错误' },
        { status: 400 }
      );
    }

    // 安全: 确认 outcome 属于当前用户
    const db = getDb();
    const outcomeRow = db
      .prepare(
        `SELECT id, decision_id, user_id, checkpoint_days FROM decision_outcomes
         WHERE id = ? AND user_id = ?`
      )
      .get(parsed.data.outcomeId, userId) as any;

    if (!outcomeRow) {
      return NextResponse.json({ error: 'Outcome 不存在或不属于你' }, { status: 403 });
    }

    // 调用 LLM 处理
    const result = await processOutcomeResponse({
      outcomeId: outcomeRow.id,
      userId,
      decisionId: outcomeRow.decision_id,
      checkpointDays: outcomeRow.checkpoint_days,
      userResponse: parsed.data.userResponse,
    });

    // 保存
    saveOutcomeResponse({
      outcomeId: outcomeRow.id,
      userResponse: parsed.data.userResponse,
      outcomeJudgment: result.outcomeJudgment,
      aiReflection: result.aiReflection,
    });

    // JOB-017 · 回写 brain: 把 outcome 答案做成一张 episodic RMC 卡, AI 之后跨决策能看到
    try {
      const decisionRow = db
        .prepare(`SELECT question FROM decisions WHERE id = ?`)
        .get(outcomeRow.decision_id) as { question: string } | undefined;
      const decisionShort = (decisionRow?.question || '').slice(0, 40);
      const judgmentLabel = JUDGMENT_DISPLAY[result.outcomeJudgment] || result.outcomeJudgment;
      addMemoryCard({
        userId,
        cardType: 'episodic',
        title: `${outcomeRow.checkpoint_days}d outcome · ${decisionShort}${decisionShort.length === 40 ? '...' : ''}`,
        content: `${judgmentLabel}\n\n用户原话: ${parsed.data.userResponse}\n\nAI reflection: ${result.aiReflection}`,
        confidence: 0.9,
        source: 'outcome_response',
        sourceDecisionId: outcomeRow.decision_id,
        tags: ['outcome', `${outcomeRow.checkpoint_days}d`, result.outcomeJudgment],
      });
    } catch (e) {
      console.error('[outcomes POST] brain writeback failed:', e);
    }

    // 如果是 worse 或 mixed, 可能值得追踪 — 加 open_loop 供 90/365 day 跨期回看
    if (
      (result.outcomeJudgment === 'worse' || result.outcomeJudgment === 'mixed') &&
      outcomeRow.checkpoint_days < 365
    ) {
      try {
        const nextCheckpoint = outcomeRow.checkpoint_days === 30 ? 90 : 365;
        const nextDueAt =
          Math.floor(Date.now() / 1000) + (nextCheckpoint - outcomeRow.checkpoint_days) * 86400;
        addOpenLoop({
          userId,
          title: `${nextCheckpoint}d 复盘: 当前 ${outcomeRow.checkpoint_days}d 的判断是 "${result.outcomeJudgment}"`,
          description: result.aiReflection.slice(0, 300),
          kind: 'review',
          dueAt: nextDueAt,
          sourceDecisionId: outcomeRow.decision_id,
        });
      } catch (e) {
        console.error('[outcomes POST] open-loop creation failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      outcomeId: outcomeRow.id,
      outcomeJudgment: result.outcomeJudgment,
      aiReflection: result.aiReflection,
      durationMs: result.durationMs,
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    console.error('[API /outcomes POST] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/outcomes — 标记 outcome 已被问 (用户看到了但还没回答)
// ============================================================================
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const body = await req.json();
    const outcomeId = Number(body.outcomeId);
    if (!outcomeId) {
      return NextResponse.json({ error: '缺少 outcomeId' }, { status: 400 });
    }

    const db = getDb();
    const row = db.prepare(`SELECT id FROM decision_outcomes WHERE id = ? AND user_id = ?`).get(outcomeId, userId);
    if (!row) {
      return NextResponse.json({ error: 'Outcome 不存在或不属于你' }, { status: 403 });
    }

    markOutcomeAsked(outcomeId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
