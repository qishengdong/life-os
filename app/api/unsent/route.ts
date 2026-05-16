/**
 * /api/unsent
 *
 * GET  · list 当前用户的所有未交付的信 (按 category 可选过滤)
 * POST · 新建一封 · body: { category, recipientLabel?, content }
 *
 * Auth: X-User-UID + access_status='invited' (API 层硬校验)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { getUserAccessStatus } from '@/lib/invites';
import {
  createUnsentLetter,
  listUnsentLetters,
  countUnsentByCategory,
  type UnsentCategory,
} from '@/lib/unsent/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CATEGORIES: UnsentCategory[] = ['parent', 'child', 'partner', 'boss', 'self', 'past-self'];

const PostSchema = z.object({
  category: z.enum(['parent', 'child', 'partner', 'boss', 'self', 'past-self']),
  recipientLabel: z.string().max(80).optional().nullable(),
  content: z.string().min(1).max(5000),
});

function requireInvitedUserId(req: NextRequest): { userId: number } | NextResponse {
  try {
    const { userId } = resolveUserId(req);
    const status = getUserAccessStatus(userId);
    if (status !== 'invited') {
      return NextResponse.json({ error: '账户未激活' }, { status: 403 });
    }
    return { userId };
  } catch (e) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    throw e;
  }
}

export async function GET(req: NextRequest) {
  const auth = requireInvitedUserId(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') as UnsentCategory | null;
    if (category && !CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'invalid category' }, { status: 400 });
    }
    const letters = listUnsentLetters({
      userId: auth.userId,
      category: category || undefined,
    });
    const counts = countUnsentByCategory(auth.userId);
    return NextResponse.json({ letters, counts });
  } catch (e: any) {
    console.error('[api/unsent GET]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireInvitedUserId(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const parsed = PostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }
    const letter = createUnsentLetter({
      userId: auth.userId,
      category: parsed.data.category,
      recipientLabel: parsed.data.recipientLabel || null,
      content: parsed.data.content,
    });
    return NextResponse.json({ ok: true, letter });
  } catch (e: any) {
    console.error('[api/unsent POST]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
