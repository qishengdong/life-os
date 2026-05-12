/**
 * 7 条决策契约 — /methodology 页的内容数据.
 *
 * 把内容跟渲染分开. 这份是文案. craft 在这里, 不在 page.tsx.
 *
 * 编辑原则:
 *   - 名词比形容词重要
 *   - 句号制造节奏
 *   - 不用排比 / 不用"首先其次" / 不用 emoji
 *   - 每一段都是被写出来的, 不是被生成出来的
 */

export interface Contract {
  /** 罗马数字编号 */
  numeral: string;

  /** 简短标题 (4-10 字) */
  title: string;

  /** 英文副标题 (品牌国际感) */
  englishTitle: string;

  /** Hook 一句话 — 章节开端的钩子, 12-25 字 */
  hook: string;

  /** 正文 essay — 2-3 段, 每段 80-150 字 */
  body: string[];

  /** 对照: 普通 AI 怎么做 vs LifeOS 怎么做 */
  contrast: {
    aiAssistedQuote: string;
    aiNativeQuote: string;
  };

  /** 方法论血缘 — 名字 + 出处 + 关键洞见, 1-2 行 */
  lineage: {
    authority: string;
    citation: string;
    insight: string;
  };

  /** 看实例 链接到 /sample-brief 的对应章节标识 */
  sampleAnchor: 'parent-care' | 'marriage' | 'child-education';
}

