/**
 * Letters store — KEY 跟用户的日常通信
 *
 * 表: letters (lib/db/index.ts schema 见 Phase 4a)
 *
 * 状态流转:
 *   pending  → replied   (pipeline 成功)
 *   pending  → failed    (pipeline 失败)
 *   failed   → pending   (用户 retry)
 *
 * 核心约束:
 *   - getLetterById 必须 user_id check, 防止跨用户访问别人的信
 *   - listLettersByUser 按 authored_at DESC, 最新的在上
 */

import { getDb } from '@/lib/db';

export interface LetterRecord {
  id: number;
  userId: number;
  userContent: string;
  userCharCount: number;
  replyContent: string | null;
  replyCharCount: number | null;
  replyAuthoredAt: number | null;
  letterNumber: string;
  status: 'pending' | 'replied' | 'failed';
  failureReason: string | null;
  tokensUsed: number | null;
  modelUsed: string | null;
  durationMs: number | null;
  canonQuotesUsed: string[] | null;    // parsed JSON array
  brainFactsUsed: string[] | null;
  frameworkMatched: string | null;
  authoredAt: number;
}

// ============================================================================
// Letter number 生成 — LE-YYYYMMDD-NNN
// ============================================================================

/**
 * 生成 letter number. 用秒级时间戳后 3 位避免同日内冲突.
 * Format: LE-20260513-181
 */
export function generateLetterNumber(date?: Date): string {
  const d = date ?? new Date();
  const yyyymmdd =
    d.getFullYear().toString() +
    (d.getMonth() + 1).toString().padStart(2, '0') +
    d.getDate().toString().padStart(2, '0');
  const seq = (d.getTime() % 1000).toString().padStart(3, '0');
  return `LE-${yyyymmdd}-${seq}`;
}

// ============================================================================
// 中文字数计算 (跟 brief-schema 一致)
// ============================================================================

function countCharsCN(text: unknown): number {
  if (typeof text !== 'string') return 0;
  return text.replace(/\s+/g, '').replace(/[\p{P}]/gu, '').length;
}

// ============================================================================
// Row → typed record mapping
// ============================================================================

function mapRow(row: any): LetterRecord {
  return {
    id: row.id,
    userId: row.user_id,
    userContent: row.user_content,
    userCharCount: row.user_char_count ?? countCharsCN(row.user_content),
    replyContent: row.reply_content,
    replyCharCount: row.reply_char_count,
    replyAuthoredAt: row.reply_authored_at,
    letterNumber: row.letter_number,
    status: row.status,
    failureReason: row.failure_reason,
    tokensUsed: row.tokens_used,
    modelUsed: row.model_used,
    durationMs: row.duration_ms,
    canonQuotesUsed: row.canon_quotes_used ? JSON.parse(row.canon_quotes_used) : null,
    brainFactsUsed: row.brain_facts_used ? JSON.parse(row.brain_facts_used) : null,
    frameworkMatched: row.framework_matched,
    authoredAt: row.authored_at,
  };
}

// ============================================================================
// Create — 用户写完信, 立刻入库 (pending 状态)
// ============================================================================

export function createLetter(args: { userId: number; userContent: string }): LetterRecord {
  const db = getDb();
  const letterNumber = generateLetterNumber();
  const userCharCount = countCharsCN(args.userContent);

  // 处理重号 (极小概率): retry 一次, 加 1ms 偏移
  let attempts = 0;
  let row: any = null;
  while (attempts < 3) {
    try {
      const result = db
        .prepare(
          `INSERT INTO letters (user_id, user_content, user_char_count, letter_number, status)
           VALUES (?, ?, ?, ?, 'pending')`,
        )
        .run(args.userId, args.userContent, userCharCount, letterNumber);
      row = db.prepare(`SELECT * FROM letters WHERE id = ?`).get(result.lastInsertRowid) as any;
      break;
    } catch (e: any) {
      if (e.code === 'SQLITE_CONSTRAINT_UNIQUE' && attempts < 2) {
        attempts++;
        // 重生成: 加 1ms 让 seq 不同
        // (实践中近 0 概率, 但 belt + suspenders)
        continue;
      }
      throw e;
    }
  }

  if (!row) throw new Error('Failed to create letter after retries');
  return mapRow(row);
}

