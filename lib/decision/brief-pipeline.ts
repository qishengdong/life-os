/**
 * Brief Pipeline — 两轮 LLM 调用产出 publication-grade 决策简报.
 *
 * 流程:
 *   1. Analyst pass: 出 9 section JSON (rigor + grounding, 不管语感)
 *   2. Editor pass: 改写为 publication-grade craft ("authored, not generated")
 *   3. 验证 + 落库
 *
 * 单次端到端耗时: ~25-45 秒 (两次非流式调用 + 验证)
 * 失败兜底:
 *   - editor pass 失败 → 使用 analyst 输出 (降级模式, brief.meta.editorPassUsed = false)
 *   - analyst 失败 → 抛错, 调用方处理
 */

import { modelRouter } from '@/lib/model-router';
import { fetchUserMemory, renderMemoryForPrompt } from '@/lib/memory';
import { routeDecision } from './router';
import {
  ANALYST_SYSTEM_PROMPT,
  EDITOR_SYSTEM_PROMPT,
  buildAnalystUserMessage,
  buildEditorUserMessage,
} from './brief-prompts';
import {
  type DecisionBrief,
  generateBriefNumber,
  validateBrief,
  countCharsCN,
} from './brief-schema';
import { appendAIDisclosure, checkInputSafety } from '@/lib/safety';

export interface BriefGenerationInput {
  userId: number;
  birthDate: string; // YYYY-MM-DD
  gender: string;
  decision: string;
  /** 强制使用某 framework (跳过 router, 测试 / sample 用) */
  forceFramework?: string;
  /** 跳过 editor pass — 调试用 */
  skipEditor?: boolean;
  /** 匿名 ID 显示用 (sample brief 公开页用) */
  displayName?: string;
}

export interface BriefGenerationResult {
  success: boolean;
  brief?: DecisionBrief;
  /** validate 报告 (即使 success=true, 也可能有非 fatal 的 issue) */
  validationIssues?: string[];
  /** 失败原因 */
  error?: string;
  /** 安全短路: 用户输入命中 crisis/blocklist, 没真跑 LLM */
  safetyShortCircuit?: {
    trigger: string;
    response: string;
  };
  /** 各阶段耗时 (毫秒) */
  timings: {
    analyst?: number;
    editor?: number;
    total: number;
  };
}

