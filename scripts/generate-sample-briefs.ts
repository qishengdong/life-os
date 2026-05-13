/**
 * 生成 3 份 sample brief — 公开展示用 (/sample-brief 页)
 *
 * 用法:
 *   npm run sample-briefs
 *   (或 tsx --env-file=.env.local scripts/generate-sample-briefs.ts)
 *
 * 流程:
 *   1. 为 3 种 framework (parent-care / marriage / child-education) 各创建一个 synthetic user
 *   2. 给每个 user 注入一组真实感的 brain context (RMC cards) + brain.md
 *   3. 跑 generateBrief() 出完整 publication-grade brief
 *   4. 标记 is_sample=1 写入 decision_briefs 表
 *
 * 这些 sample brief 在 /sample-brief 页公开可读, 不依赖具体用户身份.
 */

import 'dotenv/config';
import { getDb, saveBrief, findOrCreateUserByUid } from '../lib/db';
import { addMemoryCard } from '../lib/memory';
import { writeC16Audit } from '../lib/decision/contradiction-detector';
import { generateBrief } from '../lib/decision/brief-pipeline';
import { renderBriefMarkdown } from '../lib/decision/brief-schema';
import crypto from 'crypto';

interface SamplePersona {
  uid: string;
  displayName: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  brainContent: string;
  rmcCards: Array<{
    cardType: 'factual' | 'episodic' | 'boundary' | 'relational';
    title: string;
    content: string;
    tags?: string[];
  }>;
  decision: string;
  forceFramework: string;
}

// ============================================================================
// PERSONA 1: 父母养老 — 上海 47 岁女, 独生女, 母亲早期失智
// ============================================================================
const PERSONA_PARENT_CARE: SamplePersona = {
  uid: 'sample-parent-care-' + crypto.randomBytes(4).toString('hex'),
  displayName: '匿名读者 · 上海',
  birthDate: '1979-03-22',
  gender: 'female',
  brainContent: `# 关于这位读者

47 岁, 上海, 独生女, 已婚, 一个女儿 (15 岁, 国际学校). 投行 MD,
年收入约 200 万 RMB.

家庭:
- 母亲 73 岁, 一年前确诊轻度认知障碍 (MMSE 22 分), 目前住北京独居,
  保姆每天来 4 小时. 父亲已故 6 年.
- 丈夫 49 岁, 跨国公司高管, 常驻香港, 一月回上海 2 周.
- 女儿计划 18 岁去英国读书.

财务:
- 家庭净资产约 8000 万 RMB. 上海两套房 (一套自住一套出租), 香港一套.
- 流动资产约 2000 万. 没有专门为养老规划的 fund.

正在卡的事:
- 母亲一个人在北京越来越不安全. 上周走丢一次, 被邻居送回.
- 接来上海? 她不肯, "我在北京住了一辈子".
- 送养老院? "我不去那种地方".
- 自己飞去北京住? 工作完全停摆.
- 兄弟姐妹? 没有.
`.trim(),
  rmcCards: [
    {
      cardType: 'factual',
      title: '独生女, 父亲已故',
      content: '我是独生女. 我爸 6 年前走的, 是肺癌. 妈妈一个人住北京.',
      tags: ['parents'],
    },
    {
      cardType: 'factual',
      title: '母亲 73 岁, MMSE 22',
      content: '我妈 73 岁了. 一年前去301医院评估的, MMSE 22 分, 算轻度认知障碍.',
      tags: ['parents', 'health'],
    },
    {
      cardType: 'episodic',
      title: '母亲走丢事件',
      content: '上周三我妈下楼买菜走丢了. 走了 6 个小时. 后来是邻居在三公里外的小区门口看见她, 给我打电话. 我从上海飞过去那晚没睡.',
      tags: ['parents', 'emotion', 'potential-major-decision'],
    },
    {
      cardType: 'boundary',
      title: '我妈不肯离开北京',
      content: '我跟她提过来上海. 她说"我在北京住了一辈子, 你爸的骨灰在八宝山, 我不能走". 这是她最强的话.',
      tags: ['parents', 'avoidance'],
    },
    {
      cardType: 'episodic',
      title: '丈夫的反应',
      content: '我跟我老公说想把我妈接上海住. 他沉默了一会, 说"那家里就完全不是过去的状态了". 没明确反对, 但我知道他怕.',
      tags: ['relationship', 'avoidance'],
    },
    {
      cardType: 'relational',
      title: '保姆王阿姨',
      content: '我妈现在的保姆王阿姨, 跟了 3 年. 不错. 但她说自己年底要回老家带孙子. 这事我没告诉我妈.',
      tags: ['parents', 'repeating-pattern'],
    },
  ],
  decision: `我母亲 73 岁, 独居北京, 一年前确诊轻度认知障碍. 上周她下楼买菜走丢了 6 个小时.

我是独生女, 在上海. 父亲 6 年前走了. 我老公常驻香港, 一月回家 2 周. 女儿 15 岁, 明年国际学校 IB 课程.

四个选项压在我心上, 每个都有不能承受的代价:
1. 把她接来上海跟我们住. 但她说"我在北京住了一辈子, 你爸的骨灰在八宝山, 我不走". 我老公没明确反对但他怕家不再是家.
2. 送她去北京一家高端养老院. 她说过"我不去那种地方".
3. 自己搬到北京住几个月. 工作要停, 200 万年薪+ MD 职位可能没了.
4. 让她继续这样下去, 雇个更好的保姆. 但现在的王阿姨年底要走, 而且她已经走丢过一次, 下次可能更糟.

我每天工作 12 小时, 晚上躺下来想这件事都想到天亮.`,
  forceFramework: 'parent-care',
};

