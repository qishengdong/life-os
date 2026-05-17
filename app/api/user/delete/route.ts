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

const CHILD_TABLES = [
  'decisions',
  'decision_briefs',
  'daily_pulses',
  'letters',
  'unsent_letters',
  'decision_outcomes',
  'user_core_state',
  'relationship_memory_cards',
  'relationship_open_loops',
  'user_brain',
  'brain_insights',
  'emails_sent',
  'sunday_reviews',
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
