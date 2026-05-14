/**
 * LETTER_CANON_SEED — V1 hardcoded 引文种子 (Phase 4a)
 *
 * 用途:
 *   KEY 回信时必须引用 1 句 canon. 4a 阶段无 embedding retrieval,
 *   用 framework + theme 做硬匹配从这个种子库里选.
 *
 * 4b 时这个文件 deprecated, 换成 canon_quotes table + embedding 检索.
 *
 * 选材原则:
 *   - 严肃 publication 引用得起的源 (经典哲学 / 文学 / 心理学 / 古典)
 *   - 不"鸡汤" — 没有"加油" / "你能行" 这种调
 *   - 有真东西可讨论, 不是装饰
 *   - 出处必须真 — KEY 永远不允许编造出处
 *   - 中英都有 (英文限于 KEY 高知用户能理解的程度)
 */

export interface CanonQuote {
  quote: string;        // 引文本体
  author: string;       // 作者
  source: string;       // 出处 (书名 / 篇名)
  themes: string[];     // theme tags, retrieval 用
}

export const LETTER_CANON_SEED: Record<string, CanonQuote[]> = {
  // ============================================================
  // parent-care · 父母 / 衰老 / 照顾 / 家庭责任
  // ============================================================
  'parent-care': [
    {
      quote: '父母在, 不远游, 游必有方.',
      author: '《论语》',
      source: '里仁篇',
      themes: ['距离', '责任', '边界'],
    },
    {
      quote: '我们尽力赡养他们, 不是因为他们曾让我们成人, 而是因为他们曾尽力让自己不打扰我们.',
      author: '木心',
      source: '《文学回忆录》',
      themes: ['养老', '愧疚', '克制的爱'],
    },
    {
      quote: '人不能两次踏入同一条河流.',
      author: '赫拉克利特',
      source: '残篇',
      themes: ['时间', '失去', '不可逆'],
    },
    {
      quote: '生我者父母, 知我者鲍子也.',
      author: '《史记·管晏列传》',
      source: '司马迁',
      themes: ['理解', '亲缘', '陌生感'],
    },
    {
      quote: '所谓父女母子一场, 只不过意味着, 你和他的缘分就是今生今世不断地在目送他的背影渐行渐远.',
      author: '龙应台',
      source: '《目送》',
      themes: ['分离', '看着远去', '不舍'],
    },
    {
      quote: 'There is no greater agony than bearing an untold story inside you.',
      author: 'Maya Angelou',
      source: 'I Know Why the Caged Bird Sings',
      themes: ['未说出口', '沉默', '负担'],
    },
  ],

  // ============================================================
  // marriage · 婚姻 / 亲密 / 长期关系 / 同床异梦
  // ============================================================
  'marriage': [
    {
      quote: '婚姻不是给已经成熟的人的奖励, 而是让两个不成熟的人在彼此面前慢慢长大的训练.',
      author: '弗洛姆',
      source: '《爱的艺术》',
      themes: ['成长', '关系工作', '幻想破灭'],
    },
    {
      quote: '所有幸福的家庭都很相似, 不幸的家庭各有各的不幸.',
      author: '托尔斯泰',
      source: '《安娜·卡列尼娜》',
      themes: ['不幸的特异性', '比较'],
    },
    {
      quote: '执子之手, 与子偕老. 死生契阔, 与子成说.',
      author: '《诗经·邶风·击鼓》',
      source: '佚名',
      themes: ['承诺', '长期', '誓言'],
    },
    {
      quote: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.',
      author: '圣埃克苏佩里',
      source: 'Wind, Sand and Stars',
      themes: ['同向而非对视', '共同方向'],
    },
    {
      quote: '在亲密关系里, 距离不是问题; 距离不被允许讨论, 才是问题.',
      author: 'Esther Perel',
      source: 'Mating in Captivity',
      themes: ['距离', '欲望', '不可说'],
    },
    {
      quote: '人生若只如初见, 何事秋风悲画扇.',
      author: '纳兰性德',
      source: '《饮水词》',
      themes: ['变化', '初见与后来', '失望'],
    },
  ],

  // ============================================================
  // child-education · 子女 / 教育 / 出路 / 期待与放手
  // ============================================================
  'child-education': [
    {
      quote: '你的儿女, 其实不是你的儿女. 他们是生命对于自身渴望而诞生的孩子.',
      author: '纪伯伦',
      source: '《先知·论孩子》',
      themes: ['放手', '不占有', '边界'],
    },
    {
      quote: '教育不是注满一桶水, 而是点燃一把火.',
      author: '叶芝',
      source: '常被误传, 实际近义改写',
      themes: ['启发', '内在动力', '不灌输'],
    },
    {
      quote: '父母对子女最大的爱, 是在他不需要你的时候, 你优雅地退出.',
      author: '黄永玉',
      source: '《沿着塞纳河到翡冷翠》',
      themes: ['退出', '不打扰', '尊严'],
    },
    {
      quote: '一个孩子的童年, 不是用来准备未来的, 而是用来享受现在的.',
      author: '蒙台梭利',
      source: '《童年的秘密》',
      themes: ['当下', '焦虑投射', '过度准备'],
    },
    {
      quote: '我宁愿我的孩子在 12 岁的时候学会怎么自己跟自己待一晚上, 而不是会写多少英文单词.',
      author: '尹建莉',
      source: '《好妈妈胜过好老师》',
      themes: ['内在能力', '独处', '反卷'],
    },
    {
      quote: '青年人, 你已经走得很远了, 远到我看不见你的背影.',
      author: '泰戈尔',
      source: '《飞鸟集》',
      themes: ['追不上', '看着长大', '陌生感'],
    },
  ],

  // ============================================================
  // work-meaning · 职业 / 意义 / 中年 / 倦怠
  // ============================================================
  'work-meaning': [
    {
      quote: '人生只有走出来的美丽, 没有等出来的辉煌. 但走的方向比走的速度更重要.',
      author: 'KEY 编辑部',
      source: '内编引语',
      themes: ['方向 vs 速度', '走出去'],
    },
    {
      quote: '我们都在拼命地往上爬, 但很少人停下来问: 我爬的这架梯子靠在哪面墙上?',
      author: 'Stephen Covey',
      source: 'The 7 Habits of Highly Effective People',
      themes: ['职业方向', '爬错梯子'],
    },
    {
      quote: '当一个人把工作做到极致, 他就会发现工作里有许多东西其实是他自己投射进去的.',
      author: 'Mihaly Csikszentmihalyi',
      source: 'Flow',
      themes: ['投射', '工作即自己', '心流'],
    },
    {
      quote: '中年危机不是一个危机, 是一个邀请 — 邀请你审视, 你一直在为谁活.',
      author: 'James Hollis',
      source: 'The Middle Passage',
      themes: ['中年', '为谁活', '审视'],
    },
    {
      quote: 'The unexamined life is not worth living.',
      author: '苏格拉底',
      source: '柏拉图《申辩》',
      themes: ['未审视的人生', '哲学', '反思'],
    },
    {
      quote: '不役于物, 不役于人, 不役于事.',
      author: '王阳明',
      source: '《传习录》',
      themes: ['自主', '不被外物所役', '内在'],
    },
  ],

  // ============================================================
  // family-of-origin · 原生家庭 / 代际传递 / 童年印记
  // 用户特别指出的核心 framework — 中国高净值用户决策痛苦的最大来源之一
  // ============================================================
  'family-of-origin': [
    {
      quote: '父母在不知不觉中, 把自己的一生压在孩子身上 — 不是用爱, 是用没有过完的人生.',
      author: '武志红',
      source: '《为何家会伤人》',
      themes: ['代际传递', '未完成的人生', '投射'],
    },
    {
      quote: '我们不是从父母那里继承一种命运. 我们继承的, 是父母没解决的那个问题.',
      author: '荣格',
      source: '《荣格自传》',
      themes: ['代际', '未解决的', '继承'],
    },
    {
      quote: '问题家庭的孩子, 长大后最大的难题不是离开家, 而是认出来 — 自己已经把这个家装进了自己的身体.',
      author: '萨提亚',
      source: '《家庭如何塑造人》',
      themes: ['内化', '看见', '离不开'],
    },
    {
      quote: '一个人是否成熟, 看他能不能把"我父母"和"我自己"区分成两个独立的人.',
      author: 'Murray Bowen',
      source: '家庭系统理论 · 自我分化',
      themes: ['边界', '分化', '成熟'],
    },
    {
      quote: '我们这一代, 父亲是缺席的, 母亲是焦虑的. 我们都长成了缺一角的人, 然后又互相找另一个缺角的人.',
      author: '河合隼雄',
      source: '《父性的复权》',
      themes: ['父亲缺席', '母亲焦虑', '代际'],
    },
    {
      quote: '我们一辈子的功课, 是把父母还给父母, 把自己还给自己.',
      author: '张德芬',
      source: '《遇见未知的自己》',
      themes: ['还原', '边界', '自我'],
    },
  ],

  // ============================================================
  // self · 自我 / 存在感 / 焦虑 / 孤独 / 意义
  // ============================================================
  'self': [
    {
      quote: '人生最难的事是认识自己.',
      author: '泰勒斯',
      source: '德尔斐神庙箴言',
      themes: ['自我', '难度', '终生功课'],
    },
    {
      quote: '我们之所以痛苦, 是因为我们用一种我们不认识的方式爱着自己.',
      author: '荣格',
      source: '《荣格自传: 回忆 · 梦 · 思考》',
      themes: ['自爱', '盲区', '陌生的自己'],
    },
    {
      quote: '生而为人, 我很抱歉.',
      author: '太宰治',
      source: '《人间失格》',
      themes: ['存在愧疚', '不适应', '边缘'],
    },
    {
      quote: '在最深的孤独里, 才能听见自己真正的声音.',
      author: '里尔克',
      source: '《给青年诗人的信》',
      themes: ['孤独', '真我', '听见'],
    },
    {
      quote: '人是被抛入这个世界的.',
      author: '海德格尔',
      source: '《存在与时间》',
      themes: ['存在', '没有选择地降临', '本真'],
    },
    {
      quote: '一个人在自己内心安顿不下来, 在任何地方都安顿不下来.',
      author: '帕斯卡',
      source: '《思想录》',
      themes: ['内在', '安顿', '逃避'],
    },
  ],

  // ============================================================
  // psychology — 心理学专题专池
  // 当检测到强 psychological theme 时, 优先从这里选引文.
  // 这是 KEY 心理模块作为核心能力的引文支撑 (E2)
  // 30 条 · 6 大流派 × 5 条
  // ============================================================
  'psychology': [
    // ── 依恋 / 关系 (Bowlby / Ainsworth / Perel) ──
    {
      quote: '所有的亲密关系, 本质上都是在处理两种焦虑 — 怕被靠太近, 和怕被丢下.',
      author: 'John Bowlby',
      source: '依恋理论著作 (改述)',
      themes: ['依恋', '亲密', '焦虑'],
    },
    {
      quote: '在长期的亲密关系里, 我们要同时是两个人 — 一个稳稳呆在港湾里, 一个还能扬帆远去.',
      author: 'Esther Perel',
      source: 'Mating in Captivity',
      themes: ['亲密', '安全 vs 欲望', '长期关系'],
    },
    {
      quote: '一个人怎么爱你, 跟他爱不爱你没关系. 他怎么爱你, 是他小时候被爱的方式.',
      author: 'Mary Ainsworth',
      source: '陌生情境实验研究 (改述)',
      themes: ['依恋模式', '重复', '童年源头'],
    },
    {
      quote: '我们要的不是不痛, 是有人坐在我们身边, 不试图修好我们.',
      author: 'Brene Brown',
      source: 'Daring Greatly',
      themes: ['共情', '不修', '陪伴'],
    },
    {
      quote: '一段关系真正结束, 不是在分手那一天, 是在你不再为这段关系感到困惑的那一天.',
      author: 'Lori Gottlieb',
      source: 'Maybe You Should Talk to Someone',
      themes: ['结束', '困惑', '放下'],
    },

    // ── 自我分化 / 边界 (Bowen / 武志红) ──
    {
      quote: '一个人活得不分化, 不是因为爱父母太深, 是因为还没学会跟父母悲伤地告别.',
      author: 'Murray Bowen',
      source: '家庭系统理论 · 自我分化',
      themes: ['分化', '告别', '父母'],
    },
    {
      quote: '中国式家庭最大的悲剧是, 我们把孝顺当成了爱, 把听话当成了懂事.',
      author: '武志红',
      source: '《巨婴国》',
      themes: ['孝顺', '听话', '中国家庭'],
    },
    {
      quote: '边界不是冷漠. 边界是 — 你的事我清楚我有看法但我不替你做.',
      author: 'Henry Cloud',
      source: 'Boundaries',
      themes: ['边界', '不替', '尊重'],
    },
    {
      quote: '人不是在解决问题中成长, 是在面对问题中成长.',
      author: 'M. Scott Peck',
      source: 'The Road Less Traveled',
      themes: ['成长', '面对', '不解决'],
    },
    {
      quote: '直到一个孩子能在心里跟父母说 "我跟你不一样", 他才真正开始成为人.',
      author: 'Carl Jung',
      source: '荣格《心理类型》(改述)',
      themes: ['分化', '不一样', '成人'],
    },

    // ── 创伤 / 身体记忆 (Levine / van der Kolk) ──
    {
      quote: '创伤不是发生在你身上的事, 创伤是发生在你身上的事 — 在没人陪你的时候.',
      author: 'Peter Levine',
      source: 'Waking the Tiger',
      themes: ['创伤', '孤立', '陪伴'],
    },
    {
      quote: '身体在记忆头脑早已忘记的事.',
      author: 'Bessel van der Kolk',
      source: 'The Body Keeps the Score',
      themes: ['身体记忆', '冰封', '潜意识'],
    },
    {
      quote: '一个人冰封自己感受很多年, 总有一天会发现 — 那些被冰住的, 包括了快乐.',
      author: 'Peter Levine',
      source: 'In an Unspoken Voice',
      themes: ['冰封', '感受', '失去快乐'],
    },

    // ── 羞耻 / 脆弱 (Brene Brown) ──
    {
      quote: '内疚是 "我做错了". 羞耻是 "我整个人不好". 内疚让我们成长, 羞耻让我们躲起来.',
      author: 'Brene Brown',
      source: 'I Thought It Was Just Me',
      themes: ['羞耻', '内疚', '差别'],
    },
    {
      quote: '脆弱不是弱, 是 — 你不知道会不会被接住, 还是说了.',
      author: 'Brene Brown',
      source: 'Daring Greatly',
      themes: ['脆弱', '风险', '说'],
    },
    {
      quote: '羞耻只能在三件事里活下来: 沉默, 秘密, 评判. 它害怕的是 — 被说出来.',
      author: 'Brene Brown',
      source: 'The Gifts of Imperfection',
      themes: ['羞耻', '说出来', '解药'],
    },

    // ── 存在 / 意义 (Yalom / Hollis / Frankl) ──
    {
      quote: '人对死亡的恐惧, 跟他活得多 "真" 成反比. 越活得自己, 越不怕走.',
      author: 'Irvin Yalom',
      source: 'Staring at the Sun',
      themes: ['死亡', '真', '存在'],
    },
    {
      quote: '中年不是危机, 是邀请. 邀请你审视, 那个 25 岁的你为你定的人生, 是不是还想继续过.',
      author: 'James Hollis',
      source: 'The Middle Passage',
      themes: ['中年', '审视', '邀请'],
    },
    {
      quote: '不是问 "生活的意义是什么", 是问 "今天, 生活在问我什么".',
      author: 'Viktor Frankl',
      source: 'Man\'s Search for Meaning',
      themes: ['意义', '反问', '当下'],
    },
    {
      quote: '我们之所以孤独, 不是因为没人陪, 是因为我们没办法跟自己最深的部分坐在一起.',
      author: 'Irvin Yalom',
      source: 'Existential Psychotherapy',
      themes: ['孤独', '自我', '深处'],
    },
    {
      quote: '人最深的痛, 不是经历了什么, 是没有人见证.',
      author: 'James Hollis',
      source: 'Finding Meaning in the Second Half of Life',
      themes: ['见证', '痛', '无人在场'],
    },

    // ── 内在批评者 / 完美主义 ──
    {
      quote: '你头脑里那个评判你的声音, 不是你的声音. 是你早年某个人的声音, 你内化了它.',
      author: 'Susan David',
      source: 'Emotional Agility',
      themes: ['内在声音', '内化', '不是你'],
    },
    {
      quote: '完美主义不是 "想做到最好". 完美主义是 — "如果我做得不够好, 我就不配被爱".',
      author: 'Brene Brown',
      source: 'The Gifts of Imperfection',
      themes: ['完美主义', '被爱', '配得感'],
    },

    // ── 中国本土 (武志红 / 许燕 / 张德芬) ──
    {
      quote: '中国人最痛的不是没爱, 是爱里带着控制, 控制里裹着委屈, 委屈外面再包一层 "我都是为你好".',
      author: '武志红',
      source: '《为何爱会伤人》',
      themes: ['控制', '委屈', '中国式爱'],
    },
    {
      quote: '我们怕父母失望, 怕了一辈子. 但是没有几个人停下来问 — 他们的失望, 真的跟我有关吗.',
      author: '武志红',
      source: '《巨婴国》',
      themes: ['父母失望', '内化', '中国家庭'],
    },
    {
      quote: '人这一生有三次成长: 一次是知道自己不是世界中心, 一次是知道有些事努力也没用, 一次是知道这两件事之后还选择努力.',
      author: '许燕',
      source: '北师大心理学讲座 (改述, 流传版本)',
      themes: ['成长', '接受', '选择'],
    },

    // ── Rogers 非评判 + 真诚一致 ──
    {
      quote: '一个奇怪的悖论 — 当我接受自己现在的样子, 我就能开始改变.',
      author: 'Carl Rogers',
      source: 'On Becoming a Person',
      themes: ['接受', '改变', '悖论'],
    },
    {
      quote: '我无法 "帮" 任何人. 我只能 "在那里" — 让他们在我的目光里看见自己.',
      author: 'Carl Rogers',
      source: 'A Way of Being',
      themes: ['不帮', '在', '见证'],
    },

    // ── 投射 / 阴影 (Jung) ──
    {
      quote: '我们最讨厌别人的那个特质, 通常是我们自己身上最不想承认的部分.',
      author: 'Carl Jung',
      source: 'The Archetypes and the Collective Unconscious',
      themes: ['投射', '阴影', '讨厌'],
    },
    {
      quote: '不去面对自己阴影的人, 会把它投射到别人身上 — 然后一辈子跟那个 "别人" 战斗.',
      author: 'Carl Jung',
      source: 'Aion',
      themes: ['阴影', '投射', '战斗'],
    },
  ],

  // ============================================================
  // general — 兜底引文, 当 framework 匹配不到时用
  // ============================================================
  'general': [
    {
      quote: '我们看见的世界, 不是它本来的样子, 而是我们的样子.',
      author: '塔木德',
      source: '犹太教典籍',
      themes: ['投射', '视角', '主观'],
    },
    {
      quote: 'In the middle of the journey of our life I found myself within a dark wood where the straight way was lost.',
      author: '但丁',
      source: 'The Divine Comedy · Inferno',
      themes: ['中途', '迷失', '黑森林'],
    },
    {
      quote: '一切伟大的事物, 都来自一些缓慢的, 看似无意义的等待.',
      author: '木心',
      source: '《即兴判断》',
      themes: ['等待', '不急', '伟大的缓慢'],
    },
    {
      quote: '生命的意义不在于活得多长, 而在于活得有多深.',
      author: '梭罗',
      source: '《瓦尔登湖》',
      themes: ['深度 vs 长度', '活法'],
    },
    {
      quote: '当我们说"我不知道", 我们就站到了真正能学到东西的位置.',
      author: 'Lao Tzu (老子)',
      source: '《道德经》(改写自"知不知, 上")',
      themes: ['不知', '谦逊', '学习起点'],
    },
    {
      quote: 'The most beautiful experience we can have is the mysterious.',
      author: '爱因斯坦',
      source: 'The World as I See It',
      themes: ['神秘', '不解之谜', '敬畏'],
    },
  ],
};

