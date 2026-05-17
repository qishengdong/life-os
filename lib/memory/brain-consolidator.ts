/**
 * Brain Consolidator (Sivon Pillar 6 移植)
 *
 * 把 RMC 5 类卡 + decisions + commitments 蒸馏成软记忆叙事 (markdown).
 *
 * 触发时机:
 *   - 用户决策次数 >= 5 且距上次 consolidate > 5 决策
 *   - 或者距上次 consolidate > 7 天
 *
 * 输出:
 *   - 写入 user_brain.content (markdown)
 *   - 后续每次决策 prompt 都注入 brainContent
 *   - 用户可在 /history 看 (V1) / 编辑 (V1.5)
 *
 * Sivon 铁律 (移植):
 *   - "今天" 在 brain 里 = 写时的今天, 不是 current
 *   - 默认不主动 callback 具体细节, 除非用户当前直接问起
 */

import { modelRouter } from '@/lib/model-router';
import { getDb } from '@/lib/db';
import { fetchUserMemory } from './index';

const CONSOLIDATION_DECISION_THRESHOLD = 5; // 距上次 consolidate >= 5 个新决策
const CONSOLIDATION_TIME_THRESHOLD_S = 7 * 86400; // 或 7 天

interface ConsolidationDecision {
  id: number;
  question: string;
  ai_response: string;
  framework: string | null;
  created_at: number;
}

const BRAIN_CONSOLIDATOR_PROMPT = `你是 KEY 的 Brain 撰写者. 你的工作: 读完用户的全部 RMC 卡 + 决策历史 + 承诺, 写一份"AI 给未来自己的关于这位用户的备忘录".

# 这份 brain.md 的角色
- 它是 AI 长期记忆的"软记忆叙事层"
- 每次新决策对话时会注入到 prompt, 让 AI 自然记得用户
- 用户也能看到, 所以要诚实但不刻薄
- 它不替代 RMC (RMC 是结构化数据, brain 是叙事整合)

# 写作要求
- 第三人称叙事 ("她/他...")
- 大白话, 不要术语黑话
- 聚焦"这个人是谁 + 当前状态 + 重复模式 + 未解决议题"
- 不要把 RMC 卡平铺直叙, 要整合成连贯叙事
- 控制长度 800-1500 字

# 必含章节
## 关于这位用户
一段身份画像: 年龄 / 性别 / 家庭结构 / 职业 / 城市. 1 段话.

## 价值观与人生方向
基于决策历史推断他/她的核心价值观, 长期想要什么. 1-2 段.

## 当前状态
- 职业:
- 关系:
- 财务:
- 健康:
- 意义感:
每条 1-2 句具体描述.

## 已识别的人生模式
基于决策历史, 这个人反复出现的模式是什么? (如"她的卡点经常出现在'怕父母失望'议题上") 1-2 段.

## 关键关系网络
列出关键他人 (配偶/父母/孩子/老板/兄弟姐妹), 每人 1-2 句关系动态描述.

## 未解决议题 (open loops)
用户提了但没想透的事. 列 3-5 条.

## AI 跟这位用户的对话历史风格
基于过去 N 次决策, 总结 AI 应该用什么调性 (例: "她对鸡汤特别敏感, 直接犀利更有效"). 1 段.

# 严禁
- 编造 RMC 卡里没有的事实
- 主观评价 ("她应该 X" / "他这样不对")
- 鸡汤式总结 ("她是一个坚强的人...")
- 心理诊断 ("她可能有抑郁症")

# 输出
直接 markdown 内容, 不要包 \`\`\` 块, 不要 "好的, 这是 brain.md:" 等开场白.`;

