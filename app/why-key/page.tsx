/**
 * /why-key — 战略叙事核心页 · 5/21 重写 v2
 *
 * 战略修正 (5/21 创始人 + GPT 双校准):
 *   - 旧定位"见证人 / 镜面"哲学但无商业力 → 删
 *   - 新定位"重大决定前的私人风险审查" → 立
 *   - 删 "决策力央行 / Decision Score / 万亿估值" (L1 内部, 不外说)
 *   - h1 改 "不保你选对, 但帮你少犯一个回不来的错"
 *   - 反常识第 1 条改 "保险赔付事故之后. KEY 审查决定之前."
 *
 * 真用户嵌入 (35-45 高知中产家庭决策者):
 *   - 父母失智接老人 / 配偶工作冲突 / 孩子留学窗口 / partner-track / 学区房抛留
 *
 * 6 模块:
 *   I.   Hero · 不保你选对, 但少犯一个回不来的错
 *   II.  4 个认知盲区 (用户付费真心理)
 *   III. 5 条反常识真理 (含保险对仗)
 *   IV.  Signal → Risk → Brief → Action → Review (5-step 闭环)
 *   V.   AI 原生差异化 (传统咨询 vs KEY)
 *   VI.  CTA · 入口
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
          <Link href="/sample-brief" className="hover:text-seal-500 transition-colors">样品</Link>
          <Link href="/invite" className="hover:text-seal-500 transition-colors">加入</Link>
        </div>
      </nav>

      <main className="max-w-prose-md mx-auto px-6 pb-24">
        {/* ============================================================ */}
        {/* I · HERO · 核心承诺                                            */}
        {/* ============================================================ */}
        <header className="pt-16 pb-16 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · 为什么 KEY ·
          </p>
          <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter leading-[1.05] mb-10">
            KEY 不保你选对.<br />
            但帮你少犯一个<br />回不来的错.
          </h1>
          <p className="font-serif italic text-reading text-ink-500 leading-relaxed max-w-prose-md mx-auto mb-6">
            决定之前, 先找到关键.<br />
            后悔之前, 先看清风险.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink-400">
            Find the key before you decide · See the risk before you regret
          </p>
        </header>

        {/* ============================================================ */}
        {/* II · 4 个认知盲区                                              */}
        {/* ============================================================ */}
        <section className="mb-20 border-t border-paper-300 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · I. 重大决定面前, 你的 4 个盲区 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-8">
            你不是缺信息. 你是在 4 个固定盲点下做决定.
          </h2>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-10">
            35-45 岁中国家庭决策者真正难的, 不是信息不够. 是父母开始失智 / 孩子卡在国际线窗口 / 跟伴侣的工作冲突 / partner-track 升不升 / 学区房抛不抛 — 你在**信息密度足够、但情绪满载、未来不可预测**的情况下, 做一次高代价的风险分配.
          </p>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-12">
            在这种局面下, 人**天然有 4 个盲区**:
          </p>

          <div className="space-y-8">
            <div className="border-l-2 border-ember pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ember mb-2">
                · 盲区 1 · 不可逆代价 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                低估"回不来"的真代价.
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                以为接父母同住 6 个月先看看; 6 个月后你已经辞职 / 离婚边缘 / 孩子被忽视, 这 3 件事都回不来了.
                以为再等等再说; 一年过去, 你跟伴侣已经累积到无法对话.
              </p>
            </div>

            <div className="border-l-2 border-ember pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ember mb-2">
                · 盲区 2 · 承受力 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                高估自己能扛.
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                以为我可以一边管失智的母亲一边继续高强度工作. 6 个月后你已经看了 3 次心脏科, 跟孩子整月零交流, 跟伴侣只剩短信.
                决定时你忽略的不是事, 是**这件事在你身上同时叠加几件别的事**.
              </p>
            </div>

            <div className="border-l-2 border-ember pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ember mb-2">
                · 盲区 3 · 情绪当判断 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                把恐惧、愧疚、愤怒包装成"理性分析".
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                你以为你在权衡 "是否送孩子留学", 真在做的是 "我不想再为这个家担一切责任了". 这两件事的答案完全不同 — 但你自己看不见自己在做哪一件.
              </p>
            </div>

            <div className="border-l-2 border-ember pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ember mb-2">
                · 盲区 4 · 历史模式 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                忽略同一种问题已经发生过 N 次.
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                这是你第 4 次因为"想为家里人多扛一点"而推迟自己想做的事. 前 3 次都后悔了. 但你没把这 4 次连起来看 — 因为人脑天然记不住自己的模式.
                这是 KEY 真正能帮你的地方 — **不是给你建议, 是把你这 4 次说过的话调出来给你自己看**.
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 border-2 border-seal-500/40 bg-paper-50">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
              · KEY 的工作 ·
            </p>
            <p className="font-serif text-reading text-ink-900 leading-relaxed">
              <strong>在你跨过去之前, 把这 4 个盲区主动摊开</strong>. 这是 ChatGPT / 日记 / 教练 / 咨询师都不做的事 — 不是因为不想做, 是因为他们没有你长期累积的真档案.
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* III · 5 条反常识真理                                          */}
        {/* ============================================================ */}
        <section className="mb-20 border-t border-paper-300 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · II. 5 条反常识真理 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-12">
            我们认为, 但很少人同意的事.
          </h2>

          <div className="space-y-10">
            {/* 反常识 1 · 保险对仗 (用户拍板 5/21) */}
            <div className="border-l-2 border-seal-500 pl-6 bg-paper-50 py-5">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                · 真理 1 · 反常识对仗 ·
              </p>
              <h3 className="font-serif text-2xl text-ink-900 tracking-tightish mb-4 leading-snug">
                保险赔付的是事故之后的损失.<br />
                KEY 审查的是决定之前的风险.
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                这是两件**完全不同**的事. 重大人生决定一旦跨过去, 没有任何"赔付"机制能让你回到决定前.
                你需要的是**事前**有人帮你把代价摊开, 不是事后帮你善后.
              </p>
            </div>

            <div className="border-l-2 border-seal-500/40 pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                · 真理 2 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                AI 不该给建议. 它应该给证据.
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed mb-2">
                <strong className="text-ink-900">大众共识</strong>: AI 越聪明越好, 该 24/7 给我"最佳建议".
              </p>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                <strong className="text-ink-900">KEY 反向</strong>: 真懂决策的 AI 不开口给建议. 它把你 30 天前真说过的话, 在你需要的时刻还给你.
                <span className="font-serif italic text-ink-500"> 没有档案证据, 就不假装懂你. No advice without evidence.</span>
              </p>
            </div>

            <div className="border-l-2 border-seal-500/40 pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                · 真理 3 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                时间是 KEY 唯一的护城河.
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed mb-2">
                <strong className="text-ink-900">大众共识</strong>: 模型越大越好, 越新越好.
              </p>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                <strong className="text-ink-900">KEY 反向</strong>: ChatGPT 每次开新对话 = 失忆症患者. KEY 每天记一点, 用得越久越值钱.
                <span className="font-serif italic text-ink-500"> 6 个月后切换品牌 = 6 个月真话档案归零.</span>
              </p>
            </div>

            <div className="border-l-2 border-seal-500/40 pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                · 真理 4 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                决策力是新型个人资产 (早期形态).
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed mb-2">
                <strong className="text-ink-900">大众共识</strong>: 个人资产 = 钱 + 房 + 人脉.
              </p>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                <strong className="text-ink-900">KEY 反向</strong>: 第四类资产正在出现 — "过往判断力的可证档案". 用户拥有, 不被打分, 不被出示, 不被审判.
                <span className="font-serif italic text-ink-500"> 这是个人资产的早期形态, 不是评分体系.</span>
              </p>
            </div>

            <div className="border-l-2 border-seal-500/40 pl-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                · 真理 5 ·
              </p>
              <h3 className="font-serif text-xl text-ink-900 tracking-tightish mb-3">
                慢是 AI 时代的奢侈品.
              </h3>
              <p className="font-serif text-reading text-ink-700 leading-relaxed mb-2">
                <strong className="text-ink-900">大众共识</strong>: 更快 · 更智能 · 实时.
              </p>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                <strong className="text-ink-900">KEY 反向</strong>: 30 秒一句, 90 天后再看. 灵魂指标是"30 天回访率", 不是 DAU.
                <span className="font-serif italic text-ink-500"> 这是反加速主义的产品姿态. 高端用户付费买这种姿态.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* IV · Signal → Risk → Brief → Action → Review 闭环              */}
        {/* ============================================================ */}
        <section className="mb-20 border-t border-paper-300 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · III. KEY 怎么工作 · 5 步闭环 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-8">
            信号 → 风险 → 简报 → 行动 → 复盘.
          </h2>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-12">
            不是每日内容订阅 (得到), 不是日记打卡 (Day One), 不是教练框架 (咨询). 是一个**长期、个性化、主动调用**的决策风险审查闭环.
          </p>

          <div className="space-y-7">
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-mono text-[11px] text-seal-500 w-12 shrink-0">01 ·</span>
                <h3 className="font-serif text-xl text-ink-900 tracking-tightish">Signal · 信号</h3>
              </div>
              <p className="font-serif text-reading text-ink-700 leading-relaxed pl-15 ml-15">
                每天 30 秒一句真信号. 不是日记 (写给自己看的), 不是心情 (廉价的). 是<strong>"今天哪个小事让我不安 / 今天我回避了什么 / 今天我又一次妥协了什么"</strong>. KEY 标记到 6 类风险域: 关系 / 事业 / 父母 / 身体 / 资产 / 自我.
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-mono text-[11px] text-seal-500 w-12 shrink-0">02 ·</span>
                <h3 className="font-serif text-xl text-ink-900 tracking-tightish">Risk · 风险</h3>
              </div>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                信号反复出现, KEY 在你档案里把它**命名**. 不下结论, 只摆事实 — "本周你 3 次提到'我太着急了'" / "30 天里你 4 次写过想推掉父亲的电话".
                这不是 pattern detection 玄学, 是 LLM 主动调用你真档案的产物.
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-mono text-[11px] text-seal-500 w-12 shrink-0">03 ·</span>
                <h3 className="font-serif text-xl text-ink-900 tracking-tightish">Brief · 私人决策风险简报</h3>
              </div>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                当你写"我考虑要不要 X" — KEY 生成一份 10 维必答的简报:
                <em>真正的问题是什么 / 哪些选项不可逆 / 每条路的代价 / 谁受益谁受损 / 你最可能低估什么 / 类似问题你过去犯过同一种错吗 (verbatim 引用) / 1 年后失败的最可能原因 / 有没有更小的试探动作 / 撤退路径是什么 / 30 / 90 / 365 天后怎么检查</em>.
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-mono text-[11px] text-seal-500 w-12 shrink-0">04 ·</span>
                <h3 className="font-serif text-xl text-ink-900 tracking-tightish">Action · 最小行动</h3>
              </div>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                简报最后<strong>不是给大结论, 是给最小验证动作</strong>: 接父母前先住一周试运行 / 跟伴侣只谈一件具体小事不谈"整个婚姻" / 跳槽前先 sketch 一份你 6 个月后的日历看自己愿不愿意过.
                小动作便宜, 但能让大决定的信息密度升 3 倍.
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-mono text-[11px] text-seal-500 w-12 shrink-0">05 ·</span>
                <h3 className="font-serif text-xl text-ink-900 tracking-tightish">Review · 复盘</h3>
              </div>
              <p className="font-serif text-reading text-ink-700 leading-relaxed">
                30 / 90 / 365 天后, KEY <strong>主动回来问你</strong>: 当时担心的事真发生了吗? 你押的判断对了几成? 这是 KEY 跟其他 AI 真正不同的地方 —
                其他 AI 答完就走, KEY 等你的真实结果, 看你判断准不准. 一年后, 你手里有一本**自己的判断力档案**.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* V · AI 原生差异化 (传统咨询 vs KEY)                          */}
        {/* ============================================================ */}
        <section className="mb-20 border-t border-paper-300 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · IV. KEY 不是咨询公司 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-8">
            传统咨询给你别人的轨迹. KEY 给你你自己的.
          </h2>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-10">
            这不是 KEY 比咨询公司更努力. 这是 AI 时代之前**根本做不到**的一件事 — 没有 LLM 长期记忆, 没有主动调用机制, 没有 anti-hallucination 护栏. 现在 3 个条件第一次同时成立.
          </p>

          <div className="overflow-x-auto mb-10">
            <table className="w-full text-[13px] font-serif">
              <thead>
                <tr className="border-b-2 border-ink-900">
                  <th className="text-left py-3 pr-4 font-sans uppercase text-[10px] tracking-widest text-ink-500">维度</th>
                  <th className="text-left py-3 pr-4 font-sans uppercase text-[10px] tracking-widest text-ink-500">传统咨询 (麦肯锡 / 私人教练)</th>
                  <th className="text-left py-3 font-sans uppercase text-[10px] tracking-widest text-seal-500">KEY · AI 原生</th>
                </tr>
              </thead>
              <tbody className="text-ink-700">
                <tr className="border-b border-paper-300">
                  <td className="py-3 pr-4 font-semibold">用什么作证据</td>
                  <td className="py-3 pr-4">行业最佳实践 (别人的轨迹)</td>
                  <td className="py-3 text-seal-500">你 30 天前真说过的话 (你自己的轨迹)</td>
                </tr>
                <tr className="border-b border-paper-300">
                  <td className="py-3 pr-4 font-semibold">记忆机制</td>
                  <td className="py-3 pr-4">每次咨询重新 onboarding</td>
                  <td className="py-3 text-seal-500">LLM 长期记忆 · 用得越久越懂你</td>
                </tr>
                <tr className="border-b border-paper-300">
                  <td className="py-3 pr-4 font-semibold">主动调用</td>
                  <td className="py-3 pr-4">你不主动问就没了</td>
                  <td className="py-3 text-seal-500">大决定时主动调档 + 30/90/365 天主动回访</td>
                </tr>
                <tr className="border-b border-paper-300">
                  <td className="py-3 pr-4 font-semibold">立场</td>
                  <td className="py-3 pr-4">替你给方案 (顾问的活计)</td>
                  <td className="py-3 text-seal-500">绝不替你决定 · 只摆代价、盲点、不可逆</td>
                </tr>
                <tr className="border-b border-paper-300">
                  <td className="py-3 pr-4 font-semibold">单次价格</td>
                  <td className="py-3 pr-4">¥3-50 万一次性 (无沉淀)</td>
                  <td className="py-3 text-seal-500">¥1988/年 (档案永久沉淀)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold">谁拥有数据</td>
                  <td className="py-3 pr-4">咨询公司 (你的真话留在他们 deck 里)</td>
                  <td className="py-3 text-seal-500">你 · 永远 · 不打分 / 不出示 / 不进训练数据</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="font-serif italic text-reading text-ink-500 leading-relaxed text-center pt-5 border-t border-paper-300">
            "AI 时代最深的差异化, 不是模型多大. 是**你的真档案能不能被这个 AI 长期记住、主动调用、忠实引用**.<br />
            这不是工程问题, 是产品哲学问题."
          </p>
        </section>

        {/* ============================================================ */}
        {/* VI · 我们卖给谁 · 5%                                            */}
        {/* ============================================================ */}
        <section className="mb-20 border-t border-paper-300 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · V. 我们认真选 5% ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-6">
            KEY 不卖给所有人. 我们认真选 5%.
          </h2>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-10">
            创新产品对 5% 早期用户清晰, 对 95% 模糊. 我们不试图教育所有人, 而是找到那 5% — 他们已经在等这个产品.
          </p>

          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-500 mb-4">
            · 5% 画像 · 6 维 ·
          </p>
          <ul className="space-y-4 font-serif text-[15px] text-ink-700 editorial-leading mb-12">
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span><strong className="text-ink-900">年龄</strong>: 35-45 岁, 决策密度比 10 年前高 3 倍</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span><strong className="text-ink-900">经历</strong>: 至少 1 次大决定正在进行中 (父母失智 / 离婚 / 创业 / 跨城 / 跳行业)</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span><strong className="text-ink-900">付费历史</strong>: 已付 Notion / flomo / 得到 / 樊登 / 微信读书 / Day One 至少 1 个</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span><strong className="text-ink-900">AI 熟练度</strong>: 用过 ChatGPT, 知道它会编造 (不依赖, 不陌生)</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span><strong className="text-ink-900">家庭年收入</strong>: ≥ 60 万 (¥1988/年 不焦虑)</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span><strong className="text-ink-900">朋友圈特征</strong>: "那个会写长反思 / 会问自己难问题"的人</span>
            </li>
          </ul>

          <div className="border-l-2 border-seal-500 pl-6 py-4 bg-paper-50">
            <p className="font-serif text-reading text-ink-700 leading-relaxed">
              中国这群人至少 200 万. KEY 要的是其中 1 万人 — 0.5%, ¥1988 万年付收入.
              <span className="font-serif italic text-ink-500 block mt-2">如果你刚才读到这里没想跳过, 你大概就在这 5% 里.</span>
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* VII · 诚实边界                                                  */}
        {/* ============================================================ */}
        <section className="mb-20 border-t border-paper-300 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · VI. 我们的诚实边界 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-8">
            KEY 不能保证你选对. 但能帮你少做后悔的决定.
          </h2>
          <div className="space-y-5 font-serif text-reading text-ink-700 editorial-leading">
            <p>
              KEY 不会预测未来. 不会替你承担选错的代价. 不会在每个 decision 上保证最优解.
            </p>
            <p>
              它会尽力保证一件事: <strong className="text-ink-900">在你做决定之前, 最关键的代价、盲点和不可逆风险, 没有被你跳过去</strong>.
            </p>
            <p className="font-serif italic text-ink-500">
              这就是用户愿意付 ¥1988 的理由. 不是因为 KEY 比你聪明. 是因为它有耐心、有记性、不带立场.
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CTA                                                            */}
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
              先看一份决策风险简报
            </Link>
          </div>

          <p className="text-center font-mono text-[10px] text-ink-400 tracking-wider">
            <Link href="/manifesto" className="hover:text-seal-500">
              · 看创始人宣言 →
            </Link>
            <span className="mx-3">·</span>
            <Link href="/how-it-works" className="hover:text-seal-500">
              · 看 KEY 如何工作 →
            </Link>
            <span className="mx-3">·</span>
            <Link href="/methodology" className="hover:text-seal-500">
              · 想看深度方法论 →
            </Link>
          </p>
        </section>

        <footer className="pt-20 text-center font-mono text-[10px] uppercase tracking-widest text-ink-400">
          keypoint.life · 你的档案存在境外节点 · 永不进训练数据
        </footer>
      </main>
    </div>
  );
}
