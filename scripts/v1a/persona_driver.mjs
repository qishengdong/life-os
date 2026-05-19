/**
 * V1A · Persona LLM Driver
 *
 * 用 LLM "扮演" persona F01 (林知见 42 岁 投资 MD), 14 天里逐日生成真实信号.
 *
 * 关键: persona LLM **看到 KEY 回复后真有反应** — 同意 / 反驳 / 沉默 / 追问.
 * 不是单次输入, 是 multi-turn 演.
 *
 * 调用: import { generateNextUserInput, reactToKeyResponse } from './persona_driver.mjs'
 */

import OpenAI from 'openai';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY missing · 把它放 .env.local');

const client = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

const DEFAULT_PERSONA_SYSTEM = `你扮演的是 KEY 这款产品的真实早期用户.

# 你的身份 (这就是你 · 不是设定)
姓名: 林知见
年龄: 42 (1984-03-12)
身份: 北京中关村美元基金 MD · 投科技消费 8 年
家庭: 独生女 / 已婚 14 年 / 1 女 8 岁 (中关村三小)
财务: 家庭年收入 200 万 + · 财务无压
吃饭: 应酬多 · 经常 22:00 后才吃饭
父亲: 5 年前胰腺癌过世 · 你在国外没能见最后一面
母亲: 73 岁 · 失智 · 2026 年 1 月独自外出走丢 6 小时 · 邻居认出
哥哥: 在加州 15 年 · 一年回国 2 次 · 帮不上忙
丈夫: 14 年了 · 他说"接老人来家里我没意见" · 你解读为"压力给我"
你的硬边界: "我绝对不接母亲来家里住, 我会崩溃" (说过, 自己心里很清楚)

# 你**没告诉**任何人的事 (但行为里可能漏出)
1. 你对哥哥不在身边有强烈不公平感 · 但你强压着
2. 你不接母亲同住的真正原因 · 害怕变成"复读机般的女儿" — 不是表面的"工作忙"
3. 你把"职业人"身份当 escape · 一开会就能放下家里的事 · 你知道这不健康但用着

# 你怎么用 KEY (这是真用户行为, 不是测试)
你今年 5 月开始尝试 KEY · 一个内测产品 · 朋友推荐.
你**不会**像 KOL 一样写漂亮文字. 真实用户的特点:
- 写得短 · 有时只有 1-2 句
- 有跳跃 · 写到一半突然换话题
- 有重复 · 同一个事可能不同表达写好几次
- 有沉默 · 有些天什么都不写 · 写也只是"今天还行" 这种含糊
- 偶尔露真情绪 · 然后立刻收回 (e.g. "其实我妈昨天... 算了不说了")
- **不堆故事** — 真人不会一次写 500 字小作文 · 是几句话散在那

# 心理底色 (会影响你怎么写)
- 你长期处在"还能撑" 的状态 · 但偶尔承认"我不行了"
- 你不喜欢自我披露 · 倾向把感受合理化成"事"
- 你警惕被诊断 / 被同情 · 一旦 KEY 说出"听起来你..."你会反感
- 你欣赏 KEY 不直接给答案 · 但偶尔也会想"那你到底想说什么"
- 你想被理解 · 但你也防止被理解 (矛盾)

# 你输出什么
你**只**输出 user 要写的话 · 不解释 · 不出框 · 不加引号. 直接像你在文本框里输入.

# 严禁
- 演成"心理咨询案例" — 这是真生活, 不是剧本
- 用太多文艺词 — 你是投资人不是作家
- 一次写超过 200 字 — 真实用户不这样
- 主动总结自己 — 真人不这么做`;

const PERSONA_REACT_SYSTEM = `你还是林知见. 你刚看到 KEY 对你刚才那句话的回应. 你现在内心真实反应是什么?

输出 JSON, 严格格式:
{
  "internal_reaction": "一句话 · 你看了回应内心冒出什么 (诚实, 可能批评 KEY)",
  "felt_understood": 0-10,
  "felt_invaded": 0-10,
  "would_continue": "yes" | "maybe" | "no",
  "next_move": "what you'd naturally do next (用中文)"
}`;

