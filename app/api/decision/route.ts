import { NextRequest } from 'next/server';
import { z } from 'zod';
import { modelRouter } from '@/lib/model-router';
import { detectFramework, buildMessagesForFramework, FRAMEWORK_DISPLAY_NAMES } from '@/lib/decision/router';
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
      return new Response(
        JSON.stringify({ error: firstError?.message || '输入格式错误' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const input = parsed.data;

    // 1. 用户档案 (找或建)
    const userId = findOrCreateUser(input.birthDate, input.gender);

    // 2. 框架自动路由
    const route = detectFramework(input.decision);
    const messages = buildMessagesForFramework(route.framework, input);

    // 3. 流式调用 LLM
    const llmStream = modelRouter.completeStream({
      messages,
      provider: 'deepseek',
      temperature: 0.7,
      maxTokens: 4000,
    });

    // 4. 转换为 Server-Sent Events 格式输出给前端
    const encoder = new TextEncoder();
    let fullContent = '';
    let finalMeta: any = null;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 先发送 meta (告诉前端用了哪个框架)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'meta',
                framework: route.framework,
                frameworkName: FRAMEWORK_DISPLAY_NAMES[route.framework],
                confidence: route.confidence,
                matchedKeywords: route.matchedKeywords,
              })}\n\n`
            )
          );

          // 然后流式输出内容
          for await (const chunk of llmStream) {
            if (chunk.type === 'text' && chunk.content) {
              fullContent += chunk.content;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'text', content: chunk.content })}\n\n`
                )
              );
            }
            if (chunk.type === 'done') {
              finalMeta = {
                model: chunk.model,
                provider: chunk.provider,
                usage: chunk.usage,
              };

              // 持久化决策
              const decisionId = saveDecision({
                userId,
                question: input.decision,
                aiResponse: fullContent,
                modelUsed: `${chunk.provider}/${chunk.model}/${route.framework}`,
                tokensInput: chunk.usage?.prompt_tokens,
                tokensOutput: chunk.usage?.completion_tokens,
              });

              // 发送最终 meta
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'done',
                    decisionId,
                    ...finalMeta,
                  })}\n\n`
                )
              );
            }
          }

          controller.close();
        } catch (error: any) {
          console.error('[stream] error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[API /decision] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
