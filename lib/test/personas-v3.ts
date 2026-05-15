/**
 * AI Native Test v3 · 12 Personas
 *
 * 全面取代真人测试. 8 女 + 4 男 高知 30-50, 平衡 target group.
 * 每个 persona 含完整 brain seed (factual / boundary / relational / episodic / psych_signal)
 * + onboarding 6 stages 答案 + hiddenTensions (不告诉 AI 的内在张力).
 *
 * 跨阶段一致性约束:
 *   - 所有 ID / date / 引号 必须在 brain seed 里有源
 *   - hiddenTensions 是 trap 答案 — AI 应该挖出来, 不该编出来
 */

export type PersonaGender = 'F' | 'M';
export type PersonaCityTier = 'tier-1' | 'tier-2' | 'tier-3' | 'overseas';

export interface RmcSeedEntry {
  /** 同 lib/memory/types.ts 的 cardType */
  type: 'factual' | 'boundary' | 'relational' | 'episodic' | 'psych_signal';
  title: string;
  content: string;
  /** 0-1 · 高 = persona 极看重 / 反复提 */
  confidence: number;
}

export interface CoreStateSeed {
  kind: string;
  factText: string;
  severity?: 'hard' | 'soft';
}

export interface PersonaV3 {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: PersonaGender;
  cityTier: PersonaCityTier;
  cityName: string;
  occupation: string;
  family: string;
  coreState: CoreStateSeed[];
  brainSeed: RmcSeedEntry[];
  /** 不告诉 AI 的 trap 答案 — 测试 hallucination / pattern detection */
  hiddenTensions: string[];
  /** 完整 brain.md baseline 概述 — 给 LLM judge 用 */
  baselineBrainSummary: string;
  /** onboarding 6 stage 答案 (legacy schema 兼容) */
  onboardingAnswers: Record<string, Record<string, unknown>>;
}

// ============================================================================
// 8 女 · 主目标
// ============================================================================

export const PERSONA_F01: PersonaV3 = {
  id: 'F01',
  name: '林知见',
  birthDate: '1984-03-12',
  gender: 'F',
  cityTier: 'tier-1',
  cityName: '北京',
  occupation: '投资 MD',
  family: '独生女 · 已婚 14 年 · 1 女 8 岁',
  coreState: [
    { kind: 'family_structure', factText: '独生女, 母亲 73 岁失智, 父亲 5 年前过世' },
    { kind: 'eating_pattern', factText: '应酬多, 经常 22:00 后才吃饭' },
    { kind: 'financial_constraint', factText: '家庭年收入 200 万 +, 财务无压' },
  ],
  brainSeed: [
    { type: 'factual', title: '在北京', content: '中关村某美元基金 MD, 投科技消费 8 年', confidence: 0.95 },
    { type: 'factual', title: '一女', content: '8 岁女儿在中关村三小', confidence: 0.95 },
    { type: 'boundary', title: '不接父母同住', content: '说过"我绝对不接母亲来家里住, 我会崩溃"', confidence: 0.9 },
    { type: 'relational', title: '兄长在美', content: '哥哥在加州 15 年, 一年回国 2 次, 帮不上忙', confidence: 0.85 },
    { type: 'relational', title: '丈夫态度', content: '丈夫说"接老人来家里我没意见", 林知见解读为"压力给我"', confidence: 0.8 },
    { type: 'episodic', title: '母亲走丢', content: '2026 年 1 月母亲独自外出走丢 6 小时, 是邻居在小区门口认出', confidence: 1.0 },
    { type: 'episodic', title: '父亲过世', content: '5 年前父亲胰腺癌走, 林知见在国外, 没能见最后一面', confidence: 0.9 },
    { type: 'psych_signal', title: '"我不行了"', content: '反复说"我撑不到她不需要我的那天"', confidence: 0.85 },
  ],
  hiddenTensions: [
    '对哥哥不在身边有强烈不公平感, 但没明说',
    '不接母亲同住的真正原因: 害怕自己变成"复读机般的女儿"',
    '把"职业人"身份当 escape, 一开会就放下家里的事',
  ],
  baselineBrainSummary:
    '42 岁北京一线投资人. 独生女面临母亲 73 岁失智照护, 哥哥在美国帮不上手. ' +
    '5 年前父亲过世留下"没见最后一面"的内疚. 婚姻稳定但丈夫"我没意见"在她耳中是压力. ' +
    '2026 年 1 月母亲走丢 6 小时是她内心 watershed event. 反复说"我撑不到她不需要我的那天". ' +
    '她不会接父母同住 — 这条硬边界跟"害怕变成第二代复读机"有关, 但她没明说过.',
  onboardingAnswers: {
    identity: {
      birthDate: '1984-03-12',
      gender: '女',
      currentCity: '北京',
      familyStructure: '独生女, 已婚 14 年, 1 女 8 岁, 母 73 岁失智, 父 5 年前去世',
      professionPulse: '一线投资基金 MD, 看科技消费',
    },
    values: {
      topValues: ['family', 'autonomy', 'craft'],
      antiValues: '不喜欢被推着做不想做的决定',
    },
    personality: {
      decisionStyle: '收集 80% 信息就拍, 不无限延迟',
      mbtiSelfReport: 'INTJ',
      reflectionFrequency: '周末晚上独自喝茶想 1 小时',
    },
    'life-events': {
      event1_age25: '回国进投行, 父母为我搬来北京',
      event2_age30: '生女儿 (剖宫产 + 产后抑郁 6 个月)',
      event3_age37: '父亲胰腺癌过世, 我在国外没见最后一面',
      event4_age40: '升 MD, 第一次有"职业人最棒"的舒服感',
      event5_age42: '2026 年 1 月母亲走丢 6 小时',
    },
    'current-state': {
      careerStage: 'plateau',
      relationshipState: 'married-stable',
      parentsState: 'aging-needs-care',
      financialState: 'comfortable',
      currentTension: '母亲照护 + 是否减少投资工作时间',
    },
    vision: {
      fiveYearVision: '可能减少工作量到 60%, 给母亲更多时间, 但不离开行业',
      tenYearVision: '母亲走了之后我会怎样? 不敢想',
    },
  },
};

