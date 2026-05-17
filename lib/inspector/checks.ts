/**
 * Inspector 检查规则集 (V0: 5 类)
 *
 * Sivon doctrine 1.4 工程约束: 不靠 LLM 自觉, 必须 enforcement.
 *
 * V0 全部 shadow 模式 (扫不阻), audit 入 inspector_audit 表.
 * 7 天 stable 后切 active (block / retry).
 */

import type { CheckResult, InspectorContext, CheckCode } from './types';
import { getUserCommitments } from '@/lib/commitments/store';

// ============================================================================
// C1: 编自己做过的事
// AI 说 "我之前帮你 X / 我跟你聊过 Y / 我记得我们讨论过 Z"
// 但实际无对应历史 (回答没引用真实 RMC episodic).
// ============================================================================

export function checkC1(ctx: InspectorContext): CheckResult {
  const fabricationPatterns = [
    /我(之前|上次|之前帮你|曾经|早就)(帮你|跟你|和你|跟您|和您)/,
    /我(记得|印象中|清楚地记得)(我们|你跟我|你和我|咱们)/,
    /(?:之前|上次|前几天|前段时间)(我就|我已经|我跟你|我和你|我已|我曾)/,
  ];

  for (const pattern of fabricationPatterns) {
    const match = ctx.aiResponse.match(pattern);
    if (match) {
      // 如果 episodic memory 有对应记录, 不算违规
      const hasRelevantEpisode =
        ctx.userMemory.episodic && ctx.userMemory.episodic.length > 0;
      if (hasRelevantEpisode) {
        // 进一步检查: episodic 里是否有 AI 自己的行为记录?
        // V0 不严格,先通过. V1 加更精细的 grounding check.
        continue;
      }
      return {
        code: 'C1',
        severity: 'high',
        hit: true,
        matchedText: match[0],
        detail: 'AI 声称之前做过 / 说过, 但 RMC episodic 无对应记录',
      };
    }
  }

  return { code: 'C1', severity: 'high', hit: false };
}

// ============================================================================
// C2: 编自己说过(更细粒度)
// "我跟你说过 X" / "我之前提醒过你 X"
// ============================================================================

export function checkC2(ctx: InspectorContext): CheckResult {
  const patterns = [
    /我(之前|上次|早就|曾)(跟你说|告诉你|提醒过你|说过)/,
    /我说过(?:的|过)/,
  ];

  for (const pattern of patterns) {
    const match = ctx.aiResponse.match(pattern);
    if (match) {
      // 检查 user_brain 或 prior decisions 里是否有对应记录
      const hasPriorDecisions = ctx.userMemory.stats?.totalDecisions > 1;
      if (!hasPriorDecisions) {
        return {
          code: 'C2',
          severity: 'high',
          hit: true,
          matchedText: match[0],
          detail: 'AI 声称之前说过, 但这是用户首次决策, 无历史可引',
        };
      }
    }
  }

  return { code: 'C2', severity: 'high', hit: false };
}

// ============================================================================
// C3: 时间错乱
// "今天 5 月 10 日, 昨天周日" 类描述与真实日期冲突
// "上周 X 月 X 日" 类硬编码日期
// ============================================================================

export function checkC3(ctx: InspectorContext): CheckResult {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const todayWeekday = now.toLocaleDateString('zh-CN', { weekday: 'long' });

  // 检查 1: AI 引用具体的"今天日期", 与真实日期不符
  const datePattern = /今天.*?(\d{4})[年\-/]\s*(\d{1,2})[月\-/]\s*(\d{1,2})/;
  const m1 = ctx.aiResponse.match(datePattern);
  if (m1) {
    const claimedDate = `${m1[1]}-${String(m1[2]).padStart(2, '0')}-${String(m1[3]).padStart(2, '0')}`;
    if (claimedDate !== today) {
      return {
        code: 'C3',
        severity: 'high',
        hit: true,
        matchedText: m1[0],
        detail: `AI 声称今天是 ${claimedDate}, 实际是 ${today}`,
      };
    }
  }

  // 检查 2: AI 引用具体周几, 与真实不符
  const weekdayPattern = /今天.*?(周一|周二|周三|周四|周五|周六|周日|星期一|星期二|星期三|星期四|星期五|星期六|星期日|星期天)/;
  const m2 = ctx.aiResponse.match(weekdayPattern);
  if (m2) {
    const claimed = m2[1].replace('星期', '').replace('天', '日');
    const real = todayWeekday.replace('星期', '').replace('天', '日');
    if (claimed !== real) {
      return {
        code: 'C3',
        severity: 'high',
        hit: true,
        matchedText: m2[0],
        detail: `AI 声称今天是${m2[1]}, 实际是${todayWeekday}`,
      };
    }
  }

  return { code: 'C3', severity: 'high', hit: false };
}

// ============================================================================
// C5: 表格客服腔
// 机械列表 / "尊敬的用户" / 五项十项编号 / 罗列式无温度
// ============================================================================

