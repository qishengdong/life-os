/**
 * Memory 操作的单一入口 (Sivon doctrine 1.2 5 件套之一)
 *
 * 任何代码访问用户 memory 必须经过这里 — 防止绕过检查、防跨用户污染。
 *
 * 严禁:
 *   - 直接 db.prepare('SELECT ... FROM relationship_memory_cards')
 *   - 在其他 module 写 raw SQL 读 memory 表
 * 必须:
 *   - import { fetchUserMemory } from '@/lib/memory'
 *   - 任何 helper 都加在本文件,不在 route.ts 写 SQL
 */

import { getDb, getUser } from '@/lib/db';
import type {
  CoreState,
  MemoryCard,
  OpenLoop,
  UserMemoryContext,
  CardType,
} from './types';

// ============================================================================
// 主入口: fetchUserMemory
// ============================================================================

export function fetchUserMemory(userId: number): UserMemoryContext {
  const db = getDb();

  const user = getUser(userId);
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // Layer 0: 硬锚点
  const coreState = (db
    .prepare(
      `SELECT id, kind, fact_text, violation_pattern, severity, status, source, created_at
       FROM user_core_state
       WHERE user_id = ? AND status = 'active'
       ORDER BY created_at ASC`
    )
    .all(userId) as any[]).map(rowToCore);

  // Layer 1: 5 类 RMC
  const factual = (db
    .prepare(
      `SELECT * FROM relationship_memory_cards
       WHERE user_id = ? AND card_type = 'factual' AND confidence >= 0.6
       ORDER BY confidence DESC, last_verified_at DESC
       LIMIT 30`
    )
    .all(userId) as any[]).map(rowToCard);

  const boundary = (db
    .prepare(
      `SELECT * FROM relationship_memory_cards
       WHERE user_id = ? AND card_type = 'boundary' AND confidence >= 0.7
       ORDER BY confidence DESC
       LIMIT 20`
    )
    .all(userId) as any[]).map(rowToCard);

  const episodic = (db
    .prepare(
      `SELECT * FROM relationship_memory_cards
       WHERE user_id = ? AND card_type = 'episodic'
       ORDER BY last_verified_at DESC
       LIMIT 15`
    )
    .all(userId) as any[]).map(rowToCard);

  const relational = (db
    .prepare(
      `SELECT * FROM relationship_memory_cards
       WHERE user_id = ? AND card_type = 'relational' AND confidence >= 0.7
       ORDER BY confidence DESC
       LIMIT 20`
    )
    .all(userId) as any[]).map(rowToCard);

  const psychSignal = (db
    .prepare(
      `SELECT * FROM relationship_memory_cards
       WHERE user_id = ? AND card_type = 'psych_signal' AND confidence >= 0.7
       ORDER BY last_verified_at DESC
       LIMIT 10`
    )
    .all(userId) as any[]).map(rowToCard);

  // Layer 2: open loops
  const openLoops = (db
    .prepare(
      `SELECT id, title, description, kind, status, due_at, created_at
       FROM relationship_open_loops
       WHERE user_id = ? AND status = 'open'
       ORDER BY created_at DESC
       LIMIT 20`
    )
    .all(userId) as any[]).map(rowToOpenLoop);

  // Layer 3: brain.md
  const brainRow = db
    .prepare(`SELECT content FROM user_brain WHERE user_id = ?`)
    .get(userId) as { content: string } | undefined;

  // Stats
  const totalCardsRow = db
    .prepare(`SELECT COUNT(*) as n FROM relationship_memory_cards WHERE user_id = ?`)
    .get(userId) as { n: number };
  const totalDecisionsRow = db
    .prepare(`SELECT COUNT(*) as n FROM decisions WHERE user_id = ?`)
    .get(userId) as { n: number };

  const accountAgeDays = Math.floor(
    (Date.now() / 1000 - user.created_at) / 86400
  );

  return {
    userId,
    userUid: user.user_uid,
    coreState,
    factual,
    boundary,
    episodic,
    relational,
    psychSignal,
    openLoops,
    brainContent: brainRow?.content ?? null,
    stats: {
      totalCards: totalCardsRow.n,
      totalDecisions: totalDecisionsRow.n,
      accountAgeDays,
    },
  };
}

// ============================================================================
// Memory mutations (写入)
// ============================================================================

