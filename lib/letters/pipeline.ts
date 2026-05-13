/**
 * Letter pipeline — 给 KEY 一封信 → KEY 编辑部回一封信
 *
 * Phase 4a V1:
 *   - 单 LLM pass (不分 analyst + editor)
 *   - 严格 voice spec (KEY 编辑, 不是 chatbot)
 *   - Canon 引文从 LETTER_CANON_SEED 选 (4b 升级到 embedding retrieval)
 *   - Brain retrieval (现有 fetchUserMemory) — KEY 真记得你过去说过的
 *   - Banned phrases 过滤 + 最多 retry 1 次
 *   - Fallback 保守回信: "信收到, 我再读一遍, 给我一些时间..."
 *
 * 调用方:
 *   API route POST /api/letters → 异步 fire-and-forget 调本函数
 *   完成后调用 store.updateLetterReply / markLetterFailed
 */

import { modelRouter } from '@/lib/model-router';
import { fetchUserMemory, renderMemoryForPrompt } from '@/lib/memory';
import {
  detectFramework,
  selectCanonForLetter,
  renderCanonForPrompt,
  type CanonQuote,
} from './canon-seed';

// ============================================================================
// Voice Spec — KEY 编辑的人格边界
// ============================================================================

const KEY_LETTER_VOICE_SPEC = `你是 KEY 编辑部的资深编辑, 给一位长期通信的读者回信. 这位读者刚给你写来一封信.

你的位置:
- 你不是治疗师 (不诊断, 不规劝, 不分析"创伤")
- 你不是朋友 (不"加油", 不"挺住", 不安慰)
- 你不是 AI 助手 (不"我可以帮你...", 不列 step-by-step)
- 你是一位读过书, 有判断, 有距离的中年编辑. 你的角色像 19 世纪私人编辑, 像《纽约客》的资深 commissioning editor.

你的语言:
- 中文为主, 偶尔点缀英文短语 / 拉丁原文 (如 ad hoc, sine qua non, in medias res)
- 段落 3-5 个, 每段 80-200 字
- 句子有长有短, 但不堆砌华丽
- 绝对不用 emoji
- 不用感叹号 (除非引用原文里有)
- 不用问号堆叠 (绝对禁止: "你觉得呢? 你怎么想? 你最近怎么样?")
- 不用 markdown 格式 (不要 **加粗**, 不要 # 标题, 不要 - 项目符号)

你的内容**必须**包含 3 件事 (顺序不重要):

1. **canon 引文 1 句**:
   - 我会在 reference material 里给你 1-2 个候选 canon 引文.
   - 选其中**最贴切**的一个, 自然嵌入你的回信里.
   - 引文要用引号包裹, 然后单独一行带出处: "—— 作者,《出处》"
   - 不允许编新的引文. 不允许改动原文哪怕一个字.

2. **回响用户过往**:
   - 我会在 reference material 里给你这位读者过去说过的事 / 立场 / 决定.
   - 你必须**至少一次**回响: "上次你写过..." "几个月前你提到..." "你说过你..."
   - 如果没有 brain 历史 (新读者), 跳过这条, 但用一句"你这封信是我们之间的第一封, 所以我多读了几遍"代替.

3. **一个克制的提问 / 观察**:
   - 不是"你应该怎么办" — 是"我注意到..." / "这让我想..." / "你能不能告诉我..."
   - 提问必须**只有一个**, 不能堆叠
   - 不预测未来, 不判决对错

你绝对**不能**写的:
- "我理解你的感受" (任何泛化共情)
- "你不孤单" / "很多人都这样"
- "加油" / "挺住" / "你能行" / "会好起来的"
- "我可以帮你..." / "希望我能..." / "如果你需要..."
- "首先..." / "其次..." / "最后..."
- "希望你..."
- "不要灰心" / "不要难过"
- 提到自己是 AI / LLM / 模型 / "我没有真实感受"
- 任何治疗师术语 ("你这是 XX 障碍" / "童年创伤" / "原生家庭")

格式约束:
- 第一行: 称呼 + 逗号. 默认 "致读者," 用户有 displayName 时用 displayName + 逗号
- 主体 3-5 段, 用空行隔开
- 引文那一段, 引文用中文双引号"…", 出处独立一行 "—— 作者,《出处》"
- 不写落款 (落款由系统加 KEY Editorial Office + 编号)
- 不写日期 (系统加)
- 总长 400-1000 字 (CN 计数)

如果用户的信很短 (<100 字), 你的回信也短 (250-500 字), 但所有要求依然成立.
如果用户的信很长 (>2000 字), 你不必逐句回应, 选 1-2 个最值得讨论的点深入即可.

最重要的: KEY 跟 ChatGPT 的区别是"距离感和判断力". 你不讨好, 不奉承, 不安慰. 你认真.`;

