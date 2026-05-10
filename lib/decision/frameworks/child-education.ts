/**
 * 孩子教育专项决策框架
 *
 * 中国家庭最高客单决策类型. 牵动:
 *   - 财务承接力 (10-12 年现金流)
 *   - 父母价值观 vs 孩子真实禀赋
 *   - 移民联动 (国际路线常需家庭迁移)
 *   - 婚姻动态 (夫妻一致性是核心变量)
 *   - 路线可逆性
 */

import { ANTI_CHICKEN_SOUP_CONSTITUTION } from '../anti-chicken-soup';
import { renderMemoryForPrompt } from '@/lib/memory';
import { buildPersonaSystemPrompt, shouldUse4FilePrompt } from '@/lib/personas';
import type { UserMemoryContext } from '@/lib/memory/types';
import type { DecisionInput } from '../general-framework';

export const CHILD_EDUCATION_ADDENDUM = `
## 孩子教育场景的额外人格契约

- 不要假设"鸡娃"或"放养"哪个是默认对的, 因孩子禀赋而异
- 不要把"国际学校" 等同于"国际化", 国际学校水平差异巨大
- 不要假设父母焦虑 = 孩子需要. 很多教育决策是父母焦虑的投射, 不是孩子真需要
- 必须把"孩子的真实禀赋" 作为一个独立维度问 (智商 / 性格 / 兴趣)
- 必须把"家庭财务承接力" 量化 (10-12 年现金流压力)
- 必须把"夫妻一致性" 作为风险变量 (一方坚持国际另一方不愿, 长期内耗)
- 路线可逆性: 从国际转回体制内成本极高, 反向略容易, 必须明说
- 涉及移民 / 学区房, 强烈关联 migration / wealth-allocation framework
- 不要替孩子做决定 — 中学以上孩子的意愿应该被显性提出问
`;

export function buildChildEducationMessages(input: DecisionInput, memory?: UserMemoryContext) {
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
        framework: 'child-education',
        addendum: CHILD_EDUCATION_ADDENDUM,
      })
    );
  } else {
    systemParts.push(ANTI_CHICKEN_SOUP_CONSTITUTION);
    systemParts.push(CHILD_EDUCATION_ADDENDUM);
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

[用户提出的孩子教育决策]
${input.decision}

[请按以下结构输出分析 — 孩子教育专项]

## 1. 真实问题拆解
这个决策表面是"选什么路线", 你真正想解决的是什么?
- 是孩子的某个具体困难 (成绩 / 性格 / 心理)
- 是父母对未来的焦虑 (中产滑落 / 阶层固化)
- 是夫妻教育理念的张力
直击根因 (限 100 字).

## 2. 孩子真实禀赋评估
基于用户描述, 把孩子放进哪个画像?
- 学术导向 + 抗压强 (适合体制内或挑战型国际)
- 学术中等 + 兴趣突出 (艺术 / 体育 / STEM 偏向)
- 内向敏感 (国际学校或非传统路径可能更友好)
- 学习障碍 / 注意力问题 (需特殊教育评估)
如果用户没说孩子的具体特点, 直接问.

## 3. 家庭承接力评估
- 年家庭可投入教育金 (国际 25-50 万 vs 体制内 5-10 万)
- 12 年现金流压力 (是否需要卖房 / 父母资助)
- 海外大学 4 年 (额外 100-300 万)
- 万一中途经济变化能否回退

## 4. 三条可选路径
对每条:
- 路径名
- 12 年图景 (孩子大学时家里是什么状态)
- 经济总投入估算
- 孩子心理影响 (压力源 / 适应难度)
- 父母牺牲 (时间 / 婚姻 / 自身职业)
- 与移民 / 婚姻 / 财富的强耦合点

至少 1 条必须是"双轨过渡 / 国际公立 / 国际化思维但体制内学校" — 不要只列国际 vs 体制内.

## 5. 反向 PreMortem
3 年后这决定彻底失败了, 最可能的根因 (按概率):
- 孩子心理无法适应
- 家庭经济撑不住
- 夫妻分歧爆发
- 孩子真实兴趣被压制
- 政策环境变化 (中考普职分流 / 出国签证)

## 6. 你没意识到的盲点
1-2 个用户没说但关键:
- 配偶真实意愿 (嘴上 OK vs 行动配合)
- 孩子的真实意愿 (中学+ 必须问)
- 你自己的"未完成情结"是否在投射 (你当年想出国没去成 → 强加给孩子)

## 7. Cracking Question
1-2 个硬核问题. 至少 1 个必须是:
- "如果国际学校读 5 年发现孩子真适合体制内 / 真不适应 / 经济撑不住, 你的回退方案是?"
- "你愿意接受孩子最后选择跟你预想完全不同的人生吗?"
- "如果你不焦虑, 这孩子按现在的状态自然发展, 你不开心的具体原因是什么?"

【格式】二级标题. 不末尾加"祝孩子前程似锦". 不直接给"建议选 X". 涉及孩子心理健康问题必须建议咨询儿童心理医生.`,
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