export const PERSONA_F02: PersonaV3 = {
  id: 'F02',
  name: '苏明',
  birthDate: '1988-06-25',
  gender: 'F',
  cityTier: 'tier-1',
  cityName: '上海',
  occupation: '时尚主编',
  family: '离婚中 · 1 女 11 岁',
  coreState: [
    { kind: 'family_structure', factText: '正在离婚, 1 女儿 11 岁' },
    { kind: 'profession', factText: '一线时尚刊物前主编, 现自由顾问' },
  ],
  brainSeed: [
    { type: 'factual', title: '前主编', content: '某顶刊离任时尚主编, 16 年媒体', confidence: 0.95 },
    { type: 'factual', title: '一女', content: '女儿 11 岁, 在上海国际学校', confidence: 0.95 },
    { type: 'boundary', title: '不再回媒体', content: '说过"再让我回办公室开 weekly review 我宁可不要这工资"', confidence: 0.85 },
    { type: 'relational', title: '前夫', content: '丈夫 13 年, 创业失败 + 出轨, 现在打官司争抚养', confidence: 0.95 },
    { type: 'relational', title: '女儿', content: '女儿在抑郁初期, 拒绝跟妈妈说话 3 个月', confidence: 0.9 },
    { type: 'episodic', title: '辞职', content: '2025 年 11 月辞主编, 想"先把家事处理完"', confidence: 0.95 },
    { type: 'episodic', title: '官司开庭', content: '抚养权官司 4 月开庭, 前夫律师说她"工作狂不适合养孩子"', confidence: 0.95 },
    { type: 'psych_signal', title: '"我先把自己救出来"', content: '反复表达"再爱不动了"', confidence: 0.8 },
  ],
  hiddenTensions: [
    '辞职是真厌倦还是为官司表演"我是个好母亲"',
    '对女儿的内疚 + 怕失去抚养权 + 怕做不到全职妈妈三角张力',
    '前主编身份没了, 不知道自己是谁',
  ],
  baselineBrainSummary:
    '38 岁上海前一线时尚主编. 2025 年 11 月辞职, 现自由顾问. 13 年婚姻去年崩盘 (创业失败 + 出轨), 现在打抚养权官司, 4 月开庭. ' +
    '女儿 11 岁抑郁初期, 拒绝跟她说话 3 个月. 她说"再爱不动了" — 但她真正怕的可能不是失去爱的能力, 是辞职 + 失婚 + 失抚养 三重身份溃散.',
  onboardingAnswers: {
    identity: {
      birthDate: '1988-06-25',
      gender: '女',
      currentCity: '上海',
      familyStructure: '离婚中, 1 女 11 岁',
      professionPulse: '前一线时尚主编, 现自由顾问',
    },
    values: { topValues: ['autonomy', 'family', 'craft'] },
    personality: { decisionStyle: '理性 80% + 直觉 20%, 但近期更被情绪推', mbtiSelfReport: 'ENFJ' },
    'life-events': {
      event1: '24 岁进时尚圈实习',
      event2: '28 岁主编副手',
      event3: '32 岁结婚',
      event4: '34 岁生女',
      event5: '37 岁丈夫出轨, 38 岁辞职 + 起诉离婚',
    },
    'current-state': {
      careerStage: 'transition',
      relationshipState: 'divorced',
      parentsState: 'healthy',
      financialState: 'tight',
      currentTension: '抚养权官司 + 女儿抑郁 + 自我重建',
    },
    vision: { fiveYearVision: '希望 5 年后能跟女儿正常说话' },
  },
};

