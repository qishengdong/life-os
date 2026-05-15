/**
 * Brain Insights · 6 pattern types · grounded canonical schema
 *
 * 借鉴 Sivon "Linda 看见自己 v0 spec" (KB-DH 5/13):
 * pattern detection 必须 grounded — Inspector C30 硬约束 evidence_count >= 3.
 *
 * 没有 ≥3 证据的 insight 不入库, 不展示给用户.
 * "我看见你..." 类宽泛模糊 insight 是诊断不是观察, 不允许.
 */

export type PatternType =
  | 'topic_frequency'
  | 'temporal'
  | 'avoidance'
  | 'role_strain'
  | 'growth_marker'
  | 'relation_defensive';

export const PATTERN_TYPE_LABEL: Record<PatternType, string> = {
  topic_frequency: '反复出现的主题',
  temporal: '时间规律',
  avoidance: '你在回避的',
  role_strain: '角色张力',
  growth_marker: '成长信号',
  relation_defensive: '关系防御',
};

export const PATTERN_TYPE_HINT: Record<PatternType, string> = {
  topic_frequency:
    '某个人或话题在你最近的 pulse / decisions 里反复出现 — 频率本身就是 signal.',
  temporal:
    '你在某个时间段 (凌晨 / 周末 / 月初) 总写同一类内容. 时间是无意识的指针.',
  avoidance:
    '某个 topic 你每次靠近就转开. 不是你不想, 是身体先帮你跑了.',
  role_strain:
    '同时担当多重角色 (母亲 / 女儿 / 职业人 / 伴侣), 某两个开始打架.',
  growth_marker:
    '你说话的句式变了 — 从"我必须" 到 "我可以选择". 这是真东西, 不是错觉.',
  relation_defensive:
    '提到 X 时, 你永远先自责或先归罪自己. 这不是"懂事", 是熟悉的防御.',
};

export type InsightStatus =
  | 'unreviewed'
  | 'confirmed'
  | 'corrected'
  | 'archived'
  | 'rejected';

export interface Insight {
  id: number;
  userId: number;
  patternType: PatternType;
  title: string;
  description: string;
  evidencePulseIds: number[];
  evidenceDecisionIds: number[];
  evidenceOutcomeIds: number[];
  evidenceRmcIds: number[];
  evidenceCount: number;
  status: InsightStatus;
  userCorrection: string | null;
  confidence: number;
  detectedAt: number;
  reviewedAt: number | null;
  detectionRunId: number | null;
}

/** Inspector C30 grounded 硬约束: evidence_count 必须 >= 3 才入库. */
export const C30_MIN_EVIDENCE_COUNT = 3;

/** 单次 weekly detection run 元数据. */
export interface InsightRun {
  id: number;
  userId: number;
  weekStart: number;
  insightsGenerated: number;
  insightsPassedC30: number;
  pulsesSeen: number;
  decisionsSeen: number;
  tokensUsed: number | null;
  durationMs: number | null;
  error: string | null;
  createdAt: number;
}
