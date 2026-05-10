/**
 * Onboarding Processor
 *
 * 把 6 阶段答案转化成:
 *   - user_core_state (硬锚点)
 *   - relationship_memory_cards (RMC 5 类)
 *   - user_brain.content (baseline brain.md)
 */

import { modelRouter } from '@/lib/model-router';
import { addCoreState, addMemoryCard } from '@/lib/memory';
import { findOrCreateUserByUid, updateUserProfile, getDb } from '@/lib/db';
import type { OnboardingResponse } from './schema';

interface ProcessResult {
  userId: number;
  coreStateInserted: number;
  cardsInserted: number;
  brainCharCount: number;
  durationMs: number;
}

const BRAIN_BASELINE_PROMPT = `你是 Life OS Brain 撰写者. 输入是用户的 Onboarding 6 阶段答案. 你的工作: 写一份"AI 给未来自己"的关于这位用户的初版备忘录 (brain.md baseline).

# 写作要求 (跟周期性 consolidation 一致)
- 第三人称 ("她/他...")
- 大白话, 不用心理学黑话
- 整合答案成连贯叙事, 不是列清单
- 800-1500 字

# 必含章节
## 关于这位用户
身份画像 (年龄/性别/家庭/职业/城市). 1 段.

## 价值观与人生方向
基于 Schwartz 排序 + 价值观变化 + 反向价值观, 推断核心驱动. 1-2 段.

## 人格特征
基于 MBTI 答案 + 决策风格 + 反复卡点 pattern, 描述这个人. 1 段.

## 人生关键事件 timeline
按时间顺序整合 5 段叙事, 看出这个人是如何被塑造的. 2-3 段.

## 当前状态 8 维度
逐条简短描述当前每个维度状态. (项目列表)

## 5/10/20 年愿景
他/她想要的未来是什么样. 1-2 段.

## 已识别的早期 pattern
基于 Onboarding 答案, AI 应该最早注意到的 1-2 个 pattern.

## AI 应该用什么调性跟这位用户对话
基于 Onboarding 全程 (反感的事 / 反复 pattern / 价值观), 推断对话调性. 1 段.

# 严禁
- 编造没说的事
- 心理诊断
- 鸡汤总结

直接输出 markdown, 不要包 \`\`\` 块, 不要"好的, 这是 brain.md".`;

const RMC_EXTRACTOR_PROMPT = `你是一个 fact extractor. 从用户的 Onboarding 答案抽取**他明确说的**事实, 严禁推测.

# 输出格式
JSON array, 每条:
{
  "type": "core_state" | "factual" | "boundary" | "episodic" | "relational" | "psych_signal",
  "kind": "...",       // type=core_state 时必填
  "title": "...",      // 简洁
  "content": "...",    // 完整
  "confidence": 0.0-1.0
}

# 类型分配规则
- core_state: 永久成立的硬事实 (家庭结构/独生子女/重大健康约束/不可改变身份)
- factual: 软事实 (当前职业/城市/收入水平)
- boundary: 用户明确表达的硬边界 (反感的事 / 不能接受的事)
- episodic: 人生关键事件 (5 段叙事每段抽 1-2 条)
- relational: 关系网络 (跟父母/伴侣/孩子/老板的描述)
- psych_signal: 心理信号 (反复卡点 / 当前心理状态)

# 严禁
- 推测没说的
- 价值观排序不要抽成 fact (它在 brain.md 里说), 只抽具体事件/关系/边界
- 信息不足返回 [] 也行

直接 JSON, 不要 markdown.`;