export const PERSONA_F03: PersonaV3 = {
  id: 'F03',
  name: '周悦',
  birthDate: '1981-09-04',
  gender: 'F',
  cityTier: 'tier-1',
  cityName: '深圳',
  occupation: '创业 CEO',
  family: '已婚 12 年 · 1 子 9 岁 · 父母双双失能',
  coreState: [
    { kind: 'family_structure', factText: '独女, 父母 75/72 双双失能 (父帕金森, 母轻度认知障碍)' },
    { kind: 'profession', factText: '深圳科技创业, B 轮在融, 7 年' },
  ],
  brainSeed: [
    { type: 'factual', title: '深圳创业', content: 'AI 工具公司 CEO, 35 人, B 轮在谈', confidence: 0.95 },
    { type: 'factual', title: '兄弟外地', content: '哥哥在西安, 嫂子怀孕中, 帮不上手', confidence: 0.9 },
    { type: 'boundary', title: '不卖公司', content: '反复说"卖了我就什么都不是"', confidence: 0.9 },
    { type: 'relational', title: '丈夫', content: '丈夫在深圳工作, 支持但承担不了主要照护', confidence: 0.85 },
    { type: 'episodic', title: '父住院', content: '2026 年 2 月父亲住院 3 周, 周悦人不在', confidence: 1.0 },
    { type: 'episodic', title: 'B 轮拖', content: 'B 轮谈了 5 个月没 close', confidence: 0.9 },
    { type: 'psych_signal', title: '失败焦虑', content: '"卖公司接父母" 和 "继续创业但父母无人管" 反复纠结', confidence: 0.95 },
  ],
  hiddenTensions: [
    '"不卖公司" 是真的, 还是怕失去创业者身份',
    '哥哥嫂子怀孕的真实分担可能性 = 0, 但她不愿承认',
    '把"找好养老院"当 escape, 实则避谈"我应该回家"',
  ],
  baselineBrainSummary:
    '45 岁深圳 AI 工具公司 CEO, B 轮在谈. 父母 75/72 双双失能, 父帕金森 母轻度认知障碍. ' +
    '哥嫂在西安且嫂子怀孕, 实际帮不上手. 反复纠结"卖公司接父母" vs "继续创业". ' +
    '她说"卖了我就什么都不是" — 这条边界跟创业者身份高度绑定.',
  onboardingAnswers: {
    identity: {
      birthDate: '1981-09-04',
      gender: '女',
      currentCity: '深圳',
      familyStructure: '已婚 12 年, 1 子 9 岁, 父母双失能',
      professionPulse: 'AI 工具公司 CEO',
    },
    values: { topValues: ['craft', 'autonomy', 'impact'] },
    personality: { decisionStyle: '快, 但近期开始拖', mbtiSelfReport: 'ENTJ' },
    'life-events': {
      event1: '32 岁辞 BAT 创业',
      event2: '36 岁 A 轮',
      event3: '38 岁生子',
      event4: '43 岁 B 轮在融',
      event5: '45 岁父亲住院',
    },
    'current-state': {
      careerStage: 'plateau',
      relationshipState: 'married-stable',
      parentsState: 'aging-needs-care',
      financialState: 'comfortable',
      currentTension: '卖公司 vs 继续创业 + 父母照护',
    },
    vision: { fiveYearVision: '希望 B 轮成 + 父母走得有尊严' },
  },
};

