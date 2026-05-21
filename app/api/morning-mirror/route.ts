/**
 * /api/morning-mirror · 5/20 ship · C1
 *
 * GET  · 拉今天的 mirror (如有)
 *        Response: { mirror: MirrorResult | null }
 *        - null = 今天不显示 (新用户 / 已显示过 / 无合格 pulse / LLM 失败)
 *
 * POST · 记录用户对 mirror 的反应
 *        Body: { pulseId: number, action: 'respond' | 'dismiss' | 'timeout' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { getUserPulseCount } from '@/lib/pulse/store';
import {
  generateMorningMirror,
  recordMirrorAction,
} from '@/lib/morning-mirror/generator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN_PULSES_FOR_MIRROR = 3; // 用户写过 < 3 条 pulse 不启用 mirror (新用户跳过)

// ============================================================================
// GET · 拉今天 mirror
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);

    // Guard: 新用户 (写过 < 3 条 pulse) 跳过
    const totalPulses = await getUserPulseCount(userId);
    if (totalPulses < MIN_PULSES_FOR_MIRROR) {
      return NextResponse.json({ mirror: null, reason: 'new_user' });
    }

    const mirror = await generateMorningMirror(userId);
    if (!mirror) {
      return NextResponse.json({ mirror: null, reason: 'no_candidate_or_shown' });
    }

    return NextResponse.json({ mirror });
  } catch (e) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: 'invalid uid' }, { status: 401 });
    }
    console.error('[api/morning-mirror GET] error:', e);
    // mirror 失败不应破坏 /home 体验 · 静默 null
    return NextResponse.json({ mirror: null, reason: 'error' });
  }
}

// ============================================================================
// POST · 记录用户反应
// ============================================================================
const ActionSchema = z.object({
  pulseId: z.number().int().positive(),
  action: z.enum(['respond', 'dismiss', 'timeout']),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid body' }, { status: 400 });
    }

    await recordMirrorAction(userId, parsed.data.pulseId, parsed.data.action);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: 'invalid uid' }, { status: 401 });
    }
    console.error('[api/morning-mirror POST] error:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
