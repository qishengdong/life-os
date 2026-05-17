/**
 * /api/admin/invites
 *
 * GET  — 列出全部 invite
 * POST — 生成新 invite
 *
 * 双方都受 middleware admin cookie 保护. 这里再做一次防御性校验 (depth in defense).
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  verifyAdminCookie,
  ADMIN_COOKIE_NAME,
  isAdminConfigured,
} from '@/lib/admin/auth';
import {
  createInvite,
  listInvites,
  getInviteSummary,
  getInviteStatus,
} from '@/lib/invites';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adminGate(req: NextRequest): NextResponse | null {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'Admin 未启用 (ADMIN_TOKEN env not set)' },
      { status: 503 }
    );
  }
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminCookie(cookie)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

const CreateSchema = z.object({
  recipientName: z.string().max(100).optional(),
  recipientEmail: z.string().email().optional().or(z.literal('')),
  invitedBy: z.string().max(100).optional(),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const gate = adminGate(req);
  if (gate) return gate;

  try {
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || '格式错误' },
        { status: 400 }
      );
    }
    const invite = await createInvite({
      recipientName: parsed.data.recipientName,
      recipientEmail: parsed.data.recipientEmail || undefined,
      invitedBy: parsed.data.invitedBy,
      note: parsed.data.note,
    });

    return NextResponse.json({ ok: true, invite });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const gate = adminGate(req);
  if (gate) return gate;

  const invites = await listInvites();
  const summary = await getInviteSummary();
  return NextResponse.json({
    summary,
    invites: invites.map((i) => ({ ...i, status: getInviteStatus(i) })),
  });
}