export function addCoreState(args: {
  userId: number;
  kind: string;
  factText: string;
  violationPattern?: string;
  severity?: 'hard' | 'soft';
  source?: 'admin' | 'user_self' | 'llm_extract';
}): number {
  const db = getDb();
  // dedup by (user_id, kind, status='active')
  const existing = db
    .prepare(
      `SELECT id FROM user_core_state WHERE user_id = ? AND kind = ? AND status = 'active'`
    )
    .get(args.userId, args.kind) as { id: number } | undefined;

  if (existing) {
    db.prepare(
      `UPDATE user_core_state SET fact_text = ?, updated_at = unixepoch() WHERE id = ?`
    ).run(args.factText, existing.id);
    return existing.id;
  }

  const result = db
    .prepare(
      `INSERT INTO user_core_state (user_id, kind, fact_text, violation_pattern, severity, source)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      args.userId,
      args.kind,
      args.factText,
      args.violationPattern ?? null,
      args.severity ?? 'hard',
      args.source ?? 'llm_extract'
    );
  return result.lastInsertRowid as number;
}

export function addMemoryCard(args: {
  userId: number;
  cardType: CardType;
  title: string;
  content: string;
  confidence?: number;
  source?: string;
  sourceDecisionId?: number;
  tags?: string[];
}): number {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO relationship_memory_cards
       (user_id, card_type, title, content, confidence, source, source_decision_id, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      args.userId,
      args.cardType,
      args.title,
      args.content,
      args.confidence ?? 0.7,
      args.source ?? 'llm_extract',
      args.sourceDecisionId ?? null,
      args.tags ? JSON.stringify(args.tags) : null
    );
  return result.lastInsertRowid as number;
}

export function addOpenLoop(args: {
  userId: number;
  title: string;
  description?: string;
  kind?: string;
  dueAt?: number;
  sourceDecisionId?: number;
}): number {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO relationship_open_loops
       (user_id, title, description, kind, due_at, source_decision_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      args.userId,
      args.title,
      args.description ?? null,
      args.kind ?? null,
      args.dueAt ?? null,
      args.sourceDecisionId ?? null
    );
  return result.lastInsertRowid as number;
}

// ============================================================================
// Prompt 注入助手: 把 memory 转成 system prompt 文本
// ============================================================================

export function renderMemoryForPrompt(memory: UserMemoryContext): {
  hardAnchorsBlock: string; // 进 prompt 第 0 行
  contextBlock: string;     // 进 prompt 末尾
} {
  const parts: string[] = [];
  const contextParts: string[] = [];

  // ===== 第 0 行: 硬锚点 (永远 prepend) =====
  if (memory.coreState.length > 0) {
    parts.push('【关于你正在对话的这位用户的硬事实(永远成立,绝不能违反)】');
    for (const cs of memory.coreState) {
      parts.push(`- ${cs.factText}`);
    }
    parts.push('');
  }

  // 高置信 boundary 也 prepend (Sivon 5/10 fix)
  const highConfBoundaries = memory.boundary.filter((b) => b.confidence >= 0.85);
  if (highConfBoundaries.length > 0) {
    parts.push('【用户已表达过的硬边界】');
    for (const b of highConfBoundaries) {
      parts.push(`- ${b.title}: ${b.content}`);
    }
    parts.push('');
  }

  // ===== 末尾: context (factual / episodic / relational / psych_signal) =====
  if (memory.factual.length > 0) {
    contextParts.push('## 关于这位用户的已知事实');
    for (const c of memory.factual) {
      const conf = c.confidence < 0.85 ? ` (置信度 ${Math.round(c.confidence * 100)}%)` : '';
      contextParts.push(`- ${c.title}${conf}: ${c.content}`);
    }
    contextParts.push('');
  }

  if (memory.relational.length > 0) {
    contextParts.push('## 用户的关系网络与态度');
    for (const r of memory.relational) {
      contextParts.push(`- ${r.title}: ${r.content}`);
    }
    contextParts.push('');
  }

  if (memory.episodic.length > 0) {
    contextParts.push('## 最近的事件记忆 (用于自然引用,不要主动提)');
    for (const e of memory.episodic.slice(0, 8)) {
      contextParts.push(`- ${e.title}: ${e.content}`);
    }
    contextParts.push('');
  }

  if (memory.psychSignal.length > 0) {
    contextParts.push('## 心理信号 (用于敏感度调整,不要主动提)');
    for (const p of memory.psychSignal) {
      contextParts.push(`- ${p.title}: ${p.content}`);
    }
    contextParts.push('');
  }

  if (memory.openLoops.length > 0) {
    contextParts.push('## 待跟进事项 (用户之前提了但未解决)');
    for (const l of memory.openLoops.slice(0, 5)) {
      contextParts.push(`- ${l.title}${l.description ? ': ' + l.description : ''}`);
    }
    contextParts.push('');
  }

  return {
    hardAnchorsBlock: parts.join('\n'),
    contextBlock: contextParts.join('\n'),
  };
}

// ============================================================================
// Row → object mappers
// ============================================================================

function rowToCore(row: any): CoreState {
  return {
    id: row.id,
    kind: row.kind,
    factText: row.fact_text,
    violationPattern: row.violation_pattern,
    severity: row.severity,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
  };
}

function rowToCard(row: any): MemoryCard {
  let tags: string[] = [];
  if (row.tags) {
    try {
      tags = JSON.parse(row.tags);
    } catch {}
  }
  return {
    id: row.id,
    cardType: row.card_type,
    title: row.title,
    content: row.content,
    confidence: row.confidence,
    source: row.source,
    sourceDecisionId: row.source_decision_id,
    tags,
    lastVerifiedAt: row.last_verified_at,
    createdAt: row.created_at,
  };
}

function rowToOpenLoop(row: any): OpenLoop {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    kind: row.kind,
    status: row.status,
    dueAt: row.due_at,
    createdAt: row.created_at,
  };
}
