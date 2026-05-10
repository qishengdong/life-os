/**
 * Inspector 类型定义
 */

export type CheckCode =
  | 'C1' // 编自己做过的事 (Sivon: AI claims to have done X for user, never happened)
  | 'C2' // 编自己说过 (Sivon: AI claims to have said X before, never said)
  | 'C3' // 时间错乱 (今天/昨天/上周引用错误)
  | 'C5' // 表格客服腔 (机械列表 / "尊敬的用户")
  | 'C14' // commitment fabrication (用户问"你说要..." 必须能在 commitments 表查到)
  | 'C15'; // fact provenance (具体事实必须能在 RMC 找到 source)

export type Severity = 'low' | 'high' | 'p0';

export type Action = 'shadow' | 'flag' | 'block';

export interface CheckResult {
  code: CheckCode;
  severity: Severity;
  hit: boolean;
  matchedText?: string;
  detail?: string;
}

export interface InspectorReport {
  decisionId: number;
  userId: number;
  totalChecks: number;
  hits: CheckResult[];
  worstSeverity: Severity | null;
  recommendedAction: Action;
  createdAt: number;
}

export interface InspectorContext {
  userId: number;
  decisionId: number;
  userQuestion: string;
  aiResponse: string;
  userMemory: any; // UserMemoryContext, 但避免循环 import
  framework: string;
}
