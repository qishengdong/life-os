/**
 * 决策人格 LLM pipeline · V1
 *
 * 输入: user id (从 intake_answers 表拉 6 stage 答案)
 * 输出: DecisionPersonality JSON 写入 user_decision_personality 表
 *
 * 性能: 1 LLM 调用 (deepseek), ~15-25s, 安全 in 60s maxDuration.
 */

import { modelRouter } from '@/lib/model-router';
import { getDb } from '@/lib/db';
import { getIntakeAnswers } from '@/lib/db';
import { PERSONALITY_SYSTEM_PROMPT, buildPersonalityUserMessage } from './prompt';
import { PERSONALITY_TYPES, type DecisionPersonality, type DecisionPersonalityType } from './types';

export interface GeneratePersonalityResult {
  success: boolean;
  personality?: DecisionPersonality;
  error?: string;
  durationMs: number;
  tokensUsed?: number;
}

export async function generatePersonality(userId: number): Promise<GeneratePersonalityResult> {
  const t0 = Date.now();
  try {
    const answers = await getIntakeAnswers(userId);
    const stages = Object.keys(answers);
    if (stages.length < 3) {
      return {
        success: false,
        error: `onboarding 答案不够 · 至少需要 3 个 stage (当前 ${stages.length})`,
        durationMs: Date.now() - t0,
      };
    }

    const userMsg = buildPersonalityUserMessage(answers);
    const resp = await modelRouter.complete({
      messages: [
        { role: 'system', content: PERSONALITY_SYSTEM_PROMPT },
        { role: 'user', content: userMsg },
      ],
      provider: 'deepseek',
      temperature: 0.5,
      maxTokens: 2000,
    });

    // 解 JSON
    const raw = resp.content.trim();
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd < 0) {
      return {
        success: false,
        error: 'LLM 返回未含 JSON · 原文: ' + raw.slice(0, 200),
        durationMs: Date.now() - t0,
      };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    } catch (e: any) {
      return {
        success: false,
        error: 'JSON 解析失败: ' + e.message,
        durationMs: Date.now() - t0,
      };
    }

    // 验 type
    if (!PERSONALITY_TYPES[parsed.type as DecisionPersonalityType]) {
      return {
        success: false,
        error: `LLM 返回未知 type: ${parsed.type}`,
        durationMs: Date.now() - t0,
      };
    }

    const personality: DecisionPersonality = {
      type: parsed.type,
      headline: String(parsed.headline || '').trim(),
      signatures: Array.isArray(parsed.signatures) ? parsed.signatures.slice(0, 3) : [],
      blindSpot: {
        description: String(parsed.blindSpot?.description || '').trim(),
        evidence: String(parsed.blindSpot?.evidence || '').trim(),
      },
      growthDirection: {
        towardType: parsed.growthDirection?.towardType || parsed.type,
        description: String(parsed.growthDirection?.description || '').trim(),
      },
      generatedAt: Math.floor(Date.now() / 1000),
      basedOnStages: stages,
      llmModel: `${resp.provider}/${resp.model}`,
    };

    // 写表
    await savePersonality(userId, personality);

    return {
      success: true,
      personality,
      durationMs: Date.now() - t0,
      tokensUsed: resp.usage?.completion_tokens,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e.message || 'unknown',
      durationMs: Date.now() - t0,
    };
  }
}

export async function savePersonality(userId: number, p: DecisionPersonality): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO user_decision_personality
         (user_id, type, headline, signatures_json, blind_spot_json, growth_direction_json,
          based_on_stages, llm_model, generated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         type = excluded.type,
         headline = excluded.headline,
         signatures_json = excluded.signatures_json,
         blind_spot_json = excluded.blind_spot_json,
         growth_direction_json = excluded.growth_direction_json,
         based_on_stages = excluded.based_on_stages,
         llm_model = excluded.llm_model,
         generated_at = excluded.generated_at,
         version = version + 1`,
    )
    .run(
      userId,
      p.type,
      p.headline,
      JSON.stringify(p.signatures),
      JSON.stringify(p.blindSpot),
      JSON.stringify(p.growthDirection),
      JSON.stringify(p.basedOnStages),
      p.llmModel,
      p.generatedAt,
    );
}

export async function getPersonality(userId: number): Promise<DecisionPersonality | null> {
  const db = await getDb();
  const row = (await db
    .prepare(
      `SELECT * FROM user_decision_personality WHERE user_id = ?`,
    )
    .get(userId)) as any;
  if (!row) return null;
  return {
    type: row.type,
    headline: row.headline,
    signatures: JSON.parse(row.signatures_json || '[]'),
    blindSpot: JSON.parse(row.blind_spot_json || '{}'),
    growthDirection: JSON.parse(row.growth_direction_json || '{}'),
    generatedAt: row.generated_at,
    basedOnStages: JSON.parse(row.based_on_stages || '[]'),
    llmModel: row.llm_model || '',
  };
}
