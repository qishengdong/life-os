/**
 * Psychological Theme Detector
 *
 * 目的:
 *   读者写来的信, 用关键词模式做轻量识别 — 看里面藏着哪些心理结构.
 *   把这些 theme 作为 system prompt 的 **context hint** 注入给 LLM,
 *   让 KEY 编辑能 "看到" 心理结构, 但**回信里绝不允许用术语**.
 *
 * 反例: 这不是诊断系统. 用户不可见. 是 LLM 内部 attention 的引导.
 *
 * 4a V1: 关键词模式. 4b: embedding + 真分类 model.
 */

export type PsychologicalTheme =
  | 'attachment'              // 依恋焦虑 / 回避 / 关系里的不安
  | 'self-differentiation'    // 自我分化不足 / 跟父母 / 伴侣边界模糊
  | 'inner-critic'            // 内在批评者 / 不够好 / 完美主义
  | 'emotional-suppression'   // 情感压抑 / 不允许自己 feel
  | 'existential'             // 存在焦虑 / 意义 / 死亡 / 孤独
  | 'shame'                   // 羞耻 / 不配 / 不值得
  | 'family-of-origin'        // 原生家庭代际传递
  | 'control-loss'            // 掌控感丧失 / 被生活推着走
  | 'identity'                // 身份认同 / 我到底是谁
  | 'midlife';                // 中年特有的存在性张力

interface ThemePattern {
  theme: PsychologicalTheme;
  // 关键词组 — 命中 1 个就算这个 theme 出现
  keywords: string[];
  // 给 LLM 看的 hint (不可暴露给用户)
  hint: string;
}