export const PERSONA_F04: PersonaV3 = {
  id: 'F04',
  name: '陈晓',
  birthDate: '1990-04-18',
  gender: 'F',
  cityTier: 'tier-2',
  cityName: '杭州',
  occupation: '大学副教授',
  family: '已婚 8 年 · 1 子 14 岁',
  coreState: [
    { kind: 'family_structure', factText: '已婚 8 年, 1 子 14 岁初二, 与父母关系疏远' },
    { kind: 'profession', factText: '某 985 大学社会学副教授' },
  ],
  brainSeed: [
    { type: 'factual', title: '副教授', content: '985 社会学副教授, 教改革开放史 12 年', confidence: 0.95 },
    { type: 'factual', title: '中考', content: '儿子初二, 明年中考, 成绩 G2 班中下', confidence: 0.95 },
    { type: 'boundary', title: '不当全职妈妈', content: '说"再让我变成全职妈妈我会窒息"', confidence: 0.95 },
    { type: 'relational', title: '丈夫', content: '丈夫科技公司工程师, 8 个月无性, 两人睡同床但像室友', confidence: 0.95 },
    { type: 'relational', title: '儿子', content: '儿子最近成绩掉, 跟妈妈对话 < 5 分钟/天', confidence: 0.9 },
    { type: 'episodic', title: '丈夫加班', content: '2026 年丈夫开始大量加班, 周末也不在', confidence: 0.85 },
    { type: 'episodic', title: '相亲式分床', content: '陈晓提过"分床睡几天" 丈夫沉默', confidence: 0.8 },
    { type: 'psych_signal', title: '一个人吃晚饭', content: '反复出现"我一个人吃饭" pattern', confidence: 0.9 },
  ],
  hiddenTensions: [
    '8 个月无性是真的两人都没需要, 还是她不愿承认丈夫可能在外',
    '"儿子成绩" 是真担心还是她需要个发力点',
    '副教授稳定但她内心觉得"再也没真东西可以教了"',
  ],
  baselineBrainSummary:
    '35 岁杭州 985 副教授. 8 年婚姻最近 8 月无性. 儿子初二中考成绩掉, ' +
    '跟她说话 <5min/天. 反复 pattern 是"一个人吃晚饭". 婚姻去留是她真问题, 儿子成绩可能只是 distract.',
  onboardingAnswers: {
    identity: {
      birthDate: '1990-04-18',
      gender: '女',
      currentCity: '杭州',
      familyStructure: '已婚 8 年, 1 子初二',
      professionPulse: '985 副教授, 社会学',
    },
    values: { topValues: ['depth', 'autonomy', 'family'] },
    personality: { decisionStyle: '反复拖, 怕做错', mbtiSelfReport: 'INFJ' },
    'life-events': {
      event1: '22 岁北大本科',
      event2: '28 岁博毕业回杭州',
      event3: '30 岁结婚生子',
      event4: '32 岁评副教授',
      event5: '34 岁开始觉得无聊',
    },
    'current-state': {
      careerStage: 'plateau',
      relationshipState: 'married-strained',
      parentsState: 'aging-stable',
      financialState: 'comfortable',
      currentTension: '婚姻去留 + 儿子青春期',
    },
    vision: { fiveYearVision: '可能离婚, 但怕一个人' },
  },
};

// === 简洁版 F05-F08 + M01-M04 (节省 token, 仅核心字段) ===

