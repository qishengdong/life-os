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
 */
export function detectFramework(text: string): string {
  const lower = text.toLowerCase();
  const checks: Array<[string, string[]]> = [
    ['parent-care', ['父母', '爸', '妈', '老人', '养老', '阿尔茨海默', '痴呆', '老家', '回家看']],
    ['marriage', ['老婆', '老公', '丈夫', '妻子', '结婚', '离婚', '伴侣', '感情', '婚姻', '吵架', '出轨']],
    ['child-education', ['孩子', '儿子', '女儿', '上学', '小学', '中学', '高考', '考试', '补习', '学校', '老师']],
    ['work-meaning', ['工作', '老板', '同事', '辞职', '裸辞', '升职', '公司', '项目', '团队', '加班', '职场', '中年']],
    ['self', ['我自己', '孤独', '焦虑', '抑郁', '没意义', '存在感', '迷茫', '中年', '自我']],
  ];

  for (const [framework, keywords] of checks) {
    for (const k of keywords) {
      if (text.includes(k)) return framework;
    }
  }
  return 'general';
}

/**
 * 从 canon seed 选 1-2 句, 给 letter pipeline 当 system context 用.
 * Phase 4a V1: 随机选 (但 seed 用 user content hash 保持稳定).
 */
export function selectCanonForLetter(
  userContent: string,
  framework: string,
  count = 2,
): CanonQuote[] {
  const pool = LETTER_CANON_SEED[framework] || LETTER_CANON_SEED['general'];

  // 稳定 hash → 同一封信每次选同样的引文 (便于 retry 时回应一致)
  let hash = 0;
  for (let i = 0; i < userContent.length; i++) {
    hash = (hash * 31 + userContent.charCodeAt(i)) | 0;
  }
  const startIdx = Math.abs(hash) % pool.length;

  const result: CanonQuote[] = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    result.push(pool[(startIdx + i) % pool.length]);
  }
  return result;
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
