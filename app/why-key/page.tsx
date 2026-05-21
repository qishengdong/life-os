/**
 * /why-key — 战略叙事核心页 · 5/20 ship · A1
 *
 * 目的:
 *   1. Linda × 5 可转发给朋友 (比 /how-it-works 更深, 跟 /methodology 互补)
 *   2. 投资人尽调第一站
 *   3. 朋友圈可贴的"为什么 KEY"长链接
 *
 * 6 大模块:
 *   I.   Hero · 决策力 = 第四类个人资产
 *   II.  Peter Thiel 式 5 条反常识真理
 *   III. 历史对照表 · 信用分/职业网络/健康轨迹/决策力
 *   IV.  6 层商业模式延伸 · ¥1988 → 决策力央行
 *   V.   5% 真用户画像 · 中国 200 万人, KEY 要 0.5%
 *   VI.  CTA · 已有邀请码 / 没有 / 看样品
 *
 * Voice 铁律:
 *   - 不堆 emoji
 *   - 清醒 / 直接 / 克制 / 有温度但不安慰
 *   - 反常识但有理有据 (每条都引真历史)
 *   - 不是营销, 是宣言 + 思考公开
 */
'use client';

import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';

export default function WhyKeyPage() {
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <div className="flex gap-6 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
          <Link href="/how-it-works" className="hover:text-seal-500 transition-colors">如何工作</Link>
          <Link href="/methodology" className="hover:text-seal-500 transition-colors">方法论</Link>
          <Link href="/sample-brief" className="hover:text-seal-500 transition-colors">样品</Link>
          <Link href="/invite" className="hover:text-seal-500 transition-colors">邀请</Link>
        </div>
      </nav>

      <main className="max-w-prose-md mx-auto px-6 pb-24">
        {/* ============================================================ */}
        {/* I · HERO · 决策力 = 第四类个人资产                            */}
        {/* ============================================================ */}
        <header className="pt-16 pb-16 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · 一份不一样的 AI 立场 ·
          </p>
          <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter leading-[1.05] mb-10">
            决策力 是你的<br />第四类个人资产.
          </h1>
          <p className="font-serif italic text-reading text-ink-500 leading-relaxed max-w-prose-md mx-auto">
            钱 · 房 · 人脉 是前三类.<br />
            第四类正在出现 — 你过往做大决定时**真说过什么** · **怎么判断** · **判断对了几成**.<br />
            KEY 在做这一类资产的发行机构.
          </p>
        </header>

        {/* ============================================================ */}
        {/* II · 5 条反常识真理 (Peter Thiel 式)                          */}
        {/* ============================================================ */}
        <section className="mb-20 border-t border-paper-300 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · I. 5 条反常识真理 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-12">
            我们认为, 但很少有人同意的事.
          </h2>

          <div className="space-y-10">
            {/* 真理 1 · AI 作证不作主 */}
            <div className="border-l-2 border-seal-500/40 pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                · 真理 1 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                AI 不该给建议. 它应该作证.
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed mb-2">
                <strong className="text-ink-900">大众共识</strong>: AI 越聪明越好, 该 24/7 给我建议.
              </p>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                <strong className="text-ink-900">KEY 反向</strong>: 真懂决策的 AI 不开口给建议. 它只把你 30 天前真说过的话, 在你需要的时刻还给你.
                <span className="font-serif italic text-ink-500"> 建议是负债, 证据是资产.</span>
              </p>
            </div>

            {/* 真理 2 · 时间是唯一护城河 */}
            <div className="border-l-2 border-seal-500/40 pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                · 真理 2 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                时间, 是 KEY 唯一的护城河.
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed mb-2">
                <strong className="text-ink-900">大众共识</strong>: 模型越大越好 · 越新越好.
              </p>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                <strong className="text-ink-900">KEY 反向</strong>: ChatGPT 每次开新对话 = 失忆症患者. KEY 每天记一点, 用得越久越值钱.
                <span className="font-serif italic text-ink-500"> 6 个月后切换品牌的成本 = 6 个月真话档案归零.</span>
              </p>
            </div>

            {/* 真理 3 · 决策档案是新型资产 */}
            <div className="border-l-2 border-seal-500/40 pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                · 真理 3 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                决策档案是新型个人资产.
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed mb-2">
                <strong className="text-ink-900">大众共识</strong>: 个人资产 = 钱 + 房 + 人脉.
              </p>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                <strong className="text-ink-900">KEY 反向</strong>: 第四类资产正在出现 — "过往判断力的可证档案". 这东西在简历 / 婚恋 / 投资人尽调 / 子女继承 中都会被估值.
                <span className="font-serif italic text-ink-500"> KEY 是这个资产的发行机构.</span>
              </p>
            </div>

            {/* 真理 4 · 真相变稀缺 */}
            <div className="border-l-2 border-seal-500/40 pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                · 真理 4 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                AI 时代, 真相变稀缺.
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed mb-2">
                <strong className="text-ink-900">大众共识</strong>: AI 让信息爆炸, 内容越来越多.
              </p>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                <strong className="text-ink-900">KEY 反向</strong>: AI 让别人说的越来越多, 你自己真说过什么越来越模糊 — 被算法围栏 / 被 AI 改写 / 被自己美化.
                <span className="font-serif italic text-ink-500"> KEY 是唯一只回放、不生成的 AI.</span>
              </p>
            </div>

            {/* 真理 5 · 慢是奢侈品 */}
            <div className="border-l-2 border-seal-500/40 pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                · 真理 5 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                慢, 是 AI 时代的奢侈品.
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed mb-2">
                <strong className="text-ink-900">大众共识</strong>: 更快 · 更智能 · 实时.
              </p>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                <strong className="text-ink-900">KEY 反向</strong>: 30 秒一句, 90 天后再看. 灵魂指标是"30 天回访率", 不是 DAU.
                <span className="font-serif italic text-ink-500"> 这是反加速主义的产品姿态.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* III · 历史对照 · 第 N 类个人资产                              */}
        {/* ============================================================ */}
        <section className="mb-20 border-t border-paper-300 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · II. 历史规律 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-6">
            每一类新资产, 都先有一个公司, 后有一个市场.
          </h2>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-10">
            一种资产被"资产化", 必须 3 个条件同时成立 — <strong>可记录 · 可追踪 · 可调用</strong>.
            决策力 2024 年前没人做, 不是没人想, 是 LLM 之前根本做不到长期个性化记忆 + 主动调用.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px] font-serif">
              <thead>
                <tr className="border-b-2 border-ink-900">
                  <th className="text-left py-3 pr-4 font-sans uppercase text-[10px] tracking-widest text-ink-500">资产类型</th>
                  <th className="text-left py-3 pr-4 font-sans uppercase text-[10px] tracking-widest text-ink-500">定义者</th>
                  <th className="text-left py-3 pr-4 font-sans uppercase text-[10px] tracking-widest text-ink-500">关键年</th>
                  <th className="text-left py-3 font-sans uppercase text-[10px] tracking-widest text-ink-500">技术前提</th>
                </tr>
              </thead>
              <tbody className="text-ink-700">
                <tr className="border-b border-paper-300">
                  <td className="py-3 pr-4">信用分 · 还钱能力</td>
                  <td className="py-3 pr-4">Fair Isaac (FICO)</td>
                  <td className="py-3 pr-4">1956</td>
                  <td className="py-3 text-ink-500 italic">计算机批处理</td>
                </tr>
                <tr className="border-b border-paper-300">
                  <td className="py-3 pr-4">职业网络 · 人脉资产</td>
                  <td className="py-3 pr-4">LinkedIn</td>
                  <td className="py-3 pr-4">2003</td>
                  <td className="py-3 text-ink-500 italic">Web 2.0</td>
                </tr>
                <tr className="border-b border-paper-300">
                  <td className="py-3 pr-4">健康轨迹 · 身体状态</td>
                  <td className="py-3 pr-4">Apple Health / Fitbit</td>
                  <td className="py-3 pr-4">2014</td>
                  <td className="py-3 text-ink-500 italic">传感器 + 智能手机</td>
                </tr>
                <tr className="border-b border-paper-300">
                  <td className="py-3 pr-4">创作影响力 · 内容资产</td>
                  <td className="py-3 pr-4">Substack / Patreon</td>
                  <td className="py-3 pr-4">2017</td>
                  <td className="py-3 text-ink-500 italic">订阅经济</td>
                </tr>
                <tr className="bg-seal-500/5">
                  <td className="py-3 pr-4 font-semibold text-ink-900">决策力 · 判断力档案</td>
                  <td className="py-3 pr-4 font-semibold text-seal-500">KEY</td>
                  <td className="py-3 pr-4 font-semibold text-seal-500">2026</td>
                  <td className="py-3 text-seal-500 italic">LLM 长期记忆 + 主动调用</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ============================================================ */}
        {/* IV · 6 层商业模式延伸                                          */}
        {/* ============================================================ */}
        <section className="mb-20 border-t border-paper-300 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · III. 真护城河 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-6">
            ¥1988 是入口. 真终点是决策力央行.
          </h2>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-12">
            KEY 不是 app, 是基础设施. 类比: FICO 不是借贷 app, 是信用体系. LinkedIn 不是职场 app, 是职业身份基础设施.
            <strong className="text-ink-900"> KEY 是个人决策力的发行机构.</strong>
          </p>

          <div className="space-y-8">
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">· 层 1 · 现在 → 3 年 ·</p>
              <h3 className="font-serif text-lg text-ink-900 tracking-tightish mb-2">C 端付费 · 决策档案订阅</h3>
              <p className="font-serif text-[14px] text-ink-700 leading-relaxed">
                ¥1988/年 · 内测 100 → 5000 → 5 万 → 50 万付费用户 · 收入 ~¥1 亿/年.
                验证决策档案是真资产.
              </p>
            </div>

            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">· 层 2 · 3 → 5 年 ·</p>
              <h3 className="font-serif text-lg text-ink-900 tracking-tightish mb-2">决策力分数 (Decision Score)</h3>
              <p className="font-serif text-[14px] text-ink-700 leading-relaxed">
                类似 FICO 但用于人生. 用户自愿出示给婚恋 · 求职 · 投资人尽调 · 保险.
                决策档案从私密资产变半公开资产, 解锁估值 100 倍.
              </p>
            </div>

            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">· 层 3 · 5 → 8 年 ·</p>
              <h3 className="font-serif text-lg text-ink-900 tracking-tightish mb-2">决策档案继承</h3>
              <p className="font-serif text-[14px] text-ink-700 leading-relaxed">
                父母 60 岁起给子女留决策档案. 子女做大决定时调用父母 30 年前的真话证据.
                <span className="italic text-ink-500"> 你愿意继承你父亲 100 万, 还是他 30 岁时的真话?</span>
              </p>
            </div>

            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">· 层 4 · 5 → 10 年 ·</p>
              <h3 className="font-serif text-lg text-ink-900 tracking-tightish mb-2">决策保险合作</h3>
              <p className="font-serif text-[14px] text-ink-700 leading-relaxed">
                有 KEY 档案 ≥3 年的用户, 重疾险 / 寿险 / 健康险降 5-15%.
                逻辑: 决策稳定的人, 整体生活风险低. 保险经纪反向变 KEY 销售.
              </p>
            </div>

            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">· 层 5 · 5 → 10 年 ·</p>
              <h3 className="font-serif text-lg text-ink-900 tracking-tightish mb-2">企业版 · 高管决策档案</h3>
              <p className="font-serif text-[14px] text-ink-700 leading-relaxed">
                VC · 投行 · 律所 · 董事会高管的决策档案. 用于投决评估 / 合伙人尽调 / 接班人筛选.
                ¥10-50 万/人/年. 这是真巨大市场.
              </p>
            </div>

            <div className="border-l-2 border-seal-500 pl-6 py-4 bg-paper-50">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">· 层 6 · 10 年+ ·</p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-2">决策力央行</h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                KEY 成为个人决策力的全球记账体系. 类似 LinkedIn 在职业领域的位置.
                <span className="italic text-ink-500"> 估值: 个人资产基础设施级别.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* V · 5% 真用户画像                                             */}
        {/* ============================================================ */}
        <section className="mb-20 border-t border-paper-300 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · IV. 我们卖给谁 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-6">
            KEY 不卖给所有人. 卖给 5%.
          </h2>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-10">
            创新产品对 5% 早期用户清晰, 对 95% 模糊. 我们的目标不是说服 95%, 是找到 5% — 他们已经在等这个产品.
          </p>

          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-500 mb-4">
            · 5% 真画像 · 6 维 ·
          </p>
          <ul className="space-y-4 font-serif text-[15px] text-ink-700 editorial-leading mb-10">
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span><strong className="text-ink-900">年龄</strong>: 35-45 岁</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span><strong className="text-ink-900">经历</strong>: 至少 1 次大决定 (跳槽 / 离婚 / 创业 / 父母重病 / 移民)</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span><strong className="text-ink-900">付费历史</strong>: 已付 Notion / flomo / 得到 / 樊登 / 微信读书 / Day One 至少 1 个</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span><strong className="text-ink-900">AI 熟练度</strong>: 用过 ChatGPT, 知道它会编造</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span><strong className="text-ink-900">家庭年收入</strong>: ≥ 60 万 (¥1988/年 不焦虑)</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span><strong className="text-ink-900">朋友圈特征</strong>: "那个会写长反思的人"</span>
            </li>
          </ul>

          <div className="border-l-2 border-seal-500 pl-6 py-3 bg-paper-50">
            <p className="font-serif text-[14px] text-ink-700 leading-relaxed">
              <strong className="text-ink-900">中国这群人至少 200 万</strong>. KEY 要的是其中 1 万人 — 0.5% 目标群体, ¥1988 万年付收入.
              不需要全民懂 KEY. <span className="italic text-ink-500">"听不懂"是 feature, 不是 bug.</span>
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* VI · CTA · 入口                                                */}
        {/* ============================================================ */}
        <section className="mb-12 border-t border-paper-300 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4 text-center">
            · 内测中 · 前 100 名认真选 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-10 text-center">
            如果你在 5% 里, 你应该已经感觉到了.
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/invite"
              className="inline-block px-10 py-3.5 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 transition-colors text-center"
            >
              已有邀请码 → 激活
            </Link>
            <Link
              href="/sample-brief"
              className="inline-block px-10 py-3.5 font-serif text-base border-2 border-seal-500 text-seal-500 hover:bg-seal-500 hover:text-paper transition-colors text-center"
            >
              先看一份样品简报
            </Link>
          </div>

          <p className="text-center font-mono text-[10px] text-ink-400 tracking-wider">
            <Link href="/how-it-works" className="hover:text-seal-500">
              · 想看 KEY 实际怎么工作 →
            </Link>
            <span className="mx-3">·</span>
            <Link href="/methodology" className="hover:text-seal-500">
              · 想看更深的方法论 →
            </Link>
          </p>
        </section>

        <footer className="pt-20 text-center font-mono text-[10px] uppercase tracking-widest text-ink-400">
          keypoint.life · 你的档案存在 Turso · 永不进训练数据
        </footer>
      </main>
    </div>
  );
}
