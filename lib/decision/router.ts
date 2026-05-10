/**
 * 决策框架路由器 v2 — 混合模式
 *
 * V0 失败教训: 单纯关键词匹配的 router 会把"提到孩子但决策是职业"误判为 child-education.
 * Real Grader Run 3 数据: 7 个 persona 中 4 个错配 = 43% 准确率.
 *
 * V1 Hybrid Strategy:
 *   1) 优先识别"决策动词锚定" (要不要 X / 该不该 X / 卖不卖 / 离不离 / 走不走)
 *   2) 决策动词 + 主题词 = 强信号 (confidence 0.9+)
 *   3) 仅出现关键词没决策动词 = 弱信号 (confidence 0.3-0.5)
 *   4) confidence < 0.7 时调 LLM 分类器兜底
 *   5) 永远输出 1 个 main_framework + 列出 secondary_frameworks (展示 cross-decision 牵动)
 */

import type { DecisionInput } from './general-framework';
import { buildDecisionMessages as buildGeneralMessages } from './general-framework';
import { buildParentCareMessages } from './frameworks/parent-care';
import type { UserMemoryContext } from '@/lib/memory/types';

export type FrameworkType =
  | 'parent-care'
  | 'child-education'
  | 'career-transition'
  | 'marriage'
  | 'migration'
  | 'crisis-restart'
  | 'self-identity'
  | 'wealth-allocation'
  | 'family-conflict'
  | 'health-decision'
  | 'general';

interface FrameworkRule {
  framework: FrameworkType;
  // 决策动词 + 主题词 组合 (强信号)
  decisionPatterns: Array<{ verb: RegExp; topic: RegExp; weight: number }>;
  // 仅主题词 (弱信号)
  topicKeywords: string[];
  // 强决策标志 (出现即高分)
  strongSignals: string[];
  description: string;
}

