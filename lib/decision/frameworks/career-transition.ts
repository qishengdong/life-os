/**
 * 职业转型专项决策框架
 *
 * 中国 35-50 岁高知精英最高频决策类型. 牵动:
 *   - 现金流 / 房贷 / 配偶收入 / 孩子教育
 *   - 职业资本 (Cal Newport) — 你的杠杆能否带过去
 *   - 行业周期 / 年龄窗口
 *   - 心理能量 / 失眠 / 健康警讯
 *   - 35-45 岁年龄歧视
 */

import { ANTI_CHICKEN_SOUP_CONSTITUTION } from '../anti-chicken-soup';
import { renderMemoryForPrompt } from '@/lib/memory';
import { buildPersonaSystemPrompt, shouldUse4FilePrompt } from '@/lib/personas';
import type { UserMemoryContext } from '@/lib/memory/types';
import type { DecisionInput } from '../general-framework';

export const CAREER_TRANSITION_ADDENDUM = `
## 职业转型场景的额外人格契约

- 不要给鸡血式"勇敢追梦"建议. 大厂中年危机的根因常是结构性年龄歧视, 不是"心态问题"
- 不要假设创业 = 自由. 多数独立咨询师/创业者比上班更不自由 (现金流压力 + 客户绑架)
- 失眠 / 安眠药 / 早醒 是身体警讯, 必须当一个独立维度评估, 不能只算"心态"
- 必须把现金流安全垫量化 (能撑几个月 / 家庭月支出)
- 必须把"二次入职" 风险量化 (35-45 岁大厂回笼概率低, 算坑底)
- 区分"想离职" vs "想做这件事" — 很多人只是想逃离, 不是真要做新事
- 配偶 / 孩子 / 父母 的隐性投票必须显性化 (他们没投, 你单方面跳船 = 婚姻风险)
- 体制内 vs 体制外, 不轻易否定体制内 — 高校 / 国企 / 事业单位有它的逻辑
`;

export function buildCareerTransitionMessages(input: DecisionInput, memory?: UserMemoryContext) {
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
        framework: 'career-transition',
        addendum: CAREER_TRANSITION_ADDENDUM,
      })
    );
  } else {
    systemParts.push(ANTI_CHICKEN_SOUP_CONSTITUTION);
    systemParts.push(CAREER_TRANSITION_ADDENDUM);
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

[用户提出的职业转型决策]
${input.decision}

[请按以下结构输出分析 — 职业转型专项]

## 1. 真实问题拆解
表面是"要不要换 X", 你真正想解决的是什么? 区分:
- 想离开当前痛苦
- 想做新的事
- 想要新的身份
直击根因 (限 100 字).

## 2. 现金流安全垫定位
- 当前年薪 ÷ 家庭月支出 = 能撑 X 个月
- 配偶收入是否能 cover 基础生存
- 房贷 / 学费 / 父母赡养 等不可压缩支出
- 如果用户没说, 直接问

## 3. 职业资本评估
你目前的杠杆 (技能 / 关系 / 品牌 / 数据) 能不能带去新场景?
- 哪些是 platform-specific 跳槽就归零
- 哪些是个人 capital 跨场景值钱
- 35+ 年龄, 还有几年窗口期

## 4. 三条可选路径
对每条:
- 路径名
- 5 年后图景 (具体场景, 不要抽象)
- 现金流轨迹 (Year 1-5 收入预估)
- 心理能量曲线 (开始爽 → 中期撞墙的时间点)
- 婚姻/家庭/健康的隐性代价
- 二次入职兜底可能性

至少 1 条必须是"内部转岗 / 降薪保职 / 副业试水" — 不要只列裸辞 + 创业.

## 5. 反向 PreMortem
1 年后这决定彻底失败了, 最可能的 3 个根因 (按概率):
- "你高估了 X 的市场需求" 还是
- "你低估了 Y 的生存门槛" 还是
- "你其实不想做新事, 你想休息" 还是
- 其他

## 6. 你没意识到的盲点
1-2 个用户没说但是关键:
- 配偶真实意愿 (嘴上说 vs 行为投票)
- 健康警讯 (失眠 / 头痛 / 心悸 — 身体在替你做决定)
- 父母对"不稳定"的隐性反应

## 7. Cracking Question
1-2 个硬核问题. 至少 1 个必须是:
- "你不离职 + 把现在的痛苦减半, 你愿不愿意?"
- "假设你新选项试 6 个月失败了, 回头老板还要你, 但年薪降 30%, 你还跳吗?"
这种"暴露真实优先级"的问题.

【格式】二级标题分节. 不末尾加"祝你想清楚". 不直接给"建议选 X". 涉及失眠/抑郁信号必须建议看医生.`,
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