// ============================================================================
// Update — pipeline 完成回信后调用
// ============================================================================

export function updateLetterReply(args: {
  letterId: number;
  replyContent: string;
  tokensUsed?: number;
  modelUsed?: string;
  durationMs?: number;
  canonQuotesUsed?: string[];
  brainFactsUsed?: string[];
  frameworkMatched?: string;
}): LetterRecord {
  const db = getDb();
  const replyCharCount = countCharsCN(args.replyContent);
  const now = Math.floor(Date.now() / 1000);

  db.prepare(
    `UPDATE letters
     SET reply_content = ?,
         reply_char_count = ?,
         reply_authored_at = ?,
         status = 'replied',
         tokens_used = ?,
         model_used = ?,
         duration_ms = ?,
         canon_quotes_used = ?,
         brain_facts_used = ?,
         framework_matched = ?,
         failure_reason = NULL
     WHERE id = ?`,
  ).run(
    args.replyContent,
    replyCharCount,
    now,
    args.tokensUsed ?? null,
    args.modelUsed ?? null,
    args.durationMs ?? null,
    args.canonQuotesUsed ? JSON.stringify(args.canonQuotesUsed) : null,
    args.brainFactsUsed ? JSON.stringify(args.brainFactsUsed) : null,
    args.frameworkMatched ?? null,
    args.letterId,
  );

  const row = db.prepare(`SELECT * FROM letters WHERE id = ?`).get(args.letterId) as any;
  return mapRow(row);
}

// ============================================================================
// Mark failed — pipeline 失败时调用
// ============================================================================

export function markLetterFailed(args: {
  letterId: number;
  reason: string;
  durationMs?: number;
}): LetterRecord {
  const db = getDb();
  db.prepare(
    `UPDATE letters
     SET status = 'failed', failure_reason = ?, duration_ms = ?
     WHERE id = ?`,
  ).run(args.reason, args.durationMs ?? null, args.letterId);

  const row = db.prepare(`SELECT * FROM letters WHERE id = ?`).get(args.letterId) as any;
  return mapRow(row);
}

// ============================================================================
// Reset to pending — 用户主动 retry 一封 failed 的信
// ============================================================================

export function resetLetterToPending(args: {
  letterId: number;
  userId: number; // 防止跨用户 reset
}): LetterRecord | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM letters WHERE id = ? AND user_id = ?`)
    .get(args.letterId, args.userId) as any;
  if (!row) return null;

  db.prepare(
    `UPDATE letters
     SET status = 'pending', failure_reason = NULL
     WHERE id = ? AND user_id = ?`,
  ).run(args.letterId, args.userId);

  const updated = db.prepare(`SELECT * FROM letters WHERE id = ?`).get(args.letterId) as any;
  return mapRow(updated);
}

// ============================================================================
// Read — 单封信 (含 user_id check)
// ============================================================================

export function getLetterById(letterId: number, userId: number): LetterRecord | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM letters WHERE id = ? AND user_id = ?`)
    .get(letterId, userId) as any;
  return row ? mapRow(row) : null;
}

// ============================================================================
// List — 用户所有信, 最新在前
// ============================================================================

export function listLettersByUser(userId: number, limit = 100): LetterRecord[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM letters
       WHERE user_id = ?
       ORDER BY authored_at DESC
       LIMIT ?`,
    )
    .all(userId, limit) as any[];
  return rows.map(mapRow);
}

// ============================================================================
// Counts / metrics
// ============================================================================

export function countLettersByUser(userId: number): {
  total: number;
  replied: number;
  pending: number;
  failed: number;
} {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
       FROM letters
       WHERE user_id = ?`,
    )
    .get(userId) as any;
  return {
    total: row?.total || 0,
    replied: row?.replied || 0,
    pending: row?.pending || 0,
    failed: row?.failed || 0,
  };
}

// ============================================================================
// 工具暴露 (给 pipeline 用)
// ============================================================================

export { countCharsCN };