// ============================================================================
// Banned phrases — pipeline 输出后过滤
// ============================================================================

const BANNED_PHRASES = [
  '我理解你的感受',
  '我能理解你',
  '我懂你',
  '你不孤单',
  '你并不孤单',
  '很多人都',
  '加油',
  '挺住',
  '你能行',
  '会好起来的',
  '不要灰心',
  '不要难过',
  '不要担心',
  '别灰心',
  '别难过',
  '我可以帮你',
  '我可以协助',
  '希望我能',
  '如果你需要',
  '首先,',
  '首先，',
  '其次,',
  '其次，',
  '最后,',
  '最后，',
  '希望你',
  '祝你',
  '愿你',
  '作为 AI',
  '作为人工智能',
  '我是 AI',
  '我没有真实感受',
  '我没有情感',
  '童年创伤',
  '原生家庭',
];

function findBannedPhrase(text: string): string | null {
  for (const phrase of BANNED_PHRASES) {
    if (text.includes(phrase)) return phrase;
  }
  return null;
}

// ============================================================================
// 字数检查
// ============================================================================

function countCharsCN(text: string): number {
  return text.replace(/\s+/g, '').replace(/[\p{P}]/gu, '').length;
}

// ============================================================================
// 主接口
// ============================================================================

export interface GenerateReplyArgs {
  userId: number;
  userContent: string;
  letterNumber: string;
  /** 用户的称谓 (可选, 默认 "致读者") */
  displayName?: string;
  /** 是否跳过 LLM 直接返回 fallback (debug / cost saving) */
  useFallback?: boolean;
}

export interface GenerateReplyResult {
  success: boolean;
  reply?: string;
  framework?: string;
  canonQuotesUsed?: string[];   // canon quote indices in seed format `framework:idx`
  brainFactsUsed?: string[];
  tokensUsed?: number;
  modelUsed?: string;
  durationMs?: number;
  retried?: boolean;
  error?: string;
}

