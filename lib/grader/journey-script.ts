/**
 * Full Journey Script — 14 天单 persona 完整流程
 *
 * 这是最重要的集成测试. 真实用户用 14 天会发生什么:
 *   - Day 1 Onboarding 6 阶段
 *   - Day 1-7 每天 1 条 Pulse (Day 4 跳过, 模拟真实用户)
 *   - Day 7 第一次 Decision Deep Dive
 *   - Day 8-13 继续 Pulses, 含对 Day 7 决策的 follow-up
 *   - Day 14 第二次 Decision Deep Dive (跟 Day 7 关联)
 *
 * 验证目标:
 *   1. Pulse 写入 RMC episodic, brain.md 自动 consolidate
 *   2. Decision Deep Dive 时 AI 自然引用之前的 Pulse
 *   3. 第二次 Decision 时 AI 引用第一次 Decision 的内容
 *   4. brain.md 在 5 决策阈值后更新
 *   5. Framework router 正确路由
 *   6. Inspector shadow 不误报
 *   7. Self-Commitment 抽取工作
 */

import type { OnboardingResponse } from '@/lib/onboarding/schema';

export interface JourneyDay {
  day: number;
  action: 'onboarding' | 'pulse' | 'decision' | 'skip';
  // for onboarding
  onboarding?: OnboardingResponse[];
  // for pulse
  pulseQuestionId?: 'sinking' | 'avoidance' | 'drainage' | 'hidden-big' | 'body-signal';
  pulseContent?: string;
  // for decision
  decisionContent?: string;
  // 验证目标
  expectations: string[];
}

export interface JourneyPersona {
  id: string;
  scenario: string;
  birthDate: string;
  gender: 'female' | 'male' | 'other';
  days: JourneyDay[];
}

