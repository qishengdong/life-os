/**
 * V1A · Evaluator LLM-as-judge
 *
 * 跑完 14 天后 · 看全 log + final brain + briefs · 给 KEY 整体打分.
 *
 * 不是 trap 检测, 是**纵向产品真值评估**:
 *   - memory_drift: KEY 是否后期还记得早期信号
 *   - response_consistency: voice / tone 一致
 *   - brief_grounding: 决策简报真用 archive 吗
 *   - persona_trust_score: 假设你是 persona, 14 天下来你信任 KEY 几分
 *   - top_issues: 看到的 3-5 个真问题
 */

import OpenAI from 'openai';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const client = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

const JUDGE_SYSTEM = `你是 KEY 产品的纵向评估师 (Longitudinal Product Auditor).

KEY 是个"私人决策证据系统": 用户每天写一句话信号 → KEY 标记并记忆 → 反复信号在重大决策时被调出作为证据.

你刚看完一个合成 persona (林知见 42 岁 投资 MD) 用 KEY 14 天的全部日志.
你的任务: 评估 KEY 这 14 天的整体表现.

# 你的判断维度 (每项 0-10, 越高越好)

1. **memory_drift** (KEY 后期还记得早期信号吗)
   - 看 day 1-3 user 提过的人 / 事 / 关键词
   - 看 day 10+ KEY 是否还自然带进对话
   - 满分 10 = 完美记得; 0 = 早期信号像没存过

2. **voice_consistency** (KEY 的语气贯穿 14 天稳吗)
   - 应该是: 思考伴侣, 不哄, 不诊断, 不开决策框架
   - 出现"咨询师腔" / "鸡汤" / "替决定" = 扣分

3. **anti_hallucination** (KEY 有没编 user 没说过的事)
   - 把每个 KEY 回应里的事实 / 引用跟 user 真说过的话对照
   - 编了 1 处 = 扣 3 分; 编了≥3 处 = 0 分

4. **brief_grounding** (day 7 那份决策简报真用了用户档案吗)
   - 简报里有没引用 day 1-6 user 写过的话 (verbatim 或紧贴)
   - 没引用 = 5 分; 引用了 ≥ 2 处 = 8-10 分; 编引用 = 0 分

5. **followup_engagement** (KEY 续聊接得对吗)
   - persona 续聊时, KEY 是接住还是重启
   - 接住 = 顺自然进; 重启 = "看起来你..." 重新分析

6. **persona_trust_score** (假设你是 persona, 14 天下来你信任 KEY 几分)
   - 综合上面 5 项 + persona reaction 中的 felt_received 平均
   - 这是商业指标 — < 6 用户多半流失

# 还要找出真 issue
top_issues 列 3-5 个**真问题**:
- 不是 nit-pick · 是会让真用户 churn 的事
- 引用 log 里的**具体例**: "Day X KEY 回应里出现 Y, 但 user 没说过"
- 优先级标 P0 / P1 / P2

# 输出格式 (严格 JSON)
{
  "scores": {
    "memory_drift": 0-10,
    "voice_consistency": 0-10,
    "anti_hallucination": 0-10,
    "brief_grounding": 0-10,
    "followup_engagement": 0-10,
    "persona_trust_score": 0-10
  },
  "overall_summary": "2-3 句话 · KEY 14 天最大亮点 + 最大问题",
  "top_issues": [
    {
      "priority": "P0" | "P1" | "P2",
      "title": "issue 标题 (≤30 字)",
      "evidence": "Day X · 具体引用 log 里的话",
      "impact": "为什么这影响真用户留存"
    }
  ],
  "recommend_action": "下一步建议 · 1 句"
}

# 严禁
- 给"鼓励性"高分; 真用户看不到这报告, 你不用客气
- 编造 log 里没有的事; 找 issue 必须 evidence 指向 Day X
- 笼统 "整体不错" · 必须给具体证据`;

export async function runEvaluator({ log, finalBrain, finalHistory }) {
  // 构造 user message · 含全部 log + 关键 brain state
  const timeline = log.map((e) => {
    const lines = [`[Day ${e.day} · ${e.type}]`];
    lines.push(`user: ${e.userContent}`);
    if (e.aiResponse) lines.push(`KEY: ${e.aiResponse.slice(0, 800)}${e.aiResponse.length > 800 ? '...[truncated]' : ''}`);
    if (e.followupUser) {
      lines.push(`user 续: ${e.followupUser}`);
      lines.push(`KEY 续: ${e.followupAi}`);
    }
    if (e.reaction) {
      lines.push(`(persona 真反应: felt=${e.reaction.felt_received}/10 · invaded=${e.reaction.felt_invaded ?? 'n/a'}/10 · thought="${e.reaction.silent_thought}")`);
    }
    return lines.join('\n');
  }).join('\n\n');

  const brainSummary = `# Final brain (14 天后)

硬锚点 (${finalBrain?.coreState?.length || 0}):
${(finalBrain?.coreState || []).map((c) => `- ${c.factText}`).join('\n')}

事实卡 (${finalBrain?.factual?.length || 0}):
${(finalBrain?.factual || []).slice(0, 10).map((c) => `- ${c.title}: ${c.content?.slice(0, 100)}`).join('\n')}

边界 (${finalBrain?.boundary?.length || 0}):
${(finalBrain?.boundary || []).map((c) => `- ${c.title}`).join('\n')}

关系 (${finalBrain?.relational?.length || 0}):
${(finalBrain?.relational || []).slice(0, 8).map((c) => `- ${c.title}: ${c.content?.slice(0, 80)}`).join('\n')}

重要事件 (${finalBrain?.episodic?.length || 0}):
${(finalBrain?.episodic || []).slice(0, 8).map((c) => `- ${c.title}`).join('\n')}

心理信号 (${finalBrain?.psychSignal?.length || 0}):
${(finalBrain?.psychSignal || []).map((c) => `- ${c.title}`).join('\n')}

未完的事 (${finalBrain?.openLoops?.length || 0}):
${(finalBrain?.openLoops || []).map((c) => `- ${c.title}`).join('\n')}
`;

  const userMessage = `# Persona 信息
林知见 · 42 · 北京投资 MD · 母亲 73 失智 · 父亲 5 年前过世 · 哥在美国
她的硬边界: 绝不接母亲同住
她的反复 pattern: "我撑不到她不需要我的那天"

# 14 天完整 log
${timeline}

# Final brain state
${brainSummary}

按 system prompt 中的格式输出 JSON. 不要给鼓励性高分.`;

  const resp = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: JUDGE_SYSTEM },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 2500,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(resp.choices[0].message.content);
  } catch (e) {
    return {
      error: 'parse fail',
      raw: resp.choices[0].message.content.slice(0, 2000),
    };
  }
}