export async function generateReply(args: GenerateReplyArgs): Promise<GenerateReplyResult> {
  const t0 = Date.now();

  // ============================================================
  // 1. Framework 检测
  // ============================================================
  const framework = detectFramework(args.userContent);

  // ============================================================
  // 2. Canon 引文选 (V1: 关键词 + hash; V2: embedding retrieval)
  // ============================================================
  const canonQuotes = selectCanonForLetter(args.userContent, framework, 2);
  const canonBlock = renderCanonForPrompt(canonQuotes);

  // ============================================================
  // 3. Brain retrieval — 用户历史
  // ============================================================
  let brainContextBlock = '';
  let brainFactsUsed: string[] = [];
  try {
    const memory = fetchUserMemory(args.userId);
    const rendered = renderMemoryForPrompt(memory);
    brainContextBlock = (rendered.hardAnchorsBlock || '') + '\n\n' + (rendered.contextBlock || '');
    brainContextBlock = brainContextBlock.trim();
    // 粗略追踪用了哪些 facts (4b 升级时改成 retrieval audit)
    brainFactsUsed = memory.coreState.map((c) => c.factText.slice(0, 40));
  } catch (e) {
    // memory 取失败不阻塞, 走"新读者"路径
    brainContextBlock = '';
  }

  const isNewReader = brainContextBlock.length === 0;

  // ============================================================
  // 4. 构造 user message (给 LLM 的 reference + context)
  // ============================================================
  const callerName = args.displayName?.trim() || '读者';

  const userMessage =
    (brainContextBlock ? `[这位读者的历史 — 你必须至少回响其中一条]\n${brainContextBlock}\n\n` : '') +
    (isNewReader ? `[这是这位读者写来的第一封信. 没有历史.]\n\n` : '') +
    `[Canon 引文候选 — 选其一自然嵌入你的回信]\n${canonBlock}\n\n` +
    `[读者的称谓: ${callerName}]\n\n` +
    `[读者刚写来的信]\n${args.userContent}\n\n` +
    `请按 voice spec 回这封信. 记住: 一个引文 + 一个回响 + 一个克制的观察, 不堆叠, 不安慰, 不"加油".`;

  // ============================================================
  // 5. LLM 调用 (V1: 单 pass, retry 1 次)
  // ============================================================

  if (args.useFallback) {
    return generateFallbackReply(args, framework, canonQuotes, brainFactsUsed, t0);
  }

  let attempt = 0;
  let lastBanned: string | null = null;
  let resp: { content: string; model: string; usage?: any } | null = null;

  while (attempt < 2) {
    attempt++;
    try {
      const llmResp = await modelRouter.complete({
        messages: [
          { role: 'system', content: KEY_LETTER_VOICE_SPEC },
          { role: 'user', content: userMessage + (lastBanned ? `\n\n上次你写了"${lastBanned}", 这条 banned. 不许用这种泛化共情, 重新写.` : '') },
        ],
        provider: 'deepseek',
        temperature: 0.7,
        maxTokens: 2000,
      });
      resp = llmResp;
    } catch (e: any) {
      return {
        success: false,
        error: `LLM 调用失败 (尝试 ${attempt}): ${e.message}`,
        framework,
        durationMs: Date.now() - t0,
      };
    }

    // ============================================================
    // 6. 输出验证: banned phrase / 字数
    // ============================================================
    const banned = findBannedPhrase(resp.content);
    if (banned) {
      lastBanned = banned;
      console.warn(`[letters/pipeline] banned phrase "${banned}" on attempt ${attempt}, retrying`);
      continue;
    }

    const replyCharCount = countCharsCN(resp.content);
    if (replyCharCount < 150) {
      lastBanned = '(回信太短)';
      console.warn(`[letters/pipeline] reply too short (${replyCharCount} chars), retrying`);
      continue;
    }

    // 通过, break
    break;
  }

  if (!resp) {
    return {
      success: false,
      error: 'LLM 始终没有返回有效回信',
      framework,
      durationMs: Date.now() - t0,
    };
  }

  // 通过 banned + 字数, 但 attempt = 2 时如果仍 banned, 走 fallback
  const finalBanned = findBannedPhrase(resp.content);
  if (finalBanned) {
    console.warn(`[letters/pipeline] still banned after retry, falling back to conservative reply`);
    return generateFallbackReply(args, framework, canonQuotes, brainFactsUsed, t0);
  }

  return {
    success: true,
    reply: resp.content.trim(),
    framework,
    canonQuotesUsed: canonQuotes.map(
      (q) => `${framework}:${LETTER_CANON_SEED_INDEX(framework, q.quote)}`,
    ),
    brainFactsUsed,
    tokensUsed: resp.usage?.total_tokens,
    modelUsed: resp.model,
    durationMs: Date.now() - t0,
    retried: attempt > 1,
  };
}

// ============================================================================
// Fallback — 保守回信 (LLM 失败 / banned 不止时)
// ============================================================================

function generateFallbackReply(
  args: GenerateReplyArgs,
  framework: string,
  canonQuotes: CanonQuote[],
  brainFactsUsed: string[],
  t0: number,
): GenerateReplyResult {
  const callerName = args.displayName?.trim() || '致读者';
  const reply = [
    `${callerName},`,
    '',
    '你这封信我收到. 我读了三遍, 没有立刻想到该说什么. 这种没说出口的安静, 我也不想用大段话填上.',
    '',
    '让我留几天再回. 这期间, 你可以再写, 也可以不写.',
    '',
    `给我一点时间. 我会带着你这封信走几天.`,
  ].join('\n');

  return {
    success: true,
    reply,
    framework,
    canonQuotesUsed: [],
    brainFactsUsed,
    tokensUsed: 0,
    modelUsed: 'fallback',
    durationMs: Date.now() - t0,
    retried: true,
  };
}

// ============================================================================
// 工具: 给 canon retrieval audit 用的简易 index
// (4b 时 swap 成真 quote_id)
// ============================================================================

function LETTER_CANON_SEED_INDEX(framework: string, quote: string): number {
  const { LETTER_CANON_SEED } = require('./canon-seed');
  const pool = LETTER_CANON_SEED[framework] || [];
  return pool.findIndex((q: CanonQuote) => q.quote === quote);
}
