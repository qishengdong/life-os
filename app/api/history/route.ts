import { NextRequest, NextResponse } from 'next/server';
import { getUserDecisions } from '@/lib/db';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { fetchUserMemory } from '@/lib/memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);

    const decisions = getUserDecisions(userId);
    const memory = fetchUserMemory(userId);

    return NextResponse.json({
      decisions,
      memory: {
        coreState: memory.coreState,
        factual: memory.factual,
        boundary: memory.boundary,
        episodic: memory.episodic,
        relational: memory.relational,
        psychSignal: memory.psychSignal,
        openLoops: memory.openLoops,
        brainContent: memory.brainContent,
        stats: memory.stats,
      },
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json(
        { error: '缺少有效的用户身份 (X-User-UID header)' },
        { status: 400 }
      );
    }
    console.error('[API /history] Error:', e);
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