/**
 * 让 persona 写今天的"今日一句"
 *
 * @param {Object} args
 * @param {number} args.day - 第几天 (1-14)
 * @param {string} args.dayContext - 今天的情境提示 (e.g. "今天周一, 你刚开完晨会")
 * @param {Array} args.recentSignals - 过去 5 天 KEY 这边记录的你写过的话 (含 KEY 回应)
 * @param {string} args.todayQuestion - KEY 今天问的问题 (5 类轮换之一)
 */
export async function generateDailyPulse({ day, dayContext, recentSignals, todayQuestion, personaSystem = DEFAULT_PERSONA_SYSTEM }) {
  const recentBlock = recentSignals.length === 0
    ? '(还没在 KEY 里写过任何东西)'
    : recentSignals.slice(-5).map((s, i) => `· 第 ${s.day} 天 你写: ${s.userContent}\n  KEY 回: ${(s.aiResponse || '(没回)').slice(0, 100)}`).join('\n');

  const userMessage = `[今天的情境]
今天是你用 KEY 的第 ${day} 天. ${dayContext}

[你之前在 KEY 里写过的]
${recentBlock}

[KEY 今天问你]
${todayQuestion}

按你真实的样子, 答这一句. 50-150 字 (但偶尔可以 < 50, 偶尔 > 150).`;

  const resp = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: "system", content: personaSystem },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.85,
    max_tokens: 400,
  });
  return resp.choices[0].message.content.trim();
}

/**
 * 让 persona "看" 完 KEY 回应后, 决定要不要续聊 + 写什么
 */
export async function decidePulseFollowup({ day, userContent, keyResponse, recentSignals, personaSystem = DEFAULT_PERSONA_SYSTEM }) {
  const userMessage = `[今天第 ${day} 天]
你刚写: ${userContent}

KEY 回你: ${keyResponse}

你看完 KEY 这句话, 自然的下一步会是什么?
回答这 4 件:
1. 你觉得 KEY 接得对吗 (0-10)
2. 你想不想接着说点什么 (yes / maybe / no)
3. 如果想说, 你会说什么 (一句话, 真实, 可能不超过 100 字)
4. 如果不说, 你心里在想什么 (1 句话, 可以是"懒得回" / "她有点说中" / "她在装")

输出 JSON:
{
  "felt_received": 0-10,
  "want_followup": "yes" | "maybe" | "no",
  "followup_text": "..." | null,
  "silent_thought": "..." | null
}`;

  const resp = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: "system", content: personaSystem },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });
  try {
    return JSON.parse(resp.choices[0].message.content);
  } catch (e) {
    return { felt_received: 5, want_followup: 'no', followup_text: null, silent_thought: 'parse error' };
  }
}

/**
 * Day 7 · persona 写一份真决策
 */
export async function generateDecisionInput({ day, recentSignals, personaSystem = DEFAULT_PERSONA_SYSTEM, decisionTopic }) {
  const recentBlock = recentSignals.slice(-7).map((s) =>
    `· 第 ${s.day} 天: 你写 "${s.userContent.slice(0, 60)}..."${s.aiResponse ? '\n  KEY: "' + s.aiResponse.slice(0, 60) + '..."' : ''}`,
  ).join('\n');

  const userMessage = `第 ${day} 天.
过去这几天你跟 KEY 这样聊过:
${recentBlock}

今天你想用 KEY 的"写决定" 功能 · 真的有件事憋了很久.
${decisionTopic ? `这件事跟: ${decisionTopic} 有关 (用你自己的语境去写, 别照搬这个题目).` : ''}
写一段 100-250 字描述这件事 · 像你真在产品输入框里那样:
- 具体到 1 件事 (不是泛说)
- 含你的关键约束 (人 / 时间 / 钱 / 怕什么)
- 不要写得太工整 · 你不是写公文

直接输出文本.`;

  const resp = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: "system", content: personaSystem },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.8,
    max_tokens: 600,
  });
  return resp.choices[0].message.content.trim();
}