export async function shouldConsolidate(userId: number): Promise<{
  shouldRun: boolean;
  reason: string;
  decisionCount: number;
  lastConsolidatedAt: number | null;
}> {
  const db = await getDb();

  // 总决策数
  const decRow = (await db
    .prepare('SELECT COUNT(*) as n FROM decisions WHERE user_id = ?')
    .get(userId)) as { n: number };
  const decisionCount = decRow.n;

  // 上次 consolidation 时间 (从 user_brain.updated_at 取)
  const brainRow = (await db
    .prepare('SELECT updated_at, version FROM user_brain WHERE user_id = ?')
    .get(userId)) as { updated_at: number; version: number } | undefined;

  const now = Math.floor(Date.now() / 1000);
  const lastConsolidatedAt = brainRow?.updated_at ?? null;

  // 决策数不够 → 不跑
  if (decisionCount < CONSOLIDATION_DECISION_THRESHOLD) {
    return {
      shouldRun: false,
      reason: `决策数 ${decisionCount} < 阈值 ${CONSOLIDATION_DECISION_THRESHOLD}`,
      decisionCount,
      lastConsolidatedAt,
    };
  }

  // 从未 consolidate → 跑
  if (!brainRow) {
    return {
      shouldRun: true,
      reason: 'first-time consolidation',
      decisionCount,
      lastConsolidatedAt,
    };
  }

  // 距上次 7 天以上 → 跑
  const lastTs = lastConsolidatedAt ?? 0;
  if (now - lastTs >= CONSOLIDATION_TIME_THRESHOLD_S) {
    return {
      shouldRun: true,
      reason: `距上次 consolidation ${Math.floor((now - lastTs) / 86400)} 天`,
      decisionCount,
      lastConsolidatedAt,
    };
  }

  // 决策数比上次 consolidation 时多 5+ → 跑 (V1: 加 last_consolidation_decision_count 字段更精确)
  // V0 简化: 距上次 < 7 天 但决策很多 → 也跑一次
  // 这里我们查 user_brain 的 version (每次跑递增)
  const cardsSinceLastRow = (await db
    .prepare(
      `SELECT COUNT(*) as n FROM relationship_memory_cards
       WHERE user_id = ? AND created_at > ?`
    )
    .get(userId, lastTs)) as { n: number };

  if (cardsSinceLastRow.n >= 10) {
    return {
      shouldRun: true,
      reason: `自上次 consolidation 已抽 ${cardsSinceLastRow.n} 张新 RMC 卡`,
      decisionCount,
      lastConsolidatedAt,
    };
  }

  return {
    shouldRun: false,
    reason: `距上次 < 7 天且新增 < 10 卡`,
    decisionCount,
    lastConsolidatedAt,
  };
}

