/**
 * POST /api/admin/qa/run · 手动触发 AI Native test battery
 *
 * Body: { mode: 'layer_a_only'|'layer_ac', sampleSize?: number, filterTraps?: string[], filterStages?: string[] }
 *
 * 仅 owner 可调.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { runTestBattery } from '@/lib/test/runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const mode = body.mode === 'layer_ac' ? 'layer_ac' : 'layer_a_only';
    const summary = await runTestBattery({
      mode,
      label: body.label || 'manual',
      sampleSize: body.sampleSize,
      filterTraps: body.filterTraps,
      filterStages: body.filterStages,
      filterScenarioIds: body.filterScenarioIds,
    });
    return NextResponse.json({ success: true, summary });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