export function checkC5(ctx: InspectorContext): CheckResult {
  const patterns = [
    /尊敬的(用户|客户|您)/,
    /亲爱的用户/,
    /您好[!,。]/,
    /如有(?:任何)?疑问.*?随时/,
    /^祝您.*?生活愉快/m,
    /(?:^|\n)\s*\d+[\.\、](?:\s*[^\n]{0,3}(?:\:|：))?(?=\n)/m, // 空标号"1." "2." 没有内容
  ];

  for (const pattern of patterns) {
    const match = ctx.aiResponse.match(pattern);
    if (match) {
      return {
        code: 'C5',
        severity: 'high',
        hit: true,
        matchedText: match[0],
        detail: '表格客服腔, 违反反鸡汤宪法 voice rule 4/6',
      };
    }
  }

  // 检查鸡汤短语
  const chickenSoupPhrases = [
    '加油',
    '你已经很棒了',
    '相信自己',
    '听从内心',
    '宇宙会指引你',
    '一切都会好起来的',
    '命运自有安排',
    '顺其自然',
    '亲爱的',
    '宝贝',
    '姐妹',
    '我理解你',
    '你不是一个人',
  ];

  for (const phrase of chickenSoupPhrases) {
    if (ctx.aiResponse.includes(phrase)) {
      return {
        code: 'C5',
        severity: 'high',
        hit: true,
        matchedText: phrase,
        detail: `命中反鸡汤宪法严禁短语清单: "${phrase}"`,
      };
    }
  }

  return { code: 'C5', severity: 'high', hit: false };
}

// ============================================================================
// C14: Commitment Fabrication
//
// 双向检查:
//   1) AI 在回答里说"我之前承诺过 X / 我答应你 Y" → 必须在 commitments 表找到对应
//   2) AI 在回答里许下新承诺 ("30 天后我会跟你回看") → extractor 会写表 (异步)
//
// 这里只检查 (1): 引用过去承诺时不能编.
// ============================================================================

export async function checkC14(ctx: InspectorContext): Promise<CheckResult> {
  const refPatterns = [
    /我(?:之前|上次|早就)(?:答应|承诺|说过要|说过会|许诺)/,
    /(?:之前|上次)(?:我答应|我承诺|我说要)/,
  ];

  for (const pattern of refPatterns) {
    const match = ctx.aiResponse.match(pattern);
    if (match) {
      // 查 commitments 表
      try {
        const commitments = await getUserCommitments(ctx.userId);
        if (commitments.length === 0) {
          return {
            code: 'C14',
            severity: 'p0',
            hit: true,
            matchedText: match[0],
            detail: 'AI 声称之前答应过, 但 commitments 表无任何记录 — 编造承诺',
          };
        }
        // V0 简化: 只要表里有任何一条 commitment 就放行.
        // V1+ 精细化: NLP 匹配引用的具体内容是否真的存在于 commitments.
      } catch (e) {
        // store 调用失败不算违规, 让流程继续
      }
    }
  }

  return { code: 'C14', severity: 'p0', hit: false };
}

// ============================================================================
// C15: Fact Provenance
// AI 在回答里引用具体 fact (年龄 / 城市 / 公司 / 职业 / 关系) 必须能在
// RMC factual / boundary / core_state / episodic 找到 source.
//
// V0 简化: 只检查 AI 引用的"具体年龄"是否跟用户提交的 birth_date 对得上.
// V1+ 加更精细的 grounding (NER 抽 entities → match RMC).
// ============================================================================

export function checkC15(ctx: InspectorContext): CheckResult {
  // 抽 AI 引用的年龄
  const agePattern = /(?:你|您)(?:今年|目前|现在)?(\d{2,3})\s*岁/g;
  const agesInResponse: number[] = [];
  let match;
  while ((match = agePattern.exec(ctx.aiResponse)) !== null) {
    agesInResponse.push(parseInt(match[1]));
  }

  // 找用户的真实年龄 (从 core_state 或 birth_date)
  const realAge = extractRealAge(ctx);
  if (realAge !== null) {
    for (const claimedAge of agesInResponse) {
      if (Math.abs(claimedAge - realAge) > 2) {
        // 容差 2 岁(因为 LLM 可能说"约 40 岁")
        return {
          code: 'C15',
          severity: 'p0',
          hit: true,
          matchedText: `AI 说 ${claimedAge} 岁, 实际 ${realAge} 岁`,
          detail: 'Fact provenance 失败: AI 编造的年龄与 RMC 不符',
        };
      }
    }
  }

  return { code: 'C15', severity: 'p0', hit: false };
}

function extractRealAge(ctx: InspectorContext): number | null {
  // 1) 优先从 core_state 找年龄信息
  for (const cs of ctx.userMemory.coreState ?? []) {
    const m = cs.factText?.match(/(\d{2,3})\s*岁/);
    if (m) return parseInt(m[1]);
  }
  // 2) 从 user 表的 birth_date (在 history API 不直接传, V0 跳过)
  return null;
}

// ============================================================================
// 主入口: 跑所有检查
// ============================================================================

// C16 (用户跨决策矛盾) 是 pre-generation 检测, 不在这里跑.
// 它由 lib/decision/contradiction-detector.ts 在 brief-pipeline 里前置注入.
const ALL_CHECKS: Partial<Record<CheckCode, (ctx: InspectorContext) => CheckResult | Promise<CheckResult>>> = {
  C1: checkC1,
  C2: checkC2,
  C3: checkC3,
  C5: checkC5,
  C14: checkC14,
  C15: checkC15,
};

export async function runAllChecks(ctx: InspectorContext): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  for (const [code, fn] of Object.entries(ALL_CHECKS)) {
    if (!fn) continue;
    try {
      const result = await fn(ctx);
      results.push(result);
    } catch (e: any) {
      console.error(`[inspector] check ${code} threw:`, e);
      results.push({
        code: code as CheckCode,
        severity: 'low',
        hit: false,
        detail: `Check threw: ${e.message}`,
      });
    }
  }
  return results;
}
