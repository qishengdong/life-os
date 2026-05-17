/**
 * 未交付的信 · CRUD store.
 *
 * Day 2 (V1): drafted 状态 · write + list.
 * Day 4 升级: 寄/不寄 transition + 7d callback (send_intended → sent/not_sent).
 *
 * 这是 KEY 真护城河 L2-L3 的第一砖. 用户在这里 surface ignition (想说没说),
 * 后续 Day 4 KEY 在 7d 后 callback 推进 (用户真做了 / 没做都被档案接住).
 */
import { getDb } from '@/lib/db';

export type UnsentCategory =
  | 'parent'
  | 'child'
  | 'partner'
  | 'boss'
  | 'self'
  | 'past-self';

export type UnsentStatus =
  | 'drafted'
  | 'send_intended'
  | 'archived'
  | 'sent'
  | 'not_sent';

export const UNSENT_CATEGORIES: Array<{ key: UnsentCategory; label: string; hint: string }> = [
  { key: 'parent', label: '给父母', hint: '想说但没机会 / 没敢说的话' },
  { key: 'child', label: '给孩子', hint: '现在不好说, 或者她 / 他还听不懂' },
  { key: 'partner', label: '给伴侣', hint: '吵架后没说的, 或者一直没说出口的' },
  { key: 'boss', label: '给老板 / 同事', hint: '想表态但说不出 · 或者已经离开的人' },
  { key: 'self', label: '给自己', hint: '今天的你想对未来的自己说一句' },
  { key: 'past-self', label: '给十年前的自己', hint: '那个还没做选择的你, 现在你想跟他/她说什么' },
];

export interface UnsentLetter {
  id: number;
  userId: number;
  category: UnsentCategory;
  recipientLabel: string | null;
  content: string;
  status: UnsentStatus;
  callbackDueAt: number | null;
  callbackDoneAt: number | null;
  createdAt: number;
  updatedAt: number;
}

