/**
 * Commitments 存取层 (单一入口, 防绕过)
 */

import { getDb } from '@/lib/db';
import type {
  Commitment,
  CommitmentKind,
  CommitmentStatus,
  ExtractedCommitment,
} from './types';

export function addCommitment(args: {
  userId: number;
  commitmentText: string;
  commitmentKind: CommitmentKind;
  duePhrase?: string | null;
  dueAt?: number | null;
  sourceDecisionId?: number | null;
}): number {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO life_os_commitments
         (user_id, commitment_text, commitment_kind, due_phrase, due_at, source_decision_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      args.userId,
      args.commitmentText,
      args.commitmentKind,
      args.duePhrase ?? null,
      args.dueAt ?? null,
      args.sourceDecisionId ?? null
    );
  return result.lastInsertRowid as number;
}

export function getUserCommitments(
  userId: number,
  status?: CommitmentStatus
): Commitment[] {
  const db = getDb();
  const rows = status
    ? (db
        .prepare(
          `SELECT * FROM life_os_commitments
           WHERE user_id = ? AND status = ?
           ORDER BY created_at DESC`
        )
        .all(userId, status) as any[])
    : (db
        .prepare(
          `SELECT * FROM life_os_commitments
           WHERE user_id = ?
           ORDER BY created_at DESC`
        )
        .all(userId) as any[]);
  return rows.map(rowToCommitment);
}

/**
 * 找到当前用户应该被提醒的 commitments:
 * - status='pending'
 * - due_at <= now (到期了) 或 due_at IS NULL (无限期, 但 promised 已超过 7 天)
 */
export function getDueCommitments(userId: number): Commitment[] {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const sevenDaysAgo = now - 7 * 86400;

  const rows = db
    .prepare(
      `SELECT * FROM life_os_commitments
       WHERE user_id = ?
         AND status = 'pending'
         AND (
           (due_at IS NOT NULL AND due_at <= ?)
           OR (due_at IS NULL AND promised_at <= ?)
         )
       ORDER BY due_at ASC, promised_at ASC`
    )
    .all(userId, now, sevenDaysAgo) as any[];

  return rows.map(rowToCommitment);
}

export function markFulfilled(commitmentId: number): void {
  const db = getDb();
  db.prepare(
    `UPDATE life_os_commitments SET status = 'fulfilled', fulfilled_at = unixepoch() WHERE id = ?`
  ).run(commitmentId);
}

export function markCancelled(commitmentId: number): void {
  const db = getDb();
  db.prepare(`UPDATE life_os_commitments SET status = 'cancelled' WHERE id = ?`).run(
    commitmentId
  );
}

export function setApologyPushed(commitmentId: number): void {
  const db = getDb();
  db.prepare(
    `UPDATE life_os_commitments SET apology_pushed_at = unixepoch() WHERE id = ?`
  ).run(commitmentId);
}

function rowToCommitment(row: any): Commitment {
  return {
    id: row.id,
    userId: row.user_id,
    commitmentText: row.commitment_text,
    commitmentKind: row.commitment_kind,
    promisedAt: row.promised_at,
    dueAt: row.due_at,
    duePhrase: row.due_phrase,
    sourceDecisionId: row.source_decision_id,
    status: row.status,
    fulfilledAt: row.fulfilled_at,
    apologyPushedAt: row.apology_pushed_at,
    createdAt: row.created_at,
  };
}
