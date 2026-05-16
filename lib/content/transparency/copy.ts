/**
 * /transparency 页 — 静态编辑文案
 *
 * 数字 / 命中数 从 lib/grader/aggregations.ts 动态拉. 这里只放 essay 部分.
 */

export const HERO = {
  eyebrow: '· KEY · Transparency ·',
  title: '我们怎么审自己.',
  body: [
    '大多数 AI 产品的"信任 signal"是 testimonial / star rating / 几万订阅用户数. 我们没有这些 — 我们刚开始, 邀请制内测中.',
    '我们能给的信任 signal 只有一种: **把我们的内部审计数据直接公开**.',
    '每一份决策简报跑完后, 都被 7 个 Inspector check 和 1 套 12 维 Real Grader 评分. 这一页是我们的成绩单 — 不只是高分, 也包括我们目前**还没做到 5/5 的地方**.',
  ],
};

export const SECTION_GRADER = {
  numeral: 'I',
  title: '十二维评分',
  englishTitle: 'Twelve-Dimension Grader',
  intro: [
    '内部 Real Grader v3 框架: 每份决策输出在 12 个维度被独立评分 (满分 5).',
    '评分由一组合成 persona (27 个常规 + 7 个对抗 + 3 个长程) 跑出来 — 不是用户给好评, 是我们用最难的 case 测自己.',
    '12 维顺序按当前得分排, 最低的那几条排在最下面, 不藏.',
  ],
};

export const SECTION_INSPECTOR = {
  numeral: 'II',
  title: '七项自审',
  englishTitle: 'Seven Inspector Checks',
  intro: [
    '除了 Grader 给分, 每次输出还过一道 Inspector. 它是规则引擎, 不是 LLM — 不会被自己的 reasoning 说服.',
    'C1-C15 是 post-generation 审计 (输出后扫). C16 是 pre-injection 强制 (用户跨决策矛盾, 强行 surface 进 Brief).',
    'V0 阶段 C1-C15 走 shadow 模式 — 命中只记日志, 不阻塞输出. 假阳性率 < 5% 后切 active.',
  ],
};

export const SECTION_BRIEF = {
  numeral: 'III',
  title: '我们生成了什么',
  englishTitle: 'What We Have Produced',
  intro: [
    '每份决策简报: 9 个 section + 附录, 2000-3500 字, 两轮 LLM (Analyst + Editor) 端到端 75-95 秒.',
    '内测期数据小, 我们不藏数据, 也不放大数据.',
  ],
};

export const SECTION_NOT_MEASURED = {
  numeral: 'IV',
  title: '我们暂时没法量化的',
  englishTitle: 'What We Cannot Yet Measure',
  body: [
    '诚实声明: 上面的数字是我们能量化的部分. 决策这件事里, **最重要的几件事我们暂时无法量化**.',
    '— **用户做完决定 5 年后, 这个决定有没有变好他的生活?** Outcome Ledger 30/90/365 天回访已上线, 但 5 年视角需要 5 年时间. 没法跳过.',
    '— **AI 写的 PreMortem 跟一位资深顾问写的 PreMortem 比较起来如何?** 我们正在邀请几位行业资深者做盲评, 数据待出.',
    '— **用户在长期使用后, 是变得更会做决定了, 还是更依赖我们了?** 这是关系型 AI 最难的伦理题. 我们会用 Annie Duke 的"决策日志一致性"指标做长程评估, 但目前没有数据.',
    '凡是我们没法量化的, 不在上面的数字里. 你看到的是真实而非全部.',
  ],
};

export const SECTION_HOW_TO_QUESTION = {
  numeral: 'V',
  title: '怎么质疑我们',
  englishTitle: 'How to Question Us',
  body: [
    '如果你看到一份具体的 KEY 输出觉得有问题 — 编了你没说过的事 / 说了一句鸡汤 / 漏掉了你之前提到过的关键事实 / 当前决策跟你历史立场矛盾但 Brief 没 surface — 请告诉我们.',
  ],
  steps: [
    '截图或文字, 写到 audit@lifeos.cn (邀请期内用 hello@lifeos.cn)',
    '说明: 哪份简报 (briefNumber) / 哪一节 / 你认为问题在哪',
    '我们 7 天内回复, 包括: 是否承认问题 / 怎么改 / 已加到哪个 Inspector check',
    '所有 confirmed 的 audit 错误, 会进入下一期"月度错误公示"',
  ],
};

export const SECTION_FAIL_VISIBLY = {
  numeral: 'VI',
  title: '月度错误公示',
  englishTitle: 'Monthly Failure Log',
  body: [
    '"Fail visibly, not silently."',
    '邀请期内, 任何被用户上报且我们承认的产品错误, 都会在这一节按月公示 — 错误内容 / 影响范围 / 修复进度.',
    '数据空白时, 我们不会用"敬请期待"占位. 第一份月度公示在第一个真实错误被上报并修复后发布.',
  ],
};
