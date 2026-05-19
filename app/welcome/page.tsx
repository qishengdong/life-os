/**
 * /welcome · 兑换后 1 屏说明 · 5/19 ship · A2
 *
 * 用户痛点 (用户 5/19 反馈):
 *   "KEY 太创新, 用户不知道是什么, 直接进 9 分钟问卷被吓跑"
 *
 * 改:
 *   /invite 兑换 → /welcome (30 秒看完) → /onboarding (建档) → /your-pattern → /home
 *
 * 不能跳过 onboarding (用户拍 5/19: 建档是 trust ritual, 必须的)
 * 但要先解释 "为什么要花 9 分钟"
 */
'use client';

import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6">
        <Link href="/" aria-label="KEY home" className="block w-fit">
          <KeyWordmark variant="nav" height={22} />
        </Link>
      </nav>

      <main className="max-w-prose-md mx-auto px-6 pb-24">
        <header className="pt-8 pb-10 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · 欢迎进入 KEY ·
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 tracking-tightish leading-tight mb-6">
            进去之前, 30 秒看清楚.
          </h1>
          <p className="font-serif italic text-reading text-ink-500 leading-relaxed">
            KEY 不是日记, 不是 ChatGPT, 不是教练.<br />
            它是把你每天的真实信号, 变成未来重大决定的证据.
          </p>
        </header>

        {/* 3 步说明 · 极简 · 每段 1 句 + 1 副词 */}
        <section className="space-y-8 mb-12">
          <div className="border-l-2 border-seal-500/40 pl-6">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
              · 1. 每天 ·
            </p>
            <h2 className="font-serif text-xl text-ink-900 tracking-tightish mb-2">
              你写一句真话.
            </h2>
            <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
              30 秒. 想到什么写什么. 不用工整. KEY 记得.
            </p>
          </div>

          <div className="border-l-2 border-seal-500/40 pl-6">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
              · 2. 真正卡的时候 ·
            </p>
            <h2 className="font-serif text-xl text-ink-900 tracking-tightish mb-2">
              KEY 把你之前的真话调出来.
            </h2>
            <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
              写一份决策简报, KEY 会真引用你 X 天前说过的话作为证据.
              不是 ChatGPT 那种泛建议.
            </p>
          </div>

          <div className="border-l-2 border-seal-500/40 pl-6">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
              · 3. 30 天后 ·
            </p>
            <h2 className="font-serif text-xl text-ink-900 tracking-tightish mb-2">
              KEY 回头问你 — 真发生了吗?
            </h2>
            <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
              这是 KEY 跟其他 AI 真正不同的地方.
              其他 AI 答完就走, KEY 等你的真实结果, 看你判断准不准.
            </p>
          </div>
        </section>

        {/* 为什么先 9 分钟建档 */}
        <section className="mb-12 border-y border-paper-300 py-8">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-4 text-center">
            · 第一步: 9 分钟建档 ·
          </p>
          <p className="font-serif text-reading text-ink-700 leading-relaxed mb-3">
            KEY 想真懂你, 得先听你说一遍你是谁.
          </p>
          <p className="font-serif text-reading text-ink-700 leading-relaxed mb-3">
            6 步 · 共 9 分钟 · 不催. 你写的所有答案都进你的私人档案 —
            之后每份决策简报都会从这里调引用.
          </p>
          <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
            没建档的话, KEY 第 1 份简报会冷启动, 质量会差很多.
          </p>
        </section>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Link
            href="/onboarding"
            className="inline-block px-10 py-3.5 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 transition-colors"
          >
            开始建档 (9 分钟) →
          </Link>
          <p className="font-mono text-[10px] text-ink-400 tracking-wider">
            <Link href="/how-it-works" className="hover:text-seal-500">
              · 想看更完整的说明 →
            </Link>
          </p>
        </div>

        <footer className="pt-16 text-center font-mono text-[10px] uppercase tracking-widest text-ink-400">
          keypoint.life · 你的档案存在 Turso · 永不进训练数据
        </footer>
      </main>
    </div>
  );
}