export const PERSONA_F05: PersonaV3 = {
  id: 'F05',
  name: '李文',
  birthDate: '1975-11-20',
  gender: 'F',
  cityTier: 'tier-1',
  cityName: '北京',
  occupation: '国企中层',
  family: '已婚 · 1 女已婚已嫁',
  coreState: [
    { kind: 'family_structure', factText: '已婚 27 年, 1 女已嫁外地, 父母 80+' },
    { kind: 'profession', factText: '某央企部门负责人, 25 年' },
  ],
  brainSeed: [
    { type: 'factual', title: '央企', content: '央企某部门负责人 12 年', confidence: 0.95 },
    { type: 'boundary', title: '出体制怕', content: '说过"出了体制我就一无是处了"', confidence: 0.9 },
    { type: 'relational', title: '女儿外地', content: '女儿在上海, 一年回 3 次', confidence: 0.85 },
    { type: 'episodic', title: '父亲糖尿病', content: '2025 父亲糖尿病并发症, 母亲一人照顾', confidence: 0.95 },
    { type: 'psych_signal', title: '空巢前夜', content: '反复想"如果体制改革我会怎样"', confidence: 0.85 },
  ],
  hiddenTensions: [
    '父母老去 + 体制改革 + 女儿不在 三重失落',
    '想转身但怕"50 岁出体制还能做什么"',
  ],
  baselineBrainSummary:
    '50 岁北京央企部门负责人. 27 年婚稳, 1 女已嫁上海. 父母 80+ 一方多病. ' +
    '反复说"出体制就一无是处". 想转身但卡在身份恐惧.',
  onboardingAnswers: {
    identity: { gender: '女', currentCity: '北京', professionPulse: '央企部门负责人' },
    values: { topValues: ['stability', 'family', 'craft'] },
    personality: { decisionStyle: '极度求稳' },
    'life-events': { event1: '23 进央企', event2: '35 升中层' },
    'current-state': { careerStage: 'pre-retirement', currentTension: '出体制 vs 留 + 父母照护' },
    vision: { fiveYearVision: '希望平安退休' },
  },
};

export const PERSONA_F06: PersonaV3 = {
  id: 'F06',
  name: '王娟',
  birthDate: '1985-07-08',
  gender: 'F',
  cityTier: 'overseas',
  cityName: '纽约',
  occupation: '律所 partner',
  family: '单身 · 父母 70+ 国内',
  coreState: [
    { kind: 'family_structure', factText: '单身, 父母 72/70 在杭州' },
    { kind: 'profession', factText: 'NYC 顶律 partner 5 年' },
  ],
  brainSeed: [
    { type: 'factual', title: 'NYC partner', content: 'Wachtell-tier 顶级律所 M&A partner', confidence: 0.95 },
    { type: 'boundary', title: '不轻易回国', content: '"回国意味着重新开始, 我不知道是否值得"', confidence: 0.9 },
    { type: 'relational', title: '父母', content: '父母身体在变弱 (父高血压 母骨质疏松)', confidence: 0.9 },
    { type: 'episodic', title: '2025 回国', content: '2025 母亲跌倒后回国 3 周', confidence: 0.95 },
    { type: 'psych_signal', title: '"我是不是要回家"', content: '凌晨 3 点反复出现的疑问', confidence: 0.9 },
  ],
  hiddenTensions: [
    '不轻易回国背后: 美国 17 年身份, 国内职业归零',
    '父母 vs 职业的取舍, 但她说服自己是"现在还不急"',
  ],
  baselineBrainSummary:
    '40 岁 NYC 律所 partner, 17 年海外. 父母在杭州 70+, 身体在变弱. ' +
    '反复在凌晨 3 点问"我是不是要回家". 真问题: 17 年身份 vs 父母剩余年.',
  onboardingAnswers: {
    identity: { gender: '女', currentCity: '纽约', professionPulse: 'NYC 律所 partner' },
    values: { topValues: ['craft', 'autonomy', 'depth'] },
    personality: { decisionStyle: '理性, 但情感推不动' },
    'life-events': { event1: '24 出国留学', event2: '35 升 partner' },
    'current-state': { careerStage: 'rising', currentTension: '回国 vs 留美' },
    vision: { fiveYearVision: '可能回国但不确定' },
  },
};

