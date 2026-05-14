/**
 * AI Native Test V2 · 12 Personas
 *
 * 用户画像分布:
 *   - 8 位女性 (35-55), 默认 KEY 高知高焦虑女性
 *   - 4 位男性 (40-55), 中产 / 高净值男性 (难表达, 长期"装")
 *
 * 每个 persona 含:
 *   - 背景 (社会身份 / 家庭 / 关系)
 *   - 写作 voice (会写 vs 不会写, 文字密度)
 *   - 核心心理结构 (3-4 个 theme, 是这个人长期的 attachment / inner-critic 模式)
 *   - 触发 framework (这个人最常写信讨论的议题)
 *
 * 不写脸谱化的"角色" — 这是真实中国 35-55 高知人群的画像浓缩.
 */

import type { PsychologicalTheme } from '@/lib/letters/psychological-themes';

export interface Persona {
  id: string;                       // 'A' / 'B' / ... / 'L'
  gender: 'f' | 'm';
  age: number;
  displayName: string;              // KEY 回信里的称谓
  background: string;               // 1-2 句社会身份 / 家庭
  writingVoice: string;             // 1 句, 描述这个人怎么写信
  coreThemes: PsychologicalTheme[]; // 3-4 个长期心理结构
  triggerFrameworks: string[];      // 这个 persona 最常写的议题
  // 给 brain 预置的"过往记忆" (~ 5 条 facts, 模拟用户之前跟 KEY 互动留下的 brain trace)
  brainSeed: Array<{ topic: string; fact: string }>;
}

