/**
 * POST /api/admin/qa/layer-c
 *
 * 给定 scenario_id + ai_output, 跑 Layer C LLM judge 12 维.
 * 用于复用已 cache 的 AI 输出 (避免重复 generate · 省 token).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { runLayerC } from '@/lib/test/layer-c';
import { getScenarioById } from '@/lib/test/scenarios-v3';
import { getPersonaById } from '@/lib/test/personas-v3';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const scenarioId = String(body.scenarioId || '');
    const aiOutput = String(body.aiOutput || '');
    if (!scenarioId || !aiOutput) {
      return NextResponse.json({ error: 'scenarioId + aiOutput required' }, { status: 400 });
    }
    const scenario = getScenarioById(scenarioId);
    if (!scenario) return NextResponse.json({ error: 'scenario not found' }, { status: 404 });
    const persona = scenario.personaId ? getPersonaById(scenario.personaId) : undefined;

    const result = await runLayerC({ scenario, aiOutput, persona });
    return NextResponse.json({
      success: true,
      pass: result.pass,
      focusAvg: result.focusAvg,
      overallAvg: result.overallAvg,
      scores: result.scoresByDimension,
      comment: result.comment,
      tokensUsed: result.tokensUsed,
      durationMs: result.durationMs,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