// ============================================================================
// 主入口
// ============================================================================
export async function generateBrief(
  input: BriefGenerationInput
): Promise<BriefGenerationResult> {
  const t0 = Date.now();

  // Safety gate: crisis / blocklist 直接 short-circuit, 不浪费 token
  const safety = checkInputSafety(input.decision);
  if (safety.triggered && (safety.trigger === 'crisis' || safety.trigger === 'blocklist')) {
    return {
      success: false,
      safetyShortCircuit: {
        trigger: safety.trigger,
        response: safety.response || '',
      },
      timings: { total: Date.now() - t0 },
    };
  }

  // 1. 路由 + 拉记忆
  const route = input.forceFramework
    ? { framework: input.forceFramework as any, confidence: 1.0 }
    : await routeDecision(input.decision);
  const memory = fetchUserMemory(input.userId);
  const memBlocks = renderMemoryForPrompt(memory);
  const memoryContext = [memBlocks.hardAnchorsBlock, memBlocks.contextBlock]
    .filter(Boolean)
    .join('\n\n');

  const age = calculateAge(input.birthDate);

  // ============================================================
  // 2. Analyst pass — 出 JSON 草稿
  // ============================================================
  const tAnalyst0 = Date.now();
  let analystResp: any;
  try {
    analystResp = await modelRouter.complete({
      messages: [
        { role: 'system', content: ANALYST_SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildAnalystUserMessage({
            decision: input.decision,
            age,
            gender: input.gender,
            framework: route.framework,
            memoryContext,
          }),
        },
      ],
      provider: 'deepseek',
      temperature: 0.5,
      maxTokens: 4500,
    });
  } catch (e: any) {
    return {
      success: false,
      error: `Analyst pass failed: ${e.message}`,
      timings: { total: Date.now() - t0 },
    };
  }
  const tAnalyst = Date.now() - tAnalyst0;

  // 解析 analyst JSON
  let analystJson: any;
  try {
    analystJson = parseJsonBestEffort(analystResp.content);
  } catch (e: any) {
    return {
      success: false,
      error: `Analyst output not parseable as JSON: ${e.message}`,
      timings: { analyst: tAnalyst, total: Date.now() - t0 },
    };
  }

  // ============================================================
  // 3. Editor pass — publication-grade 改写
  // ============================================================
  let finalJson = analystJson;
  let editorPassUsed = false;
  let tEditor: number | undefined;
  let editorTokensUsed = 0;

  if (!input.skipEditor) {
    const tEditor0 = Date.now();
    try {
      const editorResp = await modelRouter.complete({
        messages: [
          { role: 'system', content: EDITOR_SYSTEM_PROMPT },
          { role: 'user', content: buildEditorUserMessage(JSON.stringify(analystJson, null, 2)) },
        ],
        provider: 'deepseek',
        temperature: 0.65, // 略高一点给文笔留空间
        maxTokens: 4500,
      });
      const editorJson = parseJsonBestEffort(editorResp.content);
      finalJson = editorJson;
      editorPassUsed = true;
      tEditor = Date.now() - tEditor0;
      editorTokensUsed = editorResp.usage?.total_tokens || 0;
    } catch (e) {
      // editor 失败不致命, 用 analyst 输出作为兜底
      console.warn('[brief-pipeline] editor pass failed, falling back to analyst output:', e);
      tEditor = Date.now() - tEditor0;
    }
  }

  // ============================================================
  // 4. 装配 DecisionBrief
  // ============================================================
  const briefNumber = generateBriefNumber();
  const authoredAt = Math.floor(Date.now() / 1000);
  const aiDisclosure =
    '本简报由 LifeOS Editorial Office (AI) 生成. 仅作为决策辅助参考, 不构成医疗、法律或财务建议. 重大决定请结合专业意见.';

  const brief: DecisionBrief = {
    briefNumber,
    topic: finalJson.topic || input.decision.slice(0, 30),
    authoredAt,
    authoredBy: 'LifeOS Editorial Office',
    authoredFor: input.displayName || `用户 #${input.userId}`,
    sections: {
      summary: finalJson.sections?.summary || '',
      background: finalJson.sections?.background || '',
      currentTension: finalJson.sections?.currentTension || '',
      stakeholders: finalJson.sections?.stakeholders || '',
      irreversibleRisks: finalJson.sections?.irreversibleRisks || '',
      threePaths: normalizeThreePaths(finalJson.sections?.threePaths),
      preMortem: finalJson.sections?.preMortem || '',
      crackingQuestions: Array.isArray(finalJson.sections?.crackingQuestions)
        ? finalJson.sections.crackingQuestions.slice(0, 2)
        : [],
      minimumNextStep: finalJson.sections?.minimumNextStep || '',
    },
    appendix: {
      memoryReferences: Array.isArray(finalJson.appendix?.memoryReferences)
        ? finalJson.appendix.memoryReferences.slice(0, 6)
        : [],
      outcomeAnchors: normalizeOutcomeAnchors(finalJson.appendix?.outcomeAnchors),
    },
    meta: {
      framework: route.framework as any,
      tokensUsed: (analystResp.usage?.total_tokens || 0) + editorTokensUsed,
      editorPassUsed,
      totalCharCount: 0, // 下面填
      aiDisclosure,
      durationMs: {
        analyst: tAnalyst,
        editor: tEditor ?? 0,
      },
    },
  };

  // 计算总字数
  const totalText =
    brief.sections.summary +
    brief.sections.background +
    brief.sections.currentTension +
    brief.sections.stakeholders +
    brief.sections.irreversibleRisks +
    brief.sections.preMortem +
    brief.sections.crackingQuestions.join('') +
    brief.sections.minimumNextStep +
    brief.sections.threePaths
      .map((p) => p.fiveYearScene + p.primaryCost + p.whoBenefitsWhoLoses)
      .join('');
  brief.meta.totalCharCount = countCharsCN(totalText);

  // 5. 验证
  const v = validateBrief(brief);

  return {
    success: true,
    brief,
    validationIssues: v.issues.length > 0 ? v.issues : undefined,
    timings: {
      analyst: tAnalyst,
      editor: tEditor,
      total: Date.now() - t0,
    },
  };
}

// ============================================================================
// Helpers
// ============================================================================
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function parseJsonBestEffort(raw: string): any {
  let s = raw.trim();
  // 去掉可能的 ```json 包裹
  s = s.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  // 取第一个 { 到最后一个 }
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('no JSON object found in output');
  }
  s = s.slice(start, end + 1);
  return JSON.parse(s);
}

function normalizeThreePaths(raw: any): DecisionBrief['sections']['threePaths'] {
  const fallback = {
    name: '',
    fiveYearScene: '',
    primaryCost: '',
    whoBenefitsWhoLoses: '',
  };
  const arr = Array.isArray(raw) ? raw : [];
  const slot = (i: number) => ({ ...fallback, ...(arr[i] || {}) });
  return [slot(0), slot(1), slot(2)] as DecisionBrief['sections']['threePaths'];
}

function normalizeOutcomeAnchors(raw: any): DecisionBrief['appendix']['outcomeAnchors'] {
  const days = [30, 90, 365] as const;
  const arr = Array.isArray(raw) ? raw : [];
  const find = (d: number) => arr.find((a: any) => a?.days === d) || {};
  return days.map((d) => ({
    days: d,
    question: find(d).question || '',
    successSignal: find(d).successSignal || '',
    failureSignal: find(d).failureSignal || '',
  })) as DecisionBrief['appendix']['outcomeAnchors'];
}