const THEME_PATTERNS: ThemePattern[] = [
  {
    theme: 'attachment',
    keywords: [
      '咯噔', '不安', '怕她', '怕他', '怕我老婆', '怕我老公', '怕被抛弃',
      '她还爱我吗', '他还爱我吗', '我们感情', '不再需要我',
      '怕离开', '怕分开', '黏', '太黏', '不让她走', '不让他走',
      '不能没有', '一个人睡', '没消息我就', '已读不回',
    ],
    hint: '这位读者透露出依恋系统活跃 (Bowlby/Ainsworth). 注意他没说出口的"怕"具体是怕失去对方还是怕自己不够好. 不要命名"焦虑型依恋", 用编辑笔触让他看到那个"怕"的颗粒度.',
  },
  {
    theme: 'self-differentiation',
    keywords: [
      '我妈说', '我爸说', '我妈总是', '我爸总是', '父母希望', '不敢告诉父母',
      '怕父母失望', '我哥', '我姐', '我弟', '我妹', '我嫂',
      '老婆觉得', '老公觉得', '不敢让', '怕被骂',
      '我应该', '不应该', '本来该', '理应',
      '为了家里', '为了孩子', '为了父母',
    ],
    hint: '这位读者跟某个重要他人的边界模糊 (Bowen 自我分化不足). 看他在"我想"和"我应该"之间站在哪里. 不要命名"自我分化", 用提问让他听见自己的声音和别人声音的差别.',
  },
  {
    theme: 'inner-critic',
    keywords: [
      '我不够好', '我做得不够', '我应该', '我本来可以',
      '怪自己', '怨自己', '恨自己', '都怪我', '我没用',
      '废物', '失败', '搞砸', '搞砸了',
      '不配', '配不上',
      '完美', '不完美', '挑剔自己', '苛刻',
    ],
    hint: '这位读者内在批评者活跃 (Brene Brown 羞耻 / 内化的父母声音). 注意"我不够好" 这种话的来源 — 那个声音是谁的. 不要命名"内在批评者", 用编辑笔触让他听见那个声音不是他自己的.',
  },
  {
    theme: 'emotional-suppression',
    keywords: [
      '不能表现', '不能让人看出', '装', '装作没事', '装坚强',
      '憋住', '忍住', '压下去', '不敢哭', '哭不出来',
      '没什么', '小事', '不算事', '不重要',
      '我没事', '我挺好的',
      '应该坚强', '男人就该', '不能软弱',
      '隔着一层',
    ],
    hint: '这位读者长期情感压抑 (Levine 创伤的身体冰封 / Brene Brown 脆弱性回避). 注意他"装"这件事本身的代价. 不要命名"情感隔离", 用编辑笔触承接他没说出来的部分.',
  },
  {
    theme: 'existential',
    keywords: [
      '毫无意义', '没意义', '没意思', '空', '虚无', '虚',
      '为什么活', '活着干嘛', '人为什么',
      '死了', '想死', '不想活', '不想醒来',
      '一切都', '什么都',
      '到头来', '到最后', '终究',
      '中年', '40 岁', '50 岁', '半生',
      '剩下的日子', '还能活', '还有多少年',
    ],
    hint: '这位读者触到 Yalom 的 4 ultimate concerns 之一: 死亡 / 自由 / 孤独 / 无意义. 注意他指向哪一个. 不要命名"存在焦虑", 不要急着给意义 — 真正高级的回应是先承认那个空本身.',
  },
  {
    theme: 'shame',
    keywords: [
      '丢人', '丢脸', '丢面子', '没脸', '没脸见',
      '不配', '配不上',
      '羞', '羞愧', '难为情',
      '怕被看到', '怕被发现', '怕别人知道',
      '不能让', '不能说', '不能告诉',
      '我有罪', '我错了', '都是我的错',
    ],
    hint: '这位读者羞耻感强 (Brene Brown). 羞耻跟内疚不同 — 内疚是"我做错了", 羞耻是"我整个人不好". 不要命名"羞耻感", 用提问让他分清这两者的差别.',
  },
  {
    theme: 'family-of-origin',
    keywords: [
      '原生家庭', '从小', '小时候', '童年', '我爸从来', '我妈从来',
      '我爸常说', '我妈常说', '我父亲', '我母亲',
      '重男轻女', '不被爱', '不被看到', '不被听见',
      '我从来没', '我妈/我爸不让', '不允许我',
      '我家', '我们家', '家里',
      '跟父母断', '不联系父母', '回老家', '过年回家',
      '继母', '继父', '父母离婚', '酗酒', '家暴',
    ],
    hint: '这位读者在跟原生家庭工作 (Bowen 代际传递 / 武志红 / 萨提亚). 注意他描述的是事件还是模式 — 模式比事件更值得停下来. 不要命名"原生家庭创伤", 用提问让他看到那个早年模式在今天哪里重演.',
  },
  {
    theme: 'control-loss',
    keywords: [
      '掌控', '失控', '控制不住', '管不住',
      '被生活推着', '没办法', '只能这样',
      '身不由己', '由不得',
      '陷进去', '陷入', '出不来',
      '一团乱', '乱套', '糟糕',
    ],
    hint: '这位读者掌控感丧失 (Yalom 自由 / 责任). 注意他是"真没办法"还是"不允许自己选择". 不要命名, 用提问让他看到自己其实有的选择空间.',
  },
  {
    theme: 'identity',
    keywords: [
      '我是谁', '我到底', '我自己', '不知道我是',
      '迷失', '迷茫', '找不到自己',
      '活成了', '变成了', '不再是',
      '面具', '伪装', '装出来的',
      '真实的我', '真正的自己',
    ],
    hint: '这位读者身份认同松动 (Erikson / Yalom 自我). 注意他在描述的是失去还是从未有过. 不要命名"身份危机", 用提问让他从一个具体的瞬间开始锚定.',
  },
  {
    theme: 'midlife',
    keywords: [
      '中年', '40 岁', '45', '50 岁',
      '我父母这个年纪', '我爸像我这么大',
      '剩下的', '还能多久', '后半生',
      '一辈子',
      '青春', '年轻时',
    ],
    hint: '这位读者在中年特有的存在性张力中 (Jung 第二人生 / James Hollis 中年的邀请). 中年不是危机, 是审视的邀请. 不要命名"中年危机", 用提问让他听见这一刻邀请他审视的具体是什么.',
  },
];

/**
 * 检测一封信里的心理 theme.
 * 返回 0-N 个 theme — 一封信常有多个交叠的结构.
 */
export function detectPsychologicalThemes(text: string): PsychologicalTheme[] {
  const found: PsychologicalTheme[] = [];
  for (const pattern of THEME_PATTERNS) {
    for (const kw of pattern.keywords) {
      if (text.includes(kw)) {
        found.push(pattern.theme);
        break;
      }
    }
  }
  return found;
}

/**
 * 渲染 theme hints 给 system prompt (LLM 看, 用户不可见).
 *
 * 这是 KEY 心理模块跟 ChatGPT 的真分水岭 — 我们把心理学专业判断
 * 注入 prompt 层, 但严格约束输出不允许出现术语.
 */
export function renderThemesForPrompt(themes: PsychologicalTheme[]): string {
  if (themes.length === 0) return '';

  const patterns = THEME_PATTERNS.filter((p) => themes.includes(p.theme));
  const lines = patterns.map(
    (p, i) => `[心理 theme ${i + 1} · ${p.theme}]\n${p.hint}`,
  );

  return (
    `[KEY 编辑部的心理学判断 — 你的内部 attention 引导, 用户不可见, 严禁在回信里命名这些 theme]\n\n` +
    lines.join('\n\n')
  );
}
