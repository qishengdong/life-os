/**
 * Daily Pulse 存取层
 */

import { getDb } from '@/lib/db';
import type { PulseQuestionId, PulseTag } from './schema';

export interface PulseRecord {
  id: number;
  userId: number;
  questionId: PulseQuestionId;
  content: string;
  tags: PulseTag[];
  aiResponse: string | null;
  rmcEpisodicId: number | null;
  createdAt: number;
}

export async function addPulse(args: {
  userId: number;
  questionId: PulseQuestionId;
  content: string;
  tags?: PulseTag[];
  aiResponse?: string | null;
  rmcEpisodicId?: number | null;
}): Promise<number> {
  const db = await getDb();
  const result = await db
    .prepare(
      `INSERT INTO daily_pulses (user_id, question_id, content, tags, ai_response, rmc_episodic_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      args.userId,
      args.questionId,
      args.content,
      args.tags ? JSON.stringify(args.tags) : null,
      args.aiResponse ?? null,
      args.rmcEpisodicId ?? null
    );
  return result.lastInsertRowid as number;
}

export async function getUserPulses(userId: number, limit = 50): Promise<PulseRecord[]> {
  const db = await getDb();
  const rows = (await db
    .prepare(
      `SELECT id, user_id, question_id, content, tags, ai_response, rmc_episodic_id, created_at
       FROM daily_pulses
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .all(userId, limit)) as any[];
  return rows.map(rowToPulse);
}

export async function getUserPulseCount(userId: number): Promise<number> {
  const db = await getDb();
  const row = (await db
    .prepare(`SELECT COUNT(*) as n FROM daily_pulses WHERE user_id = ?`)
    .get(userId)) as { n: number };
  return row.n;
}

export async function getThisWeekPulseCount(userId: number): Promise<number> {
  const db = await getDb();
  // 过去 7 天
  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 86400;
  const row = (await db
    .prepare(`SELECT COUNT(*) as n FROM daily_pulses WHERE user_id = ? AND created_at >= ?`)
    .get(userId, sevenDaysAgo)) as { n: number };
  return row.n;
}

export async function getTodayPulseCount(userId: number): Promise<number> {
  const db = await getDb();
  // 今天本地零点
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
  const row = (await db
    .prepare(`SELECT COUNT(*) as n FROM daily_pulses WHERE user_id = ? AND created_at >= ?`)
    .get(userId, todayStart)) as { n: number };
  return row.n;
}

/**
 * 拉过去 N 天的 Pulse, 按 tag 分组 — 用于 Weekly Review pattern detection
 */
export async function getPulsesGroupedByTag(
  userId: number,
  daysAgo: number = 7
): Promise<Record<PulseTag, PulseRecord[]>> {
  const db = await getDb();
  const since = Math.floor(Date.now() / 1000) - daysAgo * 86400;
  const rows = (await db
    .prepare(
      `SELECT id, user_id, question_id, content, tags, ai_response, rmc_episodic_id, created_at
       FROM daily_pulses
       WHERE user_id = ? AND created_at >= ?
       ORDER BY created_at DESC`
    )
    .all(userId, since)) as any[];

  const grouped: Record<string, PulseRecord[]> = {};
  for (const row of rows) {
    const pulse = rowToPulse(row);
    for (const tag of pulse.tags) {
      if (!grouped[tag]) grouped[tag] = [];
      grouped[tag].push(pulse);
    }
  }
  return grouped as Record<PulseTag, PulseRecord[]>;
}

function rowToPulse(row: any): PulseRecord {
  let tags: PulseTag[] = [];
  if (row.tags) {
    try { tags = JSON.parse(row.tags); } catch {}
  }
  return {
    id: row.id,
    userId: row.user_id,
    questionId: row.question_id,
    content: row.content,
    tags,
    aiResponse: row.ai_response,
    rmcEpisodicId: row.rmc_episodic_id,
    createdAt: row.created_at,
  };
}

// ============================================================================
// pulse_turns · 续聊 (5/18 ship)
// turn 0 = user 原话 (daily_pulses.content) · turn 1 = KEY 首回应 (daily_pulses.ai_response)
// turn ≥ 2 = 用户续问 + KEY 续答 (本表)
// ============================================================================

export interface PulseTurn {
  id: number;
  pulseId: number;
  turnNumber: number;
  role: 'user' | 'ai';
  content: string;
  createdAt: number;
}

/** 拿某 pulse 的所有 turn (≥2). */
export async function getPulseTurns(pulseId: number): Promise<PulseTurn[]> {
  const db = await getDb();
  const rows = (await db
    .prepare(
      `SELECT id, pulse_id, turn_number, role, content, created_at
       FROM pulse_turns WHERE pulse_id = ? ORDER BY turn_number ASC`,
    )
    .all(pulseId)) as any[];
  return rows.map((r) => ({
    id: r.id,
    pulseId: r.pulse_id,
    turnNumber: r.turn_number,
    role: r.role,
    content: r.content,
    createdAt: r.created_at,
  }));
}

/** 追加一个 turn · 自动计算下一个 turn_number. */
export async function addPulseTurn(args: {
  pulseId: number;
  role: 'user' | 'ai';
  content: string;
}): Promise<{ id: number; turnNumber: number }> {
  const db = await getDb();
  // 当前最大 turn_number · daily_pulses 的 user+ai 占 0 + 1, 所以 default 1
  const row = (await db
    .prepare(`SELECT MAX(turn_number) as maxn FROM pulse_turns WHERE pulse_id = ?`)
    .get(args.pulseId)) as { maxn: number | null } | undefined;
  const nextTurn = (row?.maxn ?? 1) + 1;
  const result = await db
    .prepare(
      `INSERT INTO pulse_turns (pulse_id, turn_number, role, content) VALUES (?, ?, ?, ?)`,
    )
    .run(args.pulseId, nextTurn, args.role, args.content);
  return { id: Number(result.lastInsertRowid), turnNumber: nextTurn };
}

/** 验证某 pulse 是否属于这个 user (跨用户访问防御). */
export async function pulseBelongsToUser(pulseId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  const row = (await db
    .prepare(`SELECT user_id FROM daily_pulses WHERE id = ?`)
    .get(pulseId)) as { user_id: number } | undefined;
  return !!row && row.user_id === userId;
}
