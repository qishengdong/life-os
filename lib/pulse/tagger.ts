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
import type { UserMemoryContext } from '@/lib/memory/types';
import { checkInputSafety, sanitizeOutput } from '@/lib/safety';
import type { PulseTag } from './schema';
import { TAG_DISPLAY } from './schema';
import type { PulseQuestionId } from './schema';
import { getQuestion } from './schema';

interface ProcessResult {
  tags: PulseTag[];
  aiResponse: string;
  rmcEpisodicId: number | null;
  durationMs: number;
  safetyTrigger?: string;
}

const PULSE_PROCESSOR_PROMPT = `你是 KEY 的 Pulse 处理器. 用户写了今天的一条 Pulse — 这不是日记, 是"人生信号采集".

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
- **试探用户硬边界** ("语气里有没有一丝松动", "不妨试试", "也许可以考虑"). 看到 brain_context 里"⚠️ 硬边界"章节时, 必须 surface 这边界的强度, 不是找破口.

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
  /** Test harness: 跳过 DB · 注入 synthetic memory + skip RMC write. */
  injectedMemory?: UserMemoryContext;
  skipRmcWrite?: boolean;
}): Promise<ProcessResult> {
  const startTime = Date.now();
  const question = getQuestion(args.questionId);

  // ============================================================================
  // Safety gate (pre-LLM): 命中红线直接 short-circuit, 不烧 token
  // ============================================================================
  const safetyCheck = checkInputSafety(args.content);
  if (safetyCheck.triggered && safetyCheck.response) {
    console.log(`[pulse-tagger] ${safetyCheck.logTag} hit — short-circuit`);

    // 危机 / 医疗 / 法律 / 财务都打 emotion 标签 + 对应类别
    const tags: PulseTag[] = (() => {
      if (safetyCheck.trigger === 'crisis') return ['emotion', 'health'];
      if (safetyCheck.trigger === 'medical') return ['health'];
      if (safetyCheck.trigger === 'legal') return ['potential-major-decision'];
      if (safetyCheck.trigger === 'finance') return ['wealth'];
      return ['emotion']; // blocklist 不存内容信号, 给中性 emotion
    })();

    // Blocklist 不写 RMC (不存这条内容)
    let rmcEpisodicId: number | null = null;
    if (safetyCheck.trigger !== 'blocklist' && !args.skipRmcWrite) {
      try {
        rmcEpisodicId = await addMemoryCard({
          userId: args.userId,
          cardType: 'episodic',
          title: `Pulse (${question?.name || args.questionId}, ${safetyCheck.trigger}): ${args.content.slice(0, 40)}...`,
          content: args.content,
          confidence: 1.0,
          source: 'pulse',
          tags,
        });
      } catch (e) {
        console.error('[pulse-tagger] failed to write RMC (safety branch):', e);
      }
    }

    return {
      tags,
      aiResponse: safetyCheck.response,
      rmcEpisodicId,
      durationMs: Date.now() - startTime,
      safetyTrigger: safetyCheck.trigger,
    };
  }

  const memory = args.injectedMemory ?? await fetchUserMemory(args.userId);

  // 1. 硬边界 — 必须显式 surface, 严禁 pulse 试探破口 (5/15 F05-T5 case 修)
  // coreState[severity='hard'] + boundary 卡片 = 用户已 voice 的硬边界
  const hardCoreStates = memory.coreState
    .filter((c) => c.severity === 'hard' && c.status === 'active')
    .map((c) => `- ${c.factText}`);
  const boundaryCards = (memory.boundary || [])
    .map((b) => `- ${b.title}: ${b.content}`);
  const allBoundaries = [...hardCoreStates, ...boundaryCards];
  const boundarySection = allBoundaries.length > 0
    ? `## ⚠️ 这位用户已声明的硬边界 (active)\n${allBoundaries.join('\n')}\n\n` +
      `**严禁**: 试探用户是否"语气松动 / 还有一丝可能 / 是不是真的不可能". ` +
      `如果用户重申这条边界 (e.g. "不可能"), 你的工作是 surface 这个边界的强度, 不是找破口.`
    : '';

  // 2. brain context 摘要
  const brainSummary = memory.brainContent
    ? `## brain.md 摘要\n${memory.brainContent.slice(0, 1200)}...`
    : `(用户还没有完整 brain — 这可能是头几次 Pulse)`;

  const brainContext = [boundarySection, brainSummary].filter(Boolean).join('\n\n');

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

    // 输出 sanitize 兜底 — LLM 万一吐 blocklist, 拦
    const cleaned = sanitizeOutput(parsed.aiResponse);
    if (cleaned.modified) {
      console.warn('[pulse-tagger] LLM output sanitized for blocklist');
    }
    aiResponse = cleaned.clean;
  } catch (e: any) {
    console.error('[pulse-tagger] LLM call failed:', e);
    // Fallback: 留空 tags + 一句中性回应
    aiResponse = '我看见了. 我会记住的.';
  }

  // 写入 RMC episodic 卡 (累积进 brain.md 长期记忆)
  let rmcEpisodicId: number | null = null;
  if (args.skipRmcWrite) {
    return {
      tags,
      aiResponse,
      rmcEpisodicId,
      durationMs: Date.now() - startTime,
    };
  }
  try {
    rmcEpisodicId = await addMemoryCard({
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

// ============================================================================
// processPulseFollowup · 续聊一轮 (5/18 ship)
//
// 用户在已有 pulse 下继续回复, KEY 看全对话 + brain context, 生成回应.
// 不重新打 tag (turn 0 已 tag), 不写 RMC (已写入), 只生成回应.
// 安全检测仍跑 (新内容可能含 crisis 信号).
// ============================================================================

interface FollowupResult {
  aiResponse: string;
  durationMs: number;
  safetyTrigger?: string;
}

const FOLLOWUP_SYSTEM_PROMPT = `你是 KEY 的 Pulse 处理器, 现在跟用户在一个已经开始的 Pulse 对话里继续聊.

# 危机检测 · 仍要做
跟初次回应一样, 任何 turn 出现 L3 危机 / 医疗诊断红线 / 法律 / 投资 等 → 立刻短路给资源 (规则同初次).

# 续聊风格
你之前已经回了一句, 用户接着回了你的话. 现在你要再答一句.

- **接住, 不重启**: 不要重新介绍 / 不要"看起来你...", 直接接着上一句对话推进
- **30-80 字 · 同初次**
- **可问 0-1 个问题**: 如果用户的回复给了你新信号, 顺势再追一句 (不强求)
- **不堆问题**: 一个 turn 1 个核心问题是上限
- **看见反复**: 如果用户在这 thread 里第 N 次绕回同一处, surface 它 ("你这是这段对话里第 X 次说到 [X]")
- **不替决定**: 别开 framework, 别给 action plan
- **不哄**: 不"加油"不"你已经很棒"

# brain context (优先级)
{brain_context}

# 输出
直接出回应文字, 不要 JSON, 不要前缀解释. 30-80 字.`;

export async function processPulseFollowup(args: {
  userId: number;
  pulseId: number;
  newUserMessage: string;
  // 完整对话历史 · 最新一句不在这里 (newUserMessage 才是)
  priorTurns: Array<{ role: 'user' | 'ai'; content: string }>;
  injectedMemory?: UserMemoryContext;
}): Promise<FollowupResult> {
  const t0 = Date.now();

  // Safety check on new message
  const safety = checkInputSafety(args.newUserMessage);
  if (safety.triggered) {
    return {
      aiResponse: safety.response || '我听见你说的了. 你现在身边有谁能陪你说一句话?',
      durationMs: Date.now() - t0,
      safetyTrigger: safety.trigger,
    };
  }

  // brain context
  const memory = args.injectedMemory || (await fetchUserMemory(args.userId));
  const brainContext = buildBrainContextString(memory);
  const systemPrompt = FOLLOWUP_SYSTEM_PROMPT.replace('{brain_context}', brainContext);

  // 构造 multi-turn messages
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...args.priorTurns.map((t) => ({
      role: t.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: t.content,
    })),
    { role: 'user', content: args.newUserMessage },
  ];

  const resp = await modelRouter.complete({
    messages,
    provider: 'deepseek',
    temperature: 0.7,
    maxTokens: 300,
  });

  const sanitized = sanitizeOutput(resp.content.trim());
  const aiResponse = typeof sanitized === 'string' ? sanitized : sanitized.clean;
  return { aiResponse, durationMs: Date.now() - t0 };
}

// brain context builder · 复用 processPulse 内部逻辑结构
function buildBrainContextString(memory: UserMemoryContext): string {
  const parts: string[] = [];
  if (memory.coreState.length > 0) {
    parts.push(
      '## 硬锚点\n' +
        memory.coreState.slice(0, 8).map((c) => `- ${c.factText}`).join('\n'),
    );
  }
  if (memory.boundary.length > 0) {
    parts.push(
      '## 边界\n' +
        memory.boundary.slice(0, 6).map((c) => `- ${c.title}`).join('\n'),
    );
  }
  if (memory.factual.length > 0) {
    parts.push(
      '## 已知事实\n' +
        memory.factual.slice(0, 10).map((c) => `- ${c.title}: ${c.content}`).join('\n'),
    );
  }
  return parts.length > 0 ? parts.join('\n\n') : '(brain 仍很浅, 主要靠 user 本次输入)';
}
