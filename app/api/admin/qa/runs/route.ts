/**
 * GET /api/admin/qa/runs · 列最近 N 次 test runs + 失败 case 详情
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const db = getDb();
  const url = new URL(req.url);
  const runIdParam = url.searchParams.get('runId');

  if (runIdParam) {
    // 单次 run 详情 + 所有 case
    const run = db.prepare(`SELECT * FROM test_runs WHERE id = ?`).get(parseInt(runIdParam, 10));
    const results = db
      .prepare(
        `SELECT id, scenario_id, persona_id, trap_type, stage,
                layer_a_pass, layer_a_fails, layer_c_pass, layer_c_focus_avg, layer_c_overall_avg,
                layer_c_comment, ai_output, created_at
         FROM test_results WHERE run_id = ? ORDER BY layer_a_pass ASC, layer_c_pass ASC`,
      )
      .all(parseInt(runIdParam, 10));
    return NextResponse.json({ run, results });
  }

  // 列最近 20 次 run
  const runs = db
    .prepare(
      `SELECT id, label, mode, total_cases, passed_a, passed_c, tokens_used,
              duration_ms, created_at
       FROM test_runs ORDER BY created_at DESC LIMIT 20`,
    )
    .all();
  return NextResponse.json({ runs });
}
