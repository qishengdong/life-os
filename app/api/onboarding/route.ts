import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { processOnboarding } from '@/lib/onboarding/processor';
import type { OnboardingResponse } from '@/lib/onboarding/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userUid = (req.headers.get('x-user-uid') || '').toLowerCase();
    if (!userUid) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    const { userId } = resolveUserId(req);

    const body = await req.json();
    const responses = body.responses as OnboardingResponse[];
    if (!Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: '无效的 responses' }, { status: 400 });
    }

    const result = await processOnboarding(userUid, responses);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少有效的用户身份' }, { status: 400 });
    }
    console.error('[API /onboarding] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
