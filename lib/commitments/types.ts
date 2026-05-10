/**
 * Commitment 类型定义
 */

export type CommitmentKind =
  | 'follow_up'    // "下次跟我说" / "你跟老婆谈完后告诉我"
  | 'review'       // "30 天后我们再回看这个决策"
  | 'check_in'     // "我会在 X 天后主动问你"
  | 'reminder'     // "X 月 X 日提醒你"
  | 'unknown';     // 无法分类

export type CommitmentStatus =
  | 'pending'
  | 'fulfilled'
  | 'overdue'
  | 'cancelled'
  | 'superseded';

export interface Commitment {
  id: number;
  userId: number;
  commitmentText: string;
  commitmentKind: CommitmentKind;
  promisedAt: number;
  dueAt: number | null;
  duePhrase: string | null;
  sourceDecisionId: number | null;
  status: CommitmentStatus;
  fulfilledAt: number | null;
  apologyPushedAt: number | null;
  createdAt: number;
}

export interface ExtractedCommitment {
  text: string;
  kind: CommitmentKind;
  duePhrase: string | null;
  dueAt: number | null;       // 计算出的具体时间戳 (如能解析)
}
