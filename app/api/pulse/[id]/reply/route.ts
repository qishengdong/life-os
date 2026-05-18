/**
 * POST /api/pulse/[id]/reply · 续聊一个 pulse (5/18 ship)
 *
 * Body: { content: string }
 * 工作:
 *   1. 校验 pulse 属于这个 user
 *   2. 拉所有 prior turns (含 turn 0/1 + pulse_turns)
 *   3. 写 user turn 进 pulse_turns
 *   4. 调 LLM (传全对话 + brain context) 生成 ai 回应
 *   5. 写 ai turn
 *   6. 返回 ai 回应 + 全 turns
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import {
  getPulseTurns,
  addPulseTurn,
  pulseBelongsToUser,
  getUserPulses,
} from '@/lib/pulse/store';
import { processPulseFollowup } from '@/lib/pulse/tagger';
import { fetchUserMemory } from '@/lib/memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const Schema = z.object({
  content: z.string().min(1, '内容不能空').max(2000, '续聊最长 2000 字'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await resolveUserId(req);
    const { id: idStr } = await params;
    const pulseId = parseInt(idStr, 10);
    if (!Number.isFinite(pulseId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    }

    // 防越权
    if (!(await pulseBelongsToUser(pulseId, userId))) {
      return NextResponse.json({ error: '没找到这条 pulse, 或不是你的' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || '内容格式错' },
        { status: 400 },
      );
    }

    // 拉这个 pulse + 现有 turns
    const userPulses = await getUserPulses(userId, 100);
    const pulse = userPulses.find((p) => p.id === pulseId);
    if (!pulse) {
      return NextResponse.json({ error: 'pulse 不存在' }, { status: 404 });
    }

    const existingTurns = await getPulseTurns(pulseId);

    // 构建 priorTurns (turn 0 = 用户原话 · turn 1 = ai · turns 2+)
    const priorTurns: Array<{ role: 'user' | 'ai'; content: string }> = [
      { role: 'user', content: pulse.content },
    ];
    if (pulse.aiResponse) priorTurns.push({ role: 'ai', content: pulse.aiResponse });
    for (const t of existingTurns) {
      priorTurns.push({ role: t.role, content: t.content });
    }

    // 先写用户 turn (即使 LLM 失败, user 输入也保留)
    const userTurn = await addPulseTurn({
      pulseId,
      role: 'user',
      content: parsed.data.content,
    });

    // 跑 LLM
    const memory = await fetchUserMemory(userId);
    const result = await processPulseFollowup({
      userId,
      pulseId,
      newUserMessage: parsed.data.content,
      priorTurns,
      injectedMemory: memory,
    });

    // 写 ai turn
    const aiTurn = await addPulseTurn({
      pulseId,
      role: 'ai',
      content: result.aiResponse,
    });

    return NextResponse.json({
      success: true,
      userTurn: { id: userTurn.id, turnNumber: userTurn.turnNumber, content: parsed.data.content },
      aiTurn: { id: aiTurn.id, turnNumber: aiTurn.turnNumber, content: result.aiResponse },
      safetyTrigger: result.safetyTrigger || null,
      durationMs: result.durationMs,
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    console.error('[api/pulse/reply]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
