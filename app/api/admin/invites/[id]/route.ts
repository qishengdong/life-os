/**
 * POST /api/admin/invites/[id]/revoke — 撤销邀请
 *
 * 用 POST + ?action=revoke 而不是 DELETE 因为我们不是真删, 是软撤销.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminCookie,
  ADMIN_COOKIE_NAME,
  isAdminConfigured,
} from '@/lib/admin/auth';
import { revokeInvite } from '@/lib/invites';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adminGate(req: NextRequest): NextResponse | null {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Admin disabled' }, { status: 503 });
  }
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = adminGate(req);
  if (gate) return gate;

  const { id } = await params;
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (action !== 'revoke') {
    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  }

  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'bad id' }, { status: 400 });
  }

  const ok = await revokeInvite(numId);
  if (!ok) {
    return NextResponse.json({ error: '已撤销或不存在' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
