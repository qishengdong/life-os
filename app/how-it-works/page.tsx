/**
 * /how-it-works — KEY 5 步真闭环 · 5/21 重写 v2
 *
 * 战略修正 (5/21):
 *   - 5 节按 Signal → Risk → Brief → Action → Review 闭环
 *   - 每节嵌入真用户决策场景 (35-45 中产家庭决策者)
 *   - 每节标"避开哪几个盲区"
 *   - AI 原生差异化讲清楚 (跟咨询 / 日记 / ChatGPT 区别)
 *
 * 目的:
 *   1. Linda × 5 转发给朋友看产品机制
 *   2. 路人看完决定要不要看 /sample-brief
 *   3. 投资人尽调第二站 (战略叙事看 /why-key, 产品机制看这页)
 */
'use client';

import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <div className="flex gap-6 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
          <Link href="/why-key" className="hover:text-seal-500 transition-colors">为什么 KEY</Link>
          <Link href="/sample-brief" className="hover:text-seal-500 transition-colors">样品</Link>
          <Link href="/invite" className="hover:text-seal-500 transition-colors">加入</Link>
        </div>
      </nav>

      <main className="max-w-prose-md mx-auto px-6 pb-24">
        {/* HERO */}
        <header className="pt-12 pb-16 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · KEY 如何工作 · 5 步真闭环 ·
          </p>
          <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter leading-[1.1] mb-8">
            信号 → 风险 → 简报 → 行动 → 复盘.
          </h1>
          <p className="font-serif italic text-reading text-ink-500 leading-relaxed">
            不是每日内容订阅. 不是日记打卡. 不是教练框架.<br />
            是一个长期、个性化、主动调用的<strong className="text-ink-900 not-italic">决策风险审查闭环</strong>.
          </p>
        </header>

        {/* ============================================================ */}
        {/* 1 · Signal · 每天 30 秒 · 不是日记                            */}
        {/* ============================================================ */}
        <section className="mb-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
            · 步骤 1 · 每天 30 秒 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-3">
            Signal · 写一句真信号.
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-widest text-ink-400 mb-6">
            · 帮你避开盲区 4: 忽略历史模式 ·
          </p>
          <div className="font-serif text-reading text-ink-700 leading-relaxed space-y-4">
            <p>
              KEY 每天给你一个问题 — 不是 "今天感觉如何", 是更具体的:
              <em className="block mt-2 pl-4 border-l-2 border-seal-500/30">
                · "今天哪个小事让你不安?"<br />
                · "今天你回避了什么?"<br />
                · "今天你又一次妥协了什么?"<br />
                · "今天哪个关系信号, 可能 90 天后变成大问题?"<br />
                · "今天身体或情绪在警告什么?"
              </em>
            </p>
            <p>
              你想到什么写什么. 30 秒, 不用工整. **不是日记, 是早期风险信号采集**.
              KEY 把这一句标记到 6 类风险域 — 关系 / 事业 / 父母 / 身体 / 资产 / 自我.
            </p>
            <p className="font-serif italic text-[14px] text-ink-500">
              真用户例:<br />
              "今天又因为孩子作业和老婆吵了, 我真的不想管了." → 标记: <strong>关系 + 自我</strong>.<br />
              "今天父亲又问了一次什么时候回家, 我说下个月再说." → 标记: <strong>父母 + 自我</strong>.<br />
              "看到老同学在朋友圈发新公司 IPO, 不知道为什么有点想哭." → 标记: <strong>事业 + 自我</strong>.
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2 · Risk · 命名, 不下结论                                       */}
        {/* ============================================================ */}
        <section className="mb-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
            · 步骤 2 · 信号反复, KEY 命名 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-3">
            Risk · 把模式摊开, 不下结论.
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-widest text-ink-400 mb-6">
            · 帮你避开盲区 3 + 4: 情绪当判断 / 历史模式 ·
          </p>
          <div className="font-serif text-reading text-ink-700 leading-relaxed space-y-4">
            <p>
              单条信号 KEY 只存. 但反复出现的, 它把模式**命名**, 让你自己看 — 不诊断, 不下结论, 不替你解读.
            </p>
            <p className="border-l-2 border-seal-500 pl-5 italic bg-paper-50 py-3">
              "本周你 3 次提到 '孩子的事我不想管了'. 类似的话在过去 30 天出现过 5 次.<br />
              顺手问你 — 这 5 次的对象, 真的都是孩子吗?"
            </p>
            <p>
              KEY 不会替你解读 "你其实是在跟伴侣较劲". 它<strong>把 5 条真原文摆出来给你看</strong>, 你自己来回答.
              这就是 KEY 跟"AI 心理咨询师"的根本区别 — 不替用户解读, 只让用户看见.
            </p>
            <p className="font-serif italic text-[14px] text-ink-500">
              6 类风险域: <strong>关系</strong> (伴侣/子女/原生家庭) · <strong>事业</strong> (跳槽/创业/转型) · <strong>父母</strong> (失智/重病/角色反转) · <strong>身体</strong> (体检异常/慢病/心理) · <strong>资产</strong> (房产/投资/接班) · <strong>自我</strong> (身份/价值/边界).
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3 · Brief · 10 维必答                                          */}
        {/* ============================================================ */}
        <section className="mb-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
            · 步骤 3 · 大决定来临 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-3">
            Brief · 私人决策风险简报 · 10 维必答.
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-widest text-ink-400 mb-6">
            · 帮你避开 4 个盲区 ·
          </p>
          <div className="font-serif text-reading text-ink-700 leading-relaxed space-y-4">
            <p>
              当你写 "我考虑要不要 X" — 接父母 / 离婚 / 跳槽 / 卖学区房 / 送孩子留学 — KEY 生成一份**10 维必答**的简报:
            </p>
            <ol className="space-y-2 pl-6 font-serif text-[14px] text-ink-700 leading-relaxed list-decimal">
              <li>这个决定**真正的问题**是什么 (剥掉表面话题)</li>
              <li>哪些选项是<strong className="text-ember">不可逆</strong>的</li>
              <li>每条路最可能<strong>付出的代价</strong></li>
              <li>谁<strong>受益</strong>, 谁<strong>受损</strong></li>
              <li>你最可能<strong>低估</strong>什么 (4 盲区映射)</li>
              <li>你过去**类似问题**, 是否犯过同一种错 (调你档案 · verbatim 引用)</li>
              <li>1 年后这个决定<strong className="text-ember">失败</strong>, 最可能因为什么</li>
              <li>有没有更<strong>小</strong>、更<strong>安全</strong>的试探动作</li>
              <li>如果选错, <strong className="text-ember">撤退路径</strong>是什么</li>
              <li>30 / 90 / 365 天后<strong>怎么检查</strong>判断是否成立</li>
            </ol>
            <p className="pt-4 border-t border-paper-300">
              **这 10 个问题, ChatGPT 给不了** — 因为它没有你的真实档案. 它能给你"最佳实践", 给不了"你 12 天前写过的那条担心".
              这是 AI 原生的真差异化: 不是模型大小, 是长期个性化记忆 + 主动调用.
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4 · Action · 最小行动                                          */}
        {/* ============================================================ */}
        <section className="mb-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
            · 步骤 4 · 简报不给大结论 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-3">
            Action · 给一个最小验证动作.
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-widest text-ink-400 mb-6">
            · 帮你避开盲区 1 + 2: 不可逆代价 / 高估承受力 ·
          </p>
          <div className="font-serif text-reading text-ink-700 leading-relaxed space-y-4">
            <p>
              简报最后**不是给大结论**, 是给可执行的最小步:
            </p>
            <ul className="space-y-3 pl-4 font-serif text-[14px] italic text-ink-500">
              <li className="border-l border-seal-500/40 pl-4">
                考虑接父母同住 → "**先住一周试运行**, 真切看一遍现实压力, 再做长期决定."
              </li>
              <li className="border-l border-seal-500/40 pl-4">
                跟伴侣的工作冲突 → "**这周只谈一件具体小事**: 谁周三接孩子. 不谈整个'婚姻'."
              </li>
              <li className="border-l border-seal-500/40 pl-4">
                想跳槽 → "**先 sketch 一份你 6 个月后的日历**, 看自己愿不愿意过那种日子. 不真跳."
              </li>
              <li className="border-l border-seal-500/40 pl-4">
                学区房抛留 → "**先列出实际生活流: 通勤 / 接送 / 月度现金流**, 跟现状对比 3 周."
              </li>
            </ul>
            <p>
              小动作便宜. 但能让大决定的<strong>信息密度升 3 倍</strong>, 不可逆风险下降一档.
              这是 KEY 真正帮你的地方 — 不是替你决定, 是让你**用最小代价收集决定所需的真证据**.
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5 · Review · 主动回访                                          */}
        {/* ============================================================ */}
        <section className="mb-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
            · 步骤 5 · 30 / 90 / 365 天后 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-3">
            Review · KEY 主动回来问.
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-widest text-ink-400 mb-6">
            · 长期判断力档案建立 ·
          </p>
          <div className="font-serif text-reading text-ink-700 leading-relaxed space-y-4">
            <p>
              这是 KEY 跟其他 AI 真正不同的地方. 其他 AI 答完就走 — ChatGPT 不会记得你 3 个月前问过它什么.
              KEY 把你的简报存档, 30 / 90 / 365 天后**主动回来问你**:
            </p>
            <p className="border-l-2 border-seal-500 pl-5 italic bg-paper-50 py-3">
              "5 月 21 日你做了那个'接母亲来住'的决定.<br />
              当时你担心 — 工作受影响 / 跟妻子角色冲突 / 母亲不适应北京.<br />
              今天是第 90 天. 这 3 件事真发生了吗? 没发生的, 没发生; 发生的, 是当时低估了哪一项?"
            </p>
            <p>
              结果存进你的"决策回访档案". 一年后你手里有的**不是 12 份 AI 报告**, 是<strong>一本你自己的判断力档案</strong> — 你哪些预测靠谱 · 哪些反复看错 · 哪种决定你的盲点在哪.
            </p>
            <p className="font-serif italic text-[14px] text-ink-500">
              这就是 KEY 的灵魂指标. 不是 DAU, 不是 stickiness, 是 <strong>30 天 / 90 天 / 365 天回访率</strong>.
              如果一年后你不愿回来跟 KEY 复盘, KEY 就失败了.
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 跟其他工具对照                                                   */}
        {/* ============================================================ */}
        <section className="mb-20 border-y border-paper-300 py-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4 text-center">
            · KEY 跟其他工具的区别 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-10 text-center">
            它不是 ChatGPT, 不是日记, 不是教练, 不是咨询.
          </h2>
          <div className="space-y-7 font-serif text-reading text-ink-700 leading-relaxed">
            <div>
              <p className="font-serif text-[15px] text-seal-500 italic mb-2">— 跟 ChatGPT 比</p>
              <p>
                ChatGPT 每次开新对话, 不记得你. 给"最佳实践"是别人的轨迹. KEY 调你 30/90/365 天前的真话作为证据, 是你自己的轨迹.
              </p>
            </div>
            <div>
              <p className="font-serif text-[15px] text-seal-500 italic mb-2">— 跟日记 / Day One / Notion 比</p>
              <p>
                日记被动归档, 你 3 个月后翻不到关键那条. KEY 在大决定时主动调出. 日记是档案柜, KEY 是作证人.
              </p>
            </div>
            <div>
              <p className="font-serif text-[15px] text-seal-500 italic mb-2">— 跟教练 / 咨询师 比</p>
              <p>
                教练给方法论, 咨询师给解读, 都没有长期连续记忆. KEY 不给方法论, 不给解读 — 把你说过的话, 在对的时刻还给你.
              </p>
            </div>
            <div>
              <p className="font-serif text-[15px] text-seal-500 italic mb-2">— 跟咨询公司 (麦肯锡 / 私董会) 比</p>
              <p>
                咨询给你别人的轨迹 (行业最佳实践). KEY 给你你自己的轨迹. 价格差 100 倍, 但<strong>决策价值差的是有没有"你自己"</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 看一个真案例 · 5/22 ship · 接 Essay 2 完整 5-step 应用       */}
        {/* ============================================================ */}
        <section className="mb-20 border-y border-paper-300 py-12 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · 看 5-step 真应用 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-6">
            一个具体 case: 为什么你妈一打电话, 你就很累?
          </h2>
          <p className="font-serif italic text-reading text-ink-500 leading-relaxed mb-8 max-w-prose-md mx-auto">
            KEY 把这条信号跑完 Signal → Risk → Brief → Action → Review 全 5 步. 你可以看到 KEY 真应用到一个 35-45 中产真日常困境的全过程.
          </p>
          <Link
            href="/essay/relational-drain-as-risk"
            className="inline-block px-8 py-3 font-serif text-base text-paper bg-seal-500 hover:bg-seal-700 transition-colors"
          >
            读完整 case →
          </Link>
        </section>

        {/* ============================================================ */}
        {/* CTA                                                            */}
        {/* ============================================================ */}
        <div className="text-center space-y-5 mt-20">
          <p className="font-serif italic text-reading text-ink-500 mb-6 max-w-prose-md mx-auto leading-relaxed">
            KEY 内测中 · 前 100 名认真选 · 年付 ¥1988.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/invite"
              className="inline-block px-10 py-3.5 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 transition-colors"
            >
              已有邀请码 → 激活
            </Link>
            <Link
              href="/sample-brief"
              className="inline-block px-10 py-3.5 font-serif text-base border-2 border-seal-500 text-seal-500 hover:bg-seal-500 hover:text-paper transition-colors"
            >
              先看一份决策风险简报
            </Link>
          </div>
          <p className="font-mono text-[10px] text-ink-400 tracking-wider mt-6">
            <Link href="/why-key" className="hover:text-seal-500">· 看战略叙事 →</Link>
            <span className="mx-3">·</span>
            <Link href="/methodology" className="hover:text-seal-500">· 想看更深方法论 →</Link>
          </p>
        </div>

        <footer className="pt-20 text-center font-mono text-[10px] uppercase tracking-widest text-ink-400">
          keypoint.life · 你的档案存在境外节点 · 永不进训练数据
        </footer>
      </main>
    </div>
  );
}
