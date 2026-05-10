/**
 * Onboarding 深度访谈 schema
 *
 * 真用户首日 30 分钟深度访谈, 出来就有完整核心档案.
 *
 * 设计逻辑:
 *   - 不让用户填 200 个表格 (反 doctrine)
 *   - 用结构化问题 + 自然语言展开
 *   - LLM 把答案抽成 user_core_state + RMC 卡 + brain.md baseline
 *
 * 阶段:
 *   1. 基础档案 (5 题, 1 分钟)
 *   2. 价值观 Schwartz (10 题, 5 分钟)
 *   3. 人格 - MBTI 简版 (8 题, 3 分钟)
 *   4. 人生关键事件 timeline (3-5 段叙事, 10 分钟)
 *   5. 当前状态 8 维度脉冲 (8 题, 5 分钟)
 *   6. 5/10/20 年愿景 (3 题, 5 分钟)
 *
 * 用户可以跳过任意阶段, 但不能跳过 1.
 */

export type StageId =
  | 'identity'
  | 'values'
  | 'personality'
  | 'life-events'
  | 'current-state'
  | 'vision';

export interface OnboardingStage {
  id: StageId;
  title: string;
  description: string;
  estimatedMinutes: number;
  questions: OnboardingQuestion[];
  required: boolean;
}

export type QuestionType =
  | 'text-short'    // 单行
  | 'text-long'     // 多行 (rich)
  | 'date'
  | 'select'        // 单选
  | 'multi-select'  // 多选
  | 'rank';         // 拖拽排序

export interface OnboardingQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  helper?: string;
  options?: string[];     // for select/multi-select/rank
  maxLength?: number;
  minLength?: number;
  required?: boolean;
}

