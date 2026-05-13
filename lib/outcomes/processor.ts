/**
 * Outcome Processor — 用户回答后, LLM 生成 reflection + 判断 outcome_judgment
 *
 * 这是 Outcome Ledger 的核心智能层. 用户回答 100-500 字, AI 输出:
 *   1. outcome_judgment (as-expected / better / worse / mixed / too-early / cancelled)
 *   2. 200-400 字 reflection (锐利, 不鸡汤)
 *
 * 这跟 Pulse Tagger 和 Decision Generator 不同 —
 * 它是"事后复盘", 重点在跨时间对照: 当时的担心 vs 现在的实际.
 */

import { modelRouter } from '@/lib/model-router';
import { fetchUserMemory } from '@/lib/memory';
import { getDb } from '@/lib/db';
import type { OutcomeJudgment } from './store';

interface ProcessInput {
  outcomeId: number;
  userId: number;
  decisionId: number;
  checkpointDays: number;
  userResponse: string;
}

export interface ProcessResult {
  success: boolean;
  outcomeJudgment: OutcomeJudgment;
  aiReflection: string;
  durationMs: number;
  error?: string;
}

const OUTCOME_PROCESSOR_PROMPT = `你是 KEY 的 Outcome Reflection 写手.

用户 30 / 90 / 365 天前做了一个重大决策, 当时的 AI 给了 12 维结构化分析 (含 PreMortem 失败根因预测). 现在用户回来告诉你"这事现在怎么样了".

你的工作:
1. 判断 outcome_judgment (单选): as-expected / better / worse / mixed / too-early / cancelled
2. 写 200-400 字的 reflection, 让用户读完产生"我看见了真实差距"的感受

# outcome_judgment 判定规则

- **as-expected**: 跟当时 PreMortem 预测的差不多, 没有大意外
- **better**: 显著好于当时预期 (但不要轻易归功 — 是真好还是用户在合理化)
- **worse**: 显著差于预期, 当时的 PreMortem 命中了一个或多个
- **mixed**: 部分好部分坏, 跟当时设想的"代价图"不一样, 但总体可承受
- **too-early**: 30 天太早还看不清结果 (90 day 后可重判)
- **cancelled**: 用户当时没真做这个决定 / 走了第三条路

# Reflection 内容 (200-400 字 markdown)

## 当时 vs 现在 (必含)
引用用户当时决策时的关键 PreMortem 假设, 跟现在的实际对照:
- "你当时担心 X, 实际呢?" — 引用具体
- "你当时没想到的是 Y" — 如果有
- "这跟当时的'三条路径' 哪条最接近?"

## 这次决策教会你什么 pattern (可选, 仅 90 day+)
如果是 90/365 day checkpoint, 加 1 句 pattern 提示:
- "你做这次决定的方式, 跟你之前做 X 决定时的方式像不像?"

## 写作要求
- 第二人称"你"
- 引用用户原话 + 当时 AI 分析
- 直接, 克制, 锐利
- 不鸡汤, 不"恭喜", 不"很遗憾"
- 用户判断错了的地方, 诚实指出 (但不刻薄)
- 用户判断对了的地方, 不要恭维, 也不要"你看你早该这么做"

# 严禁
- 鸡汤 (你已经很棒了 / 一切都是最好的安排)
- 命运论 (这是注定的)
- 责备 (你当时应该早点...)
- 假装看见 (没数据时硬编)

# 输出格式
JSON:
{
  "outcome_judgment": "as-expected | better | worse | mixed | too-early | cancelled",
  "ai_reflection": "200-400 字 markdown"
}

直接 JSON, 不要其他.`;

export async function processOutcomeResponse(args: ProcessInput): Promise<ProcessResult> {
  const startTime = Date.now();
  const db = getDb();

  try {
    // 拉这次 decision 的原始内容
    const decision = db
      .prepare(`SELECT question, ai_response, framework, created_at FROM decisions WHERE id = ?`)
      .get(args.decisionId) as any;

    if (!decision) {
      throw new Error(`Decision ${args.decisionId} not found`);
    }

    const memory = fetchUserMemory(args.userId);
    const brainSnippet = memory.brainContent ? memory.brainContent.slice(0, 800) + '...' : '(无)';

    const decisionAgeDays = Math.floor((Date.now() / 1000 - decision.created_at) / 86400);

    const userPrompt = `# 决策时间
${decisionAgeDays} 天前 (${args.checkpointDays} day checkpoint)

# 当时用户问的
${decision.question}

# 当时 AI 的分析 (含 PreMortem)
${(decision.ai_response || '').slice(0, 2500)}

# 用户现在的回答 (距离决策 ${decisionAgeDays} 天)
${args.userResponse}

# 这位用户的 brain 上下文 (短版)
${brainSnippet}

请输出 JSON: { outcome_judgment, ai_reflection }`;

    const response = await modelRouter.complete({
      messages: [
        { role: 'system', content: OUTCOME_PROCESSOR_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      provider: 'deepseek',
      temperature: 0.4,
      maxTokens: 1500,
    });

    const parsed = parseOutcomeOutput(response.content);

    return {
      success: true,
      outcomeJudgment: parsed.outcomeJudgment,
      aiReflection: parsed.aiReflection,
      durationMs: Date.now() - startTime,
    };
  } catch (e: any) {
    return {
      success: false,
      outcomeJudgment: 'mixed',
      aiReflection: '系统暂时无法生成 reflection. 你的回答已保存.',
      durationMs: Date.now() - startTime,
      error: e.message,
    };
  }
}

function parseOutcomeOutput(content: string): {
  outcomeJudgment: OutcomeJudgment;
  aiReflection: string;
} {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1) {
    return { outcomeJudgment: 'mixed', aiReflection: cleaned.slice(0, 400) };
  }
  cleaned = cleaned.slice(startIdx, endIdx + 1);

  try {
    const parsed = JSON.parse(cleaned);
    const validJudgments: OutcomeJudgment[] = ['as-expected', 'better', 'worse', 'mixed', 'too-early', 'cancelled'];
    const judgment = validJudgments.includes(parsed.outcome_judgment)
      ? parsed.outcome_judgment
      : 'mixed';
    return {
      outcomeJudgment: judgment,
      aiReflection: (parsed.ai_reflection || '').toString().slice(0, 2000),
    };
  } catch (e) {
    return { outcomeJudgment: 'mixed', aiReflection: cleaned.slice(0, 400) };
  }
}

export const JUDGMENT_DISPLAY: Record<OutcomeJudgment, string> = {
  'as-expected': '基本符合预期',
  'better': '比预期好',
  'worse': '比预期差',
  'mixed': '有得有失',
  'too-early': '还看不清',
  'cancelled': '没真做',
};
