/**
 * Sunday Review 存取层
 */

import { getDb } from '@/lib/db';

export interface SundayReviewRecord {
  id: number;
  userId: number;
  weekStart: number;
  weekEnd: number;
  content: string;
  pulseCount: number;
  decisionCount: number;
  charCount: number;
  tokensUsed: number | null;
  readAt: number | null;
  generatedAt: number;
}

/**
 * 计算本周一 00:00 + 本周日 23:59:59 unix ts (本地时区)
 */
export function getWeekRange(now: Date = new Date()): { weekStart: number; weekEnd: number } {
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // 这周一: 如果今天是 Sun (0), 上周一 = today - 6 天. 否则 today - (day - 1) 天
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    weekStart: Math.floor(monday.getTime() / 1000),
    weekEnd: Math.floor(sunday.getTime() / 1000),
  };
}

export async function saveReview(args: {
  userId: number;
  weekStart: number;
  weekEnd: number;
  content: string;
  pulseCount: number;
  decisionCount: number;
  tokensUsed?: number;
}): Promise<number> {
  const db = await getDb();
  const result = await db
    .prepare(
      `INSERT INTO sunday_reviews (user_id, week_start, week_end, content, pulse_count, decision_count, char_count, tokens_used)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, week_start) DO UPDATE SET
         content = excluded.content,
         pulse_count = excluded.pulse_count,
         decision_count = excluded.decision_count,
         char_count = excluded.char_count,
         tokens_used = excluded.tokens_used,
         generated_at = unixepoch()`
    )
    .run(
      args.userId,
      args.weekStart,
      args.weekEnd,
      args.content,
      args.pulseCount,
      args.decisionCount,
      args.content.length,
      args.tokensUsed ?? null
    );
  return result.lastInsertRowid as number;
}

export async function getUserReviews(userId: number, limit = 12): Promise<SundayReviewRecord[]> {
  const db = await getDb();
  const rows = (await db
    .prepare(
      `SELECT * FROM sunday_reviews
       WHERE user_id = ?
       ORDER BY week_start DESC
       LIMIT ?`
    )
    .all(userId, limit)) as any[];
  return rows.map(rowToReview);
}

export async function getCurrentWeekReview(userId: number): Promise<SundayReviewRecord | null> {
  const { weekStart } = getWeekRange();
  const db = await getDb();
  const row = (await db
    .prepare(`SELECT * FROM sunday_reviews WHERE user_id = ? AND week_start = ?`)
    .get(userId, weekStart)) as any;
  return row ? rowToReview(row) : null;
}

export async function getLatestReview(userId: number): Promise<SundayReviewRecord | null> {
  const db = await getDb();
  const row = (await db
    .prepare(`SELECT * FROM sunday_reviews WHERE user_id = ? ORDER BY week_start DESC LIMIT 1`)
    .get(userId)) as any;
  return row ? rowToReview(row) : null;
}

export async function hasUnreadReview(userId: number): Promise<boolean> {
  const latest = await getLatestReview(userId);
  return latest ? latest.readAt === null : false;
}

export async function markReviewRead(reviewId: number): Promise<void> {
  const db = await getDb();
  await db.prepare(`UPDATE sunday_reviews SET read_at = unixepoch() WHERE id = ? AND read_at IS NULL`).run(reviewId);
}

function rowToReview(row: any): SundayReviewRecord {
  return {
    id: row.id,
    userId: row.user_id,
    weekStart: row.week_start,
    weekEnd: row.week_end,
    content: row.content,
    pulseCount: row.pulse_count,
    decisionCount: row.decision_count,
    charCount: row.char_count,
    tokensUsed: row.tokens_used,
    readAt: row.read_at,
    generatedAt: row.generated_at,
  };
}