export async function consolidateBrain(userId: number): Promise<{
  success: boolean;
  brainContent: string;
  charCount: number;
  decisionsAnalyzed: number;
  rmcCardsAnalyzed: number;
  durationMs: number;
  error?: string;
}> {
  const startTime = Date.now();
  const db = await getDb();

  try {
    // 1. 拉用户全部 memory
    const memory = await fetchUserMemory(userId);

    // 2. 拉决策历史 (最近 20 次)
    const decisions = (await db
      .prepare(
        `SELECT id, question, ai_response, framework, created_at
         FROM decisions
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 20`
      )
      .all(userId)) as ConsolidationDecision[];

    // 3. 拉 commitments
    const commitments = (await db
      .prepare(
        `SELECT commitment_text, commitment_kind, status, created_at
         FROM life_os_commitments
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 20`
      )
      .all(userId)) as Array<{
        commitment_text: string;
        commitment_kind: string;
        status: string;
        created_at: number;
      }>;

    // 4. 拼装输入给 LLM
    const memorySection = `# 关于该用户的 RMC 卡 (Memory 5 层)

## Core State (硬锚点 - 永久成立)
${memory.coreState.map((c) => `- [${c.kind}] ${c.factText}`).join('\n') || '(无)'}

## Boundary (用户表达的硬边界)
${memory.boundary.map((b) => `- ${b.title}: ${b.content} (confidence ${(b.confidence * 100).toFixed(0)}%)`).join('\n') || '(无)'}

## Factual (事实卡)
${memory.factual.map((f) => `- ${f.title}: ${f.content}`).join('\n') || '(无)'}

## Episodic (事件记忆)
${memory.episodic.map((e) => `- ${e.title}: ${e.content}`).join('\n') || '(无)'}

## Relational (关系网络)
${memory.relational.map((r) => `- ${r.title}: ${r.content}`).join('\n') || '(无)'}

## Psych Signal (心理信号)
${memory.psychSignal.map((p) => `- ${p.title}: ${p.content}`).join('\n') || '(无)'}

## Open Loops (待跟进)
${memory.openLoops.map((l) => `- ${l.title}${l.description ? ': ' + l.description : ''}`).join('\n') || '(无)'}`;

    const decisionsSection = `# 决策历史 (最近 ${decisions.length} 次)
${decisions
  .map(
    (d, i) =>
      `## 决策 ${i + 1} (${new Date(d.created_at * 1000).toLocaleDateString('zh-CN')}, framework: ${d.framework || 'general'})
[用户问题]
${d.question}

[AI 当时的回答 (节选 - 前 500 字)]
${(d.ai_response || '').slice(0, 500)}...
`
  )
  .join('\n')}`;

    const commitmentsSection = `# AI 自己许下的承诺 (Self-Commitments)
${commitments.map((c) => `- [${c.commitment_kind}/${c.status}] ${c.commitment_text}`).join('\n') || '(无)'}`;

    const userPrompt = `${memorySection}

${decisionsSection}

${commitmentsSection}

请基于以上,写一份这位用户的 brain.md.`;

    // 5. 调 LLM
    const response = await modelRouter.complete({
      messages: [
        { role: 'system', content: BRAIN_CONSOLIDATOR_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      provider: 'deepseek',
      temperature: 0.4,
      maxTokens: 4000,
    });

    let brainContent = response.content.trim();
    // 去掉可能的 ```markdown 包裹
    brainContent = brainContent.replace(/^```markdown\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    // 合规: AI 生成内容标识
    const { appendAIDisclosure } = await import('@/lib/safety');
    brainContent = appendAIDisclosure(brainContent);

    // 6. 写入 user_brain
    const existingRow = (await db
      .prepare('SELECT user_id, version FROM user_brain WHERE user_id = ?')
      .get(userId)) as { user_id: number; version: number } | undefined;

    if (existingRow) {
      db.prepare(
        `UPDATE user_brain SET content = ?, version = version + 1, updated_at = unixepoch() WHERE user_id = ?`
      ).run(brainContent, userId);
    } else {
      db.prepare(
        `INSERT INTO user_brain (user_id, content, version, updated_at) VALUES (?, ?, 1, unixepoch())`
      ).run(userId, brainContent);
    }

    return {
      success: true,
      brainContent,
      charCount: brainContent.length,
      decisionsAnalyzed: decisions.length,
      rmcCardsAnalyzed: memory.stats.totalCards,
      durationMs: Date.now() - startTime,
    };
  } catch (e: any) {
    return {
      success: false,
      brainContent: '',
      charCount: 0,
      decisionsAnalyzed: 0,
      rmcCardsAnalyzed: 0,
      durationMs: Date.now() - startTime,
      error: e.message,
    };
  }
}

/**
 * 决策完成后异步触发 (fire-and-forget):
 *   - 检查是否到 consolidation 阈值
 *   - 是 → 跑 consolidator
 *   - 不是 → skip
 */
export async function maybeConsolidate(userId: number): Promise<void> {
  try {
    const check = await shouldConsolidate(userId);
    if (!check.shouldRun) {
      return;
    }
    console.log(
      `[brain-consolidator] user ${userId}: ${check.reason} → triggering consolidation`
    );
    const result = await consolidateBrain(userId);
    if (result.success) {
      console.log(
        `[brain-consolidator] user ${userId}: ✅ wrote ${result.charCount} chars (${result.decisionsAnalyzed} decisions, ${result.rmcCardsAnalyzed} RMC cards) in ${(result.durationMs / 1000).toFixed(1)}s`
      );
    } else {
      console.error(`[brain-consolidator] user ${userId}: ❌ ${result.error}`);
    }
  } catch (e: any) {
    console.error('[brain-consolidator] maybeConsolidate failed:', e);
  }
}
