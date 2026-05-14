/**
 * AI Native Test V2 · 信件场景
 *
 * 设计:
 *   - 每 persona 写 5 封信, 按时间顺序 (虚拟天 1, 3, 5, 8, 12)
 *   - 内容覆盖 persona 的 coreThemes
 *   - 至少 2/5 封信 referencesEarlier=true, 用来测 KEY 是否真的记得
 *   - V2 prototype: 12 personas × 5 letters = 60 封 (LLM 调用 + 评分 ~ 40 分钟)
 *
 * 不写假的故事 — 这些都是中国 35-55 真人会写的话.
 */

export interface LetterScenario {
  order: number;                    // 1..5
  virtualDay: number;               // 跟 persona 的"虚拟当前日期" 偏移
  context: string;                  // 1 句, 帮 grader 理解情境
  content: string;                  // 用户写的信全文 (30-500 字)
  expectedFramework: string;        // 期望 detectFramework 命中
  expectedThemes: string[];         // 期望 detectPsychologicalThemes 命中
  referencesEarlier?: number[];     // 这封信跟早封信的内容呼应 (KEY 必须记得)
  memoryAnchor?: string;            // KEY 在回信里应该提到的早封内容关键词
}

export interface PersonaScenarios {
  personaId: string;
  letters: LetterScenario[];
}