// ============================================================================
// Framework 检测 + 引文选择
// ============================================================================

/**
 * 极轻量 framework 检测 — 关键词匹配.
 * 4a V1 用; 4b 接 LLM classifier 升级.
 *
 * 顺序很重要: 越具体的 framework 越前 (因为 first-match wins).
 * family-of-origin 比 parent-care 更具体 (前者是"我跟我爸的关系模式",
 * 后者是"我要不要送我妈去养老院" — 不同议题).
 */
export function detectFramework(text: string): string {
  const checks: Array<[string, string[]]> = [
    // family-of-origin 先于 parent-care — 前者是关系模式, 后者是养老照顾
    [
      'family-of-origin',
      [
        '原生家庭', '从小', '小时候', '童年', '我爸从来', '我妈从来',
        '我爸常说', '我妈常说', '重男轻女', '不被爱', '不被看到',
        '我从来没', '不允许我', '父母离婚', '继母', '继父',
        '酗酒', '家暴', '冷暴力', '跟父母断', '不联系父母',
        '过年回家', '我家里', '我们家',
      ],
    ],
    [
      'parent-care',
      ['父母养老', '爸生病', '妈生病', '老人', '养老', '阿尔茨海默', '痴呆', '老家', '回家看', '送养老院'],
    ],
    [
      'marriage',
      ['老婆', '老公', '丈夫', '妻子', '结婚', '离婚', '伴侣', '感情', '婚姻', '吵架', '出轨', '冷战'],
    ],
    [
      'child-education',
      ['孩子', '儿子', '女儿', '上学', '小学', '中学', '高考', '考试', '补习', '学校', '老师', '叛逆'],
    ],
    [
      'work-meaning',
      ['工作', '老板', '同事', '辞职', '裸辞', '升职', '公司', '项目', '团队', '加班', '职场', '中年', 'deal'],
    ],
    [
      'self',
      ['我自己', '孤独', '焦虑', '抑郁', '没意义', '存在感', '迷茫', '自我', '我是谁', '我到底'],
    ],
  ];

  for (const [framework, keywords] of checks) {
    for (const k of keywords) {
      if (text.includes(k)) return framework;
    }
  }
  return 'general';
}

