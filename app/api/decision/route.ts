import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { modelRouter } from '@/lib/model-router';
import { buildDecisionMessages } from '@/lib/decision/general-framework';
import { findOrCreateUser, saveDecision } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '生日格式应为 YYYY-MM-DD'),
  gender: z.enum(['female', 'male', 'other']),
  decision: z.string().min(20, '决策描述太短了,多写一点背景和卡点').max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { error: firstError?.message || '输入格式错误' },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // 找或建用户
    const userId = findOrCreateUser(input.birthDate, input.gender);

    // 构造 prompt 并调用 LLM
    const messages = buildDecisionMessages(input);
    const response = await modelRouter.complete({
      messages,
      provider: 'deepseek', // 切换到 'claude' 或 'openai' 一行改这里
      temperature: 0.7,
      maxTokens: 4000,
    });

    // 持久化决策
    saveDecision({
      userId,
      question: input.decision,
      aiResponse: response.content,
      modelUsed: `${response.provider}/${response.model}`,
      tokensInput: response.usage?.prompt_tokens,
      tokensOutput: response.usage?.completion_tokens,
    });

    return NextResponse.json({
      analysis: response.content,
      model: response.model,
      provider: response.provider,
      tokensUsed: response.usage,
    });
  } catch (error: any) {
    console.error('[API /decision] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
