/**
 * GET /api/user/export
 *
 * 用户隐私自助 · 一次性 zip 文件 (JSON 集合) 含所有 own data:
 *   - profile (user 表自己字段, 不含 recovery_code 明文)
 *   - decisions
 *   - daily_pulses
 *   - unsent_letters
 *   - letters (写给 KEY + KEY 回信)
 *   - brain (rmc cards + open loops + brain.md content)
 *   - outcomes
 *   - brain_insights
 *
 * Auth: X-User-UID + access_status='invited'
 * 返回 JSON 一次性 dump (不 stream, 真实数据量小, < 5MB).
 */
import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId, InvalidUserUidError } from '@/lib/user-identity';
import { getUserAccessStatus } from '@/lib/invites';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await resolveUserId(req);
    if (await getUserAccessStatus(userId) !== 'invited') {
      return NextResponse.json({ error: '账户未激活' }, { status: 403 });
    }

    const db = await getDb();
    const profile = await db
      .prepare(
        `SELECT id, user_uid, birth_date, gender, created_at, onboarding_completed_at,
                access_status, last_active_at, recovery_code_acknowledged_at, wechat_id
         FROM users WHERE id = ?`,
      )
      .get(userId);

    const data = {
      exportedAt: new Date().toISOString(),
      exportVersion: 1,
      profile,
      decisions: db.prepare(`SELECT * FROM decisions WHERE user_id = ? ORDER BY created_at`).all(userId),
      decisionBriefs: db
        .prepare(`SELECT * FROM decision_briefs WHERE user_id = ? ORDER BY authored_at`)
        .all(userId),
      pulses: tryAll(db, `SELECT * FROM daily_pulses WHERE user_id = ? ORDER BY created_at`, userId),
      letters: tryAll(db, `SELECT * FROM letters WHERE user_id = ? ORDER BY created_at`, userId),
      unsentLetters: db
        .prepare(`SELECT * FROM unsent_letters WHERE user_id = ? ORDER BY created_at`)
        .all(userId),
      outcomes: db
        .prepare(`SELECT * FROM decision_outcomes WHERE user_id = ? ORDER BY due_at`)
        .all(userId),
      brain: {
        coreState: tryAll(db, `SELECT * FROM user_core_state WHERE user_id = ?`, userId),
        memoryCards: tryAll(db, `SELECT * FROM relationship_memory_cards WHERE user_id = ?`, userId),
        openLoops: tryAll(db, `SELECT * FROM relationship_open_loops WHERE user_id = ?`, userId),
        brainContent: tryGet(db, `SELECT * FROM user_brain WHERE user_id = ?`, userId),
        insights: tryAll(db, `SELECT * FROM brain_insights WHERE user_id = ?`, userId),
      },
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="key-export-user${userId}-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (e: any) {
    if (e instanceof InvalidUserUidError) {
      return NextResponse.json({ error: '缺少用户身份' }, { status: 400 });
    }
    console.error('[api/user/export]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function tryAll(db: any, sql: string, ...args: any[]): any[] {
  try {
    return db.prepare(sql).all(...args);
  } catch {
    return [];
  }
}

function tryGet(db: any, sql: string, ...args: any[]): any {
  try {
    return db.prepare(sql).get(...args) || null;
  } catch {
    return null;
  }
}