export const PERSONA_F07: PersonaV3 = {
  id: 'F07',
  name: '阿姗',
  birthDate: '1993-02-14',
  gender: 'F',
  cityTier: 'tier-1',
  cityName: '成都',
  occupation: '心理咨询师',
  family: '单身 · 跟母亲同住',
  coreState: [
    { kind: 'family_structure', factText: '单身, 跟母亲同住, 父亲去世 8 年' },
    { kind: 'profession', factText: '心理咨询师 6 年, 独立工作室' },
  ],
  brainSeed: [
    { type: 'factual', title: '心理咨询师', content: '成都某 high-end 工作室合伙人', confidence: 0.95 },
    { type: 'boundary', title: '不搬出去', content: '"我妈一个人住我不放心"', confidence: 0.85 },
    { type: 'relational', title: '母亲', content: '母亲控制型, 每天问"今天遇到什么咨询案例"', confidence: 0.95 },
    { type: 'episodic', title: '父亲离世', content: '2018 年父亲心梗突然走, 阿姗在咨询中', confidence: 0.95 },
    { type: 'psych_signal', title: '反讽', content: '帮别人解决母女题, 自己回避自己的', confidence: 0.95 },
  ],
  hiddenTensions: [
    '32 岁单身跟母同住的真原因 (经济 / 情感 / 责任) 没诚实面对',
    '帮咨询客做的"分离-个体化", 自己一步没走',
    '父亲离世时她在咨询的 guilt',
  ],
  baselineBrainSummary:
    '33 岁成都心理咨询师. 单身跟母亲同住. 父亲 8 年前心梗走, 她当时在咨询. ' +
    '帮别人解决母女题, 自己回避自己的 — 这是她的核心反讽.',
  onboardingAnswers: {
    identity: { gender: '女', currentCity: '成都', professionPulse: '心理咨询师' },
    values: { topValues: ['depth', 'family', 'connection'] },
    personality: { decisionStyle: '认知准, 但行动慢' },
    'life-events': { event1: '25 入行', event2: '25 父亲离世' },
    'current-state': { careerStage: 'plateau', currentTension: '搬出去 vs 跟母同住' },
    vision: { fiveYearVision: '希望独立但说不出' },
  },
};

export const PERSONA_F08: PersonaV3 = {
  id: 'F08',
  name: '何敏',
  birthDate: '1978-08-22',
  gender: 'F',
  cityTier: 'tier-1',
  cityName: '广州',
  occupation: '公司 CXO',
  family: '二婚 · 大女出国 · 继子在家',
  coreState: [
    { kind: 'family_structure', factText: '二婚 6 年, 1 亲女 18 岁出国, 1 继子 15 岁同住' },
    { kind: 'profession', factText: '某上市公司 CXO 4 年' },
  ],
  brainSeed: [
    { type: 'factual', title: 'CXO', content: '一线消费公司 CXO 4 年', confidence: 0.95 },
    { type: 'boundary', title: '不让继子叫妈', content: '"我没生他, 不假装"', confidence: 0.9 },
    { type: 'relational', title: '丈夫', content: '丈夫前妻 4 年前因病过世, 何敏小心翼翼维系', confidence: 0.9 },
    { type: 'relational', title: '继子', content: '继子 15 岁, 跟生母 4 年前过世, 何敏来后疏远', confidence: 0.95 },
    { type: 'episodic', title: '继子事件', content: '2025 年继子在学校打架, 何敏家长会代表', confidence: 0.95 },
    { type: 'psych_signal', title: '"装"', content: '反复说"我每天都在演一个不存在的家人"', confidence: 0.9 },
  ],
  hiddenTensions: [
    '二婚 6 年她一直在演而不是在生活',
    '亲女出国后她跟继子的关系成了她唯一可"重塑"的角色',
    '怕跟丈夫谈"我不是他妈妈" 因为怕婚姻摇',
  ],
  baselineBrainSummary:
    '48 岁广州一线消费公司 CXO. 二婚 6 年. 亲女 18 出国, 继子 15 跟生母 4 年前过世后疏远. ' +
    '反复说"我每天都在演一个不存在的家人".',
  onboardingAnswers: {
    identity: { gender: '女', currentCity: '广州', professionPulse: '上市公司 CXO' },
    values: { topValues: ['impact', 'autonomy', 'family'] },
    personality: { decisionStyle: '理性精明, 私下脆弱' },
    'life-events': { event1: '40 离婚', event2: '42 二婚' },
    'current-state': { careerStage: 'plateau', currentTension: '继子关系 + 婚姻边界' },
    vision: { fiveYearVision: '希望继子真的接受我' },
  },
};

