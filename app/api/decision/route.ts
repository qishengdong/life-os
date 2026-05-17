import { NextRequest } from 'next/server';
import { z } from 'zod';
import { modelRouter } from '@/lib/model-router';
import {
  routeDecision,
  buildMessagesForFramework,
  FRAMEWORK_DISPLAY_NAMES,
} from '@/lib/decision/router';
import { saveDecision, updateUserProfile } from '@/lib/db';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { fetchUserMemory } from '@/lib/memory';
import { extractFactsFromDecision } from '@/lib/memory/fact-extractor';
import { extractCommitmentsFromDecision } from '@/lib/commitments/extractor';
import { maybeConsolidate } from '@/lib/memory/brain-consolidator';
import { scheduleOutcomes } from '@/lib/outcomes/store';
import { runInspector } from '@/lib/inspector';
import {
  runReplikaChecks,
  getActiveReplikaHits,
  buildReinforcementInjection,
} from '@/lib/inspector/replika-filter';
import { checkInputSafety, appendAIDisclosure } from '@/lib/safety';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '生日格式应为 YYYY-MM-DD'),
  gender: z.enum(['female', 'male', 'other']),
  decision: z.string().min(20, '决策描述太短了,多写一点背景和卡点').max(2000),
});

export async function POST(req: NextRequest) {
  let userId: number;
  let userUid: string;
  try {
    const resolved = await resolveUserId(req);
    userId = resolved.userId;
    userUid = resolved.userUid;
  } catch (e) {
    if (e instanceof InvalidUserUidError) {
      return new Response(
        JSON.stringify({ error: '缺少有效的用户身份 (X-User-UID header). 请刷新页面.' }),
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
    await updateUserProfile(userId, { birthDate: input.birthDate, gender: input.gender });
    const memory = await fetchUserMemory(userId);

    // ===== Safety gate (输入端 short-circuit) =====
    // 决策入口对 crisis / blocklist short-circuit. medical/legal/finance 不 short-circuit
    // (用户提到这些话题, 决策框架自身有边界提示, 不挡用户思考).
    const safety = checkInputSafety(input.decision);
    if (safety.triggered && (safety.trigger === 'crisis' || safety.trigger === 'blocklist')) {
      console.log(`[decision] ${safety.logTag} hit — short-circuit (no LLM call)`);
      return new Response(
        JSON.stringify({
          shortCircuit: true,
          trigger: safety.trigger,
          response: safety.response,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ===== Replika risk check (输入端) =====
    const replikaDetections = await runReplikaChecks({
      userId,
      userText: input.decision,
    });
    const replikaHits = getActiveReplikaHits(replikaDetections);
    const reinforcementInjection = buildReinforcementInjection(replikaHits);

    // ===== Router (混合模式) =====
    const route = await routeDecision(input.decision);
    const messages = await buildMessagesForFramework(route.framework, input, memory);

    // 如果命中 Replika signal, 在 system prompt 末尾加 reinforcement instruction
    if (reinforcementInjection && messages[0]?.role === 'system') {
      messages[0].content =
        messages[0].content + '\n\n' + reinforcementInjection;
    }

    const llmStream = modelRouter.completeStream({
      messages,
      provider: 'deepseek',
      temperature: 0.7,
      maxTokens: 4000,
    });

    const encoder = new TextEncoder();
    let fullContent = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // meta event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'meta',
                framework: route.framework,
                frameworkName: FRAMEWORK_DISPLAY_NAMES[route.framework],
                confidence: route.confidence,
                matchedKeywords: route.matchedKeywords,
                matchedPattern: route.matchedDecisionPattern,
                secondaryFrameworks: route.secondaryFrameworks,
                routerVersion: route.routerVersion,
                replikaHits: replikaHits.map((h) => ({
                  signal: h.signal,
                  severity: h.severity,
                  detail: h.detail,
                })),
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
              // 合规: 给保存的内容追加 AI 生成标识 footer
              const contentWithDisclosure = appendAIDisclosure(fullContent);
              const decisionId = await saveDecision({
                userId,
                question: input.decision,
                aiResponse: contentWithDisclosure,
                modelUsed: `${chunk.provider}/${chunk.model}`,
                framework: route.framework,
                tokensInput: chunk.usage?.prompt_tokens,
                tokensOutput: chunk.usage?.completion_tokens,
              });

              // 自动 schedule 3 个 outcome checkpoint (30/90/365 day)
              try {
                const outcomeIds = await scheduleOutcomes(decisionId, userId);
                if (outcomeIds.length > 0) {
                  console.log(`[outcomes] decision ${decisionId}: scheduled ${outcomeIds.length} checkpoints (30/90/365 day)`);
                }
              } catch (e) {
                console.error('[outcomes] schedule failed:', e);
              }

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

              // Inspector
              try {
                const inspectorReport = await runInspector({
                  userId,
                  decisionId,
                  userQuestion: input.decision,
                  aiResponse: fullContent,
                  userMemory: memory,
                  framework: route.framework,
                });
                if (inspectorReport.hits.length > 0) {
                  console.log(
                    `[inspector] decision ${decisionId}: ${inspectorReport.hits.length} hits`
                  );
                  for (const hit of inspectorReport.hits) {
                    console.log(`  ${hit.code}/${hit.severity}: ${hit.matchedText}`);
                  }
                }
              } catch (e) {
                console.error('[inspector] failed:', e);
              }

              // 异步 fact extraction
              extractFactsFromDecision({
                userId,
                decisionId,
                userQuestion: input.decision,
                aiResponse: fullContent,
              })
                .then((result) => {
                  console.log(
                    `[fact-extractor] decision ${decisionId}: extracted ${result.extracted} facts`
                  );
                })
                .catch((e) => console.error('[fact-extractor] failed:', e));

              // 异步 commitment extraction
              extractCommitmentsFromDecision({
                userId,
                decisionId,
                aiResponse: fullContent,
              })
                .then((result) => {
                  if (result.extracted > 0) {
                    console.log(
                      `[commitment-extractor] decision ${decisionId}: ${result.extracted} commitments`
                    );
                  }
                  // commitment 抽完后再触发 brain consolidation (链式但都 fire-and-forget)
                  return maybeConsolidate(userId);
                })
                .catch((e) => console.error('[commitment-extractor / brain-consolidator] failed:', e));
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
