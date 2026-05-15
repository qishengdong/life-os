/**
 * GET /api/admin/qa/scenarios · 列 40 个 test scenarios meta
 *
 * 给 /admin/qa 客户端 orchestrator 用 — 拿到全 list 后逐个 POST run.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { SCENARIOS_V3 } from '@/lib/test/scenarios-v3';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json({
    scenarios: SCENARIOS_V3.map((s) => ({
      id: s.id,
      trap: s.trap,
      stage: s.stage,
      personaId: s.personaId,
      expectedBehavior: s.expectedBehavior.slice(0, 200),
    })),
    total: SCENARIOS_V3.length,
  });
}
