/**
 * Safety 模块统一入口.
 *
 * 上层调用模式:
 *
 *   const check = checkInputSafety(userText);
 *   if (check.triggered) {
 *     return { aiResponse: check.response, tags: ['emotion'], short_circuit: true };
 *   }
 *   // 否则正常走 LLM
 *
 * 设计原则:
 * - 检测是 pure regex/keyword, 不走 LLM (快 + 不烧 token)
 * - 命中后直接返回硬编码模板, 绕过 LLM (LLM 可能写歪)
 * - 多个命中按优先级: crisis > blocklist > medical > legal > finance
 * - 输出审查 (sanitizeOutput) 是兜底, 拦 LLM 万一吐出禁词
 */

import {
  hasCrisisSignal,
  hasMedicalQuery,
  hasLegalQuery,
  hasFinanceQuery,
  hasBlocklist,
} from './keywords';
import { getSafetyResponse, type SafetyTrigger } from './responses';

export { appendAIDisclosure, AI_GENERATED_NOTICE_FOOTER, AI_GENERATED_NOTICE_INLINE } from './disclosure';
export type { SafetyTrigger } from './responses';

export interface SafetyCheckResult {
  triggered: boolean;
  trigger?: SafetyTrigger;
  response?: string;
  /** 给上层日志用 — 知道命中的哪一类, 不暴露给用户 */
  logTag?: string;
}

/**
 * 输入端检查 — 用户文本进 LLM 前过一遍.
 * 命中 → 返回 short-circuit 响应; 没命中 → 正常往下走.
 */
export function checkInputSafety(text: string): SafetyCheckResult {
  if (!text || text.trim().length === 0) {
    return { triggered: false };
  }

  // 优先级: crisis 最高 (生命) > blocklist (合规) > medical > legal > finance
  if (hasCrisisSignal(text)) {
    return {
      triggered: true,
      trigger: 'crisis',
      response: getSafetyResponse('crisis'),
      logTag: 'safety:crisis',
    };
  }

  if (hasBlocklist(text)) {
    return {
      triggered: true,
      trigger: 'blocklist',
      response: getSafetyResponse('blocklist'),
      logTag: 'safety:blocklist',
    };
  }

  if (hasMedicalQuery(text)) {
    return {
      triggered: true,
      trigger: 'medical',
      response: getSafetyResponse('medical'),
      logTag: 'safety:medical',
    };
  }

  if (hasLegalQuery(text)) {
    return {
      triggered: true,
      trigger: 'legal',
      response: getSafetyResponse('legal'),
      logTag: 'safety:legal',
    };
  }

  if (hasFinanceQuery(text)) {
    return {
      triggered: true,
      trigger: 'finance',
      response: getSafetyResponse('finance'),
      logTag: 'safety:finance',
    };
  }

  return { triggered: false };
}

/**
 * 输出端兜底检查 — LLM 万一吐出 blocklist 词, 替换为中性表达.
 * 不试图保留语义 — blocklist 命中本身就是产品事故, 不重要的 message 直接打回.
 */
export function sanitizeOutput(text: string): { clean: string; modified: boolean } {
  if (!text) return { clean: text, modified: false };
  if (hasBlocklist(text)) {
    return {
      clean: '（这条回复被安全规则拦截了, 请重新提一遍问题.）',
      modified: true,
    };
  }
  return { clean: text, modified: false };
}

/**
 * 调试用 — 返回所有命中的红线类型 (不影响主流程).
 */
export function diagnoseSafety(text: string): {
  crisis: boolean;
  blocklist: boolean;
  medical: boolean;
  legal: boolean;
  finance: boolean;
} {
  return {
    crisis: hasCrisisSignal(text),
    blocklist: hasBlocklist(text),
    medical: hasMedicalQuery(text),
    legal: hasLegalQuery(text),
    finance: hasFinanceQuery(text),
  };
}