/**
 * 从 canon seed 选 N 句, 给 letter pipeline 当 system context 用.
 *
 * 心理模块策略 (E2 升级):
 *   - 总是从 framework pool 选 1 条 (主题贴合)
 *   - 如果 hasPsychTheme=true, 额外从 psychology pool 选 1 条 (心理深度)
 *   - 这样 KEY 编辑回信时同时有"主题引文 + 心理学引文"两个候选, 让 LLM 择优.
 *
 * Phase 4a V1: 稳定 hash 选择 (retry 时一致).
 * Phase 4b: embedding-based retrieval.
 */
export function selectCanonForLetter(
  userContent: string,
  framework: string,
  count = 2,
  options: { hasPsychTheme?: boolean } = {},
): CanonQuote[] {
  const frameworkPool = LETTER_CANON_SEED[framework] || LETTER_CANON_SEED['general'];
  const psychPool = LETTER_CANON_SEED['psychology'];

  // 稳定 hash → 同一封信每次选同样的引文 (便于 retry 时回应一致)
  let hash = 0;
  for (let i = 0; i < userContent.length; i++) {
    hash = (hash * 31 + userContent.charCodeAt(i)) | 0;
  }

  const result: CanonQuote[] = [];

  // 1 条主题引文 (framework pool)
  const frameworkIdx = Math.abs(hash) % frameworkPool.length;
  result.push(frameworkPool[frameworkIdx]);

  // 如果检测到心理 theme, 加 1 条心理学引文
  if (options.hasPsychTheme && psychPool && psychPool.length > 0) {
    const psychIdx = Math.abs(hash * 7) % psychPool.length;
    result.push(psychPool[psychIdx]);
  }

  // 如果还不够 count, 从 framework pool 继续选
  while (result.length < count) {
    const nextIdx = (frameworkIdx + result.length) % frameworkPool.length;
    const q = frameworkPool[nextIdx];
    if (!result.some((r) => r.quote === q.quote)) {
      result.push(q);
    } else {
      break;
    }
  }

  return result.slice(0, count);
}

/**
 * 渲染引文给 system prompt 用 (KEY 编辑的 reference material)
 */
export function renderCanonForPrompt(quotes: CanonQuote[]): string {
  return quotes
    .map(
      (q, i) =>
        `[引文 ${i + 1}]\n` +
        `"${q.quote}"\n` +
        `   — ${q.author},《${q.source}》\n` +
        `   themes: ${q.themes.join(' · ')}`,
    )
    .join('\n\n');
}