// ============================================================================
// PERSONA 2: 婚姻 — 北京 42 岁男, 婚姻 14 年, 太太提出分居
// ============================================================================
const PERSONA_MARRIAGE: SamplePersona = {
  uid: 'sample-marriage-' + crypto.randomBytes(4).toString('hex'),
  displayName: '匿名读者 · 北京',
  birthDate: '1984-08-15',
  gender: 'male',
  brainContent: `# 关于这位读者

42 岁, 北京, 互联网公司 VP, 年薪约 350 万 + 期权 (公司 D 轮).
结婚 14 年, 两个孩子 (12 岁男 / 8 岁女).

家庭:
- 太太 39 岁, 前媒体人, 孩子出生后基本全职在家.
- 这两年关系冷淡. 6 个月前太太提出"分居半年看看".
- 双方都没有第三者.

工作 vs 家庭:
- 加班高峰期 12-14 小时/天. 周末几乎不在家.
- 太太说: "你在或不在, 这个家是一样的, 这才是问题."
- 我从大学起就习惯把意义感放在工作上.

可能的隐性事:
- 太太开始报心理咨询. 我不知道她在咨询师那里说什么.
- 她最近开始重新写公众号, 写一些"被忽视的中年女性" 的文章.
- 我们已经 4 个月没有性生活. 没有人提.

正在卡的事:
- 接受分居半年? 还是争一争, 努力修复?
- 努力修复意味着什么? 我不知道该做什么具体的事.
- 我有点害怕 — 如果分居半年她真离开, 我不知道我会变成什么样.
`.trim(),
  rmcCards: [
    {
      cardType: 'episodic',
      title: '太太提分居那一晚',
      content: '6 个月前一个周日晚上, 孩子睡了. 她坐在客厅沙发上等我加完班回来, 第一句话: "我想分居半年". 没有眼泪, 平静, 像她思考了很久.',
      tags: ['relationship', 'potential-major-decision'],
    },
    {
      cardType: 'factual',
      title: '太太 39, 全职在家 9 年',
      content: '太太 39, 大儿子出生 (我们 30 岁) 后就基本不上班了. 中间断断续续做过些自由媒体, 不稳定.',
      tags: ['relationship'],
    },
    {
      cardType: 'boundary',
      title: '太太关键一句',
      content: '她跟我说过最重的一句话: "你在或不在, 这个家是一样的, 这才是问题."',
      tags: ['relationship', 'repeating-pattern'],
    },
    {
      cardType: 'episodic',
      title: '4 个月没碰',
      content: '我们 4 个月没有性生活了. 没有人提. 这件事我跟谁都没说过.',
      tags: ['relationship', 'avoidance'],
    },
    {
      cardType: 'factual',
      title: '太太重启公众号',
      content: '她两个月前重新开始写公众号, 写中年女性, "被忽视的", "在家庭里消失的". 我没敢看完.',
      tags: ['relationship', 'repeating-pattern'],
    },
    {
      cardType: 'episodic',
      title: '父亲离婚的童年记忆',
      content: '我父母在我 11 岁时离婚. 我妈跟我说"是你爸的错". 我现在意识到, 我从那时起就在心里发誓不能让我的孩子有同样的经历.',
      tags: ['emotion', 'children', 'repeating-pattern'],
    },
  ],
  decision: `结婚 14 年. 6 个月前太太提出分居半年. 双方没第三者. 我是 42 岁互联网 VP, 加班高峰期 12-14 小时/天, 太太 39, 全职在家 9 年.

她跟我说: "你在或不在, 这个家是一样的, 这才是问题."

我们 4 个月没有性生活了, 没人提. 她两个月前重启公众号, 写"消失在家庭里的中年女性". 她最近开始报心理咨询.

我的卡点: 接受分居半年, 还是争一争修复? 但修复意味着什么 — 我不知道具体该做什么. 我从大学起就习惯把意义感放在工作上.

我父母在我 11 岁离婚. 我从那时起在心里发誓我的孩子不会经历这个. 但我现在好像正在重复某种东西, 只是不知道是什么.

我害怕的是: 如果分居半年她真离开, 我不知道我会变成什么样.`,
  forceFramework: 'marriage',
};

