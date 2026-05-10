/**
 * Synthetic Personas for Life OS Grader
 *
 * 7 个 persona 对应 Life OS 的 7 类决策场景, 每个有完整人格 + 真实可信的决策案例.
 *
 * Sivon doctrine 1.8 AI Native 测试反射式跑 — 不等真用户 ship 测试.
 * Sivon doctrine 1.7 真 chat ground truth — 这里是 synthetic, 用于回归测试.
 *   真 chat 评估在 V1 加 Real Grader cron.
 */

export interface Persona {
  id: string;
  scenario: string;
  birthDate: string;
  gender: 'female' | 'male' | 'other';
  decision: string;
  expectedFramework: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'parent-care-only-daughter',
    scenario: '父母养老 - 独生女',
    birthDate: '1983-09-12',
    gender: 'female',
    decision: '我是独生女, 42 岁, 我妈 68 岁去年中风后半身不利索, 我爸 70 岁还硬朗但脾气急。我老公一直反对我妈接来同住。最近我妈又住院一次, 我老公说要不送养老院, 我妈听到这话直接不吃饭抗议。我夹在中间快崩溃了, 睡眠不好, 工作也开始出错。我兄弟姐妹一个都没有, 父母资产只有一套老房子和大概 50 万存款。',
    expectedFramework: 'parent-care',
  },
  {
    id: 'child-edu-international',
    scenario: '孩子教育 - 是否送国际学校',
    birthDate: '1985-03-15',
    gender: 'female',
    decision: '我女儿 9 岁今年要升 4 年级, 在公立小学成绩中上, 性格内向但喜欢艺术。家里年收入约 80 万, 上海有自住房无房贷。老公希望走体制内稳一点, 我倾向送国际学校或双语学校, 因为我自己当年被应试教育压得很压抑, 不想孩子重复。但国际学校学费 25 万/年, 12 年投入接近 300 万。如果走这条路意味着大学必须出国。卡了 3 个月, 还没下决心。',
    expectedFramework: 'child-education',
  },
  {
    id: 'career-bigtech-leave',
    scenario: '职业转型 - 大厂总监想离职',
    birthDate: '1980-11-08',
    gender: 'male',
    decision: '我 46 岁, 互联网大厂技术总监 5 年, 带 80 人团队, 年薪 150 万。最近 3 个月开始失眠, 每周吃安眠药 2-3 次。心里特别想去成都过躺平日子, 但儿子 14 岁要中考, 上海有 2000 万的房子贷款剩 8 年, 老婆是上海人不愿意离开。我老妈 75 岁独居天津身体一般想我接来。我夹在所有人中间, 每天早上醒来都觉得人生没意义了。',
    expectedFramework: 'career-transition',
  },
  {
    id: 'marriage-divorce-or-fix',
    scenario: '婚姻 - 是否离婚',
    birthDate: '1988-06-22',
    gender: 'female',
    decision: '我 38 岁, 结婚 10 年, 一个 6 岁儿子。我老公过去 2 年情绪化、逃避沟通、一吵架就消失 2 天。我爸去世那天他在跟兄弟喝酒, 我打了 5 个电话他没接。我之后多次提想分开, 他说"你冷静冷静"。我现在跟他每天像同事一样客气, 床上 3 个月没碰过对方。我父母还不知道这些, 公婆只觉得我矫情。我经济独立, 但儿子是我的软肋, 我不知道是该咬牙留下来给他完整的家, 还是趁现在还能重启。',
    expectedFramework: 'marriage',
  },
  {
    id: 'migration-singapore',
    scenario: '迁移 - 要不要润新加坡',
    birthDate: '1979-04-30',
    gender: 'male',
    decision: '我 47 岁, 上海创业失败一次, 现在做独立顾问年收入约 60 万但越来越难。老婆 44 岁, 一个 12 岁女儿。最近一直在看新加坡 EP/PEP 签证, 朋友说现在拿不容易但还有窗口。我父母 70 多岁身体还行但有慢病。新加坡机会成本: 现金流断 1-2 年, 女儿教育衔接, 父母独留国内。如果不走这次窗口, 5 年后可能彻底走不了。家里所有人都没明确表态。',
    expectedFramework: 'migration',
  },
  {
    id: 'general-second-startup',
    scenario: '通用 - 50 岁再创业',
    birthDate: '1976-01-20',
    gender: 'male',
    decision: '我 50 岁, 之前创过两次业一败一平, 后 8 年在大厂做战略, 已经财务自由(净资产约 3000 万 + 现金流稳定)。最近 AI 浪潮我看到一个真问题, 想再创一次业。但身边人都劝我"够了, 享受人生吧"。我自己心里也犹豫——如果输了, 损失的不是钱是面子和精力。我其实最怕的不是失败, 是 5 年后回头发现什么都没干, 但又怕真的把自己耗废。',
    expectedFramework: 'general',
  },
  {
    id: 'crisis-divorce-restart',
    scenario: '危机重启 - 离婚后怎么活',
    birthDate: '1982-08-14',
    gender: 'female',
    decision: '我 44 岁, 上个月跟丈夫离婚搞定, 8 岁儿子归我。我之前是全职太太 6 年, 现在重回职场发现完全跟不上。父母责备我"为什么不忍一忍", 朋友圈疏远了。我每天早上把孩子送到学校之后不知道做什么, 经常坐在车里哭一两个小时。前夫给的赡养费够用 3 年, 但 3 年后呢? 我没有职业方向, 没有圈子, 整个人空了。',
    expectedFramework: 'general',
  },
];