function rowToLetter(r: any): UnsentLetter {
  return {
    id: r.id,
    userId: r.user_id,
    category: r.category,
    recipientLabel: r.recipient_label,
    content: r.content,
    status: r.status,
    callbackDueAt: r.callback_due_at,
    callbackDoneAt: r.callback_done_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** 创建新信件 · 默认 status='drafted'. */
export async function createUnsentLetter(args: {
  userId: number;
  category: UnsentCategory;
  recipientLabel?: string | null;
  content: string;
}): Promise<UnsentLetter> {
  const db = await getDb();
  const trimmed = args.content.trim();
  if (!trimmed) throw new Error('content 不能为空');
  if (trimmed.length > 5000) throw new Error('单封信 5000 字以内');

  const res = await db
    .prepare(
      `INSERT INTO unsent_letters (user_id, category, recipient_label, content)
       VALUES (?, ?, ?, ?)`,
    )
    .run(args.userId, args.category, args.recipientLabel || null, trimmed);

  const row = await db
    .prepare(`SELECT * FROM unsent_letters WHERE id = ?`)
    .get(res.lastInsertRowid as number);
  return rowToLetter(row);
}

/** 列用户所有信件 · 按 createdAt desc · 可按 category 过滤. */
export async function listUnsentLetters(args: {
  userId: number;
  category?: UnsentCategory;
  limit?: number;
}): Promise<UnsentLetter[]> {
  const db = await getDb();
  const limit = args.limit ?? 200;
  if (args.category) {
    return (await db
      .prepare(
        `SELECT * FROM unsent_letters
         WHERE user_id = ? AND category = ?
         ORDER BY created_at DESC LIMIT ?`,
      )
      .all(args.userId, args.category, limit)).map(rowToLetter);
  }
  return (await db
    .prepare(
      `SELECT * FROM unsent_letters
       WHERE user_id = ?
       ORDER BY created_at DESC LIMIT ?`,
    )
    .all(args.userId, limit)).map(rowToLetter);
}

/** 拿单封 · 校验 userId 防越权. */
export async function getUnsentLetter(args: { userId: number; id: number }): Promise<UnsentLetter | null> {
  const db = await getDb();
  const row = await db
    .prepare(`SELECT * FROM unsent_letters WHERE id = ? AND user_id = ?`)
    .get(args.id, args.userId);
  return row ? rowToLetter(row) : null;
}

// ============================================================
// Day 4 · 寄/不寄 transition + 7d callback (L2 → L3)
// ============================================================

const CALLBACK_DELAY_DAYS = 7;
const CALLBACK_DELAY_SECONDS = CALLBACK_DELAY_DAYS * 86400;

/** 用户选"想寄出" · drafted → send_intended · 设 7d callback. */
export async function markSendIntended(args: { userId: number; id: number }): Promise<UnsentLetter | null> {
  const db = await getDb();
  const letter = await getUnsentLetter(args);
  if (!letter) return null;
  if (letter.status !== 'drafted') {
    throw new Error(`letter ${args.id} 不在 drafted 状态 (当前: ${letter.status}), 不能 mark send_intended`);
  }
  const due = Math.floor(Date.now() / 1000) + CALLBACK_DELAY_SECONDS;
  db.prepare(
    `UPDATE unsent_letters
     SET status = 'send_intended', callback_due_at = ?, updated_at = unixepoch()
     WHERE id = ? AND user_id = ?`,
  ).run(due, args.id, args.userId);
  return await getUnsentLetter(args);
}

/** 用户选"不寄, 留档" · drafted → archived · 不催. */
export async function markArchived(args: { userId: number; id: number }): Promise<UnsentLetter | null> {
  const db = await getDb();
  const letter = await getUnsentLetter(args);
  if (!letter) return null;
  if (letter.status !== 'drafted') {
    throw new Error(`letter ${args.id} 不在 drafted 状态, 不能 archive`);
  }
  db.prepare(
    `UPDATE unsent_letters
     SET status = 'archived', updated_at = unixepoch()
     WHERE id = ? AND user_id = ?`,
  ).run(args.id, args.userId);
  return await getUnsentLetter(args);
}

/** Callback 时用户确认: 寄了 / 没寄 · send_intended → sent / not_sent. */
export async function resolveCallback(args: {
  userId: number;
  id: number;
  outcome: 'sent' | 'not_sent';
}): Promise<UnsentLetter | null> {
  const db = await getDb();
  const letter = await getUnsentLetter(args);
  if (!letter) return null;
  if (letter.status !== 'send_intended') {
    throw new Error(`letter ${args.id} 不在 send_intended 状态, 不能 resolve callback`);
  }
  db.prepare(
    `UPDATE unsent_letters
     SET status = ?, callback_done_at = unixepoch(), updated_at = unixepoch()
     WHERE id = ? AND user_id = ?`,
  ).run(args.outcome, args.id, args.userId);
  return await getUnsentLetter(args);
}

/** Admin 用 · 列出所有 callback 已到期但用户没答的信件 (跨用户). */
export interface PendingCallback {
  letter: UnsentLetter;
  userId: number;
  recipientName: string | null;
  wechatId: string | null;
  daysOverdue: number;
}

export async function listPendingCallbacks(): Promise<PendingCallback[]> {
  const db = await getDb();
  const now = Math.floor(Date.now() / 1000);
  const rows = (await db
    .prepare(
      `SELECT
         l.*,
         u.id AS u_id, u.wechat_id, i.recipient_name
       FROM unsent_letters l
       INNER JOIN users u ON u.id = l.user_id
       LEFT JOIN invites i ON i.redeemed_by_user_id = u.id
       WHERE l.status = 'send_intended'
         AND l.callback_due_at <= ?
         AND l.callback_done_at IS NULL
       ORDER BY l.callback_due_at ASC`,
    )
    .all(now)) as Array<any>;
  return rows.map((r) => ({
    letter: rowToLetter(r),
    userId: r.u_id,
    recipientName: r.recipient_name,
    wechatId: r.wechat_id,
    daysOverdue: Math.floor((now - r.callback_due_at) / 86400),
  }));
}

/** 各 category 计数 · 用于 dashboard. */
export async function countUnsentByCategory(userId: number): Promise<Record<UnsentCategory, number>> {
  const db = await getDb();
  const rows = (await db
    .prepare(
      `SELECT category, COUNT(*) AS cnt FROM unsent_letters
       WHERE user_id = ? GROUP BY category`,
    )
    .all(userId)) as Array<{ category: UnsentCategory; cnt: number }>;
  const out: Record<UnsentCategory, number> = {
    parent: 0, child: 0, partner: 0, boss: 0, self: 0, 'past-self': 0,
  };
  for (const r of rows) out[r.category] = r.cnt;
  return out;
}
