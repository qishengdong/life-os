/**
 * Invite 存储 + 业务逻辑.
 */

import { getDb } from '@/lib/db';
import { generateInviteCode } from './code-gen';

// ============================================================================
// 类型
// ============================================================================
export interface Invite {
  id: number;
  code: string;
  recipientName: string | null;
  recipientEmail: string | null;
  invitedBy: string;
  note: string | null;
  redeemedByUserId: number | null;
  redeemedAt: number | null;
  revokedAt: number | null;
  createdAt: number;
}

export type InviteStatus = 'pending' | 'redeemed' | 'revoked';

export function getInviteStatus(inv: Invite): InviteStatus {
  if (inv.revokedAt) return 'revoked';
  if (inv.redeemedAt) return 'redeemed';
  return 'pending';
}

function rowToInvite(r: any): Invite {
  return {
    id: r.id,
    code: r.code,
    recipientName: r.recipient_name,
    recipientEmail: r.recipient_email,
    invitedBy: r.invited_by,
    note: r.note,
    redeemedByUserId: r.redeemed_by_user_id,
    redeemedAt: r.redeemed_at,
    revokedAt: r.revoked_at,
    createdAt: r.created_at,
  };
}

// ============================================================================
// 创建
// ============================================================================
export async function createInvite(args: {
  recipientName?: string;
  recipientEmail?: string;
  invitedBy?: string;
  note?: string;
}): Promise<Invite> {
  const db = await getDb();

  // 防 code 冲突: 最多 retry 5 次 (10^12 概率几乎不可能, 但稳健)
  for (let i = 0; i < 5; i++) {
    const code = generateInviteCode();
    try {
      const result = await db
        .prepare(
          `INSERT INTO invites (code, recipient_name, recipient_email, invited_by, note)
           VALUES (?, ?, ?, ?, ?)`
        )
        .run(
          code,
          args.recipientName ?? null,
          args.recipientEmail ?? null,
          args.invitedBy ?? 'founder',
          args.note ?? null
        );
      const id = result.lastInsertRowid as number;
      const row = (await db.prepare(`SELECT * FROM invites WHERE id = ?`).get(id)) as any;
      return rowToInvite(row);
    } catch (e: any) {
      if (!String(e.message).includes('UNIQUE')) throw e;
      // collision — retry
    }
  }
  throw new Error('Failed to generate unique invite code after 5 retries');
}

// ============================================================================
// 列表 (admin)
// ============================================================================
export async function listInvites(limit = 200): Promise<Invite[]> {
  const db = await getDb();
  const rows = (await db
    .prepare(`SELECT * FROM invites ORDER BY created_at DESC LIMIT ?`)
    .all(limit)) as any[];
  return rows.map(rowToInvite);
}

export interface InviteSummary {
  total: number;
  pending: number;
  redeemed: number;
  revoked: number;
}

export async function getInviteSummary(): Promise<InviteSummary> {
  const db = await getDb();
  const row = (await db
    .prepare(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN redeemed_at IS NULL AND revoked_at IS NULL THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN redeemed_at IS NOT NULL THEN 1 ELSE 0 END) as redeemed,
         SUM(CASE WHEN revoked_at IS NOT NULL THEN 1 ELSE 0 END) as revoked
       FROM invites`
    )
    .get()) as any;

  return {
    total: row?.total || 0,
    pending: row?.pending || 0,
    redeemed: row?.redeemed || 0,
    revoked: row?.revoked || 0,
  };
}

// ============================================================================
// 查询单个 (按 code)
// ============================================================================
export async function findInviteByCode(code: string): Promise<Invite | null> {
  const db = await getDb();
  const row = (await db.prepare(`SELECT * FROM invites WHERE code = ?`).get(code)) as any;
  return row ? rowToInvite(row) : null;
}

// ============================================================================
// 兑换 — 关键业务逻辑
// ============================================================================
export type RedeemResult =
  | { ok: true; invite: Invite }
  | { ok: false; reason: 'not_found' | 'already_redeemed' | 'revoked' };

export async function redeemInvite(args: { code: string; userId: number }): Promise<RedeemResult> {
  const db = await getDb();
  return db.transaction(async (txdb) => {
    const row = (await txdb.prepare(`SELECT * FROM invites WHERE code = ?`).get(args.code)) as any;
    if (!row) return { ok: false, reason: 'not_found' as const };
    if (row.revoked_at) return { ok: false, reason: 'revoked' as const };
    if (row.redeemed_at) return { ok: false, reason: 'already_redeemed' as const };

    await txdb.prepare(
      `UPDATE invites SET redeemed_by_user_id = ?, redeemed_at = unixepoch() WHERE id = ?`,
    ).run(args.userId, row.id);

    await txdb.prepare(`UPDATE users SET access_status = 'invited' WHERE id = ?`).run(args.userId);

    const updated = (await txdb.prepare(`SELECT * FROM invites WHERE id = ?`).get(row.id)) as any;
    return { ok: true, invite: rowToInvite(updated) };
  }) as Promise<RedeemResult>;
}

// ============================================================================
// 撤销 (admin)
// ============================================================================
export async function revokeInvite(id: number): Promise<boolean> {
  const db = await getDb();
  const r = await db
    .prepare(`UPDATE invites SET revoked_at = unixepoch() WHERE id = ? AND revoked_at IS NULL`)
    .run(id);
  return r.changes > 0;
}

// ============================================================================
// 用户访问状态
// ============================================================================
export type AccessStatus = 'guest' | 'invited' | 'suspended';

export async function getUserAccessStatus(userId: number): Promise<AccessStatus> {
  const db = await getDb();
  const row = (await db.prepare(`SELECT access_status FROM users WHERE id = ?`).get(userId)) as any;
  return (row?.access_status as AccessStatus) || 'guest';
}
