/**
 * POST /api/admin/onboarding/regenerate-seed
 *
 * Body: { userId: number }
 *
 * Owner-only. 从 saved intake_answers 重新跑 RMC extractor + brain.md baseline.
 *
 * 用途:
 *   - 老用户的 brain 在 Vercel 冷启动后丢了 → 重建
 *   - prompt 升级后想给老用户重蒸 seed
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { regenerateBrainSeedForUser } from '@/lib/onboarding/processor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId } = await req.json();
    if (typeof userId !== 'number') {
      return NextResponse.json({ error: 'userId required (number)' }, { status: 400 });
    }
    const result = await regenerateBrainSeedForUser(userId);
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