// 实测 persona: 42 岁独生女, 父母养老 + 婚姻 + 职业三线压力
export const JOURNEY_PERSONA: JourneyPersona = {
  id: 'journey-only-daughter-42',
  scenario: '42 岁独生女 — 父母养老 + 婚姻 + 职业 三线压力',
  birthDate: '1983-09-12',
  gender: 'female',
  days: [
    // ===== Day 1: Onboarding (基础档案 only — 模拟跳过深度) =====
    {
      day: 1,
      action: 'onboarding',
      onboarding: [
        {
          stage: 'identity',
          completedAt: Math.floor(Date.now() / 1000),
          answers: {
            birthDate: '1983-09-12',
            gender: '女',
            currentCity: '上海',
            familyStructure: '已婚一子 8 岁, 独生女, 父母在天津',
            professionPulse: '互联网产品总监 8 年, 现年薪 80 万',
          },
        },
        {
          stage: 'current-state',
          completedAt: Math.floor(Date.now() / 1000),
          answers: {
            'pulse-career': '平台期 (稳定但停滞)',
            'pulse-finance': '稳定 (够用不富)',
            'pulse-marriage': '紧张 (冲突 / 距离)',
            'pulse-children': '正向 (有质量陪伴)',
            'pulse-parents': '边界紧张 / 控制型',
            'pulse-health': '亮黄灯 (需调整)',
            'pulse-mental': '持续疲惫 / 焦虑',
            'pulse-meaning': '在做该做的事, 但不确定意义',
          },
        },
      ],
      expectations: [
        '建档完成后 user_core_state 有 ≥3 条 (家庭/城市/职业)',
        'brain.md baseline 已写入 (V1 OK)',
        'RMC 有 ≥5 条 (来自 onboarding 抽取)',
      ],
    },

    // ===== Day 1 (晚): 第 1 条 Pulse =====
    {
      day: 1,
      action: 'pulse',
      pulseQuestionId: 'sinking',
      pulseContent: '下午跟我妈视频, 她又一次说"你爸最近老忘事". 我点头说"哦". 但我心里咯噔一下 — 我已经听她说过 3 次了, 我居然到现在还没认真想这个问题意味着什么.',
      expectations: [
        '应识别为 parents + repeating-pattern 标签',
        'AI 回应不应鸡汤, 应反映式追问',
      ],
    },

    // ===== Day 2 =====
    {
      day: 2,
      action: 'pulse',
      pulseQuestionId: 'avoidance',
      pulseContent: '老公昨晚问"你妈那边什么打算", 我说"再看看". 我已经回避这个对话 3 次了. 我心里知道我老公的耐心快没了, 但我不知道怎么开口.',
      expectations: [
        '应识别为 avoidance + relationship + parents 多标签',
        'AI 应注意到这是第 2 条关于父母的 Pulse',
      ],
    },

    // ===== Day 3 =====
    {
      day: 3,
      action: 'pulse',
      pulseQuestionId: 'drainage',
      pulseContent: '今天 4 个 Slack 加 2 个会, 同事 W 又一次"我有个 quick question" 占了我 45 分钟. 不是讨厌他, 是我没法保护自己的时间.',
      expectations: [
        '应识别 career + emotion 标签',
        'AI 可能识别"无法保护时间"这个 pattern',
      ],
    },

    // ===== Day 4: 跳过 (模拟真实用户) =====
    { day: 4, action: 'skip', expectations: ['用户跳过, 不影响系统'] },

    // ===== Day 5 =====
    {
      day: 5,
      action: 'pulse',
      pulseQuestionId: 'body-signal',
      pulseContent: '凌晨 3:40 又醒了. 这周第 4 次. 我已经不告诉自己"还行"了 — 我在崩溃边缘.',
      expectations: [
        '应识别 health + emotion + repeating-pattern',
        'AI 应认真对待身体信号, 可能建议看医生',
      ],
    },

    // ===== Day 6 =====
    {
      day: 6,
      action: 'pulse',
      pulseQuestionId: 'hidden-big',
      pulseContent: '今天买了新加坡机票, 名义是探朋友, 心里其实是想看看搬过去的可能性. 这不是小决定.',
      expectations: [
        '应识别 potential-major-decision + emotion',
        'AI 应识别这跟前面"父母 + 婚姻" 的张力关联',
      ],
    },

    // ===== Day 7: 第一次 Decision Deep Dive =====
    {
      day: 7,
      action: 'decision',
      decisionContent: '我妈昨天又住院一次 (高血压急性发作). 我老公今晚摊牌: "你要么接她来住, 要么送养老院 — 但我不会跟她住一起". 我兄弟姐妹一个都没有. 我自己睡眠崩了, 工作出错. 我现在不知道是接来 / 送养老院 / 我回天津陪 / 全家搬天津. 我感觉每个选项都是错的.',
      expectations: [
        'Framework 应路由到 parent-care',
        'AI 回答应自然引用前 6 天 Pulses (老公耐心 / 失眠 / 新加坡机票)',
        '应出现 12 维结构化分析',
        '应给出 3 条路径 + PreMortem + Cracking Q',
      ],
    },

    // ===== Day 8 =====
    {
      day: 8,
      action: 'pulse',
      pulseQuestionId: 'sinking',
      pulseContent: '昨晚跟我老公看完你给的分析后, 他第一次没立刻反对 — 而是说"那我们先各退一步, 试 3 个月". 我感觉今天像活过来一点.',
      expectations: [
        '应识别 relationship + emotion 标签',
        'AI 应识别"昨晚跟老公谈" 是 Day 7 决策的后续',
      ],
    },

    // ===== Day 9 =====
    {
      day: 9,
      action: 'pulse',
      pulseQuestionId: 'avoidance',
      pulseContent: '今天给我妈打电话, 我说"我们想了一下, 可能先送养老院试 3 个月". 她沉默了 30 秒, 然后说"哦, 行". 我知道她不行. 但我不敢追问.',
      expectations: [
        '应识别 parents + avoidance + emotion',
        'AI 应认真处理这个父母情感冲击',
      ],
    },

    // ===== Day 10 =====
    {
      day: 10,
      action: 'pulse',
      pulseQuestionId: 'body-signal',
      pulseContent: '今天难得睡了 6 小时. 不是因为没事 — 是因为我开始接受我做不到完美.',
      expectations: [
        '应识别 health + emotion (positive change)',
        'AI 应注意到这是 health 改善, 跟 Day 5 对照',
      ],
    },

    // ===== Day 11: 跳过 =====
    { day: 11, action: 'skip', expectations: ['第 2 次 skip'] },

    // ===== Day 12 =====
    {
      day: 12,
      action: 'pulse',
      pulseQuestionId: 'drainage',
      pulseContent: '我妈今天主动给我电话, 说"养老院让我去看看了". 她声音平静. 我反而开始紧张.',
      expectations: [
        '应识别 parents + relationship',
        'AI 应识别母亲心态变化',
      ],
    },

    // ===== Day 13 =====
    {
      day: 13,
      action: 'pulse',
      pulseQuestionId: 'hidden-big',
      pulseContent: '今天我跟老板说我下个月需要 5 天 PTO 陪我妈搬家. 他没皱眉. 我突然意识到 — 我之前一直以为没人能理解我, 其实我从来没认真说过.',
      expectations: [
        '应识别 career + relationship + repeating-pattern',
        'AI 应识别"我从来没认真说过" 这个 meta-pattern',
      ],
    },

    // ===== Day 14: 第二次 Decision Deep Dive =====
    {
      day: 14,
      action: 'decision',
      decisionContent: '我妈下周开始去那家养老院试住. 我现在卡在第二个决定: 我老公还在生我妈的气, 这件事的"裂痕"我们都没真聊. 我要不要主动把这个矛盾摊开? 还是先让 3 个月顺利过完再说?',
      expectations: [
        'Framework 应路由到 marriage',
        'AI 必须引用 Day 7 第一次决策 + Day 8 老公态度变化 + Day 9 给妈打电话 + 整体 timeline',
        '应识别"我从来没认真说过" pattern (Day 13)',
        '应给出 3 条路径 + PreMortem',
        'Cracking Question 应基于完整 14 天 context',
      ],
    },
  ],
};