const ROUTES: FrameworkRule[] = [
  {
    framework: 'parent-care',
    decisionPatterns: [
      { verb: /(要不要|该不该|是不是该|应不应该)/, topic: /(接|送|照顾|养).*?(妈|爸|父母|老人)/, weight: 0.95 },
      { verb: /(要不要|该不该)/, topic: /(养老院|护工|失能|临终)/, weight: 0.95 },
    ],
    topicKeywords: ['父母', '爸妈', '老人', '养老', '父亲', '母亲', '爸爸', '妈妈'],
    strongSignals: ['养老院', '护工', '失能', '认知症', '阿尔兹海默', '失智', '临终', '安宁疗护', '兄弟姐妹分担', '独生'],
    description: '父母养老 / 代际责任决策',
  },
  {
    framework: 'child-education',
    decisionPatterns: [
      { verb: /(要不要|该不该|应不应)/, topic: /(送|让|给).*?(孩子|儿子|女儿|娃).*?(学校|留学|出国|国际|体制)/, weight: 0.95 },
      { verb: /(要不要|该不该)/, topic: /(国际学校|双语学校|学区房|留学|寄宿)/, weight: 0.95 },
    ],
    topicKeywords: ['孩子', '小孩', '子女', '儿子', '女儿', '娃'],
    strongSignals: ['国际学校', '体制内', '体制外', '留学', '学区房', '中考', '高考', '鸡娃', '小升初', '幼升小', '寄宿制'],
    description: '孩子出路 / 教育路线决策',
  },
  {
    framework: 'career-transition',
    decisionPatterns: [
      { verb: /(要不要|该不该|是不是该|应不应)/, topic: /(离职|跳槽|裸辞|创业|转型|降薪|去[A-Za-z一-龥]+(公司|大厂))/, weight: 0.95 },
      { verb: /(要不要|该不该)/, topic: /(从大厂出来|去创业|做副业|转行|早退休|FIRE)/, weight: 0.95 },
    ],
    topicKeywords: ['工作', '职业', '大厂', '公司', '岗位'],
    strongSignals: ['离职', '跳槽', '辞职', '裸辞', '创业', '副业', '降薪', '升职', '晋升', '转岗', '转型', '管理岗', '专家岗', 'FIRE', '早退休'],
    description: '职业转型决策',
  },
  {
    framework: 'marriage',
    decisionPatterns: [
      { verb: /(要不要|该不该|是不是要)/, topic: /(结婚|离婚|分手|和好|修复|分居|出轨)/, weight: 0.95 },
      { verb: /(要不要|该不该)/, topic: /(继续|结束|挽回).*?(关系|婚姻|这段)/, weight: 0.9 },
    ],
    topicKeywords: ['老婆', '老公', '伴侣', '丈夫', '妻子', '配偶', '夫妻'],
    strongSignals: ['离婚', '出轨', '分居', '冷战', '婚外情', '修复婚姻', '挽回', '前任', '复合'],
    description: '婚姻 / 亲密关系决策',
  },
  {
    framework: 'migration',
    decisionPatterns: [
      { verb: /(要不要|该不该|是不是要)/, topic: /(润|移民|出国|搬|换城市|定居)/, weight: 0.95 },
      { verb: /(去|搬到)/, topic: /(美国|加拿大|新加坡|日本|澳洲|英国|欧洲|大理|成都|海南)/, weight: 0.85 },
    ],
    topicKeywords: ['移民', '出国', '润', '搬家', '换城市', '迁居'],
    strongSignals: ['EP', 'PEP', '签证', '绿卡', '永居', 'PR', '入籍', '中产润', '陪读', '留守家庭'],
    description: '迁移 / 城市 / 国家选择决策',
  },
  {
    framework: 'crisis-restart',
    decisionPatterns: [
      { verb: /(怎么|如何)/, topic: /(重新开始|重启|走出|恢复|重建)/, weight: 0.85 },
    ],
    topicKeywords: ['失业', '被裁', '破产', '失婚', '离世', '抑郁', '崩溃', '空心', '倦怠', '重启', '重建'],
    strongSignals: ['刚离婚', '刚失业', '刚被裁', '刚生病', '刚出院', '刚破产', '失去亲人', '丧偶', '人生没意义', '不知道怎么活', '想消失'],
    description: '危机 / 重启决策 (含 Crisis Protocol L0-L3)',
  },
  {
    framework: 'self-identity',
    decisionPatterns: [
      { verb: /(我到底|我现在|我究竟)/, topic: /(要什么|是谁|想要什么|怎么活|为什么活)/, weight: 0.9 },
    ],
    topicKeywords: ['人生意义', '价值观', '身份', '我是谁', '后半生', '中年危机'],
    strongSignals: ['人生没意义', '空心', '不知道想要什么', '迷失', '迷茫', '中年危机', '价值观崩塌', '后半生'],
    description: '自我与人生方向决策',
  },
  {
    framework: 'wealth-allocation',
    decisionPatterns: [
      { verb: /(要不要|该不该|卖不卖|买不买)/, topic: /(房|资产|存款|投资)/, weight: 0.9 },
    ],
    topicKeywords: ['买房', '卖房', '换房', '资产', '理财', '投资'],
    strongSignals: ['学区房', '海外资产', '信托', '遗嘱', '财务自由', '现金流', '房贷', '提前还贷'],
    description: '财富 / 资源配置决策',
  },
  {
    framework: 'family-conflict',
    decisionPatterns: [
      { verb: /(要不要|该不该)/, topic: /(切断|断绝|和解|修复).*?(关系|联系)/, weight: 0.9 },
    ],
    topicKeywords: ['婆媳', '岳父母', '兄弟', '姐妹', '亲戚'],
    strongSignals: ['切断关系', '断绝来往', '和父母决裂', '不来往', '继承纠纷', '偏心'],
    description: '家庭系统冲突决策',
  },
  {
    framework: 'health-decision',
    decisionPatterns: [
      { verb: /(要不要|该不该|是不是要)/, topic: /(手术|治疗|吃药|GLP|减肥|冻卵|试管)/, weight: 0.9 },
    ],
    topicKeywords: ['手术', '治疗', '吃药', '住院', '化疗', '康复'],
    strongSignals: ['开刀', '保守治疗', '化疗', '靶向治疗', '中医', 'GLP-1', '减肥手术', '冻卵', '试管婴儿', '安宁疗护'],
    description: '健康 / 身体重大决策 (强转介医生)',
  },
];

export interface RouteResult {
  framework: FrameworkType;
  confidence: number;
  matchedKeywords: string[];
  matchedSignals: string[];
  matchedDecisionPattern?: string; // "(要不要离职)+(职业)" 等
  secondaryFrameworks: Array<{ framework: FrameworkType; confidence: number }>; // 牵动的次要议题
  routerVersion: 'keyword' | 'llm-classifier'; // V0 还是 V1 兜底
}