export const CONTRACTS: Contract[] = [
  // ============================================================
  // I. 反鸡汤宪法
  // ============================================================
  {
    numeral: 'I',
    title: '反鸡汤宪法',
    englishTitle: 'The Anti-Chicken-Soup Constitution',
    hook: '你不需要再多一个夸你的 AI.',
    body: [
      'LifeOS 的每一次 LLM 调用, 都附带一份系统级禁令. 禁止输出"加油 / 你已经很棒了 / 听从内心 / 相信自己 / 一切都会好起来". 不主动安慰, 不假装有答案, 不替你决定.',
      '这不是一份风格指南. 是一份契约. 它在代码里 — anti-chicken-soup.ts, 第一行 import. 任何决策框架, 任何回应, 都先经过它. 你看到的所有输出, 都是这份契约之后的产物.',
      '调性的坐标在哪里? 像晚饭后跟你聊到深夜的最锐利的同事. 不是人生导师, 不是疗愈师, 不是心理咨询. 是 Charlie Munger 而不是 Naval Ravikant. 是精神科医生的"诚实"模式, 不是社工的"支持"模式.',
    ],
    contrast: {
      aiAssistedQuote: '听起来这是个艰难的决定. 相信你的直觉, 你会找到对的路.',
      aiNativeQuote: '你已经知道答案了. 你只是不敢承认承担它的代价是什么. 在这件事上, 真正的问题是 X.',
    },
    lineage: {
      authority: 'Charlie Munger',
      citation: '《穷查理宝典》(Poor Charlie\'s Almanack, 2005)',
      insight: '严肃决策的第一原则: 反对自己的情绪偏好, 而不是顺着它.',
    },
    sampleAnchor: 'marriage',
  },

  // ============================================================
  // II. 12 维结构化分析
  // ============================================================
  {
    numeral: 'II',
    title: '12 维结构化分析',
    englishTitle: 'Twelve Dimensions',
    hook: '重大决定要走的 12 个问题, 一个不能少.',
    body: [
      '每一份 LifeOS 决策简报必经 12 个维度. 第一性原理. 决策可逆性. 三条路径 + 5 年后图景. PreMortem 反向尸检. 你没意识到的盲点. 关键利益相关者. 时间窗口. 不可逆风险地图. 资源约束. 价值观一致性. Cracking Question. 最小下一步.',
      '一个维度都不能跳过. 不是因为更多就是更好 — 而是因为你一个人想的时候, 总是恰好跳过最关键的那一个.',
      'Atul Gawande 在《清单革命》里写过: 外科 / 航空 / 投资三个领域引入 checklist 后, 错误率降低 30-50%. 不是因为医生 / 飞行员 / 投资人变笨了 — 是因为人类在压力下, 总会忘掉自己已经知道的事.',
    ],
    contrast: {
      aiAssistedQuote: 'ChatGPT 接到你的问题, 直接给三个选项的 pros and cons. 中间漏掉 9 个该问的事.',
      aiNativeQuote: '12 维强制执行, 不容协商. 漏掉一个, 简报不算合格. validateBrief() 会标 issue.',
    },
    lineage: {
      authority: 'Atul Gawande · Daniel Kahneman',
      citation: '《清单革命》(2009) · 《Noise》(2021)',
      insight: '一致性是质量的前置条件. 不一致的决策系统, 即使每次都"聪明", 整体仍是不可靠的.',
    },
    sampleAnchor: 'parent-care',
  },

  // ============================================================
  // III. PreMortem 反向尸检
  // ============================================================
  {
    numeral: 'III',
    title: '反向尸检',
    englishTitle: 'PreMortem',
    hook: '下决定前, 强制让你想象失败的样子.',
    body: [
      '1989 年, 心理学家 Gary Klein 发现一个反直觉的现象. 如果你在做决定**之前**, 假设"3 年后这事彻底塌了", 然后反推哪里塌的 — 你能识别到的风险数量, 比"事前 pros and cons" 多 30%.',
      '这个方法叫 PreMortem. Google 已经把它写进重大产品决策流程. NASA 用它评估发射决策. Boeing 用它做安全审查.',
      'LifeOS 的每一份简报, Section VII 强制运行 PreMortem. 不是建议, 是契约. 我们会让 AI 假设这件事 3 年后塌了, 推断 2-3 个最可能的塌方点 — 其中至少一个, 必须是"你自己没意识到的".',
    ],
    contrast: {
      aiAssistedQuote: '可能的风险包括 ... (列出 3 条通用风险, 没有具体性)',
      aiNativeQuote: '假设 2029 年这件事塌了. 根据你 brain 里的 6 条事实, 我看到 2 个具体塌方点. 其中一个是你 1 月 13 日的 Pulse 提到过, 但你今天没把它纳入决策考量.',
    },
    lineage: {
      authority: 'Gary Klein',
      citation: '"Performing a Project Premortem", Harvard Business Review (2007)',
      insight: '想象失败比预测成功更能识别风险. 大脑面对"已经发生的失败"会比"可能发生的风险" 启动更细致的因果推理.',
    },
    sampleAnchor: 'child-education',
  },

  // ============================================================
  // IV. 领域专项框架
  // ============================================================
  {
    numeral: 'IV',
    title: '六个领域专项',
    englishTitle: 'Six Domain Frameworks',
    hook: '父母养老不是职业转型. 决策框架也不该是一套.',
    body: [
      '我们不用"一个万能模板"应付所有决策. 父母养老有它独特的失败模式 — 代际责任的隐性约定, 兄弟姐妹分担的政治, 走丢事件的不可逆性, 失能加速曲线的陡度. 婚姻有婚姻的 — 4 个月无性史 vs 6 个月分居 vs 8 年累积的"消失感". 子女教育有子女教育的 — 升学路径的窗口期, 孩子真实状态的识别, 配偶分歧的处理.',
      'LifeOS 内置 6 个针对中国 30-50 高知最常卡死的决策类型的专项框架: 父母养老 / 子女教育 / 职业转型 / 婚姻 / 迁移 / 危机重启. 每个框架由领域研究 + 真实案例库 + 已知失败模式表 共同构成.',
      '决策路由器在你 input 一句话时就自动识别框架. 高 confidence 直接走, 低 confidence 走 LLM 兜底分类器. 单一决策可能牵动多个框架 — 我们会同时展示主框架 + 次框架.',
    ],
    contrast: {
      aiAssistedQuote: '不论你问什么, 用同一套"列三个选项 + pros and cons"模板.',
      aiNativeQuote: '识别到"父母养老" framework + 次框架"婚姻". 注入这一类决策的 12 个已知失败模式. 不会问你"你的目标是什么"这种空话.',
    },
    lineage: {
      authority: 'Gary Klein',
      citation: '《Sources of Power》(1998) — Naturalistic Decision Making',
      insight: '每个领域的 expert 都靠 domain-specific 模式识别, 不靠通用算法. 通用的决策模板是给"非 expert"看的, 不是给真正会做决定的人用的.',
    },
    sampleAnchor: 'parent-care',
  },

  // ============================================================
  // V. 长期记忆
  // ============================================================
  {
    numeral: 'V',
    title: '长期记忆',
    englishTitle: 'Persistent Memory',
    hook: '它记得你三个月前说过, 你太太反对接父母同住.',
    body: [
      '这是 LifeOS 跟所有其他 AI 的最大区别. ChatGPT 不记得你. Pi 不记得你. Claude 不记得你. Replika 假装记得你, 但只挑你爱听的回应.',
      '我们记得. 你每次 Pulse 写的话, 每次决策时说出口的"我不能", 每个被你强调过 2 次以上的事实 — 都会被结构化进入你的 Brain. 5 层架构: 硬锚点 (永远成立的事实) / 事实卡 (具体信息) / 边界卡 (你明确说过的"不行") / 关系卡 (你跟谁怎样) / 事件卡 (重大时刻的原话).',
      '三个月后, 你再做一个相关的决定时, 我们不会问你"你结婚多久了". 我们会说: "你 1 月 13 日 Pulse 提到过, 你太太当时明确反对. 这次的决策是否已经处理这件事?" 这一句话, 是我们跟通用 AI 的护城河.',
    ],
    contrast: {
      aiAssistedQuote: '每次重新解释你是谁. 你 30 分钟前说过的话, 它已经忘了.',
      aiNativeQuote: '5 层记忆 + 自动生成的 Brain 文档 + 每次 prompt 自动注入相关历史 + Outcome 365 天追踪.',
    },
    lineage: {
      authority: '这是 LifeOS 的独有创新',
      citation: '— 没有完全对应的学术血缘',
      insight: '但它呼应的是临床心理学早期的 person-centered 学派 (Carl Rogers): 真正帮人的开端, 是"被认真记住".',
    },
    sampleAnchor: 'marriage',
  },

  // ============================================================
  // VI. Outcome Ledger
  // ============================================================
  {
    numeral: 'VI',
    title: '决策账本',
    englishTitle: 'Outcome Ledger',
    hook: '30 / 90 / 365 天后, 我们会回来问你: 当时担心的事, 发生了吗?',
    body: [
      '大多数 AI 决策工具, 给完建议就消失了. 你做了决定, 三个月后忘了当时为什么这么决定, 半年后塌了你不知道为什么塌的, 一年后又遇到类似情况, 重复同样的错.',
      'LifeOS 不一样. 每一份决策简报自动 schedule 三个 checkpoint — 30 天后, 90 天后, 365 天后. 那一天我们会找你 (邮件 / 微信通知), 问一个**具体的**问题: "你当时担心的 X, 现在 X 发生了吗? 你选了 A 路径, 5 年后的图景跟你预期一样吗? 你当时没提到的 Y, 现在变成什么样了?"',
      'Annie Duke 在《Thinking in Bets》里强调: 决策质量 ≠ 结果. 你做了对的决定也可能塌, 做了错的决定也可能蒙对. 不回访, 你永远学不到东西. 我们用 Outcome Ledger 把这件事强制做了 — 不是 reminder, 是契约.',
    ],
    contrast: {
      aiAssistedQuote: '给完建议, 关闭对话, 永远不知道结果.',
      aiNativeQuote: 'Outcome Ledger 自动 schedule 30/90/365 天回访 + 经验沉淀回 Brain + 失败模式入下一份简报的"已知陷阱".',
    },
    lineage: {
      authority: 'Annie Duke · Phil Tetlock',
      citation: '《Thinking in Bets》(2018) · 《Superforecasting》(2015)',
      insight: '超预测者 (top 2% 的预测准确度) 的核心特征不是更聪明, 而是定期校准自己 — 知道自己哪些时候对, 哪些时候错.',
    },
    sampleAnchor: 'child-education',
  },

  // ============================================================
  // VII. Inspector 6 项自审
  // ============================================================
  {
    numeral: 'VII',
    title: '六项自审',
    englishTitle: 'Six-Check Inspector',
    hook: 'AI 给完答案, 再过一道审查.',
    body: [
      '这一条最反直觉. LifeOS 的每一次输出, 都会被另一个独立的 Inspector 模块再过一遍, 检查 6 件事.',
      'C1: 是否真的引用了用户的具体事实, 还是抛抽象建议? C2: 是否给出空话 (像"建议你深入思考一下"这种)? C3: 是否量化了代价? C5: 是否埋了未声明的预设? C14: 是否违反了用户明确说过的硬锚点 (e.g. 用户说过"我老婆反对", AI 不应假设她同意)? C15: 是否 surface 了用户自己跨决策的矛盾?',
      '任何一项命中, 当前 shadow mode 记日志 + 标 issue, V2 起会阻塞输出. 这是 Kahneman 在《Noise》里强调的"决策一致性审计"思想 — 任何严肃决策系统, 都需要二审机制.',
    ],
    contrast: {
      aiAssistedQuote: '一个 LLM 自说自话. 错了也没人查.',
      aiNativeQuote: '一个 LLM 写 + 一个独立 Inspector 审 + 一份你能查的审计日志. 不依赖 LLM 自己注意到自己写错.',
    },
    lineage: {
      authority: 'Daniel Kahneman, Olivier Sibony, Cass Sunstein',
      citation: '《Noise: A Flaw in Human Judgment》(2021)',
      insight: '人 (和 LLM) 在同一个问题上, 不同时刻给出的答案差别极大. 减少 noise 的唯一方法, 是引入结构化的"二审".',
    },
    sampleAnchor: 'parent-care',
  },
];

