/**
 * 决策框架路由器
 *
 * 根据用户输入自动识别决策类型,选择最合适的框架。
 *
 * V0 阶段: 关键词匹配(快、零成本、可解释)
 * V1+: 加 LLM 分类器作为兜底(处理 ambiguous 情况)
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
  | 'general';

interface RouteRule {
  framework: FrameworkType;
  // 必须命中至少 1 个关键词才算匹配
  keywords: string[];
  // 加分关键词(命中得 1 分)
  signalWords: string[];
  // 决策类型的"语义中心"(供调试)
  description: string;
}

const ROUTES: RouteRule[] = [
  {
    framework: 'parent-care',
    keywords: ['父母', '爸妈', '老人', '养老', '照顾老', '父亲', '母亲', '爸爸', '妈妈'],
    signalWords: ['养老院', '护工', '住院', '失能', '认知症', '阿尔兹海默', '失智', '同住', '回老家', '兄弟姐妹', '独生'],
    description: '父母养老 / 代际责任决策',
  },
  {
    framework: 'child-education',
    keywords: ['孩子', '小孩', '子女', '儿子', '女儿', '娃'],
    signalWords: ['学校', '教育', '国际学校', '体制内', '留学', '出国', '学区', '中考', '高考', '鸡娃', '幼儿园', '小升初'],
    description: '孩子出路 / 教育路线决策',
  },
  {
    framework: 'career-transition',
    keywords: ['工作', '职业', '工作', '大厂', '公司', '老板', '岗位'],
    signalWords: ['离职', '跳槽', '辞职', '转型', '裸辞', '创业', '副业', '降薪', '升职', '晋升', '转岗'],
    description: '职业转型决策',
  },
  {
    framework: 'marriage',
    keywords: ['老婆', '老公', '伴侣', '丈夫', '妻子', '对象', '男友', '女友', '配偶'],
    signalWords: ['结婚', '离婚', '分手', '出轨', '感情', '婚姻', '修复关系', '冷战', '和好'],
    description: '婚姻 / 亲密关系决策',
  },
  {
    framework: 'migration',
    keywords: ['移民', '出国', '润', '搬家', '换城市'],
    signalWords: ['美国', '加拿大', '新加坡', '日本', '澳洲', '英国', '欧洲', '签证', '绿卡', '身份', '回国'],
    description: '迁移 / 城市国家选择决策',
  },
];

export interface RouteResult {
  framework: FrameworkType;
  confidence: number; // 0-1
  matchedKeywords: string[];
  matchedSignals: string[];
}

export function detectFramework(decisionText: string): RouteResult {
  const text = decisionText.toLowerCase();

  let bestMatch: RouteResult = {
    framework: 'general',
    confidence: 0,
    matchedKeywords: [],
    matchedSignals: [],
  };

  for (const route of ROUTES) {
    const matchedKeywords = route.keywords.filter((kw) => text.includes(kw.toLowerCase()));
    const matchedSignals = route.signalWords.filter((sw) => text.includes(sw.toLowerCase()));

    if (matchedKeywords.length === 0) continue;

    // 信心评分:
    //   - 命中关键词得 0.4 (必须有,否则不进入)
    //   - 每个加分词加 0.15
    //   - 上限 0.95 (永远留 0.05 给 general 兜底可能性)
    const confidence = Math.min(0.95, 0.4 + matchedSignals.length * 0.15);

    if (confidence > bestMatch.confidence) {
      bestMatch = {
        framework: route.framework,
        confidence,
        matchedKeywords,
        matchedSignals,
      };
    }
  }

  return bestMatch;
}

export function buildMessagesForFramework(
  framework: FrameworkType,
  input: DecisionInput,
  memory?: UserMemoryContext
) {
  switch (framework) {
    case 'parent-care':
      return buildParentCareMessages(input, memory);
    // 后续场景:
    // case 'child-education':
    //   return buildChildEducationMessages(input, memory);
    // case 'career-transition':
    //   return buildCareerTransitionMessages(input, memory);
    // case 'marriage':
    //   return buildMarriageMessages(input, memory);
    // case 'migration':
    //   return buildMigrationMessages(input, memory);
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
  general: '通用决策框架',
};