export const STAGES: OnboardingStage[] = [
  // ===== Stage 1: 基础档案 =====
  {
    id: 'identity',
    title: '基础档案',
    description: '让我们先建立你的核心身份',
    estimatedMinutes: 1,
    required: true,
    questions: [
      {
        id: 'birthDate',
        type: 'date',
        prompt: '你的生日是?',
        required: true,
      },
      {
        id: 'gender',
        type: 'select',
        prompt: '你的性别认同是?',
        options: ['女', '男', '其他/不愿透露'],
        required: true,
      },
      {
        id: 'currentCity',
        type: 'text-short',
        prompt: '你目前主要在哪个城市生活?',
        helper: '城市决定了很多决策的语境 (房价/教育/医疗资源)',
        maxLength: 30,
        required: true,
      },
      {
        id: 'familyStructure',
        type: 'text-short',
        prompt: '一句话描述你的核心家庭结构',
        helper: '例:"已婚有 2 个孩子(8/5)/双方父母都健在" 或 "未婚, 父母离异跟父亲" 等',
        maxLength: 100,
        required: true,
      },
      {
        id: 'professionPulse',
        type: 'text-short',
        prompt: '一句话描述你目前的职业',
        helper: '例:"上海互联网大厂技术总监 12 年" 或 "全职妈妈 / 兼职做翻译"',
        maxLength: 100,
        required: true,
      },
    ],
  },

  // ===== Stage 2: 价值观 Schwartz =====
  {
    id: 'values',
    title: '价值观排序',
    description: '让 AI 知道你真正在意什么',
    estimatedMinutes: 5,
    required: false,
    questions: [
      {
        id: 'topValues',
        type: 'rank',
        prompt: '把以下价值观按对你**当前人生阶段**的重要程度排序 (拖动调整)',
        helper: 'Schwartz 普世价值理论的 10 大类. 没有"对错", 你的真实排序就是答案.',
        options: [
          '自由 (按自己意志生活)',
          '安全 (家庭+财务+健康稳定)',
          '成就 (世俗成功 / 影响力)',
          '关系 (深度亲密关系)',
          '成长 (持续学习 / 自我突破)',
          '享乐 (此刻的幸福感)',
          '权力 (控制他人 / 资源)',
          '传承 (家族 / 子女 / 遗产)',
          '意义 (helping others / 公益)',
          '探索 (新鲜 / 冒险)',
        ],
        required: true,
      },
      {
        id: 'whichValueChanged',
        type: 'text-long',
        prompt: '过去 5 年, 你内心最在意的价值观有变化吗? 怎么变?',
        helper: '例:"30 岁前最看重成就, 现在更看重关系和健康"',
        maxLength: 500,
      },
      {
        id: 'forbiddenValue',
        type: 'text-short',
        prompt: '你最反感 / 最不能接受别人怎么做?',
        helper: '反向价值观往往比正向更准. 例:"最讨厌强迫别人/装作很懂"',
        maxLength: 100,
      },
    ],
  },

  // ===== Stage 3: 人格 - MBTI 简版 =====
  {
    id: 'personality',
    title: '人格自识',
    description: '不是测试是引导你识别自己',
    estimatedMinutes: 3,
    required: false,
    questions: [
      {
        id: 'mbtiKnown',
        type: 'select',
        prompt: '你之前测过 MBTI 吗?',
        options: ['是, 我是 [类型]', '测过但不记得', '没测过'],
      },
      {
        id: 'mbtiType',
        type: 'text-short',
        prompt: '如果记得, 你是哪个类型? (4 个字母)',
        helper: '不记得就空着, 我们继续后面的问题',
        maxLength: 10,
      },
      {
        id: 'energySource',
        type: 'select',
        prompt: '一天高强度社交后, 你需要 ___ 才能恢复',
        options: ['1 小时独处就行 (E)', '半天独处 (中间)', '至少 1-2 天独处 (I)'],
      },
      {
        id: 'decisionStyle',
        type: 'select',
        prompt: '面对重大决策, 你更靠 ___',
        options: ['逻辑 + 数据 + 客观分析 (T)', '直觉 + 价值观 + 对人的影响 (F)', '都用 (中间)'],
      },
      {
        id: 'planningStyle',
        type: 'select',
        prompt: '面对开放性时间, 你更喜欢 ___',
        options: ['提前规划好每一步 (J)', '保持灵活随机应变 (P)', '都行 (中间)'],
      },
      {
        id: 'painPattern',
        type: 'text-long',
        prompt: '你的人生反复卡在同一种困境上吗? 描述一下',
        helper: '例:"我总是因为怕父母失望放弃自己的选择" / "每段感情我都在讨好对方"',
        maxLength: 500,
      },
    ],
  },

  // ===== Stage 4: 人生关键事件 timeline =====
  {
    id: 'life-events',
    title: '人生关键事件',
    description: '5 段叙事, AI 据此识别你的 pattern',
    estimatedMinutes: 10,
    required: false,
    questions: [
      {
        id: 'event1-childhood',
        type: 'text-long',
        prompt: '童年最重要的 1 件事 (positive or negative)',
        helper: '影响了你成年的某种行为模式',
        maxLength: 600,
      },
      {
        id: 'event2-parents',
        type: 'text-long',
        prompt: '跟父母的关系里, 最影响你的 1 件事',
        helper: '可以是冲突也可以是温暖时刻',
        maxLength: 600,
      },
      {
        id: 'event3-firstcareer',
        type: 'text-long',
        prompt: '职业第一次重大转折是什么?',
        helper: '入行 / 跳槽 / 失业 / 创业 等',
        maxLength: 600,
      },
      {
        id: 'event4-relationship',
        type: 'text-long',
        prompt: '亲密关系里塑造你最多的 1 段',
        helper: '不一定是浪漫, 也可以是深度友谊或导师关系',
        maxLength: 600,
      },
      {
        id: 'event5-recent',
        type: 'text-long',
        prompt: '最近 2 年最重要的 1 件事',
        helper: '当下决策的最近 context',
        maxLength: 600,
      },
    ],
  },

  // ===== Stage 5: 当前状态 8 维度脉冲 =====
  {
    id: 'current-state',
    title: '当前状态脉冲',
    description: '8 维度快速扫描你目前在哪',
    estimatedMinutes: 5,
    required: false,
    questions: [
      {
        id: 'pulse-career',
        type: 'select',
        prompt: '职业上, 你目前在?',
        options: ['顺风期 (有上升势)', '平台期 (稳定但停滞)', '下行期 (要换轨)', '空窗期 (无业 / 转型中)'],
      },
      {
        id: 'pulse-finance',
        type: 'select',
        prompt: '财务上?',
        options: ['宽裕 (现金流强)', '稳定 (够用不富)', '紧张 (现金流压力)', '危险 (债务 / 失业风险)'],
      },
      {
        id: 'pulse-marriage',
        type: 'select',
        prompt: '亲密关系?',
        options: ['充实 (有深度连接)', '舒适 (稳定但平淡)', '紧张 (冲突 / 距离)', '空 (单身 / 独居)'],
      },
      {
        id: 'pulse-children',
        type: 'select',
        prompt: '跟孩子的关系? (无孩子选最后)',
        options: ['正向 (有质量陪伴)', '一般 (在但有距离)', '紧张 (青春期 / 冲突)', '没孩子'],
      },
      {
        id: 'pulse-parents',
        type: 'select',
        prompt: '跟父母的关系?',
        options: ['深度连接', '功能性平和', '边界紧张 / 控制型', '父母已不在 / 切断联系'],
      },
      {
        id: 'pulse-health',
        type: 'select',
        prompt: '身体健康?',
        options: ['好', '一般 (有小问题)', '亮黄灯 (需调整)', '在病中 / 已确诊'],
      },
      {
        id: 'pulse-mental',
        type: 'select',
        prompt: '心理状态最近 1 个月?',
        options: ['平稳清醒', '有波动但能应对', '持续疲惫 / 焦虑', '已经撑不住'],
      },
      {
        id: 'pulse-meaning',
        type: 'select',
        prompt: '对人生的整体感觉?',
        options: ['有方向有意义', '在做该做的事, 但不确定意义', '迷茫 / 空心', '不想再讨论这个'],
      },
    ],
  },

  // ===== Stage 6: 5/10/20 年愿景 =====
  {
    id: 'vision',
    title: '5/10/20 年愿景',
    description: '不强求宏大, 只要诚实',
    estimatedMinutes: 5,
    required: false,
    questions: [
      {
        id: 'vision-5-year',
        type: 'text-long',
        prompt: '5 年后 (2031), 你最希望自己的生活长什么样?',
        helper: '具体一点, 例:"住成都, 每天 9 点起, 自由职业..."',
        maxLength: 400,
      },
      {
        id: 'vision-10-year',
        type: 'text-long',
        prompt: '10 年后 (2036)?',
        helper: '可以模糊但不要空',
        maxLength: 400,
      },
      {
        id: 'vision-deathbed',
        type: 'text-long',
        prompt: '想象你 80 岁回头看, 哪 1 件事不做你最后悔?',
        helper: '不需要"应该做"的事, 是"你心里真的想做"的事',
        maxLength: 400,
      },
    ],
  },
];

export interface OnboardingResponse {
  stage: StageId;
  answers: Record<string, any>;
  completedAt: number;
}
