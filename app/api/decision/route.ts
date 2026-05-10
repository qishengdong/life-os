import { NextRequest } from 'next/server';
import { z } from 'zod';
import { modelRouter } from '@/lib/model-router';
import {
  detectFramework,
  buildMessagesForFramework,
  FRAMEWORK_DISPLAY_NAMES,
} from '@/lib/decision/router';
import { saveDecision, updateUserProfile } from '@/lib/db';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { fetchUserMemory } from '@/lib/memory';
import { extractFactsFromDecision } from '@/lib/memory/fact-extractor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '生日格式应为 YYYY-MM-DD'),
  gender: z.enum(['female', 'male', 'other']),
  decision: z.string().min(20, '决策描述太短了,多写一点背景和卡点').max(2000),
});

export async function POST(req: NextRequest) {
  // ===== 1. 解析用户身份 (X-User-UID header) =====
  let userId: number;
  let userUid: string;
  try {
    const resolved = resolveUserId(req);
    userId = resolved.userId;
    userUid = resolved.userUid;
  } catch (e) {
    if (e instanceof InvalidUserUidError) {
      return new Response(
        JSON.stringify({
          error: '缺少有效的用户身份 (X-User-UID header). 请刷新页面.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    throw e;
  }

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

    // ===== 2. 更新用户 profile (birth_date / gender) =====
    updateUserProfile(userId, { birthDate: input.birthDate, gender: input.gender });

    // ===== 3. fetchUserMemory — 单一入口拿 memory =====
    const memory = fetchUserMemory(userId);

    // ===== 4. 框架自动路由 =====
    const route = detectFramework(input.decision);
    const messages = buildMessagesForFramework(route.framework, input, memory);

    // ===== 5. 流式调用 LLM =====
    const llmStream = modelRouter.completeStream({
      messages,
      provider: 'deepseek',
      temperature: 0.7,
      maxTokens: 4000,
    });

    // ===== 6. SSE 格式输出 =====
    const encoder = new TextEncoder();
    let fullContent = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 6a. meta — 框架 + memory 统计
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'meta',
                framework: route.framework,
                frameworkName: FRAMEWORK_DISPLAY_NAMES[route.framework],
                confidence: route.confidence,
                matchedKeywords: route.matchedKeywords,
                memoryStats: {
                  hardAnchors: memory.coreState.length,
                  factCards: memory.factual.length,
                  boundaries: memory.boundary.length,
                  episodes: memory.episodic.length,
                  totalCards: memory.stats.totalCards,
                  totalDecisions: memory.stats.totalDecisions,
                },
              })}\n\n`
            )
          );

          // 6b. 流式输出内容
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
              // 持久化决策
              const decisionId = saveDecision({
                userId,
                question: input.decision,
                aiResponse: fullContent,
                modelUsed: `${chunk.provider}/${chunk.model}`,
                framework: route.framework,
                tokensInput: chunk.usage?.prompt_tokens,
                tokensOutput: chunk.usage?.completion_tokens,
              });

              // 发送完成事件
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'done',
                    decisionId,
                    model: chunk.model,
                    provider: chunk.provider,
                    usage: chunk.usage,
                  })}\n\n`
                )
              );

              // 6c. 异步触发 fact extraction (fire-and-forget)
              // 用户已经看到完整回答, fact 抽取在后台进行,不阻塞 UI
              extractFactsFromDecision({
                userId,
                decisionId,
                userQuestion: input.decision,
                aiResponse: fullContent,
              })
                .then((result) => {
                  console.log(
                    `[fact-extractor] decision ${decisionId}: extracted ${result.extracted} facts, ${result.errors.length} errors`
                  );
                  if (result.errors.length > 0) {
                    console.warn('[fact-extractor] errors:', result.errors);
                  }
                })
                .catch((e) => {
                  console.error('[fact-extractor] failed:', e);
                });
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
