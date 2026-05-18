/**
 * /api/personality
 *
 * GET  · 拿当前用户的画像 (没有返回 null)
 * POST · 生成 (或重新生成) 画像 · 用 onboarding 答案
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { generatePersonality, getPersonality } from '@/lib/personality/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    const personality = await getPersonality(userId);
    return NextResponse.json({ personality });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ personality: null }, { status: 200 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    const result = await generatePersonality(userId);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '生成失败' },
        { status: 400 },
      );
    }
    return NextResponse.json({
      success: true,
      personality: result.personality,
      durationMs: result.durationMs,
      tokensUsed: result.tokensUsed,
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
