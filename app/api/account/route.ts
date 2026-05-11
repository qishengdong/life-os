/**
 * Account API — 用户管理 email + 订阅偏好
 *
 * V1.5 加: 设密码 / 真实 unsubscribe token / OAuth
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { getUser, updateUserEmail, getUserEmailPrefs } from '@/lib/db';
import { getEmailsForUser, isEmailConfigured } from '@/lib/email/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// GET /api/account — 当前 email + prefs + 邮件历史
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const user = getUser(userId);
    const prefs = getUserEmailPrefs(userId);
    const emails = getEmailsForUser(userId, 20);
    return NextResponse.json({
      email: user?.email || null,
      emailVerifiedAt: user?.email_verified_at || null,
      preferences: prefs,
      emailServiceConfigured: isEmailConfigured(),
      recentEmails: emails,
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ============================================================================
// POST /api/account — 设 email / 订阅偏好
// ============================================================================
const Schema = z.object({
  email: z.string().email('邮箱格式不对').optional(),
  preferences: z.object({
    sunday_review: z.boolean().optional(),
    outcome_due: z.boolean().optional(),
    welcome: z.boolean().optional(),
    commitment: z.boolean().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = resolveUserId(req);
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || '格式错误' }, { status: 400 });
    }
    updateUserEmail({ userId, ...parsed.data });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