// ============================================================================
// Opening + Closing manifesto
// ============================================================================
export const METHODOLOGY_OPENING = {
  eyebrow: '· LifeOS Editorial Office · Methodology ·',
  title: '我们为 AI 写了一份决策契约.',
  body: [
    '大多数所谓"AI 决策工具", 不过是给 ChatGPT 套一层 UI. 它们卖的是"AI 的便利". 我们卖的是另一件事 — 我们卖的是"AI 不能跳过的步骤".',
    '在重大人生决策面前 — 父母养老, 婚姻去留, 孩子出路, 职业转身 — 你不需要再多一个夸你的 AI. 你需要一个被严格约束, 长期记得你, 不替你做决定, 但保证你不跳过你一个人时会跳过的关键问题的伙伴.',
    '下面这 7 条契约, 是 LifeOS 跟通用 AI 的全部不同. 不是市场话术, 是代码里就有的东西. 每一条都附学术血缘, 每一条都给出实例.',
  ],
};

export const METHODOLOGY_CLOSING = {
  body: [
    '决策科学过去 40 年的全部研究, 指向同一件事: 重大决定的失败, 多数不是因为信息不够, 而是因为思考过程不完整.',
    'LifeOS 是把这 40 年的最佳实践 — Checklist Manifesto / PreMortem / Naturalistic Decision Making / Thinking in Bets / Noise / Anti-Chicken-Soup — 用 AI 的边际成本固化下来. 你不需要请一位资深顾问 (一小时 ¥1000-3000), 也不需要把这些书全部读完. 你需要一份契约, 让 AI 在你面对重大决定时, 不漏掉任何该问的事.',
  ],
  ctaPrimary: { label: '读三份真实的 sample brief', href: '/sample-brief' },
  ctaSecondary: { label: '开始第一次咨询', href: '/onboarding' },
};