// ============================================================================
// PERSONA 3: 子女教育 — 深圳 44 岁女, 儿子初二, 鸡娃 vs 不鸡娃
// ============================================================================
const PERSONA_CHILD_EDUCATION: SamplePersona = {
  uid: 'sample-child-edu-' + crypto.randomBytes(4).toString('hex'),
  displayName: '匿名读者 · 深圳',
  birthDate: '1982-11-09',
  gender: 'female',
  brainContent: `# 关于这位读者

44 岁, 深圳, 上市互联网公司高级总监. 年薪约 180 万.
丈夫 46 岁, 自己开公司 (供应链), 年净利约 300 万.
一个儿子, 14 岁, 初二, 深外初中部.

孩子状态:
- 初二上学期成绩从年级前 20 跌到 80.
- 数学是强项, 但开始排斥数学课. 物理刚开始, 找不到感觉.
- 上学期问他"你想去哪个高中", 他说"我不知道".
- 喜欢看历史、哲学的书, 看《荒原狼》《存在与时间》.
- 不打游戏, 也不爱社交. 周末经常一个人骑车在城里转.

正在卡的事:
- 现在加大力度补课, 冲深外高中? 妈妈群里都在卷.
- 还是接受他现在的状态, 让他自己找自己的路?
- 体制内 (深外) vs 国际学校 (升学路径完全不同)?
- 我看他读那些书时眼睛是亮的, 但我也怕他将来"读不出好学校就完了".

我自己背景:
- 我是河北小县城出来的, 当年高考一本压线上的二线 985, 凭努力做到现在.
- 我先生是深圳本地, 大学没毕业自己创业起家.
- 我们的成长经验完全不同, 在孩子的教育路径上经常吵.
`.trim(),
  rmcCards: [
    {
      cardType: 'factual',
      title: '儿子 14 岁, 初二, 深外',
      content: '儿子 14 岁, 在深外读初二. 强项是数学和历史哲学, 但本学期成绩往下走.',
      tags: ['children'],
    },
    {
      cardType: 'episodic',
      title: '问他想去哪个高中',
      content: '上学期我问他想考哪个高中. 他想了很久, 说"我不知道". 不是叛逆, 是真的没想.',
      tags: ['children', 'potential-major-decision'],
    },
    {
      cardType: 'factual',
      title: '儿子读《存在与时间》',
      content: '我前几天看他在读海德格尔《存在与时间》中文版. 才初二, 我不确定他真懂多少, 但他看的时候眼睛是亮的.',
      tags: ['children'],
    },
    {
      cardType: 'episodic',
      title: '跟先生的争吵',
      content: '上周末跟先生大吵了一架. 我说应该给孩子加大力度补课, 他说"你看他眼睛, 你忍心". 我们一晚没说话.',
      tags: ['relationship', 'children', 'repeating-pattern'],
    },
    {
      cardType: 'boundary',
      title: '我自己的成长路径',
      content: '我是河北小县城高考一本压线进二线 985 的. 我知道"读出来"是怎么改变命运的. 我先生不知道, 他没经历过.',
      tags: ['career', 'wealth'],
    },
    {
      cardType: 'episodic',
      title: '妈妈群的压力',
      content: '我们深外妈妈群里 200 多个, 谁不补课谁就是异类. 上周一位妈妈分享她孩子今年 5 个 A* 录牛津的, 下面 100 多条祝贺.',
      tags: ['children', 'emotion', 'repeating-pattern'],
    },
  ],
  decision: `儿子 14 岁初二, 在深圳外国语学校. 上学期他从年级前 20 跌到 80. 我问他想考哪个高中, 他说"我不知道".

我看见他眼睛发亮的时候 — 是在读海德格尔《存在与时间》, 是在周末一个人骑车在城里转, 是在跟我讲春秋战国的兵家流派.

但他成绩在掉. 妈妈群里都在卷. 上周一位妈妈分享孩子 5 个 A* 牛津录取, 100 多条祝贺.

我自己是河北小县城出来的, 一本压线进二线 985, 凭努力做到深圳上市公司高级总监. 我知道"读出来"怎么改变命运的. 我先生是深圳本地长大, 大学没毕业创业, 现在 300 万年净利. 他看儿子读哲学书的样子, 跟我说"你忍心".

我现在卡的是:
- 加大力度补课冲深外高中, 还是让他自己找自己的路?
- 体制内还是国际学校 (升学路径完全不同)?
- 我看着他读哲学时眼睛是亮的, 但我怕他将来"读不出好学校就完了".

我跟先生上周末大吵了一架. 我没法跟他讲清我怕的是什么, 但我心里有种说不出的东西.`,
  forceFramework: 'child-education',
};

