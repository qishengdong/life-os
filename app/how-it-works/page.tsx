/**
 * /how-it-works — 公开版完整说明 · 5/19 ship · A1
 *
 * 目的:
 *   1. Linda × 5 内测可转发给朋友 / 让朋友先看懂再申请
 *   2. 比 /welcome (30 秒) 多一层, 但比 /methodology (方法论 essay) 浅
 *   3. 不需 invite cookie, 公开访问
 *
 * 不同于 /methodology:
 *   - methodology = 哲学 / 为什么决策需要长期对照
 *   - how-it-works = 你 30 天里实际会做什么 / KEY 实际会给你什么
 *
 * 5 段:
 *   1. 你每天会做一件事 · 30 秒
 *   2. KEY 会做的事 · 标记 + 记得
 *   3. 真正卡的时候 · 把你的话调出来
 *   4. 30 天后 · KEY 回头问你
 *   5. 跟 ChatGPT / 日记 / 教练有什么不一样
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
          <Link href="/methodology" className="hover:text-seal-500 transition-colors">方法论</Link>
          <Link href="/sample-brief" className="hover:text-seal-500 transition-colors">样品</Link>
          <Link href="/invite" className="hover:text-seal-500 transition-colors">邀请</Link>
        </div>
      </nav>

      <main className="max-w-prose-md mx-auto px-6 pb-24">
        {/* HERO */}
        <header className="pt-12 pb-16 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · KEY 是什么 · 它如何工作 ·
          </p>
          <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter leading-[1.1] mb-8">
            你每天 30 秒.<br />KEY 把它存成证据.
          </h1>
          <p className="font-serif italic text-reading text-ink-500 leading-relaxed">
            KEY 不是日记, 不是 ChatGPT, 不是教练.<br />
            它是把你每天的真实信号, 变成未来重大决定的证据.
          </p>
        </header>

        {/* 1. 每天 */}
        <section className="mb-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · 1. 每天 · 30 秒 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-6">
            你写一句真话.
          </h2>
          <div className="font-serif text-reading text-ink-700 leading-relaxed space-y-4">
            <p>
              KEY 每天给你一个问题 — 不是"今天感觉如何", 是更具体的, 关于你**正在做的决定** / 你**反复想到的事** / 你**没说出口的犹豫**.
            </p>
            <p>
              你想到什么写什么. 30 秒, 不用工整, 不用整理. 真就行.
            </p>
            <p className="font-serif italic text-[14px] text-ink-500">
              这不是日记 — 日记是写给自己看的. 这是写给"30 天后的你"看的.
            </p>
          </div>
        </section>

        {/* 2. KEY 会做的事 */}
        <section className="mb-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · 2. KEY 做的事 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-6">
            标记. 记得.
          </h2>
          <div className="font-serif text-reading text-ink-700 leading-relaxed space-y-4">
            <p>
              KEY 看你这一句, 标记它是 — 担心 / 边界 / 渴望 / 反复 / 突破 ...
              然后存进你的私人档案 (你看得见, 你可以改, 不进训练数据).
            </p>
            <p>
              它会回你一句话. 不是分析, 不是建议, 不是鸡汤. 是**让你听见你刚说的话** — 用它自己的方式.
            </p>
            <p className="font-serif italic text-[14px] text-ink-500">
              KEY 的角色是见证人, 不是教练. 你不需要被告诉怎么做 — 你需要被听见.
            </p>
          </div>
        </section>

        {/* 3. 真正卡的时候 */}
        <section className="mb-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · 3. 真正卡的时候 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-6">
            把你之前的真话调出来.
          </h2>
          <div className="font-serif text-reading text-ink-700 leading-relaxed space-y-4">
            <p>
              要离职 / 要分手 / 要搬城 / 要不要做这个手术 / 要不要接这一单 —
              这种压住你的决定, 你写一份**决策简报** (12 维 · 一份 PDF 的厚度).
            </p>
            <p>
              KEY 不会给你"3 个建议". 它会从你之前 7 天 / 30 天写过的话里, 调出来:
            </p>
            <ul className="pl-6 space-y-2 font-serif italic text-[15px] text-ink-700">
              <li>— 你 5 天前说过的担心</li>
              <li>— 你 12 天前画的那条边界</li>
              <li>— 你昨天没说出口的那个犹豫</li>
            </ul>
            <p>
              这些是证据. 你做决定时, 拿着的不是"AI 的建议", 是**你自己 30 天前的真话**.
            </p>
          </div>
        </section>

        {/* 4. 30 天后 */}
        <section className="mb-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · 4. 30 / 90 / 365 天后 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-6">
            KEY 回头问你 — 真发生了吗?
          </h2>
          <div className="font-serif text-reading text-ink-700 leading-relaxed space-y-4">
            <p>
              你 5 月做的决定, 6 月 / 8 月 / 明年 5 月, KEY 都会回来问你:
              你当时担心的事真发生了吗? 你押注的那个判断对了几成?
            </p>
            <p>
              结果存进你的"决策回访本". 一年后, 你手里有一本**自己的判断力档案** —
              你哪些预测靠谱 / 哪些反复看错 / 哪种决定你的盲点在哪.
            </p>
            <p className="font-serif italic text-[14px] text-ink-500">
              这是 KEY 跟其他 AI 真正不同的地方. 其他 AI 答完就走, KEY 等你的真实结果.
            </p>
          </div>
        </section>

        {/* 5. 跟其他工具的区别 */}
        <section className="mb-16 border-y border-paper-300 py-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4 text-center">
            · 5. 那 KEY 不是什么 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-10 text-center">
            它不是 ChatGPT, 不是日记, 不是教练.
          </h2>
          <div className="space-y-8 font-serif text-reading text-ink-700 leading-relaxed">
            <div>
              <p className="font-serif text-[15px] text-seal-500 italic mb-2">— 跟 ChatGPT 比</p>
              <p>
                ChatGPT 每次开新对话, 记不得你. KEY 每天记一点, 半年后调用你半年前的真话作为证据.
                ChatGPT 给"最佳实践", KEY 给**你自己的轨迹**.
              </p>
            </div>
            <div>
              <p className="font-serif text-[15px] text-seal-500 italic mb-2">— 跟日记 / Day One 比</p>
              <p>
                日记是写给自己看的, 你 3 个月后翻不到关键那条. KEY 会主动调出来, 在你需要的时刻.
                日记是被动归档, KEY 是主动作证.
              </p>
            </div>
            <div>
              <p className="font-serif text-[15px] text-seal-500 italic mb-2">— 跟教练 / 咨询师比</p>
              <p>
                教练给你方法论, 咨询师给你解读. KEY 不给方法论, 不给解读 —
                它只把你说过的话, 在对的时刻还给你. 你做决定. 它做证.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center space-y-5 mt-20">
          <p className="font-serif italic text-reading text-ink-500 mb-6 max-w-prose-md mx-auto leading-relaxed">
            KEY 现在内测中 · 前 100 名认真选 · 年付 ¥1988 / 月付 ¥198.
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
              先看一份样品简报
            </Link>
          </div>
          <p className="font-mono text-[10px] text-ink-400 tracking-wider mt-6">
            <Link href="/methodology" className="hover:text-seal-500">
              · 想看更深的方法论 →
            </Link>
          </p>
        </div>

        <footer className="pt-20 text-center font-mono text-[10px] uppercase tracking-widest text-ink-400">
          keypoint.life · 你的档案存在 Turso · 永不进训练数据
        </footer>
      </main>
    </div>
  );
}
