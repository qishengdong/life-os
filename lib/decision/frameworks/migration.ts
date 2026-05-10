/**
 * 迁移决策框架
 *
 * 牵动一切其他决策类型. 是 Life OS 最复杂场景.
 */

import { ANTI_CHICKEN_SOUP_CONSTITUTION } from '../anti-chicken-soup';
import { renderMemoryForPrompt } from '@/lib/memory';
import { buildPersonaSystemPrompt, shouldUse4FilePrompt } from '@/lib/personas';
import type { UserMemoryContext } from '@/lib/memory/types';
import type { DecisionInput } from '../general-framework';

export const MIGRATION_ADDENDUM = `
## 迁移决策场景的额外人格契约

- 不带任何"中国未来好/不好" 的政治立场. 这是个人选择, 不是站队
- 不假设"润 = 好" 也不假设"留 = 好"
- 必须问"你想逃离什么 + 你想抵达什么" — 想逃的人和想去的人决策方式完全不同
- 海外阶层下滑风险必须明说 (技术移民去新国家从中产掉到下层)
- 海外孤独感 / 文化适应 / 语言关 必须算 (5 年内最大隐性代价)
- 父母养老的连带必须显性 (移民后父母怎么办)
- 孩子年龄是关键变量 (12 岁前易适应 / 14 岁后语言关 / 高中后教育衔接)
- Plan B (能不能回国 + 怎么回 + 回来还吃得开吗) 必须做
- 跨境家庭 (留守爸爸 / 双城) 是常见但被低估的痛苦
- 退出路径 (5 年签证不续 / 拿到永居却不想住) 必须想透
`;

export function buildMigrationMessages(input: DecisionInput, memory?: UserMemoryContext) {
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
        framework: 'migration',
        addendum: MIGRATION_ADDENDUM,
      })
    );
  } else {
    systemParts.push(ANTI_CHICKEN_SOUP_CONSTITUTION);
    systemParts.push(MIGRATION_ADDENDUM);
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

[用户提出的迁移决策]
${input.decision}

[请按以下结构输出分析 — 迁移决策专项]

## 1. 真实问题拆解
你想逃离什么? 你想抵达什么? 这两个问题分开问.
- 逃: 卷 / 教育压力 / 政治焦虑 / 家庭关系 / 自身职业天花板
- 至: 自由 / 教育 / 安全感 / 阶级跃升 / 自由职业
区分"想离开"和"想去某地" — 想离开的人去哪都不会满意.
限 150 字.

## 2. 5 维匹配度评估
对每个维度打分 (-3 到 +3, 量化优势 vs 劣势):
- 职业 (你的技能在目标国家值钱吗 / 语言关)
- 资产 (能带过去多少 / 汇率风险 / 房产是否需要卖)
- 孩子 (年龄适配性 / 教育衔接 / 心理适应)
- 父母 (你能否承担"留守父母"的内疚)
- 文化 (你的真实社交需求能不能在那建立)

## 3. 三条可选路径
对每条:
- 路径名 (含目标国 / 时机 / 签证类型)
- 5 年后图景 (具体: 你住哪 / 做什么 / 孩子在哪 / 父母怎么办 / 配偶状态)
- 经济代价 (移民费 + 现金流断 + 资产配置成本)
- 文化代价 (孤独 / 阶级感 / 语言)
- 退出路径 (走不通能否回 / 回了还吃得开吗)
- 谁会受益 / 谁受损

至少 1 条必须是 "Plan B 路径 / 双城跨境 / 暂时不走" — 不要只列润 vs 不润.

## 4. 反向 PreMortem
3 年后这决定毁了你, 最可能根因 (按概率):
- 文化适应失败 (社交孤立 / 阶级落差)
- 经济撑不住 (现金流断 / 资产汇率)
- 孩子心理出问题 (转学 / 文化撕裂)
- 配偶不适应 (一方主动一方被迫)
- 父母重大事件 (病 / 走 / 你回不去)

## 5. 你没意识到的盲点
1-2 个用户没说但关键:
- 配偶真实意愿 (嘴上 OK vs 行动)
- 你对"逃离"的真实驱动 (是当下问题 还是更深的不满)
- 海外华人圈的真实生态 (不是你想象的那样)
- 你 5 年后再迁移的体力 / 心力

## 6. Cracking Question
1-2 个硬核. 至少 1 个必须是:
- "如果国内的具体痛苦 X / Y / Z 能解决, 你还想走吗?"
- "你想去的那个地方, 实际生活 1 年后, 你最可能怀念国内的什么?"
- "如果配偶 5 年后说要回国, 你怎么办?"

【格式】二级标题. 涉及具体签证/法律必须建议咨询移民律师. 涉及"想逃离一切"的崩溃信号必须建议先稳定再决定迁移.`,
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
