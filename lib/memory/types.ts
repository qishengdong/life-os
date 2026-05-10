/**
 * Memory 类型定义
 * 对应 SQLite 表结构,但不直接 export DB 字段(隔离层)
 */

export type CardType =
  | 'factual'
  | 'boundary'
  | 'episodic'
  | 'relational'
  | 'psych_signal';

export interface CoreState {
  id: number;
  kind: string;
  factText: string;
  violationPattern: string | null;
  severity: 'hard' | 'soft';
  status: 'active' | 'deprecated' | 'user_overrode';
  source: 'admin' | 'user_self' | 'llm_extract';
  createdAt: number;
}

export interface MemoryCard {
  id: number;
  cardType: CardType;
  title: string;
  content: string;
  confidence: number;
  source: string;
  sourceDecisionId: number | null;
  tags: string[];
  lastVerifiedAt: number;
  createdAt: number;
}

export interface OpenLoop {
  id: number;
  title: string;
  description: string | null;
  kind: string | null;
  status: 'open' | 'resolved' | 'cancelled';
  dueAt: number | null;
  createdAt: number;
}

export interface UserMemoryContext {
  userId: number;
  userUid: string;
  // Layer 0: 永远 active 的硬锚点
  coreState: CoreState[];
  // Layer 1: 5 类卡按 type 分组
  factual: MemoryCard[];
  boundary: MemoryCard[]; // 高置信 boundary 也会出现在 prepend
  episodic: MemoryCard[]; // 限近期 N 条
  relational: MemoryCard[];
  psychSignal: MemoryCard[];
  // Layer 2: open loops
  openLoops: OpenLoop[];
  // Layer 3: brain.md content (per-user)
  brainContent: string | null;
  // Quick stats (用于 UI 展示)
  stats: {
    totalCards: number;
    totalDecisions: number;
    accountAgeDays: number;
  };
}
