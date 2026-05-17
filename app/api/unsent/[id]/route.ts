/**
 * PATCH /api/unsent/[id]
 *
 * 用户改信件状态:
 *   - { action: 'send_intent' }   · drafted → send_intended (KEY 7d 后 callback)
 *   - { action: 'archive' }       · drafted → archived (不催)
 *   - { action: 'callback_sent' }     · send_intended → sent (用户答"寄了")
 *   - { action: 'callback_not_sent' } · send_intended → not_sent (用户答"没寄")
 *
 * Auth: X-User-UID + invited
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { getUserAccessStatus } from '@/lib/invites';
import {
  markSendIntended,
  markArchived,
  resolveCallback,
  getUnsentLetter,
} from '@/lib/unsent/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({
  action: z.enum(['send_intent', 'archive', 'callback_sent', 'callback_not_sent']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    }

    const { userId } = await resolveUserId(req);
    if (await getUserAccessStatus(userId) !== 'invited') {
      return NextResponse.json({ error: '账户未激活' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid action' }, { status: 400 });
    }

    let letter;
    try {
      switch (parsed.data.action) {
        case 'send_intent':
          letter = await markSendIntended({ userId, id });
          break;
        case 'archive':
          letter = await markArchived({ userId, id });
          break;
        case 'callback_sent':
          letter = await resolveCallback({ userId, id, outcome: 'sent' });
          break;
        case 'callback_not_sent':
          letter = await resolveCallback({ userId, id, outcome: 'not_sent' });
          break;
      }
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    if (!letter) {
      return NextResponse.json({ error: 'letter not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, letter });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    console.error('[api/unsent/[id] PATCH]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    }
    const { userId } = await resolveUserId(req);
    if (await getUserAccessStatus(userId) !== 'invited') {
      return NextResponse.json({ error: '账户未激活' }, { status: 403 });
    }
    const letter = await getUnsentLetter({ userId, id });
    if (!letter) {
      return NextResponse.json({ error: 'letter not found' }, { status: 404 });
    }
    return NextResponse.json({ letter });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    console.error('[api/unsent/[id] GET]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