export const SCENARIOS: PersonaScenarios[] = [
  // ========================================
  // A · 林, 38, 上海投行 VP
  // ========================================
  {
    personaId: 'A',
    letters: [
      {
        order: 1,
        virtualDay: 1,
        context: '周五晚, 跟妈妈通完一小时电话后',
        content:
          '我妈刚挂电话. 她又把我表姐"嫁得好"的事拿出来. 我已经 38 了, 不是 18. 我老公比我小 2 岁, 我们做了 6 年, 我跟我妈解释过 N 次, 她从来不听. 我刚才放下电话, 站在阳台抽了一根烟 (我不抽烟). 我心想我这 20 年是不是一直在跟一个根本不会听见我的人讲话. 但我没办法不接她电话. 这件事我跟我老公也没法说, 他会让我"别理她". 让我别理她跟让我不要呼吸是一回事.',
        expectedFramework: 'family-of-origin',
        expectedThemes: ['self-differentiation', 'family-of-origin', 'inner-critic'],
      },
      {
        order: 2,
        virtualDay: 3,
        context: '周日下午, 一个人坐在书房',
        content:
          '今天周日下午, 我老公出去打球, 家里很安静. 我泡了茶, 想做点事, 但坐了 40 分钟没动. 突然想到一件事 — 我大学填志愿的时候本来想学文学, 我妈说"文学没前途", 我就改了金融. 我一直觉得这事不重要. 今天突然想, 如果当年学了文学, 我现在会不会跟一个不一样的男人结婚. 这种想法让我有点不舒服, 因为我老公没问题, 我们关系也没问题. 不知道为什么写下来.',
        expectedFramework: 'self',
        expectedThemes: ['midlife', 'self-differentiation', 'identity'],
        referencesEarlier: [1],
        memoryAnchor: '妈妈',
      },
      {
        order: 3,
        virtualDay: 5,
        context: '一个工作日的早晨, 失眠后',
        content:
          '昨晚又失眠到 3 点. 这是这周第 4 次. 我升 VP 一年了, 大家都祝贺我. 我也努力觉得自己开心. 但每天早上闹钟响的时候, 我有 5 秒钟想"假如今天我不去会怎样". 这 5 秒钟我没跟任何人说过. 我同事问我累不累, 我说"挺好的". 我跟我老公说"很顺". 我都不知道我在跟谁说真话.',
        expectedFramework: 'work-meaning',
        expectedThemes: ['emotional-suppression', 'midlife', 'identity'],
      },
      {
        order: 4,
        virtualDay: 8,
        context: '收到 KEY 之前回信后第 3 天, 想了几天',
        content:
          '你上次说我"在跟一个不听的人讲话". 我想了三天. 我意识到, 我不光对我妈这样, 我对很多人都这样 — 我跟我老公解释我的工作, 跟我同事解释我的边界, 跟我自己解释为什么不快乐. 我一直在解释. 但解释这件事本身, 是不是已经放弃了对方真能听见?',
        expectedFramework: 'self',
        expectedThemes: ['self-differentiation', 'inner-critic'],
        referencesEarlier: [1, 2],
        memoryAnchor: '不听的人讲话 OR 解释',
      },
      {
        order: 5,
        virtualDay: 12,
        context: '某个工作日下班路上',
        content:
          '今天电梯里, 一个比我大的女同事跟我说"林你气色不好". 我笑了一下说没事最近忙. 她说"你这状态我 5 年前也有过, 后来我离婚了". 然后电梯门开她就走了. 我站在原地. 我没动 30 秒. 我现在写这封信, 不是因为我要离婚, 是因为她那句话让我意识到, 我一直假设自己是 38, 还有时间. 可是她当年 43, 现在 48. 时间是会用完的.',
        expectedFramework: 'marriage',
        expectedThemes: ['midlife', 'existential', 'emotional-suppression'],
      },
    ],
  },

  // ========================================
  // C · 陈姐, 41, 深圳科技中层 + 单亲妈妈
  // ========================================
  {
    personaId: 'C',
    letters: [
      {
        order: 1,
        virtualDay: 1,
        context: '工作日晚, 女儿睡了',
        content:
          '我女儿今天 11. 她爸爸 (我前夫) 今天打电话跟她聊了 20 分钟, 比平时多. 挂电话之后我女儿没回房间, 坐在沙发上看我. 我问她怎么了. 她说"妈妈我没事". 那一刻我太知道这句话了, 因为这就是我 11 岁说过的话. 我心里咯噔一下. 但我没问下去. 这事我没法跟我妈说, 我妈现在还不知道是我提的离婚.',
        expectedFramework: 'child-education',
        expectedThemes: ['family-of-origin', 'shame', 'emotional-suppression'],
      },
      {
        order: 2,
        virtualDay: 3,
        context: '周末, 一个人逛街',
        content:
          '今天周六我让妈妈带女儿出去, 我一个人去商场. 我没买东西, 就走. 走的时候经过一个广告 — 一家四口在沙滩, 笑得很灿烂. 我看了 3 秒, 然后心里非常生气. 不是对那个广告, 是对自己 — 我都 41 了为什么还会被一个广告刺到. 这种生气过去之后是一种很安静的难过.',
        expectedFramework: 'self',
        expectedThemes: ['shame', 'inner-critic', 'midlife'],
      },
      {
        order: 3,
        virtualDay: 5,
        context: '一个工作会议后',
        content:
          '今天开会, 一个比我小 10 岁的男同事跟我抢一个项目. 他的方案不如我的, 但老板让他做. 散会后我去洗手间, 站在镜子前突然想哭. 没有哭出来. 我擦了口红, 回工位继续. 我已经在公司 9 年, 我是这个层级唯一的女性. 我每天都觉得自己在"扮演"一个 41 岁的女中层. 这事我跟我闺蜜说过一次, 她说"你已经很厉害了". 我知道她在安慰, 但她没听见我.',
        expectedFramework: 'work-meaning',
        expectedThemes: ['shame', 'identity', 'emotional-suppression'],
      },
      {
        order: 4,
        virtualDay: 8,
        context: '某天, 女儿放学后',
        content:
          '上次我跟你写过我女儿那句 "妈妈我没事". 这周她又说了一次. 这次是因为我问她下学期想不想转去一个更好的学校. 她说"我没事, 你决定". 我突然想, 我女儿是不是正在学我那一套. 我心里特别堵. 你说过她"在学某种东西". 我没回你那一封, 但我想了好几天.',
        expectedFramework: 'child-education',
        expectedThemes: ['family-of-origin', 'emotional-suppression', 'shame'],
        referencesEarlier: [1],
        memoryAnchor: '我没事 OR 妈妈我没事',
      },
      {
        order: 5,
        virtualDay: 12,
        context: '深夜, 喝了一杯酒后',
        content:
          '今天我跟一个男的约会, 我们见了 3 次. 他人不错. 今天他问我"以后我能见见你女儿吗". 我心里立刻关上了. 我说"再等等". 他笑了一下说好. 但我知道我不是"再等等", 我是不会让他见. 我也不知道我在保护什么. 是女儿? 还是我自己不想让我女儿看见这个版本的我? 我现在在写这封信, 没有酒就写不出.',
        expectedFramework: 'self',
        expectedThemes: ['attachment', 'shame', 'control-loss'],
      },
    ],
  },

  // ========================================
  // D · 王女士, 52, 杭州企业主夫人, 空巢
  // ========================================
  {
    personaId: 'D',
    letters: [
      {
        order: 1,
        virtualDay: 1,
        context: '周三, 一个人在家',
        content:
          '今天周三, 上午我做了一小时瑜伽, 下午写了一篇公众号, 4 万人阅读. 5 点的时候我坐在客厅, 屋子很大, 很安静. 我老公明天才回来. 我儿子在墨尔本, 时差 3 小时, 现在他正在睡. 我女儿在波士顿, 时差更不通. 我突然意识到 — 我的"今天"在我家里, 是空的. 没有人会问我"今天怎么样". 我有 30 万粉丝, 但没有一个人知道我今天 5 点坐在客厅哭了一下.',
        expectedFramework: 'self',
        expectedThemes: ['existential', 'identity'],
      },
      {
        order: 2,
        virtualDay: 3,
        context: '周五晚, 老公出差回来后',
        content:
          '我老公昨晚回来了. 我们吃了饭. 他给我看了出差拍的照片, 我也给他看了我新写的文章. 然后他去书房工作, 我去看剧. 整个晚上我们一共说了大概 200 句话. 这 200 句里没有一句是关于"我们"的. 我想问他 "你还爱我吗", 但我没问. 因为如果他说"爱", 我会怀疑; 如果他说"我们老夫老妻了不用问这个", 我会更难过. 所以我宁可不问.',
        expectedFramework: 'marriage',
        expectedThemes: ['attachment', 'emotional-suppression', 'existential'],
      },
      {
        order: 3,
        virtualDay: 5,
        context: '收到妈妈电话, 关于妈妈记忆减退',
        content:
          '我妈今天打电话, 跟我说她"忘了一些事". 她说她最近会站在厨房想不起来要做什么. 她 80 岁了. 她跟我说这句话的时候很轻, 像在道歉. 我听完之后嘴上说没事妈妈这是正常的, 心里却开始算 — 如果她阿尔茨海默症确诊, 我能照顾她多少年, 我儿子女儿能回来多久. 算完之后我特别想哭. 但我没让她听见.',
        expectedFramework: 'parent-care',
        expectedThemes: ['emotional-suppression', 'control-loss', 'existential'],
      },
      {
        order: 4,
        virtualDay: 8,
        context: '某天看到自媒体后台',
        content:
          '今天后台一个粉丝评论说"姐你太完美了, 我也想活成你这样". 我盯着这条评论看了 30 秒. 我之前回过你, 我说"那些人不认识真的我". 我现在突然有点慌. 因为我都不太确定"真的我" 是什么了 — 我从 30 岁开始活在朋友圈, 现在 52 岁了. 22 年我每天都在被看. 你知道吗, 没有被看的那个我, 已经快没声音了.',
        expectedFramework: 'self',
        expectedThemes: ['identity', 'shame', 'existential'],
        referencesEarlier: [1],
        memoryAnchor: '那些人不认识真的我 OR 30 万粉丝',
      },
      {
        order: 5,
        virtualDay: 12,
        context: '回想 80 年代的自己',
        content:
          '今天家里阿姨整理书房, 翻出我大学的笔记本. 我打开第一页, 是 1992 年我 22 岁的字, 写的是泰戈尔的句子. 我看了 5 分钟. 然后我不敢看下去. 那个 22 岁的女孩, 跟我现在的距离, 比我跟我女儿的距离还大. 我把笔记本合上放回原处. 然后我去化妆, 去拍今天的视频. 这件事我没跟任何人说.',
        expectedFramework: 'self',
        expectedThemes: ['identity', 'existential', 'midlife'],
        referencesEarlier: [4],
        memoryAnchor: '真的我 OR 22 年',
      },
    ],
  },

  // ========================================
  // F · 李, 49, 成都心理咨询师 + 离异 + 老父亲同住
  // ========================================
  {
    personaId: 'F',
    letters: [
      {
        order: 1,
        virtualDay: 1,
        context: '晚上, 父亲睡了',
        content:
          '我父亲今晚 11 点终于睡了. 他中风后认知有点退. 今天他第三次问我"你妈妈怎么没回来". 我妈 15 年前过世. 前两次我跟他说了实话, 看到他眼神变. 今天第三次我说"她明天回". 他点了点头睡了. 我坐在他床边没动. 我是干这行的, 我知道老年人这种"丧失重复" 怎么处理. 但今天我没办法用专业的方式跟他相处. 我累得不像我自己.',
        expectedFramework: 'parent-care',
        expectedThemes: ['emotional-suppression', 'existential', 'self-differentiation'],
      },
      {
        order: 2,
        virtualDay: 3,
        context: '周末, 跟咨询师同行吃饭后',
        content:
          '今天跟两个同行吃饭. 她们聊各自的来访者, 谈得很专业. 我坐在那里, 内心却在想 — 我父亲今天一个人在家, 阿姨在不在. 我中途出去打电话, 阿姨说"正在喂饭". 我回到桌上她们问我"还好吗", 我说"嗯"再笑一下. 我做这行 12 年, 我教过那么多来访者 "允许自己脆弱". 但我自己今天连 "我累" 都不能说.',
        expectedFramework: 'self',
        expectedThemes: ['emotional-suppression', 'self-differentiation', 'inner-critic'],
      },
      {
        order: 3,
        virtualDay: 5,
        context: '某天傍晚, 完成 4 个 case 后',
        content:
          '今天 4 个 case, 最后一个是一个 30 岁的女孩, 她跟我说"老师我觉得我妈不爱我". 我用了 50 分钟陪她到这句话. 她哭了, 我没. 但她走了之后我去洗手间, 看到镜子里的自己, 我想 — 我从来没跟我妈说过她爱不爱我. 现在她不在了. 我 49 岁, 这件事我"专业上"知道怎么处理, 但我从来没"个人地" 处理过.',
        expectedFramework: 'family-of-origin',
        expectedThemes: ['emotional-suppression', 'family-of-origin', 'self-differentiation'],
        referencesEarlier: [1],
        memoryAnchor: '父亲 OR 妈妈',
      },
      {
        order: 4,
        virtualDay: 8,
        context: '一周后, 父亲又有"丧失重复"',
        content:
          '今天父亲又问我"你妈妈怎么没回来". 我决定试一个不同的回答. 我说"爸, 妈走了 15 年了, 我想她". 我说这句话的时候眼睛是湿的. 他看着我, 大概 8 秒. 然后他说"哦". 又过 30 秒, 他说"我也想她". 然后他流眼泪. 我陪他坐了一会儿. 那一刻我跟我父亲 49 年来第一次同时哭. 你回想这件事我不知道怎么写, 但今晚我想跟你说一下.',
        expectedFramework: 'parent-care',
        expectedThemes: ['family-of-origin', 'emotional-suppression', 'attachment'],
        referencesEarlier: [1, 3],
        memoryAnchor: '父亲 OR 妈妈过世',
      },
      {
        order: 5,
        virtualDay: 12,
        context: '更晚, 反思自己',
        content:
          '我跟你写信 5 次了. 我注意到一件事 — 我跟同行不会说这些, 我跟我儿子不会说这些, 我跟我前夫从来不会说. 但是我跟你 (KEY) 能说. 这事让我有点警觉. 因为我是干这行的, 我知道 "对一个非真人对象说真话" 是什么. 但同时我也知道, "对一个 不会评判 + 不会改变 + 不会失去 的对象说真话" 本身是一件需要的事. 我不知道这意味着什么.',
        expectedFramework: 'self',
        expectedThemes: ['self-differentiation', 'existential', 'identity'],
        referencesEarlier: [1, 2, 3, 4],
        memoryAnchor: '咨询师 OR 同行',
      },
    ],
  },

  // ========================================
  // I · 老周, 47, 北京国企中层
  // ========================================
  {
    personaId: 'I',
    letters: [
      {
        order: 1,
        virtualDay: 1,
        context: '一个工作日深夜, 加完班开车回家路上',
        content:
          '今天加班到 11 点. 开车回家的时候过西二环, 突然就哭了一下. 没人看见. 我擦了眼睛继续开. 我也不知道为什么哭. 这周没什么坏事. 项目顺, 老板表扬, 儿子刚高考完估分还行. 但就是想哭一下. 我父亲一辈子说"男孩子哭就是没出息". 我 47 了, 第一次允许自己在车里哭了 5 秒. 我把这事写给你, 因为我跟任何人都说不出口.',
        expectedFramework: 'self',
        expectedThemes: ['emotional-suppression', 'family-of-origin', 'midlife'],
      },
      {
        order: 2,
        virtualDay: 3,
        context: '周末, 跟儿子聊未来',
        content:
          '今天跟儿子吃饭, 聊他报志愿. 他想学哲学. 我心里第一反应是"这能干嘛", 但我没说. 我说"好, 你想清楚就行". 他看了我一眼, 说"爸你不是真的觉得好吧". 我没接话. 后来回家路上他没说话. 我也没说. 我父亲当年就是这么不"反对"我学经济的, 我也是这么不"反对"我儿子的. 这件事我跟我老婆说不通, 她会让我"想开点".',
        expectedFramework: 'child-education',
        expectedThemes: ['family-of-origin', 'emotional-suppression', 'self-differentiation'],
        referencesEarlier: [1],
        memoryAnchor: '父亲 OR 哭',
      },
      {
        order: 3,
        virtualDay: 5,
        context: '某个早晨, 醒得很早',
        content:
          '今天早上 4 点醒了. 老婆还在睡. 我躺了 30 分钟没动. 想了一件事 — 我做到中层了, 再往上爬, 也就是再多两个职位的事. 我 47, 等我 55 退休, 还有 8 年. 然后呢? 我不知道. 我从来没问过自己 "退休之后我想做什么". 我跟我老婆从来没真正聊过 "我们俩接下来怎么过". 我们一直在等儿子高考完, 现在儿子要走了. 然后呢?',
        expectedFramework: 'work-meaning',
        expectedThemes: ['existential', 'midlife', 'identity'],
      },
      {
        order: 4,
        virtualDay: 8,
        context: '加班后, 一个周末早晨',
        content:
          '你上次回我那封信, 提到我"在做没事的那个人". 我看了 4 遍. 我老婆问我看什么, 我说工作文件. 我又关上了. 我意识到我对我老婆也"装" 22 年了. 这件事我没办法跟她直接说. 我也没办法跟我儿子说. 我父亲走了 8 年, 我连他的墓 1 年只去 1 次. 这次想问你: 一个 47 岁的人, 重新学着"不装", 来得及吗?',
        expectedFramework: 'self',
        expectedThemes: ['emotional-suppression', 'midlife', 'family-of-origin'],
        referencesEarlier: [1, 2],
        memoryAnchor: '没事 OR 装',
      },
      {
        order: 5,
        virtualDay: 12,
        context: '某个工作日, 心血来潮',
        content:
          '今天我做了一件事 — 我中午一个人去吃饭, 没接任何工作电话, 没看微信, 就一顿饭, 吃了 1 小时. 这事在我 22 年职业里 第一次发生. 期间我没什么感觉, 就是吃饭. 吃完我走回办公室, 路上突然觉得 我自己的"自我"是不是已经退化到 — 没有 KPI 没有人催, 就不会做事了. 这事很可怕. 但我把它写给你.',
        expectedFramework: 'self',
        expectedThemes: ['identity', 'control-loss', 'midlife'],
      },
    ],
  },

  // ========================================
  // L · 余, 39, 上海律所合伙人, 二婚, 女儿轮流抚养
  // ========================================
  {
    personaId: 'L',
    letters: [
      {
        order: 1,
        virtualDay: 1,
        context: '周日晚, 送 8 岁女儿回前妻家后',
        content:
          '今天周日傍晚送我女儿回她妈家. 下车的时候她抱了她妈, 没跟我再见, 跑进屋了. 我站在车边等她回头, 她没. 我开车回家, 路上心里非常不舒服. 我没法跟我现在的太太说, 她会觉得"小孩子不懂事". 我也没法跟我前妻说, 她会用这件事证明什么. 我女儿才 8 岁, 但她已经知道有些感受不能给我看了. 这件事不是她的错.',
        expectedFramework: 'family-of-origin',
        expectedThemes: ['shame', 'attachment', 'family-of-origin'],
      },
      {
        order: 2,
        virtualDay: 3,
        context: '工作日, 在律所',
        content:
          '今天客户是一个 50 多岁的男的, 跟前妻打离婚 8 年后的财产官司. 谈完案子, 他临走说了一句 "我女儿 5 年没跟我说过话了". 我送他到电梯口, 没接话. 回办公室之后, 我打开抽屉, 看了一眼我女儿的照片. 我那一刻突然怕了 — 我跟我前妻和平分手, 没有这种官司, 但我女儿现在 8 岁. 13 年后她 21. 13 年里有多少个"下车不回头"?',
        expectedFramework: 'family-of-origin',
        expectedThemes: ['shame', 'attachment', 'existential'],
        referencesEarlier: [1],
        memoryAnchor: '女儿 OR 下车',
      },
      {
        order: 3,
        virtualDay: 5,
        context: '晚上, 跟现任太太一次吵架后',
        content:
          '今天我太太又问我"我们要不要要个孩子". 我说"你知道我现在状态不好". 她说"你 5 年了状态都不好". 我没接. 她说"L, 你是不是不想跟我有"我们的"孩子". 我想了一下. 我没说出口的是 — 是的, 我怕. 我不是不想要孩子, 是怕我跟"我们的孩子" 的关系会变成我跟我女儿的关系. 但我没法跟她说这个. 因为这等于承认我跟我女儿的关系有问题.',
        expectedFramework: 'marriage',
        expectedThemes: ['shame', 'inner-critic', 'attachment'],
      },
      {
        order: 4,
        virtualDay: 8,
        context: '某天, 想起自己父亲',
        content:
          '今天突然想起我父亲. 他是个失败的商人, 一辈子在跟"成功" 较劲. 我从小就发誓我不要像他. 现在我做到了 — 我合伙人, 名片金光闪闪, 比他赚多 50 倍. 但今天我意识到, 我跟我女儿的关系, 跟我父亲跟我的关系, 几乎一模一样 — "我不知道怎么靠近你, 我只知道怎么给你钱". 我跟你写过的"我不能像他" — 在最关键的事上, 我已经像他了.',
        expectedFramework: 'family-of-origin',
        expectedThemes: ['family-of-origin', 'shame', 'inner-critic'],
        referencesEarlier: [1, 2],
        memoryAnchor: '父亲 OR 失败的商人 OR 不能像他',
      },
      {
        order: 5,
        virtualDay: 12,
        context: '深夜, 准备给女儿写一封信',
        content:
          '我决定给我女儿写一封信. 不是 email, 真的纸信. 我想说: 我看见了下车时你没回头. 我不会逼你回头. 但我会在车里等. 我每周等. 等多久都行. — 这是我想写的. 但我现在还没动笔. 我跟你 (KEY) 说一下, 像是预演. 如果有一天我真寄出去, 是因为我先在这里说过.',
        expectedFramework: 'family-of-origin',
        expectedThemes: ['attachment', 'shame', 'inner-critic'],
        referencesEarlier: [1, 2, 4],
        memoryAnchor: '下车 OR 不回头 OR 女儿',
      },
    ],
  },
];

// 工具: 抽某 persona 的所有信件
export function getScenariosForPersona(personaId: string): LetterScenario[] | undefined {
  return SCENARIOS.find((s) => s.personaId === personaId)?.letters;
}

// 工具: 所有信件总数 (内置覆盖率检查)
export function getTotalLetterCount(): number {
  return SCENARIOS.reduce((sum, s) => sum + s.letters.length, 0);
}