// ============================================================================
// 决策动词检测
// ============================================================================

const DECISION_VERBS = [
  /(要不要|该不该|是不是该|应不应该|是否应)/,
  /(选|挑|定).*?(哪|什么|哪个)/,
  /(怎么)(选|决定|办|做)/,
  /(卖不卖|买不买|换不换|搬不搬|走不走|去不去|留不留)/,
  /(继续|结束|开始)/,
];

function hasDecisionVerb(text: string): RegExpMatchArray | null {
  for (const v of DECISION_VERBS) {
    const m = text.match(v);
    if (m) return m;
  }
  return null;
}

// ============================================================================
// 主路由函数
// ============================================================================

export function detectFramework(decisionText: string): RouteResult {
  const text = decisionText;
  const lowerText = text.toLowerCase();

  // 计算每个 framework 的 confidence
  const scored: Array<{
    framework: FrameworkType;
    confidence: number;
    matchedKeywords: string[];
    matchedSignals: string[];
    matchedPattern?: string;
  }> = [];

  for (const route of ROUTES) {
    let confidence = 0;
    const matchedKeywords: string[] = [];
    const matchedSignals: string[] = [];
    let matchedPattern: string | undefined;

    // 决策动词 + 主题 组合 (最强信号)
    for (const dp of route.decisionPatterns) {
      const verbMatch = text.match(dp.verb);
      const topicMatch = text.match(dp.topic);
      if (verbMatch && topicMatch) {
        // 检查 verb 和 topic 是否在合理距离内 (50 字符内)
        const verbIdx = text.indexOf(verbMatch[0]);
        const topicIdx = text.indexOf(topicMatch[0]);
        if (Math.abs(verbIdx - topicIdx) < 80) {
          confidence = Math.max(confidence, dp.weight);
          matchedPattern = `${verbMatch[0]} + ${topicMatch[0]}`;
        }
      }
    }

    // 强信号词 (即使没决策动词也加分)
    for (const sig of route.strongSignals) {
      if (lowerText.includes(sig.toLowerCase())) {
        matchedSignals.push(sig);
        confidence += 0.15;
      }
    }

    // 主题关键词 (弱信号 — 只能作为辅助, 不能单独触发高分)
    for (const kw of route.topicKeywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
        confidence += 0.05; // 弱权重: 只是 context 出现
      }
    }

    // 上限 0.95 (永远留 0.05 给 LLM 兜底)
    confidence = Math.min(0.95, confidence);

    if (confidence > 0) {
      scored.push({
        framework: route.framework,
        confidence,
        matchedKeywords,
        matchedSignals,
        matchedPattern,
      });
    }
  }

  // 排序
  scored.sort((a, b) => b.confidence - a.confidence);

  if (scored.length === 0) {
    return {
      framework: 'general',
      confidence: 0,
      matchedKeywords: [],
      matchedSignals: [],
      secondaryFrameworks: [],
      routerVersion: 'keyword',
    };
  }

  const winner = scored[0];

  // 次要 frameworks (confidence > 0.3 但不是 winner)
  const secondaries = scored
    .slice(1)
    .filter((s) => s.confidence > 0.3)
    .slice(0, 2)
    .map((s) => ({ framework: s.framework, confidence: s.confidence }));

  return {
    framework: winner.framework,
    confidence: winner.confidence,
    matchedKeywords: winner.matchedKeywords,
    matchedSignals: winner.matchedSignals,
    matchedDecisionPattern: winner.matchedPattern,
    secondaryFrameworks: secondaries,
    routerVersion: 'keyword',
  };
}

// ============================================================================
// LLM 分类器兜底 (低 confidence 时调用)
// ============================================================================