export async function processOnboarding(
  userUid: string,
  responses: OnboardingResponse[]
): Promise<ProcessResult> {
  const startTime = Date.now();

  // 1. Find or create user
  const userId = findOrCreateUserByUid(userUid);

  // 2. 提取 identity 阶段的 birthDate / gender → 写 user 表
  const identityResp = responses.find((r) => r.stage === 'identity');
  if (identityResp) {
    const birthDate = identityResp.answers.birthDate;
    const genderRaw = identityResp.answers.gender;
    const gender =
      genderRaw === '女' ? 'female' : genderRaw === '男' ? 'male' : 'other';
    if (birthDate) updateUserProfile(userId, { birthDate, gender });
  }

  // 3. Identity → core_state hardcoded inserts (高 confidence)
  let coreStateInserted = 0;
  if (identityResp) {
    const a = identityResp.answers;
    if (a.familyStructure) {
      addCoreState({
        userId,
        kind: 'family_structure',
        factText: a.familyStructure,
        severity: 'hard',
        source: 'user_self',
      });
      coreStateInserted++;
    }
    if (a.currentCity) {
      addCoreState({
        userId,
        kind: 'current_city',
        factText: `目前生活在${a.currentCity}`,
        severity: 'hard',
        source: 'user_self',
      });
      coreStateInserted++;
    }
    if (a.professionPulse) {
      addCoreState({
        userId,
        kind: 'profession',
        factText: a.professionPulse,
        severity: 'hard',
        source: 'user_self',
      });
      coreStateInserted++;
    }
  }

  // 4. 把所有阶段答案合并成 1 个大 prompt → LLM 抽 RMC 卡
  const onboardingDigest = responses
    .map((r) => {
      const stageAnswers = Object.entries(r.answers)
        .filter(([_, v]) => v && (typeof v !== 'string' || v.length > 0))
        .map(([k, v]) => `  ${k}: ${Array.isArray(v) ? v.join(' > ') : v}`)
        .join('\n');
      return `# ${r.stage}\n${stageAnswers}`;
    })
    .join('\n\n');

  let cardsInserted = 0;
  try {
    const extractResp = await modelRouter.complete({
      messages: [
        { role: 'system', content: RMC_EXTRACTOR_PROMPT },
        { role: 'user', content: onboardingDigest },
      ],
      provider: 'deepseek',
      temperature: 0.2,
      maxTokens: 3000,
    });

    const cards = parseExtractorOutput(extractResp.content);
    for (const c of cards) {
      try {
        if (c.type === 'core_state') {
          if (c.kind) {
            addCoreState({
              userId,
              kind: c.kind,
              factText: c.content,
              severity: 'hard',
              source: 'user_self',
            });
            coreStateInserted++;
          }
        } else {
          addMemoryCard({
            userId,
            cardType: c.type as any,
            title: c.title,
            content: c.content,
            confidence: c.confidence,
            source: 'onboarding',
          });
          cardsInserted++;
        }
      } catch (e: any) {
        console.error('[onboarding] insert card failed:', e.message);
      }
    }
  } catch (e: any) {
    console.error('[onboarding] RMC extraction failed:', e);
  }

  // 5. 写 brain.md baseline
  let brainCharCount = 0;
  try {
    const brainResp = await modelRouter.complete({
      messages: [
        { role: 'system', content: BRAIN_BASELINE_PROMPT },
        { role: 'user', content: onboardingDigest },
      ],
      provider: 'deepseek',
      temperature: 0.4,
      maxTokens: 4000,
    });

    let brainContent = brainResp.content.trim();
    brainContent = brainContent.replace(/^```markdown\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    const db = getDb();
    db.prepare(
      `INSERT INTO user_brain (user_id, content, version, updated_at) VALUES (?, ?, 1, unixepoch())
       ON CONFLICT(user_id) DO UPDATE SET content = excluded.content, version = user_brain.version + 1, updated_at = unixepoch()`
    ).run(userId, brainContent);

    brainCharCount = brainContent.length;
  } catch (e: any) {
    console.error('[onboarding] brain baseline failed:', e);
  }

  return {
    userId,
    coreStateInserted,
    cardsInserted,
    brainCharCount,
    durationMs: Date.now() - startTime,
  };
}

function parseExtractorOutput(content: string): Array<{
  type: string;
  kind?: string;
  title: string;
  content: string;
  confidence: number;
}> {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  const startIdx = cleaned.indexOf('[');
  const endIdx = cleaned.lastIndexOf(']');
  if (startIdx === -1 || endIdx === -1) return [];
  cleaned = cleaned.slice(startIdx, endIdx + 1);
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
