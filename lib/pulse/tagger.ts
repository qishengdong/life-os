/**
 * Pulse Tagger + AI 思考伴侣回应
 *
 * 单次 LLM call 做两件事:
 *   1. 自动打 10 类标签 (1-3 个最相关的)
 *   2. 生成 30-80 字 "思考伴侣" 风格回应
 *
 * 同时写入 RMC episodic 卡 (跨 episode 累积).
 */

import { modelRouter } from '@/lib/model-router';
import { addMemoryCard, fetchUserMemory } from '@/lib/memory';
import type { PulseTag } from './schema';
import { TAG_DISPLAY } from './schema';
import type { PulseQuestionId } from './schema';
import { getQuestion } from './schema';

interface ProcessResult {
  tags: PulseTag[];
  aiResponse: string;
  rmcEpisodicId: number | null;
  durationMs: number;
}

const PULSE_PROCESSOR_PROMPT = `你是 Life OS 的 Pulse 处理器. 用户写了今天的一条 Pulse — 这不是日记, 是"人生信号采集".

你的工作:
1. 给 Pulse 打 1-3 个最相关的标签 (从 10 类中选)
2. 写一句 30-80 字的"思考伴侣"回应

# 10 类标签
- relationship: 关系信号 (配偶 / 朋友 / 同事 / 一般人际)
- children: 孩子信号
- parents: 父母信号
- career: 职业信号
- wealth: 资产 / 财务信号
- health: 身体 / 健康信号
- emotion: 情绪信号 (焦虑 / 愤怒 / 难过 / 空 / 崩溃)
- avoidance: 逃避信号 (不想 / 拖 / 没敢 / 假装)
- repeating-pattern: 重复模式 (又 / 再次 / 总是 / 老问题)
- potential-major-decision: 潜在重大决策 (要不要 / 是不是该 / 卡住 / 摊牌)

# 回应风格 (重要)

你不是分析师, 不是治疗师, 不是教练. 你是**思考伴侣**.

✅ 该做:
- "我听见你说 X. 你有没有注意到 Y?" (反映式追问)
- "你最近第 N 次说这件事了." (pattern callback, 如果记忆里有)
- "你说'还行', 但你的身体在说'救命'." (识别矛盾)
- 直接, 克制, 锐利

❌ 严禁:
- "加油 / 你已经很棒了 / 相信自己 / 听从内心" (鸡汤)
- "我理解你的感受" (廉价共情)
- "我们来分析一下" (开框架 - 不是 deep dive)
- 任何超过 80 字
- emoji
- 网络流行语 / 反讽 / 互联网腔

# 用户 brain 上下文 (如有)
{brain_context}

# 输出格式
JSON:
{
  "tags": ["..."],          // 1-3 个最相关的
  "ai_response": "..."      // 30-80 字, 一句话或两句话, 不要分段
}

直接 JSON, 不要 markdown, 不要解释.`;

export async function processPulse(args: {
  userId: number;
  questionId: PulseQuestionId;
  content: string;
}): Promise<ProcessResult> {
  const startTime = Date.now();
  const question = getQuestion(args.questionId);
  const memory = fetchUserMemory(args.userId);

  // 拼装 brain context (压缩版, 给 tagger 用)
  const brainContext = memory.brainContent
    ? `${memory.brainContent.slice(0, 1500)}...`
    : `(用户还没有完整 brain — 这可能是头几次 Pulse)`;

  const promptWithContext = PULSE_PROCESSOR_PROMPT.replace('{brain_context}', brainContext);

  const userMessage = `# 今天的问题
${question?.prompt || '今天的 Pulse'}

# 用户的回答
${args.content}

请给标签 + 思考伴侣回应.`;

  let tags: PulseTag[] = [];
  let aiResponse = '';

  try {
    const response = await modelRouter.complete({
      messages: [
        { role: 'system', content: promptWithContext },
        { role: 'user', content: userMessage },
      ],
      provider: 'deepseek',
      temperature: 0.5,
      maxTokens: 800,
    });

    const parsed = parseProcessorOutput(response.content);
    tags = parsed.tags;
    aiResponse = parsed.aiResponse;
  } catch (e: any) {
    console.error('[pulse-tagger] LLM call failed:', e);
    // Fallback: 留空 tags + 一句中性回应
    aiResponse = '我看见了. 我会记住的.';
  }

  // 写入 RMC episodic 卡 (累积进 brain.md 长期记忆)
  let rmcEpisodicId: number | null = null;
  try {
    rmcEpisodicId = addMemoryCard({
      userId: args.userId,
      cardType: 'episodic',
      title: `Pulse (${question?.name || args.questionId}): ${args.content.slice(0, 40)}...`,
      content: args.content,
      confidence: 1.0, // 用户原话, 100% confidence
      source: 'pulse',
      tags: tags,
    });
  } catch (e) {
    console.error('[pulse-tagger] failed to write RMC episodic:', e);
  }

  return {
    tags,
    aiResponse,
    rmcEpisodicId,
    durationMs: Date.now() - startTime,
  };
}

function parseProcessorOutput(content: string): {
  tags: PulseTag[];
  aiResponse: string;
} {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1) {
    return { tags: [], aiResponse: '我看见了.' };
  }
  cleaned = cleaned.slice(startIdx, endIdx + 1);

  try {
    const parsed = JSON.parse(cleaned);
    const validTags: PulseTag[] = (parsed.tags || []).filter((t: string) =>
      Object.keys(TAG_DISPLAY).includes(t)
    );
    return {
      tags: validTags.slice(0, 3),
      aiResponse: (parsed.ai_response || '我看见了.').toString().slice(0, 200),
    };
  } catch (e) {
    return { tags: [], aiResponse: '我看见了.' };
  }
}