export const PERSONAS: Persona[] = [
  // ========================================
  // 女性 (8 位)
  // ========================================
  {
    id: 'A',
    gender: 'f',
    age: 38,
    displayName: '林',
    background: '上海, 投行 VP, 已婚 6 年, 没孩子, 跟父母关系紧张',
    writingVoice: '文笔流畅, 习惯把情绪知识化分析, 偶尔露出真情绪后立刻收回',
    coreThemes: ['self-differentiation', 'inner-critic', 'family-of-origin'],
    triggerFrameworks: ['marriage', 'family-of-origin', 'work-meaning'],
    brainSeed: [
      { topic: '原生家庭', fact: 'A 提过她父母控制欲极强, 30 岁前每次穿衣搭配都被妈评价' },
      { topic: '婚姻', fact: '老公比她小 2 岁, 工作压力小, A 担心是否跟自己不在一个 pace' },
      { topic: '工作', fact: 'A 一年前升 VP 后开始失眠, 但跟同事说"挺好的"' },
      { topic: '边界', fact: 'A 跟妈妈每周一次电话, 每次都心累, 但没断' },
    ],
  },
  {
    id: 'B',
    gender: 'f',
    age: 44,
    displayName: '苏',
    background: '北京, 大学教授, 已婚 18 年, 一个 14 岁儿子, 跟丈夫"客气"',
    writingVoice: '克制书面体, 偏散文化, 有古典文学储备',
    coreThemes: ['emotional-suppression', 'midlife', 'attachment'],
    triggerFrameworks: ['marriage', 'self', 'work-meaning'],
    brainSeed: [
      { topic: '婚姻', fact: 'B 跟先生 3 年没有过真情绪对话, 但表面"圆满"' },
      { topic: '中年', fact: 'B 今年 44, 频繁想起 25 岁那年放弃出国的选择' },
      { topic: '儿子', fact: 'B 的儿子青春期叛逆, 跟父亲对抗时她不敢站任何一边' },
      { topic: '身体', fact: 'B 最近频繁早醒, 但没去看医生' },
    ],
  },
  {
    id: 'C',
    gender: 'f',
    age: 41,
    displayName: '陈姐',
    background: '深圳, 科技公司中层, 单亲妈妈 (女儿 11 岁), 跟前夫和平分手',
    writingVoice: '直接, 短句多, 不修辞, 但偶尔一句话非常戳',
    coreThemes: ['shame', 'control-loss', 'identity'],
    triggerFrameworks: ['child-education', 'work-meaning', 'self'],
    brainSeed: [
      { topic: '离婚', fact: 'C 3 年前离婚, 一直跟父母说"前夫人不错就是工作忙", 不敢承认是 C 提的' },
      { topic: '女儿', fact: 'C 担心女儿"敏感", 内心怕的是女儿像自己' },
      { topic: '工作', fact: 'C 在公司是唯一女性中层, 开会都用男人腔调说话' },
      { topic: '约会', fact: 'C 偶尔有约会, 但从不带任何人见女儿' },
    ],
  },
  {
    id: 'D',
    gender: 'f',
    age: 52,
    displayName: '王女士',
    background: '杭州, 企业主夫人, 自己也有自媒体, 一儿一女都在国外读书',
    writingVoice: '语言华丽, 想表达"我有文化", 但情绪表达迂回',
    coreThemes: ['existential', 'inner-critic', 'identity'],
    triggerFrameworks: ['marriage', 'self', 'parent-care'],
    brainSeed: [
      { topic: '空巢', fact: 'D 两个孩子去年都出国, 她现在一个人在 600 平的房子' },
      { topic: '丈夫', fact: 'D 丈夫常出差, 在家也少说话, D 怀疑他有别人但不想确认' },
      { topic: '身份', fact: 'D 自媒体粉丝 30 万, 但她说"那些人不认识真的我"' },
      { topic: '母亲', fact: 'D 80 岁的妈妈最近开始忘事' },
    ],
  },
  {
    id: 'E',
    gender: 'f',
    age: 36,
    displayName: 'J',
    background: '北京, 设计公司创始人 (独立), 同性伴侣 4 年, 未公开关系',
    writingVoice: '英文混中文, 用词精准, 偶尔写一半就停住',
    coreThemes: ['shame', 'family-of-origin', 'identity'],
    triggerFrameworks: ['family-of-origin', 'self', 'marriage'],
    brainSeed: [
      { topic: '性向', fact: 'J 跟父母从未出柜, 30 岁后父母不再问"找对象"了, J 觉得这是默契也是失落' },
      { topic: '伴侣', fact: 'J 的伴侣比她小 4 岁, 想要 commitment ceremony, J 推了 2 年' },
      { topic: '事业', fact: 'J 公司 8 个人, 她常 14 小时工作, 但跟伴侣说"在做创意"' },
    ],
  },
  {
    id: 'F',
    gender: 'f',
    age: 49,
    displayName: '李',
    background: '成都, 心理咨询师 (自己执业), 离异 5 年, 一个上大学的儿子',
    writingVoice: '专业知识丰富, 但写信时刻意不用术语, 反而更克制',
    coreThemes: ['emotional-suppression', 'midlife', 'self-differentiation'],
    triggerFrameworks: ['self', 'parent-care', 'family-of-origin'],
    brainSeed: [
      { topic: '职业', fact: 'F 是咨询师 12 年, 但自己有难时不找同行, 怕被看穿' },
      { topic: '前夫', fact: 'F 5 年前离婚, 离婚理由"性格不合", 实际是丈夫多年隐瞒抑郁' },
      { topic: '父亲', fact: 'F 父亲去年中风后, F 主动接他来住, 但每天都心累' },
    ],
  },
  {
    id: 'G',
    gender: 'f',
    age: 55,
    displayName: '吴女士',
    background: '上海, 已退休医生, 老公还在工作, 一个女儿 30 岁未婚',
    writingVoice: '老派书面语, 用 "您" 称呼 KEY (后来才改成你), 标点严谨',
    coreThemes: ['control-loss', 'existential', 'attachment'],
    triggerFrameworks: ['self', 'child-education', 'parent-care'],
    brainSeed: [
      { topic: '退休', fact: '吴女士退休 2 年, 一开始很开心, 现在每天找事做但都不持续' },
      { topic: '女儿', fact: '女儿 30 岁未婚, 吴女士嘴上说"自己决定", 心里很急' },
      { topic: '老公', fact: '老公比她大 6 岁, 还在工作, 但身体明显在衰退' },
    ],
  },
  {
    id: 'H',
    gender: 'f',
    age: 32,
    displayName: '小芮',
    background: '北京, 大厂产品经理, 未婚, 跟父母同城但分开住, 妈妈每周来看一次',
    writingVoice: '微博体, 短促, 偶尔自嘲, 但深处情绪很重',
    coreThemes: ['inner-critic', 'family-of-origin', 'attachment'],
    triggerFrameworks: ['family-of-origin', 'marriage', 'self'],
    brainSeed: [
      { topic: '妈妈', fact: '小芮的妈妈每次来都"打扫一遍房子", 小芮觉得是评价' },
      { topic: '感情', fact: '小芮上一段感情 2 年前结束, 男方说她"太敏感", 她内化这条' },
      { topic: '工作', fact: '小芮在大厂被 promote 但她说"没想去"' },
    ],
  },

  // ========================================
  // 男性 (4 位)
  // ========================================
  {
    id: 'I',
    gender: 'm',
    age: 47,
    displayName: '老周',
    background: '北京, 国企中高层, 已婚 19 年, 一个高考完的儿子, 父母都在世',
    writingVoice: '写信像写公文, 用词谨慎, 但写到一半会突然漏出真情绪然后赶快收',
    coreThemes: ['emotional-suppression', 'existential', 'midlife'],
    triggerFrameworks: ['work-meaning', 'parent-care', 'marriage'],
    brainSeed: [
      { topic: '父亲', fact: '老周父亲常说"男孩子哭就是没出息", 老周到 47 岁还没哭过 (除了去年开车一个人时)' },
      { topic: '儿子', fact: '儿子刚高考, 老周担心儿子像自己一样"成功但不快乐"' },
      { topic: '工作', fact: '老周在国企做到中层, 但 47 岁突然觉得 "再爬上去, 是更累, 不是更想要"' },
    ],
  },
  {
    id: 'J',
    gender: 'm',
    age: 41,
    displayName: '阿斌',
    background: '深圳, 创业者 (科技初创), 已婚 8 年, 老婆全职带 2 岁孩子',
    writingVoice: '直接, 但常用"哥们儿"语气掩盖深度, 偶尔触动写一句真心',
    coreThemes: ['attachment', 'inner-critic', 'shame'],
    triggerFrameworks: ['marriage', 'work-meaning', 'self'],
    brainSeed: [
      { topic: '老婆', fact: '阿斌的老婆全职带娃, 阿斌偶尔觉得"她跟我聊的都是孩子", 但不敢说' },
      { topic: '创业', fact: '阿斌 3 年没融到下一轮, 但跟老婆说"快了"' },
      { topic: '父亲', fact: '阿斌父亲是工人, 一辈子省吃俭用, 阿斌赚的钱 10 倍于他, 但跟父亲见面就吵' },
    ],
  },
  {
    id: 'K',
    gender: 'm',
    age: 53,
    displayName: '陈总',
    background: '广州, 制造业老板, 已婚 28 年, 一儿一女都成年了',
    writingVoice: '简短, 几乎是 SMS 风, 一句一行, 但句句沉',
    coreThemes: ['existential', 'control-loss', 'midlife'],
    triggerFrameworks: ['work-meaning', 'parent-care', 'self'],
    brainSeed: [
      { topic: '事业', fact: '陈总公司过去 5 年走下坡, 他还没跟家人说真实数字' },
      { topic: '父亲', fact: '陈总父亲 78 岁突然认知衰退, 陈总不知道怎么接' },
      { topic: '妻子', fact: '陈总跟太太 28 年, 这 5 年几乎没认真聊过' },
    ],
  },
  {
    id: 'L',
    gender: 'm',
    age: 39,
    displayName: '余',
    background: '上海, 律所合伙人, 已婚 5 年 (二婚), 跟前妻有一个 8 岁的女儿轮流抚养',
    writingVoice: '法律人腔, 用词精确, 但情绪表达迟疑',
    coreThemes: ['shame', 'inner-critic', 'family-of-origin'],
    triggerFrameworks: ['marriage', 'child-education', 'family-of-origin'],
    brainSeed: [
      { topic: '女儿', fact: '余跟前妻每周轮换, 周末送女儿时女儿不愿意跟他走, 他不知道为什么' },
      { topic: '现任妻子', fact: '余跟现任结婚 5 年, 一直没想要孩子, 现任开始问' },
      { topic: '父亲', fact: '余父亲是个失败的商人, 余一辈子在跟"我不能像他"较劲' },
    ],
  },
];

// 工具: 按 framework 找 personas (用于覆盖率检查)
export function personasByFramework(framework: string): Persona[] {
  return PERSONAS.filter((p) => p.triggerFrameworks.includes(framework));
}

// 工具: 按 theme 找 personas
export function personasByTheme(theme: PsychologicalTheme): Persona[] {
  return PERSONAS.filter((p) => p.coreThemes.includes(theme));
}
