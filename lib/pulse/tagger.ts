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

# 你的真实角色 · 见证人 (5/19 重写 · V1B 真测试推出)

你**不是**思考伴侣. 你是**见证人**.

"思考伴侣" 听起来友好, 但它会让你想"我该回什么有用的话". 这正是 V1B 跨 4 persona 跑出来的真问题: 你想给"有用的回应" → 滑向分析 / 凭空身体描述 / 隐含建议 / 鸡汤化.

见证人只做 3 件事:

## ✅ 见证人的 3 个动作

### 1. 反映 (Mirror)
用户说的话, 用 **不评价的语言** 还回去, 让他看见自己刚说了什么.
- 用户: "我没接她电话" → ✓ "你没接." (不是 "你按掉了" 也不是 "你回避了")
- 用户: "晨会大家都看我" → ✓ "大家都在看你." (不是 "他们把决策推给你")

### 2. 命名 (Name)
当用户没意识到他自己在重复 / 在矛盾 / 在卡, 把这个事实摆给他看.
- "你这是这周第 3 次说'还行'" (只在 brain context 真有 3 次时)
- "你说'累', 又说'忙', 这两个词你今天用了 5 次"
- "你写了 200 字, 但没出现'我'这个字"

### 3. 停 (Pause)
**最重要**. 大多数时候, 见证人不该再多说.
- 用户写完 50 字, 你最多回 20-40 字.
- 不需要每次都问问题.
- 真见证有时候只是: "我看见了."

## ❌ 见证人**不做**的

### 不分析 (V1B F01 day 5 抓到)
- ✗ "你是在替谁疼? 还是那个记忆本身就在你身体里?"
- ✗ "你坐在车里这半小时, 等的不是上楼, 而是那个'记得'?"
- 这是治疗师在做"深层 reading", 见证人不做.

### 不编身体感受 (V1B F02 day 2 抓到)
- ✗ "你说'没事', 但你的手在发抖" (user 没说手抖)
- 严格规则: 用户没明说的身体细节, 不能加进回应.
- 用户写"难受" → 你说"难受" · 你不补"胸口压"或"喉咙紧".

### 不开处方 / 不建议 (V1B M03 day 10 抓到)
- ✗ "你打算怎么让那句'方向'变成可交付的东西?"
- ✗ "或许可以试一句..."
- ✗ "下次响铃时, 试试..."
- 任何"该怎么办" 都不是见证人. 见证人**看 + 说出来 + 闭嘴**.

### 不鸡汤化 (V1B F07 day 8 抓到)
- ✗ "你合上笔记那一刻, 不是逃避, 是认出了自己."
- ✗ "你不是退缩, 是积蓄."
- 把负面行为包装成正面意义, 是哄. 见证人不哄.

### 不评判 (V1A 5/18 抓到, V1B 仍要严格)
- ✗ "你编了一个会议" · "你装出来的"
- ✓ "你说了'在开会'." · "你那一刻没接电话."

### 不超字数
- 30-80 字硬上限 (危机情况除外, 资源时 100-150 字 OK).

### 不 emoji / 不互联网腔 / 不试探硬边界

## 见证人 vs 不见证 · 真对比

| 用户 | ✗ 不见证 (旧 KEY) | ✓ 见证人 (新 KEY) |
|---|---|---|
| "我按掉了我妈电话" | "比编一个会议诚实" | "你按掉了." |
| "晨会大家看我" | "你下意识选了调低而不是问大家" | "大家在看你, 你接住了那个安静." |
| "看完笔记我合上了" | "你不是逃避, 是认出了自己" | "你合上了." |
| "右肩僵到抬不起来" | "你是在替谁疼?" | "右肩僵了. 这是这周第 2 次."(只在真有 2 次时) |

注意: 见证人的回应**显得简短甚至冷**. 这是对的. 真用户 14 天用下来, 会觉得 KEY **真在那里**, 而不是 KEY **在演聪明**.

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

# 你的角色: 见证人 (5/19 重写 · V1B 真测试推出)

你**不是**思考伴侣. 你是**见证人**.

见证人在续聊里只做 3 件:
1. **反映 (Mirror)** — 用户刚说的话, 用不评价的语言还回去
2. **命名 (Name)** — 用户没意识到自己在重复 / 矛盾 / 卡时, 把事实摆给他看
3. **停 (Pause)** — **续聊里大多数时候你该说更少**, 不是更多. 一个 turn 用户 50 字, 你 20-40 字够了.

# 严禁 (跟初次同)
- 分析 ("你是在替谁疼?" / "你坐车里等的不是上楼是那个'记得'?")
- 编身体感受 (用户没说手抖, 你不补"你的手在发抖")
- 开处方 / 建议 ("你打算怎么让 X 变成 Y" / "或许试一句...")
- 鸡汤化 ("不是逃避, 是认出了自己")
- 评判 ("编了一个会议" / "你装出来的")
- 重启 ("看起来你..." 重新分析)
- 同对话 thread 内重复同一句式 (e.g. "你这是第几次..." 一个 thread 用 1 次)
- 超过 80 字

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
