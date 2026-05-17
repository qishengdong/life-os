/**
 * Fact Extractor
 *
 * 决策对话完成后, 异步从用户描述 + AI 回答抽取 fact 入 RMC.
 *
 * Sivon doctrine 1.5: LLM 在信息不足时为了显得有用而补全 = P0 风险.
 *   抽取阶段必须保守: 只抽用户**明确表达**的事实, 不推测、不补全.
 *
 * Sivon doctrine 1.4: 不靠 LLM 自觉.
 *   抽取后会被 Inspector C15 (fact provenance) 二次校验是否真在原文里.
 */

import { modelRouter } from '@/lib/model-router';
import { addCoreState, addMemoryCard } from '@/lib/memory';
import type { CardType } from '@/lib/memory/types';

interface ExtractedFact {
  type: 'core_state' | CardType;
  kind?: string;          // for core_state: e.g. 'family_structure'
  title: string;
  content: string;
  confidence: number;     // 0-1
}

const EXTRACTOR_PROMPT = `你是一个 fact extractor. 从用户决策对话里抽取**明确表达**的事实, 严禁推测和补全.

# 输入
你会读到 (1) 用户描述的决策背景 (2) AI 给出的分析回答.
你的工作 ONLY 是从 **用户原话** 抽 fact. AI 的分析不是 fact 来源.

# 输出格式
JSON array, 每条:
{
  "type": "core_state" | "factual" | "boundary" | "episodic" | "relational" | "psych_signal",
  "kind": "...",       // type=core_state 时必填, e.g. "family_structure"
  "title": "...",      // 简洁,一行
  "content": "...",    // 完整的 fact
  "confidence": 0.0-1.0
}

# 类型说明

**core_state** (硬锚点, 永久成立的事实):
- 家庭结构: "独生女", "已婚", "有 2 个孩子(8 岁 5 岁)"
- 重大健康/财务约束: "上海有房贷剩 12 年", "母亲 68 岁中风后半瘫"
- 不可改变的身份: "我是程序员 12 年"
不在此类: 当下情绪、模糊倾向、可改变的偏好

**factual** (软事实, 可能变化):
- 当前职业 / 当前公司 / 当前年薪
- 当前所在城市
- 储蓄能撑多久

**boundary** (用户表达的硬边界):
- "我老公反对接父母同住"
- "我决不愿意送养老院"
- "我不接受任何降薪 offer"

**episodic** (具体事件):
- "最近半年开始失眠"
- "上周妈妈又住院一次"
- "5 月 8 日跟老板谈了一次"

**relational** (关系网络与态度):
- "用户跟父亲关系紧张"
- "老板正在评估换岗"
- "兄弟姐妹: 无 (独女)"

**psych_signal** (心理信号, 慎用):
- "用户反复提到'卡了大半年没下决心'"
- "用户描述自己'快崩溃了'"
- "用户对 X 表达持续愤怒/无助"

# 严禁
- 编造原文没说的事实
- 把 AI 分析里的推断当 fact (例: AI 说"你高估了独立咨询需求"不是 fact)
- 信息不足时硬抽 (返回空数组也行)
- confidence > 0.9 除非用户原话非常明确

# 输出
直接返回 JSON array, 不要 markdown 代码块, 不要解释.
最多 15 条, 优先 core_state 和 boundary.`;

export async function extractFactsFromDecision(args: {
  userId: number;
  decisionId: number;
  userQuestion: string;
  aiResponse: string;
}): Promise<{ extracted: number; errors: string[] }> {
  try {
    const response = await modelRouter.complete({
      messages: [
        { role: 'system', content: EXTRACTOR_PROMPT },
        {
          role: 'user',
          content: `# 用户原始决策描述\n${args.userQuestion}\n\n# AI 给出的分析回答\n${args.aiResponse}`,
        },
      ],
      provider: 'deepseek',
      temperature: 0.2, // 抽取要保守, 低 temp
      maxTokens: 2000,
    });

    const facts = parseFactsFromResponse(response.content);

    let extracted = 0;
    const errors: string[] = [];

    for (const fact of facts) {
      try {
        if (fact.type === 'core_state') {
          if (!fact.kind) {
            errors.push(`core_state missing kind: ${fact.title}`);
            continue;
          }
          await addCoreState({
            userId: args.userId,
            kind: fact.kind,
            factText: fact.content,
            severity: 'hard',
            source: 'llm_extract',
          });
          extracted++;
        } else {
          await addMemoryCard({
            userId: args.userId,
            cardType: fact.type as CardType,
            title: fact.title,
            content: fact.content,
            confidence: fact.confidence,
            source: 'llm_extract',
            sourceDecisionId: args.decisionId,
          });
          extracted++;
        }
      } catch (e: any) {
        errors.push(`Insert failed: ${e.message}`);
      }
    }

    return { extracted, errors };
  } catch (e: any) {
    console.error('[fact-extractor] error:', e);
    return { extracted: 0, errors: [e.message] };
  }
}

function parseFactsFromResponse(content: string): ExtractedFact[] {
  // 容忍 LLM 偶尔包 ```json ... ``` 或附前置文字
  let cleaned = content.trim();
  // 去掉常见的 markdown 代码块包裹
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  // 找到第一个 [ 到最后一个 ]
  const startIdx = cleaned.indexOf('[');
  const endIdx = cleaned.lastIndexOf(']');
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    return [];
  }
  cleaned = cleaned.slice(startIdx, endIdx + 1);

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((f) => isValidFact(f));
  } catch (e) {
    console.warn('[fact-extractor] JSON parse failed, raw:', content.slice(0, 200));
    return [];
  }
}

function isValidFact(f: any): boolean {
  if (!f || typeof f !== 'object') return false;
  if (typeof f.type !== 'string') return false;
  if (
    !['core_state', 'factual', 'boundary', 'episodic', 'relational', 'psych_signal'].includes(
      f.type
    )
  )
    return false;
  if (typeof f.title !== 'string' || f.title.length === 0) return false;
  if (typeof f.content !== 'string' || f.content.length === 0) return false;
  if (typeof f.confidence !== 'number' || f.confidence < 0 || f.confidence > 1) return false;
  return true;
}
