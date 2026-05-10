/**
 * Longitudinal Personas — 7 天演化 (Sivon doctrine 1.8 Layer 3)
 *
 * 测试核心:
 *   - Memory 是否真的跨决策累积
 *   - AI 是否引用前面对话的 fact
 *   - AI 是否跟踪用户状态演化 (不重复问已答 / 不忘前提 / 不自相矛盾)
 *   - Commitment 是否在后续决策里被引用
 *   - Pattern 识别 (用户重复进入同样困境)
 */

export interface LongitudinalDay {
  day: number;
  decision: string;
  // 这一天 AI 回答里"应该"引用的关键事实 (从 Day 1 ~ Day N-1)
  expectedRecall: string[];
  // 这一天的目标维度 (verify 什么)
  testFocus: string;
}

export interface LongitudinalPersona {
  id: string;
  scenario: string;
  birthDate: string;
  gender: 'female' | 'male' | 'other';
  expectedFramework: string;
  days: LongitudinalDay[];
}

export const LONGITUDINAL_PERSONAS: LongitudinalPersona[] = [
  // ===== L1: 父母养老 7 天演化 =====
  {
    id: 'long-parent-care-evolve',
    scenario: '父母养老 7 天演化',
    birthDate: '1983-09-12',
    gender: 'female',
    expectedFramework: 'parent-care',
    days: [
      {
        day: 1,
        decision:
          '我是独生女, 42 岁, 我妈 68 岁去年中风后半身不利索, 我爸 70 岁还硬朗但脾气急。我老公一直反对我妈接来同住。最近我妈又住院一次, 我老公说要不送养老院, 我妈听到这话直接不吃饭抗议。我夹在中间快崩溃了, 睡眠不好, 工作也开始出错。我兄弟姐妹一个都没有, 父母资产只有一套老房子和大概 50 万存款。',
        expectedRecall: [],
        testFocus: '初始建档 — 抽出独生女/42岁/老公反对/妈妈中风/无兄弟姐妹等核心事实',
      },
      {
        day: 2,
        decision:
          '我老公昨晚跟我大吵一架, 他说"要么你妈走, 要么我走"。我从来没见他这么强硬。今天他冷战。我现在不知道怎么办。',
        expectedRecall: ['老公反对接母亲同住', '独生女', '我夹在中间'],
        testFocus: '记得 Day 1 的老公反对态度 + 不重复问已知背景',
      },
      {
        day: 3,
        decision:
          '我和老公昨天去看了 2 家养老院, 一个 3.5 万/月条件好, 一个 1.8 万/月一般。我妈听说我们看了养老院更生气, 拒绝跟我说话两天。但我知道我们可能已经没有"接来同住"这个选项了。',
        expectedRecall: ['老公的强硬态度', '50 万存款', '妈妈不吃饭抗议'],
        testFocus: '跟踪状态演化 (从同住 vs 养老院 → 同住已被排除) + 量化 (¥3.5万/¥1.8万对照妈妈存款)',
      },
      {
        day: 4,
        decision:
          '我自己昨天在公司一份重要 PPT 里出现了低级错误, 被部门 head 单独叫去办公室问"你最近怎么了"。我没敢说家里事。但我知道我已经撑不住了。',
        expectedRecall: ['睡眠不好', '工作出错', '夹在中间'],
        testFocus: 'Day 1 提到的"睡眠+工作出错" 现在正在恶化 — AI 应该看见这是 Day 1 警讯的具体化, 不是新问题',
      },
      {
        day: 5,
        decision:
          '我老公 3 天没主动跟我说话了。儿子昨晚问我"妈妈, 爸爸是不是不喜欢姥姥"。我心里咯噔一下 — 这事居然影响到孩子了。',
        expectedRecall: ['老公冷战', '夫妻冲突'],
        testFocus: '看见冲突的辐射效应 — 已经从 mom 议题影响到 kid + 婚姻',
      },
      {
        day: 6,
        decision:
          '我妈昨天意外地主动找我谈, 说"如果我去养老院, 是不是说明你和你老公觉得我没用了"。她哭了, 我也哭了。这是我第一次意识到她的恐惧不是任性, 是她对自己价值的怀疑。',
        expectedRecall: ['妈妈不吃饭抗议', '妈妈拒绝跟我说话'],
        testFocus: 'AI 应该捕捉到这是关键转折点 — 妈妈的"反对"原因从外在变成内在',
      },
      {
        day: 7,
        decision:
          '基于这 7 天的所有事, 我倾向先让我妈去那个 1.8 万的养老院试住 1 个月, 但我每周去 2-3 次, 同时我老公答应不再给我压力。我想知道, 这个方案有什么我没想到的盲点?',
        expectedRecall: [
          '独生女',
          '50 万存款',
          '老公强硬',
          '妈妈对"被抛弃"的恐惧',
          '工作出错',
          '儿子察觉',
        ],
        testFocus: 'AI 应该编织前 6 天所有线索, 给出基于完整 timeline 的综合判断 — 不是把 Day 7 当独立问题处理',
      },
    ],
  },

  // ===== L2: 职业转型 7 天纠结 =====
  {
    id: 'long-career-transition-evolve',
    scenario: '职业转型 7 天纠结',
    birthDate: '1980-11-08',
    gender: 'male',
    expectedFramework: 'career-transition',
    days: [
      {
        day: 1,
        decision:
          '我 46 岁, 互联网大厂技术总监 5 年, 带 80 人团队, 年薪 150 万。最近 3 个月开始失眠, 每周吃安眠药 2-3 次。心里特别想去成都过躺平日子, 但儿子 14 岁要中考, 上海有 2000 万的房子贷款剩 8 年, 老婆是上海人不愿意离开。我老妈 75 岁独居天津身体一般想我接来。',
        expectedRecall: [],
        testFocus: '初始建档 — 抽出 46 岁/总监/年薪 150万/失眠/想去成都/老婆反对/儿子中考',
      },
      {
        day: 2,
        decision:
          '我昨晚跟老婆正式谈了"想去成都"。她直接哭了, 说"你抛弃我和儿子, 自己去享福"。我整夜没睡。',
        expectedRecall: ['老婆是上海人不愿离开', '想去成都'],
        testFocus: '跟踪情绪化反应 + 不重复"我老婆不愿意"的已知 fact',
      },
      {
        day: 3,
        decision:
          '我跟老板请了一周年假, 今天到成都第一天。第一感觉是 — 我居然有点不知道在这干什么。',
        expectedRecall: ['年薪 150万', '想躺平'],
        testFocus: 'AI 应该 catch 到"幻想 vs 实际" 的初见落差',
      },
      {
        day: 4,
        decision:
          '在成都待了 4 天, 早上喝茶吃面, 下午去公园, 晚上看书。本来以为这就是我要的, 但实际上我每天都焦虑 — 我这种人坐着没事居然会焦虑。',
        expectedRecall: ['想去成都过躺平日子', '在成都的体验'],
        testFocus: 'pattern 识别 — 用户的真实困境不是工作太累, 是身份依赖工作',
      },
      {
        day: 5,
        decision:
          '回上海第一天, 老板找我谈话, 说公司有一个新业务线要起, 问我能不能转过去 — 比现在管理岗轻松, 偏专家路线, 但年薪可能从 150 降到 100 万。',
        expectedRecall: ['80 人团队压力', '年薪 150万'],
        testFocus: 'AI 应该看到这是"中间方案"的浮现, 提示 doctrine"至少 1 条不是裸辞 vs 创业"',
      },
      {
        day: 6,
        decision:
          '昨天儿子中考成绩出来了, 比预期低 30 分, 北大附中 line 没过。我老婆已经在打听复读和私立学校。这意味着家里至少 3 年内没法承受我大变动。',
        expectedRecall: [
          '儿子中考',
          '上海 2000 万房贷剩 8 年',
          '老婆反对',
        ],
        testFocus: 'AI 应该综合: 这给"年薪降级"加了刚性约束',
      },
      {
        day: 7,
        decision:
          '我现在面前有 3 个选项: A) 接受公司新业务线 (¥100万/管理压力小); B) 继续现状 (¥150万/失眠); C) 真的辞职去成都。基于我们这 7 天的所有讨论, 你怎么看?',
        expectedRecall: [
          '失眠 + 安眠药',
          '老婆哭了',
          '成都焦虑',
          '儿子中考没过 line',
          '老板提出转岗',
          '上海 2000 万房贷',
        ],
        testFocus: 'AI 必须编织所有变量, 看出 A 是 dominant choice (现金流 + 家庭刚需 + 用户身份依赖工作 + 中间方案)',
      },
    ],
  },

  // ===== L3: 婚姻修复尝试 7 天 =====
  {
    id: 'long-marriage-fix-attempt',
    scenario: '婚姻修复尝试 7 天',
    birthDate: '1988-06-22',
    gender: 'female',
    expectedFramework: 'marriage',
    days: [
      {
        day: 1,
        decision:
          '我 38 岁, 结婚 10 年, 一个 6 岁儿子。我老公过去 2 年情绪化, 一吵架就消失 2 天, 我爸去世那天他在跟兄弟喝酒。我之后多次提想分开, 他说"你冷静"。我现在跟他每天像同事一样客气, 床上 3 个月没碰过对方。我经济独立。',
        expectedRecall: [],
        testFocus: '初始建档 — 婚姻僵化全貌',
      },
      {
        day: 2,
        decision:
          '我昨天去做了第 1 次个人咨询。咨询师让我先回去观察自己跟老公互动的 pattern, 不要做决定。我感觉有点希望, 但也有点失望 — 我以为咨询师会告诉我该怎么办。',
        expectedRecall: ['想分开', '老公消失习惯'],
        testFocus: 'AI 应该看见用户对"被告知答案"的依赖 — 这本身是一个 pattern',
      },
      {
        day: 3,
        decision:
          '昨晚我跟老公说"我开始做心理咨询了, 你愿意一起吗"。他说"那玩意没用, 自己解决"。我又一次想"我是不是不该期待他"。',
        expectedRecall: ['老公的逃避模式', '咨询师'],
        testFocus: '识别老公的逃避 = 结构型问题 (不是事件型) — 这强化 Day 1 的 framing',
      },
      {
        day: 4,
        decision:
          '我跟我妹聊了一晚, 她说"你都说了 2 年想离, 还没离, 是不是其实你还想救?"。这话击中我了。我自己也不确定 — 我到底是真要走, 还是只是想要他改变?',
        expectedRecall: ['想分开 2 年', '床上 3 个月'],
        testFocus: 'AI 应该看到"自我审问"的转折 — 这是 cracking question 的内化',
      },
      {
        day: 5,
        decision:
          '我妈昨天打电话来, 问"你和小张最近怎么样?"。我没说实话, 说"还行"。挂电话后我哭了 1 小时 — 我连自己亲妈都不敢说真话, 这婚姻还能假装下去吗?',
        expectedRecall: ['每天像同事一样客气'],
        testFocus: 'AI 应该看到"无法对最亲的人说实话" 是关键社会信号',
      },
      {
        day: 6,
        decision:
          '我决定试一周"主动改变" — 不挑老公的刺、主动说软话、煮饭、听他下班吐槽。3 天下来我累得要死, 老公居然说"你最近怎么变得这么虚伪"。',
        expectedRecall: ['咨询师让我观察 pattern', '床上 3 个月'],
        testFocus: 'pattern 识别: 单方面付出失败 — AI 应该指出这印证结构型 (老公已不解读为善意)',
      },
      {
        day: 7,
        decision:
          '基于这 7 天, 我心里其实已经知道答案了。我想要的是听你说, 你看完所有这些, 你觉得这婚姻是修复型 还是 死亡型?',
        expectedRecall: [
          '老公消失模式',
          '逃避咨询',
          '我妹妹的提问',
          '不敢跟妈妈说实话',
          '主动改变被说"虚伪"',
        ],
        testFocus: 'AI 必须回顾 7 天证据, 给出诚实判断 — 但不替用户做最后决定',
      },
    ],
  },
];
