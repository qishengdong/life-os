/**
 * 通用决策分析框架
 *
 * V0 阶段的"万能决策模板"。
 * 整合 6 个经典决策科学模型: 第一性原理 / 可逆性 / 路径模拟 / PreMortem / 盲点 / Cracking Question
 *
 * 未来按场景特化:
 *   - lib/decision/frameworks/career-transition.ts
 *   - lib/decision/frameworks/parent-care.ts
 *   - lib/decision/frameworks/child-education.ts
 *   - lib/decision/frameworks/migration.ts
 *   ...
 */

import { ANTI_CHICKEN_SOUP_CONSTITUTION } from './anti-chicken-soup';

export interface DecisionInput {
  birthDate: string;
  gender: string;
  decision: string;
}

export function buildDecisionMessages(input: DecisionInput) {
  const age = calculateAge(input.birthDate);
  const genderText = input.gender === 'female' ? '女性' : input.gender === 'male' ? '男性' : '其他';

  return [
    {
      role: 'system' as const,
      content: ANTI_CHICKEN_SOUP_CONSTITUTION,
    },
    {
      role: 'user' as const,
      content: `[用户档案]
生日: ${input.birthDate}
当前年龄: 约 ${age} 岁
性别: ${genderText}

[用户提出的决策]
${input.decision}

[请按以下结构输出决策分析]

## 1. 第一性原理拆解
这个决策表面是 X,本质上你真正想解决的是什么?(不超过 100 字,直击根因)

## 2. 决策可逆性
- 单向门(不可逆): 列出 1-3 条具体后果
- 双向门(可逆): 列出 1-3 条可以试错的部分

## 3. 三条可选路径
对每条路径必须给出:
- 路径名(一句话)
- 5 年后图景(具体场景描写,不要抽象,要让用户能"看见"那个未来的自己)
- 主要代价(尽量量化:时间/金钱/关系/机会成本)
- 受益者 vs 受损者

## 4. 反向 PreMortem
如果一年后这个决定彻底失败了,最可能的根因是什么?(2-3 个候选因素,按概率排序)

## 5. 你没意识到的盲点
1-2 个用户在自述里没提到、但可能是关键变量的角度。要点出"你为什么没说这个"。

## 6. Cracking Question
1-2 个最关键的决策性问题。这些问题不是"启发性"的,是"如果你回答不了,就不该现在做这个决定"的硬核问题。

【格式要求】
- 用 ## 二级标题分节,与上面 6 个模块完全对齐
- 不要在末尾加"祝你想清楚"、"加油"之类的空话
- 不要给最终建议(选哪条路径)
- 让用户自己想透,不替他决定`,
    },
  ];
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
