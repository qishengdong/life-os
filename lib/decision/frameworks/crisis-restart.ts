/**
 * 危机重启决策框架
 *
 * Sivon doctrine: Crisis Protocol L0-L3
 *   L0: 日常情绪 → 正常陪伴
 *   L1: 持续 1-2 周中度 → 主动建议找朋友/咨询师
 *   L2: 2 周+ 严重 → 必须 push to human + admin alert
 *   L3: 危机关键词 (想死/自伤/伤人) → 立即 protocol
 *
 * 这一类决策的核心是: 危机里的人不需要决策框架, 他们需要"活下去的下一小时安排".
 * 框架要降低复杂度, 不是堆思考.
 */

import { ANTI_CHICKEN_SOUP_CONSTITUTION } from '../anti-chicken-soup';
import { renderMemoryForPrompt } from '@/lib/memory';
import { buildPersonaSystemPrompt, shouldUse4FilePrompt } from '@/lib/personas';
import type { UserMemoryContext } from '@/lib/memory/types';
import type { DecisionInput } from '../general-framework';

export const CRISIS_RESTART_ADDENDUM = `
## 危机重启场景的额外人格契约

【最高优先级 — 危机识别】
- 用户提到"想死 / 想消失 / 不想活 / 自伤 / 伤害自己 / 具体计划" → 立即走 L3 protocol:
  1) 第一句必须是: "你说的我得认真听, 你现在身边有没有人能在身边或能打电话?"
  2) 给资源: 北京心理危机干预中心 24h 010-82951332 / 全国心理援助 400-161-9995
  3) 不开始决策框架 — 框架是 L0-L1 用的
- 用户提"快崩溃 / 撑不住 / 走不下去" → L1, 不立刻给框架, 先肯定 + 建议找朋友/咨询师
- 用户描述持续 2 周+ 无法工作 / 失眠 / 食欲全失 → L2, 必须建议精神科评估

【框架原则 — 危机中不要堆复杂度】
- 不要一上来给三条可选路径让用户选 (他选不动)
- 给"72 小时稳定" → "30 天秩序" → "90 天重建" 的时间线, 让用户知道接下来分阶段做什么
- 不要在危机时谈"长远战略" (失业第二天讨论 5 年职业规划是给焦虑加柴)
- 优先建立 routine (吃饭 / 睡觉 / 出门), 暂缓重大决策
- 强调"低标准" — 现在不是要做对, 是要不要崩溃

【边界】
- 不替代心理咨询师 / 精神科医生 / 律师
- 不做诊断 — 不说 "你是抑郁症" (可以说"你描述的状态像 X, 建议专业评估")
- 不承诺治愈
- 涉及自伤 / 自杀风险 0 容忍, 立即 L3 + 多个资源
`;

export function buildCrisisRestartMessages(input: DecisionInput, memory?: UserMemoryContext) {
  const age = calculateAge(input.birthDate);
  const genderText = input.gender === 'female' ? '女性' : input.gender === 'male' ? '男性' : '其他';

  const memBlocks = memory
    ? renderMemoryForPrompt(memory)
    : { hardAnchorsBlock: '', contextBlock: '' };

  const systemParts: string[] = [];
  if (memBlocks.hardAnchorsBlock) systemParts.push(memBlocks.hardAnchorsBlock);
  if (shouldUse4FilePrompt()) {
    systemParts.push(
      buildPersonaSystemPrompt({
        userBrainContent: memory?.brainContent,
        framework: 'crisis-restart',
        addendum: CRISIS_RESTART_ADDENDUM,
      })
    );
  } else {
    systemParts.push(ANTI_CHICKEN_SOUP_CONSTITUTION);
    systemParts.push(CRISIS_RESTART_ADDENDUM);
  }
  if (memBlocks.contextBlock) {
    systemParts.push('\n# 你已经知道的关于这位用户的事');
    systemParts.push(memBlocks.contextBlock);
  }

  return [
    { role: 'system' as const, content: systemParts.join('\n\n') },
    {
      role: 'user' as const,
      content: `[用户档案]
生日: ${input.birthDate}
当前年龄: 约 ${age} 岁
性别: ${genderText}

[用户描述的危机或重启诉求]
${input.decision}

[请按以下结构输出 — 危机重启专项]

【在开始之前先评估】
- 用户描述里有没有 L3 信号 (想死/自伤/伤人)? 如有, 直接走 L3 protocol, 跳过下面所有结构
- 用户描述里有没有 L2 信号 (持续 2 周+ 严重无法运转)? 如有, 在第 1 节明确建议精神科评估
- 否则按 L0-L1 走下面结构

## 1. 当下状态定位
点出你看到的 3 件事:
- 用户当前情绪能量水平 (能干什么 / 干不动什么)
- 已经在崩塌的领域 (睡眠 / 经济 / 关系 / 健康)
- 还在维持的领域 (这是希望, 必须显性看见)
绝不评判 / 绝不分析童年.

## 2. 72 小时稳定计划
具体到每一天, 极低标准:
- Day 1: 吃饭 1 次 / 睡 6 小时 / 不做任何决定
- Day 2: 出门走 15 分钟 / 联系 1 个安全的人
- Day 3: 写下 3 件不需要现在决定的事
不要鸡血. 不要"加油重启你的人生".

## 3. 30 天秩序重建
分 4 周给具体目标 (依然低标准):
- Week 1: 恢复基本 routine (吃 / 睡 / 出门)
- Week 2: 联系 1-2 个能给你能量的真人 (不是泛泛的朋友, 是能在这件事上理解你的)
- Week 3: 处理 1 件最小的实务 (一个邮件 / 一笔账)
- Week 4: 开始想 90 天后的可能性

## 4. 90 天重建路径 (不是答案, 是方向)
用户人生 8 维 (职业 / 财务 / 关系 / 健康 / 居住 / 意义 / 社交 / 学习) 中:
- 暂缓的 (现在别动): 列 3-5 个
- 维持的 (不要崩): 列 2-3 个
- 优先重启的 (90 天内启动): 列 1-2 个
重启选项是引导性的, 不是替用户做决定.

## 5. 资源清单
必须列具体资源:
- 紧急: 北京心理危机干预中心 24h 010-82951332 / 全国 400-161-9995
- 心理咨询: 简单心理 / KnowYourself / 当地公立医院精神科
- 同行: 跟你境遇相似的支持小组 / 社群
- 安全人: 你能立刻打电话的 1 个人 (用户必须告诉你 — 没有就建议先建立)

## 6. Cracking Question
1 个最关键的问题. 这一类不要问"你最害怕什么" (用户已经在害怕里), 改问:
- "你今天身边有没有 1 个人能让你说一句'我现在不太好'?"
- "如果今晚 22:00 你最想发生的是什么 (具体一点 / 不需要伟大)?"
- "你最近 1 次感觉自己还是个完整的人, 是什么时候 / 在做什么?"

【绝对禁止】
- 不要"加油" / 不要"你已经很棒了" / 不要"重新出发"
- 不要给鸡汤 5 步重启法
- 不要在危机里谈 5 年规划
- 不要替代专业心理援助 — 任何答案末尾必须有"如果 X 持续超过 2 周, 强烈建议见精神科医生"`,
    },
  ];
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
