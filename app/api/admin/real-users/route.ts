/**
 * GET /api/admin/real-users
 *
 * List all real beta users with full activity metrics for owner monitoring.
 *
 * Fields:
 *   id, user_uid, recovery_code_tail (last 4 only · privacy), wechat_id,
 *   access_status, onboarding_completed_at, recovery_acked_at, last_active_at,
 *   redeemed_at, invited_by, recipient_name,
 *   counts: decisions, pulses, unsent_letters, letters_to_key,
 *   outcomes_due_count (callback due, not yet asked)
 *
 * Auth: requireAdmin
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const db = getDb();

    // 拉 users + 邀请关联 + 各类计数 · 一条 SQL
    const rows = db
      .prepare(
        `SELECT
           u.id,
           u.user_uid,
           u.recovery_code,
           u.recovery_code_acknowledged_at,
           u.wechat_id,
           u.access_status,
           u.onboarding_completed_at,
           u.last_active_at,
           u.created_at,
           i.code AS invite_code,
           i.recipient_name,
           i.invited_by,
           i.redeemed_at,
           (SELECT COUNT(*) FROM decisions WHERE user_id = u.id) AS decision_count,
           (SELECT COUNT(*) FROM daily_pulses WHERE user_id = u.id) AS pulse_count,
           (SELECT COUNT(*) FROM unsent_letters WHERE user_id = u.id) AS unsent_count,
           (SELECT COUNT(*) FROM unsent_letters
              WHERE user_id = u.id
                AND status = 'send_intended'
                AND callback_due_at <= unixepoch()
                AND callback_done_at IS NULL) AS unsent_callback_due,
           (SELECT COUNT(*) FROM decision_outcomes
              WHERE user_id = u.id
                AND due_at <= unixepoch()
                AND asked_at IS NULL) AS outcomes_due
         FROM users u
         LEFT JOIN invites i ON i.redeemed_by_user_id = u.id
         WHERE u.access_status IN ('invited','suspended')
         ORDER BY u.created_at DESC`,
      )
      .all() as Array<any>;

    const users = rows.map((r) => ({
      id: r.id,
      userUid: r.user_uid,
      // privacy: 只显示恢复码末 4 位 (核身用, 不暴露完整码)
      recoveryCodeTail: r.recovery_code ? r.recovery_code.slice(-4) : null,
      hasRecoveryCode: !!r.recovery_code,
      recoveryAckedAt: r.recovery_code_acknowledged_at,
      wechatId: r.wechat_id,
      accessStatus: r.access_status,
      onboardingCompletedAt: r.onboarding_completed_at,
      lastActiveAt: r.last_active_at,
      createdAt: r.created_at,
      inviteCode: r.invite_code,
      recipientName: r.recipient_name,
      invitedBy: r.invited_by,
      redeemedAt: r.redeemed_at,
      counts: {
        decisions: r.decision_count,
        pulses: r.pulse_count,
        unsent: r.unsent_count,
        unsentCallbackDue: r.unsent_callback_due,
        outcomesDue: r.outcomes_due,
      },
    }));

    return NextResponse.json({ users });
  } catch (e: any) {
    console.error('[api/admin/real-users GET]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * PATCH · admin 更新单个用户的 wechat_id (兜底 channel)
 * Body: { id: number, wechatId: string | null }
 */
export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const id = Number(body.id);
    const wechatId = body.wechatId === null ? null : String(body.wechatId).trim().slice(0, 80) || null;
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    }
    const db = getDb();
    const res = db.prepare(`UPDATE users SET wechat_id = ? WHERE id = ?`).run(wechatId, id);
    if (res.changes === 0) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[api/admin/real-users PATCH]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
