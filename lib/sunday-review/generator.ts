/**
 * Sunday Review Generator — V1 付费感峰值
 *
 * 每周日 (或按需) 生成 800-1200 字 pattern recognition.
 * 这是 Pulse 累积价值兑现的高光时刻.
 *
 * 输入: 过去 7 天 Pulse + decisions + memory context
 * 输出: 3 节 markdown — "反复提到什么 / 没说出口的张力 / 下周注意什么"
 *
 * 跟 brain.md 区别:
 *   - brain.md: 综合身份 (who you are), 慢变化, 每 5+ 决策更新
 *   - sunday review: 1 周模式 (what just happened), 快变化, 每周更新
 */

import { modelRouter } from '@/lib/model-router';
import { fetchUserMemory } from '@/lib/memory';
import { getPulsesGroupedByTag } from '@/lib/pulse/store';
import { getDb } from '@/lib/db';

interface ReviewInput {
  userId: number;
  weekStart: number;  // unix ts (本周一 00:00 local)
  weekEnd: number;    // unix ts (本周日 23:59 local)
}

export interface ReviewResult {
  success: boolean;
  content: string;
  charCount: number;
  pulseCount: number;
  decisionCount: number;
  tokensUsed?: number;
  durationMs: number;
  error?: string;
}

const SUNDAY_REVIEW_PROMPT = `你是 Life OS 的 Weekly Pattern Recognizer.

用户过去 7 天在 Life OS 写了一些 Pulses (人生信号采集) + 也许做了 1-2 个重大决策.

你的工作: 写一份 800-1200 字的 markdown, 让用户读完产生"它真的看见我了, 不只是记着我"的感受.

# 这份 Review 必须回答 3 问 (按这个顺序, 用 ## 标题)

## 1. 这周你反复提到什么

不是简单计数 (你提了 5 次 X). 是**主题层面的反复**:
- 不同事件背后的同一议题
- 例: "你这周 3 次写了不同的事 (老板 / 老婆 / 老妈), 但每次卡的都是同一处 — 你不敢直接说'不'."
- 例: "你提了 4 次'我妈', 但每次都是别人帮你提起来的, 你自己没主动开口."
- 必须引用**具体的 Pulse 内容**(用引号), 不要泛泛.

## 2. 你真正没说出口的张力是什么

找 Pulses 之间的**矛盾 / 沉默 / 回避**:
- 用户嘴上说 A 但身体/行为是 B
  - 例: "你周二说'还行', 周四凌晨 3 点醒了第 4 次, 周五写'我在崩溃边缘'. 你看见这条曲线了吗?"
- 用户连续多天都没碰某个明显在的话题
  - 例: "你这周一次都没提到孩子. 上周你提了 3 次. 这个沉默本身在说话."
- 用户用某个固定方式包装事件
  - 例: "你写老公的时候用'冷战', 写老妈的时候用'又一次', 这两个词都在替你回避同一件事 — 你在等别人先开口."

## 3. 下周最值得观察的一个信号

不是预测, 不是建议. 是**结构性提示**:
- "下周注意你跟 X 沟通时, 你是不是又开始'再看看'."
- "下周如果你又在凌晨 3 点醒, 那个时间点的念头比白天准 — 记下来."
- "下周如果 Y 事再次发生, 你的下一句话是什么? 提前想清楚."

# 写作风格

- 第二人称"你" (不是"用户")
- 引用 Pulse 用引号 + 关键词, 不要复述全文
- 直接, 克制, 锐利, 不鸡汤
- 不堆数字 (不要"你写了 5 条 Pulse")
- 不分析童年 / 不开框架 / 不替决定

# 严禁

- 流水账 (列 7 天 Pulse 一条一条)
- 鸡汤式总结 ("你已经很努力" / "下周会更好")
- 假装看见 (没数据时硬编)
- 心理分析 (童年 / 母婴依恋 / 创伤等)
- 未来承诺 ("一定会好转")
- emoji
- "加油 / 相信自己" 等任何鸡汤短语

# 长度
800-1200 字. 控制紧.

# 输出
直接 markdown 内容, 不要包 \`\`\` 块, 不要 "好的, 这是 review:" 等开场.`;