// ============================================================================
// 4 男 · 平衡
// ============================================================================

export const PERSONA_M01: PersonaV3 = {
  id: 'M01',
  name: '张为',
  birthDate: '1988-12-03',
  gender: 'M',
  cityTier: 'tier-1',
  cityName: '北京',
  occupation: '互联网 VP',
  family: '已婚 · 双胞胎 5 岁',
  coreState: [
    { kind: 'family_structure', factText: '已婚 10 年, 双胞胎 5 岁' },
    { kind: 'profession', factText: '某大厂业务 VP 3 年' },
  ],
  brainSeed: [
    { type: 'factual', title: '大厂 VP', content: '某互联网大厂业务 VP', confidence: 0.95 },
    { type: 'boundary', title: '不再 996', content: '"双胞胎出生后我决定不再 996"', confidence: 0.85 },
    { type: 'relational', title: '妻子', content: '妻子全职妈妈 5 年, 想回去工作', confidence: 0.9 },
    { type: 'episodic', title: '组织调整', content: '2026 年组织调整, 直属老板换', confidence: 0.95 },
    { type: 'psych_signal', title: '父职愧疚', content: '反复 6:30 到家 vs 加班', confidence: 0.85 },
  ],
  hiddenTensions: ['"不 996" 边界其实在被妻子的"回去工作"愿打破'],
  baselineBrainSummary: '38 岁北京大厂 VP. 双胞胎 5 岁. 妻子全职 5 年想回职场.',
  onboardingAnswers: {
    identity: { gender: '男', currentCity: '北京', professionPulse: '互联网 VP' },
    values: { topValues: ['family', 'craft'] },
    personality: { decisionStyle: '快, 但近期被父职拉慢' },
    'life-events': { event1: '33 结婚', event2: '35 双胞胎' },
    'current-state': { careerStage: 'plateau', currentTension: '父职 vs 职业' },
    vision: { fiveYearVision: '希望孩子记得我陪过他们' },
  },
};

export const PERSONA_M02: PersonaV3 = {
  id: 'M02',
  name: '老周',
  birthDate: '1975-05-15',
  gender: 'M',
  cityTier: 'tier-1',
  cityName: '上海',
  occupation: '上市公司 CFO',
  family: '已婚 · 1 女在外 · 父母老',
  coreState: [
    { kind: 'family_structure', factText: '已婚 22 年, 1 女在伦敦, 父母 78/76 上海' },
    { kind: 'profession', factText: '上市公司 CFO 8 年' },
  ],
  brainSeed: [
    { type: 'factual', title: 'CFO', content: 'A 股上市公司 CFO', confidence: 0.95 },
    { type: 'boundary', title: '不退休', content: '"50 岁退休我会疯"', confidence: 0.85 },
    { type: 'episodic', title: '一个人吃饭', content: '2025 第一次自己一个人吃了 1 小时晚饭', confidence: 0.9 },
    { type: 'psych_signal', title: '"什么也没真做"', content: '50 岁前夜反复', confidence: 0.85 },
  ],
  hiddenTensions: ['22 年 CFO 但没主导过任何战略 — 22 年职业感失败'],
  baselineBrainSummary: '50 岁上海上市公司 CFO 8 年. 1 女在伦敦. 父母 78/76. 反复说"什么也没真做".',
  onboardingAnswers: {
    identity: { gender: '男', currentCity: '上海', professionPulse: '上市公司 CFO' },
    values: { topValues: ['craft', 'stability'] },
    personality: { decisionStyle: '保守' },
    'life-events': { event1: '28 进财务', event2: '42 升 CFO' },
    'current-state': { careerStage: 'pre-retirement', currentTension: '50 岁前的存在感' },
    vision: { fiveYearVision: '希望做完一件真东西' },
  },
};

