/**
 * /manifesto — 创始人宣言 · 5/20 draft · A2
 *
 * 这是 draft v1. 用户拿到后审改 1 小时, 改完发朋友圈 + 5% 真用户自现身.
 *
 * 6 段结构:
 *   1. Hook · 个人真话 (不是营销)
 *   2. 诊断 · 中国 35-45 岁决策密度危机
 *   3. 反思 · 为什么 ChatGPT/Notion/日记都解决不了
 *   4. 定义 · 决策力 = 第四资产, KEY 是发行机构
 *   5. 承诺 · 5 件不做 + 3 件会做
 *   6. 签名 + 邀请码 entry
 *
 * Voice:
 *   - 第一人称, 创始人本人在说话 (不是 marketing)
 *   - 诚实承认困境, 不假装"我们改变世界"
 *   - 引用真用户场景 (Linda × 5 脱敏)
 *   - 反加速主义 / 反高歌 / 反鸡汤
 */
'use client';

import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <div className="flex gap-6 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
          <Link href="/why-key" className="hover:text-seal-500 transition-colors">为什么 KEY</Link>
          <Link href="/how-it-works" className="hover:text-seal-500 transition-colors">如何工作</Link>
          <Link href="/invite" className="hover:text-seal-500 transition-colors">邀请</Link>
        </div>
      </nav>

      <main className="max-w-prose-md mx-auto px-6 pb-24">
        <header className="pt-16 pb-12 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · 创始人 · 写给一个我们还没找到的人 ·
          </p>
          <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter leading-[1.1] mb-8">
            我做 KEY,<br />是因为我自己需要它.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
            2026 · 春 · 北京
          </p>
        </header>

        {/* ====================================================== */}
        {/* 1. Hook · 个人真话                                       */}
        {/* ====================================================== */}
        <section className="mb-16">
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-5">
            2023 年, 我做过一个让我后悔的决定. 现在已经记不太清当时为什么这么选了 — 我记得结果, 但忘了**当时的我在怕什么**.
          </p>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-5">
            那一刻我意识到一件事: 我们这一代人, 决定越做越多, 但**决定的真证据**越来越少.
            朋友圈是表演, 日记没人主动翻, ChatGPT 每次重新认识你. 所有工具都帮你**做下一件事**, 没人帮你**记得你当时怎么想**.
          </p>
          <p className="font-serif italic text-reading text-ink-500 editorial-leading">
            我做 KEY, 是因为我希望 30 年后, 我还能找到当年的我.
          </p>
        </section>

        {/* ====================================================== */}
        {/* 2. 诊断 · 中国 35-45 岁决策密度危机                     */}
        {/* ====================================================== */}
        <section className="mb-16 border-t border-paper-300 pt-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · I. 我看到的事 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-8">
            35-45 岁的中国人, 决定密度比 10 年前高 3 倍.
          </h2>
          <div className="space-y-5 font-serif text-reading text-ink-700 editorial-leading">
            <p>
              要不要离婚 / 父母失智怎么办 / 孩子要不要送出国 / 这一单接不接 / 创业还是回去打工 / 要不要做这个手术 / 老板在霸凌我说不说 ...
            </p>
            <p>
              这些不是小事. 每一个都决定后面 5-10 年怎么过.
              但我们手里没有任何工具帮我们**记住自己当时是怎么想的** — 等真做完决定, 你只剩结果, 没了过程.
            </p>
            <p className="font-serif italic text-ink-500">
              没有过程, 就没有学习. 没有学习, 你下一次面对同类决定还是凭直觉.
            </p>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 3. 反思 · 为什么现有工具解决不了                        */}
        {/* ====================================================== */}
        <section className="mb-16 border-t border-paper-300 pt-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · II. 为什么 ChatGPT / 日记 / 教练都不行 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-8">
            因为它们都在做**别的事**.
          </h2>
          <div className="space-y-6 font-serif text-reading text-ink-700 editorial-leading">
            <div>
              <p className="font-serif italic text-seal-500 mb-1">— ChatGPT</p>
              <p>给你"最佳实践", 但每次开新对话, 它不认识你. 它是个**博学但失忆**的人.</p>
            </div>
            <div>
              <p className="font-serif italic text-seal-500 mb-1">— 日记 / Day One / Notion</p>
              <p>记录是被动的. 你 3 个月后翻不到关键那条. 它们是档案柜, 不是**作证人**.</p>
            </div>
            <div>
              <p className="font-serif italic text-seal-500 mb-1">— 教练 / 咨询师</p>
              <p>给你方法论 / 解读, 但每次都是新的对话, 没有跨年的连续记忆.</p>
            </div>
            <p className="pt-3 border-t border-paper-300">
              真问题不是 "AI 不够聪明", 是 <strong className="text-ink-900">没有一种工具,
              在你做大决定时, 把你 30 天前真说过的话端给你</strong>.
              这种工具 2024 年之前根本做不出来 — 因为 LLM 没有长期记忆. 现在可以了.
            </p>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 4. 定义 · 决策力 = 第四资产                              */}
        {/* ====================================================== */}
        <section className="mb-16 border-t border-paper-300 pt-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · III. KEY 是什么 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-8">
            一个给个人决定建档案的 AI 系统.
          </h2>
          <div className="space-y-5 font-serif text-reading text-ink-700 editorial-leading">
            <p>
              你每天写 30 秒 — 想到什么写什么, 不用工整. KEY 标记, 存进你的私人档案.
            </p>
            <p>
              你做大决定时, KEY 不给你建议. 它把你之前 7 天 / 30 天写过的真话**调出来**给你 —
              你 5 天前担心的事 / 12 天前画的边界 / 昨天没说出口的犹豫. 这些是证据.
            </p>
            <p>
              30 / 90 / 365 天后, KEY 主动回来问你: 你担心的事真发生了吗? 你押的那个判断对了几成?
              一年后, 你手里有一本**自己的判断力档案**.
            </p>
            <p className="pt-5 border-l-2 border-seal-500 pl-5 italic text-ink-700 bg-paper-50 py-3">
              我相信 — 决策力是你的第四类个人资产. 钱 · 房 · 人脉之外, 这一类正在出现.
              KEY 在做这一类资产的发行机构.
            </p>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 5. 承诺 · 5 件不做 + 3 件会做                          */}
        {/* ====================================================== */}
        <section className="mb-16 border-t border-paper-300 pt-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · IV. 我的承诺 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-10">
            KEY 永远不会做的 5 件事.
          </h2>
          <ul className="space-y-4 font-serif text-reading text-ink-700 editorial-leading mb-12">
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-ember w-6 shrink-0">01</span>
              <span><strong className="text-ink-900">永远不卖广告</strong>. 你付钱, 不是被卖.</span>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-ember w-6 shrink-0">02</span>
              <span><strong className="text-ink-900">你的真话永远不进训练数据</strong>. 档案在 Turso, 你可以一键导出 / 删除 / 继承.</span>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-ember w-6 shrink-0">03</span>
              <span><strong className="text-ink-900">永远不主动给建议</strong>. KEY 只把你说过的话还给你, 决定是你做的.</span>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-ember w-6 shrink-0">04</span>
              <span><strong className="text-ink-900">永远不做"决策思维"内容订阅</strong>. 不是樊登, 不是得到. 你来 KEY 是看见自己, 不是学新东西.</span>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-ember w-6 shrink-0">05</span>
              <span><strong className="text-ink-900">永远不上中国 App Store 做合规版</strong>. 不接审查, 不实名认证, 不存境内. 灵魂不让.</span>
            </li>
          </ul>

          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-10">
            KEY 永远会做的 3 件事.
          </h2>
          <ul className="space-y-4 font-serif text-reading text-ink-700 editorial-leading">
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-seal-500 w-6 shrink-0">01</span>
              <span><strong className="text-ink-900">真引用你说过的话</strong>. 编一处, 我们公开承认 + 修. anti-hallucination 是产品底线.</span>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-seal-500 w-6 shrink-0">02</span>
              <span><strong className="text-ink-900">真回访你的预测</strong>. 30 / 90 / 365 天, KEY 主动来问. 不是发邮件让你"回来用", 是把你 90 天前的真话端给你.</span>
            </li>
            <li className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] text-seal-500 w-6 shrink-0">03</span>
              <span><strong className="text-ink-900">慢</strong>. 30 秒一句, 90 天后再看. 灵魂指标是"30 天回访率", 不是 DAU. 这是反加速主义的产品姿态.</span>
            </li>
          </ul>
        </section>

        {/* ====================================================== */}
        {/* 6. 签名 + CTA                                            */}
        {/* ====================================================== */}
        <section className="mb-12 border-t border-paper-300 pt-12">
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-5">
            如果你看到这里, 你大概是我要找的人.
          </p>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-5">
            KEY 内测中, 前 100 名认真选. 我们不靠投资人催进度, 不靠 PR 涨用户, 不靠付费墙赌增长.
            就这条路: 找到 100 个真懂的人, 一起把决策力档案这件事做出来.
          </p>
          <p className="font-serif italic text-reading text-ink-500 editorial-leading mb-12">
            5 年后这是基础设施. 10 年后是人类资产的新维度. 现在是 day 1.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/invite"
              className="inline-block px-10 py-3.5 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 transition-colors text-center"
            >
              已有邀请码 → 激活
            </Link>
            <Link
              href="/why-key"
              className="inline-block px-10 py-3.5 font-serif text-base border-2 border-seal-500 text-seal-500 hover:bg-seal-500 hover:text-paper transition-colors text-center"
            >
              先看战略叙事
            </Link>
          </div>

          {/* 签名 */}
          <div className="text-center pt-12">
            <p className="font-serif italic text-reading text-ink-500 mb-2">
              — 写于 keypoint.life · 春 · MMXXVI
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
              KEY 创始人
            </p>
          </div>
        </section>

        <footer className="pt-16 text-center font-mono text-[10px] uppercase tracking-widest text-ink-400">
          keypoint.life · 你的档案存在 Turso · 永不进训练数据
        </footer>
      </main>
    </div>
  );
}
