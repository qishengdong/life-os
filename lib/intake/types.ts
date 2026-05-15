/**
 * Onboarding intake · 5 步建档定义
 *
 * 每步对应 intake_answers.step 字段值. 答案存 JSON.
 * Step 设计指向 JOB-003 Brain seed 生成 — 5 层 brain entries (core_state + RMC):
 *   identity     → core_state (家庭结构 / 生活方式硬锚)
 *   life-stage   → core_state + RMC factual
 *   values       → core_state (rigid_lines = boundary cards) + RMC factual (top_values)
 *   pressing     → RMC episodic + open_loops (待跟进决定)
 *   expectations → core_state (用户对 KEY 的期望边界)
 */

export type IntakeStep =
  | 'identity'
  | 'life-stage'
  | 'values'
  | 'pressing-decisions'
  | 'expectations';

export const INTAKE_STEPS: IntakeStep[] = [
  'identity',
  'life-stage',
  'values',
  'pressing-decisions',
  'expectations',
];

// ============================================================================
// 各步的答案结构 (storedAs JSON in intake_answers.answers)
// ============================================================================

export interface IdentityAnswers {
  ageRange: '30-35' | '35-40' | '40-45' | '45-50' | '50-55';
  gender: 'F' | 'M' | 'unspecified';
  cityTier: 'tier-1' | 'tier-2' | 'tier-3' | 'overseas';
  /** 80-200 字自述 — 你怎么 describe 自己给一个陌生但聪明的人 */
  selfDescription: string;
}

export interface LifeStageAnswers {
  career:
    | 'rising'
    | 'plateau'
    | 'transition'
    | 'pre-retirement'
    | 'self-employed';
  relationship:
    | 'single'
    | 'married-stable'
    | 'married-strained'
    | 'divorced'
    | 'remarried';
  children: 'none' | 'young' | 'school-age' | 'college' | 'adult';
  parents:
    | 'healthy'
    | 'aging-stable'
    | 'aging-needs-care'
    | 'deceased'
    | 'complicated';
}

export interface ValuesAnswers {
  /** 从 8 个 value 选 3 个 */
  topValues: Array<
    'autonomy' | 'family' | 'craft' | 'impact' | 'stability' | 'freedom' | 'depth' | 'connection'
  >;
  /** 1-3 条你绝对不会做的事 (硬边界, 转 boundary cards) */
  rigidLines: string[];
}

export interface PressingDecision {
  topic: string;
  framework:
    | 'parent-care'
    | 'child-education'
    | 'marriage'
    | 'career-transition'
    | 'migration'
    | 'crisis-restart'
    | 'general';
  urgency: 'this-month' | 'this-quarter' | 'this-year' | 'no-deadline';
}

export interface PressingDecisionsAnswers {
  decisions: PressingDecision[]; // 1-2 条
}

export interface ExpectationsAnswers {
  /** 用户想要什么 (多选) */
  wants: Array<
    'clarity' | 'accountability' | 'pattern-recognition' | '365-tracking' | 'thinking-partner'
  >;
  /** 用户不想要什么 (多选, 红线) */
  dontWants: Array<'cheerleading' | 'clinical' | 'patronizing' | 'urgent-push'>;
}

// ============================================================================
// 完整 intake 数据 (5 步合并)
// ============================================================================

export interface CompletedIntake {
  identity: IdentityAnswers;
  lifeStage: LifeStageAnswers;
  values: ValuesAnswers;
  pressing: PressingDecisionsAnswers;
  expectations: ExpectationsAnswers;
}

// ============================================================================
// Label maps · 给 UI / brain seed prompt 用
// ============================================================================

export const LABEL_AGE_RANGE: Record<IdentityAnswers['ageRange'], string> = {
  '30-35': '30-35 岁',
  '35-40': '35-40 岁',
  '40-45': '40-45 岁',
  '45-50': '45-50 岁',
  '50-55': '50-55 岁',
};

export const LABEL_CITY_TIER: Record<IdentityAnswers['cityTier'], string> = {
  'tier-1': '一线 (北上广深 / 港澳)',
  'tier-2': '新一线 / 二线',
  'tier-3': '三线及以下',
  'overseas': '海外',
};

export const LABEL_CAREER: Record<LifeStageAnswers['career'], string> = {
  rising: '上升期',
  plateau: '平台期 / 卡住',
  transition: '正在转型',
  'pre-retirement': '近退休',
  'self-employed': '自雇 / 创业',
};

export const LABEL_RELATIONSHIP: Record<LifeStageAnswers['relationship'], string> = {
  single: '单身',
  'married-stable': '已婚 · 稳定',
  'married-strained': '已婚 · 紧张',
  divorced: '离异',
  remarried: '再婚',
};

export const LABEL_CHILDREN: Record<LifeStageAnswers['children'], string> = {
  none: '无子女',
  young: '学龄前 (0-6)',
  'school-age': '中小学 (7-15)',
  college: '高中 / 大学',
  adult: '成年',
};

export const LABEL_PARENTS: Record<LifeStageAnswers['parents'], string> = {
  healthy: '健在 · 健康',
  'aging-stable': '健在 · 衰老但稳定',
  'aging-needs-care': '需要照护',
  deceased: '已故 (一方或双方)',
  complicated: '关系复杂 / 联系少',
};

export const LABEL_VALUE: Record<ValuesAnswers['topValues'][number], string> = {
  autonomy: '自主 · 我的人生我做主',
  family: '家庭 · 至亲安好是底色',
  craft: '手艺 · 把一件事做精',
  impact: '影响 · 让世界因我不同',
  stability: '稳定 · 不折腾',
  freedom: '自由 · 想去就去',
  depth: '深度 · 少而精',
  connection: '联结 · 真朋友多于成就',
};

export const LABEL_FRAMEWORK: Record<PressingDecision['framework'], string> = {
  'parent-care': '父母养老',
  'child-education': '子女出路',
  marriage: '婚姻去留',
  'career-transition': '职业转身',
  migration: '迁移决策',
  'crisis-restart': '危机重启',
  general: '通用决策',
};

export const LABEL_URGENCY: Record<PressingDecision['urgency'], string> = {
  'this-month': '这个月内必须想清',
  'this-quarter': '这季度',
  'this-year': '今年',
  'no-deadline': '无明确期限',
};

export const LABEL_WANT: Record<ExpectationsAnswers['wants'][number], string> = {
  clarity: '看清结构, 不再原地打转',
  accountability: '有人 30 / 90 / 365 天后真回访我',
  'pattern-recognition': '识别我反复掉的坑',
  '365-tracking': '长期跟踪一年',
  'thinking-partner': '一个能聊深的伙伴',
};

export const LABEL_DONT_WANT: Record<ExpectationsAnswers['dontWants'][number], string> = {
  cheerleading: '加油 / 你已经很棒了',
  clinical: '诊断 / 给我贴标签',
  patronizing: '说教 / 居高临下',
  'urgent-push': '没事就来推消息催我',
};