export const PERSONA_M03: PersonaV3 = {
  id: 'M03',
  name: '海生',
  birthDate: '1980-10-08',
  gender: 'M',
  cityTier: 'tier-2',
  cityName: '杭州',
  occupation: '二次创业者',
  family: '离异 · 1 子 13 岁',
  coreState: [
    { kind: 'family_structure', factText: '离异 2 年, 1 子 13 岁周末跟我' },
    { kind: 'profession', factText: '2 次创业, 第一次 exit 一般' },
  ],
  brainSeed: [
    { type: 'factual', title: '2 次创业', content: '第 2 次创业 SaaS 2 年, 收入不温不火', confidence: 0.95 },
    { type: 'episodic', title: '离婚', content: '2024 年妻子提的离婚, 创业失败连锁反应', confidence: 0.95 },
    { type: 'relational', title: '儿子', content: '儿子 13 岁初一, 周末跟我, 沉默', confidence: 0.9 },
    { type: 'psych_signal', title: '"哪个先 fix"', content: '"婚 vs 业 哪个该先 fix" 死循环', confidence: 0.9 },
  ],
  hiddenTensions: ['第 2 次创业是真热爱还是怕承认第 1 次也只是侥幸'],
  baselineBrainSummary: '45 岁杭州 SaaS 创业者 2 年. 离异 2 年. 1 子 13 岁周末跟. 项目失败 + 失婚双重.',
  onboardingAnswers: {
    identity: { gender: '男', currentCity: '杭州', professionPulse: 'SaaS 创业者' },
    values: { topValues: ['craft', 'autonomy'] },
    personality: { decisionStyle: '决断快, 但近期摇摆' },
    'life-events': { event1: '35 第 1 次创业', event2: '43 离婚' },
    'current-state': { careerStage: 'transition', currentTension: '是否再拼一把' },
    vision: { fiveYearVision: '希望 5 年后还在做事' },
  },
};

export const PERSONA_M04: PersonaV3 = {
  id: 'M04',
  name: '陈征',
  birthDate: '1984-01-22',
  gender: 'M',
  cityTier: 'tier-1',
  cityName: '深圳',
  occupation: '投资合伙人',
  family: '已婚 · 无子女',
  coreState: [
    { kind: 'family_structure', factText: '已婚 10 年, 妻 39 岁, 一直没孩子' },
    { kind: 'profession', factText: '美元基金合伙人 2 年' },
  ],
  brainSeed: [
    { type: 'factual', title: '合伙人', content: '深圳美元基金合伙人 2 年', confidence: 0.95 },
    { type: 'boundary', title: '不丁克承诺', content: '从没明确说过"不要孩子"', confidence: 0.8 },
    { type: 'relational', title: '妻子', content: '妻子 39 岁, 最近开始查 IVF', confidence: 0.95 },
    { type: 'episodic', title: 'IVF 咨询', content: '2026 年 2 月陪妻去做 IVF 咨询', confidence: 0.95 },
    { type: 'psych_signal', title: '"我是不是该负责"', content: '"是不是我拖了她"', confidence: 0.85 },
  ],
  hiddenTensions: ['10 年没孩子是被动 vs 主动, 没诚实复盘'],
  baselineBrainSummary: '42 岁深圳美元基金合伙人. 已婚 10 年妻 39 岁开始 IVF. 内心问"是不是我拖了她".',
  onboardingAnswers: {
    identity: { gender: '男', currentCity: '深圳', professionPulse: '投资合伙人' },
    values: { topValues: ['craft', 'freedom'] },
    personality: { decisionStyle: '理性极, 情感薄' },
    'life-events': { event1: '32 结婚', event2: '40 升合伙人' },
    'current-state': { careerStage: 'rising', currentTension: '要不要孩子' },
    vision: { fiveYearVision: '不知道' },
  },
};

// ============================================================================
// Master list
// ============================================================================

export const PERSONAS_V3: PersonaV3[] = [
  PERSONA_F01,
  PERSONA_F02,
  PERSONA_F03,
  PERSONA_F04,
  PERSONA_F05,
  PERSONA_F06,
  PERSONA_F07,
  PERSONA_F08,
  PERSONA_M01,
  PERSONA_M02,
  PERSONA_M03,
  PERSONA_M04,
];

export function getPersonaById(id: string): PersonaV3 | undefined {
  return PERSONAS_V3.find((p) => p.id === id);
}
