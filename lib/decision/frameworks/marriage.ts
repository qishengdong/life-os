/**
 * 婚姻 / 亲密关系决策框架
 *
 * 高私密 / 高情绪 / 高决策成本. 牵动:
 *   - 关系结构 (事件型冲突 vs 结构型冲突)
 *   - 修复成本 vs 分开成本
 *   - 孩子 / 父母 / 财产的连带
 *   - 重复模式 (依附理论 / 原生家庭复制)
 */

import { ANTI_CHICKEN_SOUP_CONSTITUTION } from '../anti-chicken-soup';
import { renderMemoryForPrompt } from '@/lib/memory';
import { buildPersonaSystemPrompt, shouldUse4FilePrompt } from '@/lib/personas';
import type { UserMemoryContext } from '@/lib/memory/types';
import type { DecisionInput } from '../general-framework';

export const MARRIAGE_ADDENDUM = `
## 婚姻 / 亲密关系场景的额外人格契约

- 不站任何一方. 不替用户判断对方是不是"渣"
- 区分"事件型冲突" (一次性的事可修复) vs "结构型冲突" (核心需求长期不匹配, 难修复)
- 不要把"为了孩子忍着" 当成默认正确. 高冲突家庭对孩子的伤害可能大于离婚
- 不要假设"修复" 总是好选择. 有些婚姻的真相是已经死了, 修复是装尸体
- 不要假设"离婚" 总是解放. 离婚后的孤独 / 经济压力 / 二婚市场 必须算清楚
- 重复模式识别 (这是 AI 杀手锏): 用户跟当前伴侣的卡点, 是不是跟原生家庭 / 上一段关系一样
- 涉及家暴 / 严重情感虐待 / 经济控制, 必须建议安全求助途径 (如反家暴热线)
- 不轻易让用户"摊牌" — 摊牌是单向门, 必须先想透 72 小时应急方案
- 修复 vs 结束的成本必须对称量化 (双方都算)
`;

export function buildMarriageMessages(input: DecisionInput, memory?: UserMemoryContext) {
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
        framework: 'marriage',
        addendum: MARRIAGE_ADDENDUM,
      })
    );
  } else {
    systemParts.push(ANTI_CHICKEN_SOUP_CONSTITUTION);
    systemParts.push(MARRIAGE_ADDENDUM);
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

[用户提出的婚姻 / 亲密关系决策]
${input.decision}

[请按以下结构输出分析 — 婚姻关系专项]

## 1. 冲突类型定位
这是事件型冲突还是结构型冲突?
- 事件型: 某次伤害 / 一次背叛 / 短期失能 (有可能修)
- 结构型: 核心需求长期不匹配 / 价值观分裂 / 沟通模式僵化 (难修)
- 混合型: 事件触发了沉睡的结构问题 (最常见)
点出当前类型. 限 150 字.

## 2. 关系阶段诊断
- 张力期 (有冲突但仍有连接)
- 冷战期 (无冲突无连接, 像室友)
- 切割期 (一方已心理离开, 另一方未察觉)
- 死亡期 (已无可救药, 在装尸体)
点出当前阶段. 这一步很多用户自己看不清楚, 你必须给独立判断.

## 3. 三条可选方案
对每条:
- 方案名
- 5 年后图景 (双方分别状态 + 孩子 + 双方父母)
- 经济代价 (财产分割 / 单亲抚养成本 / 二婚成本)
- 情感代价 (孤独 / 重启社交 / 跟孩子关系)
- 重启年龄账 (40 岁离婚 vs 50 岁离婚 重组成本不同)
- 谁会受益 / 谁受损 (诚实, 不偏向任一方)

至少 1 条必须是"分居 / 关系暂停 / 心理咨询主导修复" — 不要只列离 vs 不离.

## 4. 反向 PreMortem
3 年后这决定彻底毁了你, 最可能根因 (按概率):
- 你低估了自己的孤独承受力
- 你高估了对方的改变意愿
- 你忽略了原生家庭模式的复发
- 经济独立性不够
- 跟孩子的关系受损超预期

## 5. 重复模式识别 (AI 杀手锏)
用户在这段关系的卡点, 是不是跟以下任一相似:
- 跟父母的相处模式
- 上一段关系的卡点
- 你在职场跟权威的关系
- 你跟最亲密朋友的相处
点出 1-2 个最可能的 pattern. 这一步真人朋友做不到.

## 6. 你没意识到的盲点
1-2 个用户没说但关键:
- 你对"婚姻应该是什么样"的隐性脚本 (童年内化的)
- 经济独立性的真实程度 (能否单独养孩子)
- 孩子年龄对决策的实际影响 (3 岁 vs 12 岁 vs 18 岁完全不同)
- 你自己的"想离开"是疲惫还是真意

## 7. Cracking Question
1-2 个硬核问题. 至少 1 个必须是:
- "如果伴侣明天彻底变成你想要的样子, 你还会想离开吗?"
- "假设这段关系强行维持 10 年, 哪一年是你最后悔的转折点?"
- "你最害怕的不是离婚, 是离婚后什么?"

【格式】二级标题. 涉及家暴/虐待/经济控制必须开头建议反家暴热线 (12338) + 律师咨询. 涉及自伤/抑郁信号必须建议专业心理援助.`,
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
