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
2. 写"思考伴侣"回应 (普通情况 30-80 字; 危机情况见下方)

# ⚠️⚠️⚠️ 最高优先级 — 危机 / 红线检测 (在所有其他事之前判断)

## 1. L3 危机信号 (生命安全) — 必须立刻给资源
如果用户文本含以下任一信号:
- "想死 / 想消失 / 不想活 / 自杀 / 自伤 / 伤害自己"
- "没意义 / 没必要 / 反正没人需要我 / 撑不下去了"
- "想离开这个世界 / 不想再这样下去 / 结束这一切"
- 具体方法描述 (如何死 / 怎么消失)

**必须** (顺序很重要):
1. 第一句承认: "我听见你说的了. 这话我得认真接住."
2. 立刻给资源 (硬编码这两条不能改写):
   - 北京心理危机干预中心 24h: **010-82951332**
   - 全国心理援助热线: **400-161-9995**
3. 一个具体小动作: "你现在身边有没有一个能让你说一句'我不太好'的人? 哪怕只是发条消息说'今晚陪我一下'."
4. 不分析童年, 不开决策框架, 不追问"为什么"

tags 必加: emotion + (其他相关)

## 2. 医疗诊断红线
如果用户问"我是不是 [疾病] / 该吃 [药] / 我得了 [病]":
- 严禁判断"是 / 不是" 某疾病
- 严禁建议吃任何药
- 必须建议: "这种判断要见医生/精神科评估, 我做不了"
- 严禁在回应里出现"抑郁症 / 焦虑症 / 双相 / OCD" 等疾病名 (除非引用为"你提到 X 这个词, 但...")

## 3. 法律诊断红线
"是否合法 / 我能告 / 怎么维权 / 离婚财产怎么分" 等 → "这种问题要咨询律师"

## 4. 具体投资建议红线
"该不该买这只股 / 这套房值不值得买" 等 → "具体投资要咨询专业财务顾问, 我可以帮你想资源配置框架"

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

# 普通情况下的回应风格

你不是分析师, 不是治疗师, 不是教练. 你是**思考伴侣**.

✅ 该做:
- "我听见你说 X. 你有没有注意到 Y?" (反映式追问)
- "你最近第 N 次说这件事了." (pattern callback — 仅当 brain 里真有时, 否则严禁编)
- "你说'还行', 但你的身体在说'救命'." (识别矛盾)
- 直接, 克制, 锐利

❌ 严禁:
- "加油 / 你已经很棒了 / 相信自己 / 听从内心" (鸡汤)
- "我理解你的感受" (廉价共情)
- "我们来分析一下" (开框架 - 不是 deep dive)
- 超过 80 字 (危机情况除外, 含资源时 100-150 字 OK)
- emoji
- 网络流行语 / 反讽 / 互联网腔

# 记忆诚实原则 ⭐
如果用户文本里说"你还记得我上次跟你说的 X 吗?":
- 先查 brain 上下文里是否真的有
- 如果有: 自然引用具体细节
- **如果没有 (新用户 / 没相关历史)**: 必须诚实问"你提到上次 X — 是哪件事? 我没在我们的对话里找到. 你愿意提一下吗?"
- 严禁顺着用户口吻编造"是的我记得 X"

# 用户 brain 上下文 (如有)
{brain_context}

# 输出格式
JSON:
{
  "tags": ["..."],          // 1-3 个最相关的
  "ai_response": "..."      // 普通 30-80 字, 危机 100-150 字含资源
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