export async function generateReview(args: ReviewInput): Promise<ReviewResult> {
  const startTime = Date.now();
  const db = getDb();

  try {
    // 拉这周 Pulses
    const pulsesRow = db
      .prepare(
        `SELECT id, question_id, content, tags, ai_response, created_at
         FROM daily_pulses
         WHERE user_id = ? AND created_at >= ? AND created_at <= ?
         ORDER BY created_at ASC`
      )
      .all(args.userId, args.weekStart, args.weekEnd) as any[];

    const pulseCount = pulsesRow.length;
    if (pulseCount < 3) {
      return {
        success: false,
        content: '',
        charCount: 0,
        pulseCount,
        decisionCount: 0,
        durationMs: Date.now() - startTime,
        error: `这周 Pulse 数 ${pulseCount} < 3, 数据不够支持有质量的 pattern recognition`,
      };
    }

    // 拉这周 decisions
    const decisionsRow = db
      .prepare(
        `SELECT id, question, ai_response, framework, created_at
         FROM decisions
         WHERE user_id = ? AND created_at >= ? AND created_at <= ?
         ORDER BY created_at ASC`
      )
      .all(args.userId, args.weekStart, args.weekEnd) as any[];

    const decisionCount = decisionsRow.length;

    // memory context
    const memory = fetchUserMemory(args.userId);

    // 拼装输入
    const weekStartDate = new Date(args.weekStart * 1000).toLocaleDateString('zh-CN');
    const weekEndDate = new Date(args.weekEnd * 1000).toLocaleDateString('zh-CN');

    const pulsesSection = pulsesRow
      .map((p, i) => {
        const date = new Date(p.created_at * 1000).toLocaleDateString('zh-CN');
        const tagsStr = p.tags ? JSON.parse(p.tags).join(', ') : '';
        return `### Pulse ${i + 1} (${date}, ${p.question_id}, tags: ${tagsStr})\n用户写: ${p.content}\nAI 当时回应: ${p.ai_response || '(无)'}`;
      })
      .join('\n\n');

    const decisionsSection = decisionsRow.length > 0
      ? decisionsRow
          .map((d, i) => {
            const date = new Date(d.created_at * 1000).toLocaleDateString('zh-CN');
            return `### 决策 ${i + 1} (${date}, framework: ${d.framework})\n用户问: ${d.question}\nAI 分析节选: ${(d.ai_response || '').slice(0, 400)}...`;
          })
          .join('\n\n')
      : '(本周无重大决策)';

    const brainSection = memory.brainContent
      ? `# 这位用户的 brain.md (基础档案)\n${memory.brainContent.slice(0, 1200)}...`
      : '# (用户还没有 brain.md baseline)';

    const userPrompt = `# 本周时间范围
${weekStartDate} → ${weekEndDate}

# 这周的 Pulses (${pulseCount} 条)
${pulsesSection}

# 这周的重大决策 (${decisionCount} 个)
${decisionsSection}

${brainSection}

请基于以上, 写这位用户的 Sunday Review.`;

    const response = await modelRouter.complete({
      messages: [
        { role: 'system', content: SUNDAY_REVIEW_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      provider: 'deepseek',
      temperature: 0.5,
      maxTokens: 3000,
    });

    let content = response.content.trim();
    content = content.replace(/^```markdown\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    // 合规: AI 生成内容标识 (《生成式人工智能服务管理暂行办法》)
    const { appendAIDisclosure } = await import('@/lib/safety');
    content = appendAIDisclosure(content);

    return {
      success: true,
      content,
      charCount: content.length,
      pulseCount,
      decisionCount,
      tokensUsed: response.usage?.total_tokens,
      durationMs: Date.now() - startTime,
    };
  } catch (e: any) {
    return {
      success: false,
      content: '',
      charCount: 0,
      pulseCount: 0,
      decisionCount: 0,
      durationMs: Date.now() - startTime,
      error: e.message,
    };
  }
}