// ============================================================================
// 工具: 注入 persona 到 db
// ============================================================================
function setupPersona(p: SamplePersona): number {
  const db = getDb();
  const userId = findOrCreateUserByUid(p.uid);

  // 设 profile
  db.prepare(`UPDATE users SET birth_date = ?, gender = ? WHERE id = ?`).run(
    p.birthDate,
    p.gender,
    userId
  );

  // 写 brain
  const existing = db.prepare('SELECT user_id FROM user_brain WHERE user_id = ?').get(userId);
  if (existing) {
    db.prepare(
      `UPDATE user_brain SET content = ?, version = version + 1, updated_at = unixepoch() WHERE user_id = ?`
    ).run(p.brainContent, userId);
  } else {
    db.prepare(
      `INSERT INTO user_brain (user_id, content, version, updated_at) VALUES (?, ?, 1, unixepoch())`
    ).run(userId, p.brainContent);
  }

  // 注入 RMC 卡片
  for (const c of p.rmcCards) {
    addMemoryCard({
      userId,
      cardType: c.cardType,
      title: c.title,
      content: c.content,
      confidence: 0.95,
      source: 'admin',
      tags: c.tags,
    });
  }

  return userId;
}

// ============================================================================
// 主流程
// ============================================================================
async function main() {
  // CLI: 可指定 only=parent-care|marriage|child-education,... 单跑某几条
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const only = onlyArg ? onlyArg.slice('--only='.length).split(',') : null;

  const allPersonas: SamplePersona[] = [
    PERSONA_PARENT_CARE,
    PERSONA_MARRIAGE,
    PERSONA_CHILD_EDUCATION,
  ];
  const personas = only
    ? allPersonas.filter((p) => only.includes(p.forceFramework))
    : allPersonas;

  if (only) {
    console.log(`[setup] only running: ${personas.map((p) => p.forceFramework).join(', ')}`);
  }

  const db = getDb();

  // 单跑模式: 只清掉指定 framework, 不清全部
  const removed = only
    ? db
        .prepare(
          `DELETE FROM decision_briefs WHERE is_sample = 1 AND framework IN (${personas.map(() => '?').join(',')})`,
        )
        .run(...personas.map((p) => p.forceFramework))
    : db.prepare(`DELETE FROM decision_briefs WHERE is_sample = 1`).run();
  console.log(`[setup] removed ${removed.changes} previous sample briefs\n`);

  for (const p of personas) {
    console.log(`========================================`);
    console.log(`[${p.forceFramework}] ${p.displayName}`);
    console.log(`========================================`);

    const userId = setupPersona(p);
    console.log(`✓ persona setup, user_id=${userId}`);

    console.log(`→ 跑 brief pipeline (analyst + editor, ~30-60s)...`);
    const t0 = Date.now();
    const result = await generateBrief({
      userId,
      birthDate: p.birthDate,
      gender: p.gender,
      decision: p.decision,
      forceFramework: p.forceFramework,
      displayName: p.displayName,
    });

    if (!result.success || !result.brief) {
      console.error(`✗ FAILED: ${result.error}`);
      continue;
    }

    const brief = result.brief;
    const renderedMarkdown = require('../lib/decision/brief-schema').renderBriefMarkdown(brief);

    const briefRowId = saveBrief({
      userId,
      briefJson: JSON.stringify(brief),
      briefNumber: brief.briefNumber,
      topic: brief.topic,
      framework: brief.meta.framework,
      renderedMarkdown,
      totalCharCount: brief.meta.totalCharCount,
      editorPassUsed: brief.meta.editorPassUsed,
      tokensUsed: brief.meta.tokensUsed,
      durationAnalystMs: brief.meta.durationMs.analyst,
      durationEditorMs: brief.meta.durationMs.editor,
      isSample: true,
    });

    // C16 audit (跟其他 inspector check 一起入表)
    if (result.contradictions && result.contradictions.length > 0) {
      try {
        writeC16Audit({ userId, decisionId: null, contradictions: result.contradictions });
      } catch (e) {
        console.error('writeC16Audit failed:', e);
      }
    }

    console.log(`✓ saved as briefRowId=${briefRowId}, briefNumber=${brief.briefNumber}`);
    console.log(`  字数 ${brief.meta.totalCharCount}, editor=${brief.meta.editorPassUsed}, tokens=${brief.meta.tokensUsed}`);
    console.log(`  耗时: analyst ${brief.meta.durationMs.analyst}ms, editor ${brief.meta.durationMs.editor}ms`);
    if (result.contradictions && result.contradictions.length > 0) {
      console.log(`  🔴 C16 检测到 ${result.contradictions.length} 个矛盾 (已注入 brief + 写入 audit):`);
      for (const c of result.contradictions) {
        console.log(`    - [${c.severity}] ${c.pastStatement.slice(0, 50)}... (${c.attribution})`);
      }
    }
    if (result.validationIssues && result.validationIssues.length > 0) {
      console.log(`  ⚠ validation issues:`);
      for (const issue of result.validationIssues) console.log(`    - ${issue}`);
    }

    console.log(`  总耗时: ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
  }

  console.log(`========================================`);
  console.log(`完成. 3 份 sample brief 已写入 decision_briefs 表 (is_sample=1).`);
  console.log(`访问 /sample-brief 查看公开页.`);
  console.log(`========================================`);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
