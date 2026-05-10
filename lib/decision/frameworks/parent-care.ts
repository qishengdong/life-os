/**
 * 父母养老专项决策框架
 *
 * 中国版 Life OS 的旗舰场景之一。父母养老在中国语境下牵涉:
 *   - 医疗 / 居住 / 情感 / 财务 / 兄弟姐妹分工 / 夫妻边界 /
 *   - 城市选择 / 愧疚感 / 父母控制欲 / 子女自身人生损耗
 *
 * 这个框架不替用户做决定,核心目的是:
 *   1. 把愧疚和责任分开
 *   2. 把"孝顺"和"自我消耗"分开
 *   3. 把当下决定放进父母健康阶段的整体规划里
 *   4. 强制看见配偶/兄弟姐妹/孩子的隐性代价
 */

import { ANTI_CHICKEN_SOUP_CONSTITUTION } from '../anti-chicken-soup';
import type { DecisionInput } from '../general-framework';

const PARENT_CARE_ADDENDUM = `
【父母养老场景的额外人格契约】
- 这个场景里,绝不能用"孝顺"作为论证前提
- 不要假设"父母接来同住"是默认正确答案
- 不要假设用户必须牺牲自己的人生来证明孝顺
- 中国家庭里"愧疚"经常被武器化,你的工作是帮用户分辨"真责任"和"被强加的愧疚"
- 父母也是有局限的成年人,不是绝对道德权威
- 兄弟姐妹之间的责任分配是合理议题,不是"独子/独女天经地义全包"
- 如果用户的方案里完全没有自己的位置,你必须明确指出
`;

export function buildParentCareMessages(input: DecisionInput) {
  const age = calculateAge(input.birthDate);
  const genderText =
    input.gender === 'female' ? '女性' : input.gender === 'male' ? '男性' : '其他';

  return [
    {
      role: 'system' as const,
      content: ANTI_CHICKEN_SOUP_CONSTITUTION + '\n\n' + PARENT_CARE_ADDENDUM,
    },
    {
      role: 'user' as const,
      content: `[用户档案]
生日: ${input.birthDate}
当前年龄: 约 ${age} 岁
性别: ${genderText}

[用户提出的父母养老相关决策]
${input.decision}

[请按以下结构输出分析 — 父母养老专项]

## 1. 核心冲突拆解
这个决策表面是 X,本质上你卡住的是这几对张力中的哪几对?
- 责任 vs 自我消耗
- 愧疚 vs 边界
- 孝顺叙事 vs 现实可行性
- 你 vs 配偶 vs 兄弟姐妹的隐性谈判
直接点名,不要回避(限 150 字内)。

## 2. 父母现状定位
基于用户描述,把父母放进哪个健康阶段?
- 阶段 1: 完全自理(focus 在情感连接和财务规划,不要过度照护)
- 阶段 2: 部分自理(focus 在适度协助 + 远程监护 + 紧急预案)
- 阶段 3: 失能/认知衰退(focus 在专业照护资源 + 家庭分工)
- 阶段 4: 临终阶段(focus 在尊严 + 减痛 + 家人和解)
点出当前阶段,以及未来 5 年最可能的过渡。如果用户没说健康状态,直接问。

## 3. 三条可选方案
对每条方案给出:
- 方案名(一句话)
- 5 年后图景: 父母状态 / 你的状态 / 配偶状态 / 兄弟姐妹关系 / 孩子受影响程度(必须把所有人都画出来)
- 经济代价(尽量量化: 月支出 / 资产消耗 / 机会成本)
- 时间代价(每周/每月小时数)
- 情感代价(具体到睡眠 / 婚姻张力 / 你自身职业能量)
- 谁会受益、谁会受损

## 4. 责任地图
列出所有相关方应承担的责任:
- 父母自身(他们的健康决策权 / 财务责任)
- 你
- 配偶
- 兄弟姐妹(若有)
- 父母自己的资产 / 保险 / 退休金
- 专业照护资源(护工 / 养老院 / 居家护理)
明确指出"用户方案里有没有把别人的责任揽到自己身上"。

## 5. 反向 PreMortem
如果 3 年后这个决定毁掉了你的婚姻 / 健康 / 职业 / 跟父母的关系,最可能的根因是什么?
按概率排序给 2-3 个候选。

## 6. 你没意识到的盲点
1-2 个用户在自述里没提到、但是父母养老决策的关键变量。
比如: 配偶的真实意愿(不是嘴上说的)、父母自己的偏好(他们可能不想被接来)、孩子的发展阶段、你自己的健康警讯。

## 7. Cracking Question
1-2 个最关键的决策性硬核问题。
其中至少 1 个必须涉及"你给自己留了多少空间"或"你和配偶/兄弟姐妹的真实分工是否谈过"。

【格式要求】
- 用 ## 二级标题分节
- 不要在末尾加任何"祝你和父母都好"之类的安慰话
- 不要给最终建议(选哪条方案)
- 让用户自己想透,不替他决定
- 如果用户提到自伤、抑郁、或者父母可能有医疗紧急情况,必须在回答开头先建议联系专业资源`,
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