const LLM_CLASSIFIER_PROMPT = `你是 Life OS 决策类型分类器. 你的工作: 读用户描述的决策, 判断**核心议题**属于以下哪类.

# 类目 (单选)
- parent-care: 父母养老 / 代际责任
- child-education: 孩子出路 / 教育路线
- career-transition: 职业转型 / 跳槽 / 创业
- marriage: 婚姻 / 亲密关系
- migration: 迁移 / 城市选择 / 移民
- crisis-restart: 危机 / 重启 (失业/离婚/丧亲/抑郁后重建)
- self-identity: 自我重建 / 中年危机 / 价值观重排
- wealth-allocation: 财富配置 / 买卖房 / 资产决策
- family-conflict: 家庭系统冲突 (非夫妻非父母)
- health-decision: 健康重大决策 (手术 / 治疗路径)
- general: 上述都不是, 通用决策

# 关键纪律
- 区分"主决策" vs "背景信息"
- 提到孩子 ≠ child-education (可能只是背景, 决策是职业)
- 提到父母 ≠ parent-care (可能只是背景, 决策是迁移)
- 看用户**最想问的那一个问题**, 而非提到了什么

# 输出格式
JSON:
{
  "framework": "...",
  "confidence": 0.0-1.0,
  "secondary": [{"framework": "...", "confidence": 0.0-1.0}],
  "reasoning": "一句话说明"
}

不要 markdown, 直接 JSON.`;

export async function classifyWithLLM(decisionText: string): Promise<RouteResult> {
  // 动态 import 避免循环依赖
  const { modelRouter } = await import('@/lib/model-router');

  try {
    const response = await modelRouter.complete({
      messages: [
        { role: 'system', content: LLM_CLASSIFIER_PROMPT },
        { role: 'user', content: decisionText },
      ],
      provider: 'deepseek',
      temperature: 0.1,
      maxTokens: 500,
    });

    let cleaned = response.content.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    cleaned = cleaned.slice(startIdx, endIdx + 1);

    const parsed = JSON.parse(cleaned);
    return {
      framework: parsed.framework as FrameworkType,
      confidence: parsed.confidence ?? 0.7,
      matchedKeywords: [],
      matchedSignals: [],
      matchedDecisionPattern: parsed.reasoning,
      secondaryFrameworks: (parsed.secondary || []).map((s: any) => ({
        framework: s.framework,
        confidence: s.confidence,
      })),
      routerVersion: 'llm-classifier',
    };
  } catch (e) {
    console.error('[router] LLM classifier failed:', e);
    return {
      framework: 'general',
      confidence: 0.5,
      matchedKeywords: [],
      matchedSignals: [],
      secondaryFrameworks: [],
      routerVersion: 'llm-classifier',
    };
  }
}

/**
 * 主路由入口 — 混合模式
 *
 * 1. 跑关键词 router
 * 2. 如果 confidence >= 0.7 直接用
 * 3. 否则调 LLM 分类器兜底
 */
export async function routeDecision(decisionText: string): Promise<RouteResult> {
  const keywordResult = detectFramework(decisionText);

  // 高置信直接用
  if (keywordResult.confidence >= 0.7) {
    return keywordResult;
  }

  // 低置信 → LLM 兜底
  console.log(
    `[router] keyword confidence ${keywordResult.confidence.toFixed(2)} < 0.7, falling back to LLM classifier`
  );
  return await classifyWithLLM(decisionText);
}

// ============================================================================
// Framework → message builder 映射
// ============================================================================

export async function buildMessagesForFramework(
  framework: FrameworkType,
  input: DecisionInput,
  memory?: UserMemoryContext
) {
  switch (framework) {
    case 'parent-care':
      return buildParentCareMessages(input, memory);
    case 'career-transition':
      return (await import('./frameworks/career-transition')).buildCareerTransitionMessages(input, memory);
    case 'child-education':
      return (await import('./frameworks/child-education')).buildChildEducationMessages(input, memory);
    case 'marriage':
      return (await import('./frameworks/marriage')).buildMarriageMessages(input, memory);
    case 'migration':
      return (await import('./frameworks/migration')).buildMigrationMessages(input, memory);
    case 'crisis-restart':
      return (await import('./frameworks/crisis-restart')).buildCrisisRestartMessages(input, memory);
    case 'general':
    default:
      return buildGeneralMessages(input, memory);
  }
}

export const FRAMEWORK_DISPLAY_NAMES: Record<FrameworkType, string> = {
  'parent-care': '父母养老专项',
  'child-education': '孩子教育专项',
  'career-transition': '职业转型专项',
  marriage: '婚姻关系专项',
  migration: '迁移决策专项',
  'crisis-restart': '危机重启专项',
  'self-identity': '自我重建专项',
  'wealth-allocation': '财富配置专项',
  'family-conflict': '家庭系统冲突专项',
  'health-decision': '健康决策专项',
  general: '通用决策框架',
};
