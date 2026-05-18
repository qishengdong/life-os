/**
 * POST /api/user/delete
 *
 * 用户隐私自助 · 删除自己所有数据 (irreversible).
 * Cascade by user_id 到所有相关表.
 *
 * Auth: X-User-UID + body 必须含 confirmation: "DELETE MY KEY"
 *
 * 删完清空 cookies, 用户回到匿名访客.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { getDb } from '@/lib/db';
import { clearUserCookies } from '@/lib/auth/cookies';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({
  confirmation: z.literal('DELETE MY KEY'),
});

// 注意: 必须包含 lib/db/index.ts initSchema 里所有带 user_id 外键的表.
// 加表必须在这里同步加 (隐私铁律 · 不能漏).
// 重要顺序: decisions 最后删 (decision_briefs / decision_outcomes 都 FK 它).
const CHILD_TABLES = [
  // 决策相关
  'decision_briefs',
  'decision_outcomes',
  'decisions',                     // 最后 — 子表都引它
  // 日常记录
  'daily_pulses',
  'letters',
  'unsent_letters',
  'intake_answers',                // P0 fix 2026-05-17: onboarding 答案
  'life_os_commitments',           // P0 fix 2026-05-17: 用户承诺
  // 记忆 / brain
  'user_core_state',
  'relationship_memory_cards',
  'relationship_open_loops',
  'user_brain',
  'brain_insights',
  'brain_insight_runs',            // P0 fix 2026-05-17: brain cron 记录
  // 审计 / 邮件
  'inspector_audit',               // P0 fix 2026-05-17: AI 行为审计
  'emails_sent',
  'sunday_reviews',
  'user_decision_personality',     // 2026-05-18 ship: 决策人格画像
  'pulse_turns',                   // 2026-05-18 ship: pulse 续聊 turns
];

export async function POST(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    const body = await req.json().catch(() => ({}));
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '需要确认字符串 "DELETE MY KEY"' },
        { status: 400 },
      );
    }

    const db = await getDb();
    await db.transaction(async (txdb) => {
      for (const table of CHILD_TABLES) {
        try {
          await txdb.prepare(`DELETE FROM ${table} WHERE user_id = ?`).run(userId);
        } catch {
          // 表可能在某些环境不存在, 忽略
        }
      }
      try {
        await txdb.prepare(
          `UPDATE invites SET redeemed_by_user_id = NULL WHERE redeemed_by_user_id = ?`,
        ).run(userId);
      } catch {}
      await txdb.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
    });

    const res = NextResponse.json({ ok: true, message: '所有数据已删除. 谢谢使用过 KEY.' });
    clearUserCookies(res);
    return res;
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    console.error('[api/user/delete]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
