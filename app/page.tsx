/**
 * / — LifeOS landing page (publication-grade)
 *
 * 设计原则:
 *   - 跟 /methodology + /sample-brief 同一调性
 *   - 没有 SaaS pattern (没 "Sign Up Free" / 没三档定价网格 / 没 testimonial 滚轮)
 *   - 像一本严肃刊物的封面 + 卷首语 + 内容预告
 *   - 三条入口: 看样品 / 看方法论 / 开始第一次咨询
 *
 * 不做:
 *   - 不在首页直接问 Pulse (那是已 onboard 用户的事, /pulse)
 *   - 不要求邮箱 (没建立信任前不要)
 *   - 不放 product screenshot (产品本身就是阅读体验)
 */

import Link from 'next/link';
import Image from 'next/image';
import { getSampleBriefs } from '@/lib/db';
import type { DecisionBrief } from '@/lib/decision/brief-schema';
import KeyWordmark from '@/components/KeyWordmark';
import { loadHomeContent } from '@/lib/content/home';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FRAMEWORK_LABEL: Record<string, string> = {
  'parent-care': '父母养老',
  marriage: '婚姻',
  'child-education': '子女教育',
};

export default async function HomePage() {
  // CMS 可编辑内容 (lib/content/data/home.json)
  const content = loadHomeContent();
  const { hero, fiveDomains, footer } = content;
  const HERO_LEADS = hero.leads;
  const FIVE_DOMAINS = fiveDomains.items;

  // 拉一份 sample brief 作为首页 pull-quote (优先用 parent-care)
  const sampleRows = getSampleBriefs();
  const teaserRow =
    sampleRows.find((r: any) => r.framework === 'parent-care') || sampleRows[0];
  const teaserBrief: DecisionBrief | null = teaserRow
    ? JSON.parse(teaserRow.brief_json)
    : null;

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      {/* ============================================ */}
      {/* 顶部导航                                       */}
      {/* ============================================ */}
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-center">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="display" height={66} />
        </Link>
        <div className="flex gap-6 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
          <Link href="/letters" className="text-seal-500 hover:text-seal-700 transition-colors">
            通信集
          </Link>
          <Link href="/methodology" className="hover:text-seal-500 transition-colors">
            方法论
          </Link>
          <Link href="/sample-brief" className="hover:text-seal-500 transition-colors">
            样品
          </Link>
          <Link href="/membership" className="hover:text-seal-500 transition-colors">
            会员
          </Link>
          <Link href="/transparency" className="hover:text-seal-500 transition-colors">
            透明度
          </Link>
          <Link href="/invite" className="hover:text-seal-500 transition-colors">
            加入
          </Link>
        </div>
      </nav>

      {/* ============================================ */}
      {/* K · E · Y · acronym expansion (取代 PageMasthead) */}
      {/* ============================================ */}
      <section
        aria-label="What KEY stands for"
        className="max-w-prose-xl mx-auto px-6 pt-2 pb-10 border-b border-ink-900/15"
      >
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-8 text-center">
          · KEY STANDS FOR ·
        </p>
        <div className="grid grid-cols-3 gap-3 md:gap-12 text-center">
          {[
            { letter: 'K', en: 'Know what matters.', cn: '看见真正关键的变量' },
            { letter: 'E', en: 'Expose the cost.',   cn: '揭开你回避的代价' },
            { letter: 'Y', en: 'You decide.',        cn: '决定永远是你的' },
          ].map((item) => (
            <div key={item.letter} className="flex flex-col items-center">
              <p className="font-serif text-[clamp(3rem,7vw,5rem)] text-seal-500 tracking-tighter leading-none mb-3">
                {item.letter}
              </p>
              <p className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-ink-900 leading-snug mb-1.5">
                {item.en}
              </p>
              <p className="font-serif italic text-[12px] md:text-[13px] text-ink-500 leading-snug">
                {item.cn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* B4 · HERO V5 — text-only, 大开本封面感           */}
      {/* mini-stories 提前 / fleuron 后 / 大图后置 / 卷首语 后 */}
      {/* ============================================ */}
      <header className="relative overflow-hidden">
        {/* 顶部书脊金线 */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-seal-500 z-10" />

        {/* === Hero · 左文 + 右图 (5/15 用户反馈: hero 必须有图) === */}
        <div className="relative max-w-prose-xl mx-auto px-6 pt-16 md:pt-20 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-10 md:gap-14 items-start">
            {/* LEFT · 文字 */}
            <div className="order-2 md:order-1">
              <h1 className="font-serif text-[clamp(2rem,4.5vw,3.6rem)] text-ink-900 tracking-tighter leading-[1.02] mb-3">
                {hero.brandStatementEn}
              </h1>
              <p className="font-serif text-[clamp(1.5rem,3.4vw,2.4rem)] text-ink-900 tracking-tighter leading-[1.05] mb-8">
                {hero.brandStatementCn}
              </p>

              <p className="font-serif italic text-[clamp(0.95rem,1.4vw,1.15rem)] text-ink-700 editorial-leading mb-8 whitespace-pre-line">
                {hero.subTag}
              </p>

              {/* explainer 接在 deck 后 (3 段) */}
              <div className="space-y-4 mb-10">
                {hero.explainer.map((para, i) => {
                  const isItalic = para.trim().startsWith('<i>') && para.trim().endsWith('</i>');
                  const stripped = para.replace(/^<i>|<\/i>$/g, '');
                  const cls = isItalic
                    ? 'font-serif text-[15px] italic text-ink-500 editorial-leading'
                    : 'font-serif text-[15px] text-ink-700 editorial-leading';
                  return (
                    <p
                      key={i}
                      className={cls}
                      dangerouslySetInnerHTML={{ __html: stripped }}
                    />
                  );
                })}
              </div>

              {/* CTAs · skip ghost if label empty */}
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-baseline flex-wrap">
                <Link
                  href={hero.ctas.primary.href}
                  className="font-serif text-base bg-seal-500 hover:bg-seal-700 text-paper-100 px-5 py-2.5 transition-colors tracking-wide"
                >
                  {hero.ctas.primary.label}
                </Link>
                <Link
                  href={hero.ctas.secondary.href}
                  className="font-serif text-[15px] text-ink-900 border-b-2 border-seal-500 pb-0.5 hover:text-seal-500 transition-colors"
                >
                  {hero.ctas.secondary.label}
                </Link>
                {hero.ctas.ghost.label && (
                  <Link
                    href={hero.ctas.ghost.href}
                    className="font-serif text-[15px] text-ink-700 hover:text-seal-500 transition-colors"
                  >
                    {hero.ctas.ghost.label}
                  </Link>
                )}
              </div>
            </div>

            {/* RIGHT · hero 图 */}
            <div className="order-1 md:order-2 md:sticky md:top-8">
              <div className="relative aspect-[4/5] bg-ink-900 overflow-hidden shadow-lg">
                <Image
                  src="/illustrations/hero-home.png"
                  alt={hero.brandStatementEn}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority
                  className="object-cover"
                />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-seal-500" />
              </div>
            </div>
          </div>
        </div>

        {/* === 4 mini-stories (B4 · 移到 hero 紧后, 不再藏在下面) === */}
        <div className="relative max-w-prose-xl mx-auto px-6 pb-16 border-t border-paper-300 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-10 text-center">
            · {hero.leadsIntro} ·
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {HERO_LEADS.map((lead) => (
              <article key={lead.label} className="group">
                <p className="font-sans text-[10px] uppercase tracking-[0.35em] text-seal-500 mb-4">
                  · {lead.label} ·
                </p>
                <div className="font-serif text-reading text-ink-900 editorial-leading mb-4">
                  {lead.setup.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                <p className="font-serif italic text-[15px] text-ink-700/90 editorial-leading pl-4 border-l-2 border-seal-500/40">
                  —— {lead.truth}
                </p>
                {lead.href && (
                  <div className="mt-5 pt-3 border-t border-seal-500/30">
                    <Link
                      href={lead.href}
                      className="font-serif italic text-[13px] text-seal-500 hover:text-seal-700 transition-colors"
                    >
                      读 →
                    </Link>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* === tagline · 三秒停顿 (接在 mini-stories 后, 桥接到大图) === */}
        <div className="relative max-w-prose-xl mx-auto px-6 pt-12 pb-16 text-center">
          <div className="inline-block max-w-prose-md">
            <p className="font-serif italic text-[clamp(1.3rem,2.4vw,1.6rem)] text-ink-900 mb-1 leading-snug tracking-tightish">
              {hero.betterCallKey.en1}
            </p>
            <p className="font-serif italic text-[clamp(1.3rem,2.4vw,1.6rem)] text-ink-900 mb-4 leading-snug tracking-tightish">
              {hero.betterCallKey.en2}
            </p>
            <p className="font-serif italic text-[clamp(0.95rem,1.2vw,1.15rem)] text-ink-500 leading-relaxed">
              {hero.betterCallKey.cnSubtitle}
            </p>
          </div>
        </div>

        {/* === Fleuron 分隔 (B4 · 移到 tagline 后) === */}
        <div className="relative max-w-prose-xl mx-auto px-6 my-4 flex items-center justify-center">
          <span className="flex-1 h-px bg-ink-900/10" />
          <span className="px-6 font-serif text-seal-500/60 text-xl select-none">✦</span>
          <span className="flex-1 h-px bg-ink-900/10" />
        </div>
      </header>

      {/* B4 满版大图删除 · 图已回 hero 区, 中间不再重复 */}

      {/* ============================================ */}
      {/* WHAT IS THIS — 卷首语                          */}
      {/* ============================================ */}
      <section className="border-t border-paper-300 bg-paper-50">
        <div className="max-w-prose-lg mx-auto px-6 py-24">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-8">
            · 卷首语 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 mb-10 tracking-tightish leading-tight">
            我们为 AI 写了一份决策契约.
          </h2>
          <div className="space-y-5 font-serif text-reading text-ink-700 editorial-leading">
            <p>
              市面上大多数所谓 "AI 决策工具", 不过是给 ChatGPT 套一层 UI. 它们卖的是 "AI 的便利".
              我们卖的是另一件事 — 我们卖的是 "AI 不能跳过的步骤".
            </p>
            <p>
              在重大人生决策面前, 你不需要再多一个夸你的 AI. 你需要一个被严格约束 / 长期记得你 /
              不替你做决定, 但保证你不跳过你一个人时会跳过的关键问题的伙伴.
            </p>
            <p>
              7 条决策契约. 12 维结构化分析. PreMortem 反向尸检. 30 / 90 / 365 天回访. 长期记忆.
              在代码里, 不在市场话术里.
            </p>
          </div>
          <div className="mt-10">
            <Link
              href="/methodology"
              className="font-serif text-base text-ink-900 border-b border-seal-500 pb-0.5 hover:text-seal-500 transition-colors"
            >
              读完整方法论 →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TEASER — 摘自一份真实 brief                     */}
      {/* ============================================ */}
      {teaserBrief && (
        <section className="border-t border-paper-300">
          <div className="max-w-prose-xl mx-auto px-6 py-24">
            <div className="flex items-center gap-4 mb-10">
              {/* icon-envelope · 装饰 */}
              <img
                src="/illustrations/icon-envelope.png"
                alt=""
                width={48}
                height={48}
                className="opacity-70"
              />
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500">
                · 摘自一份真实简报 ·
              </p>
            </div>

            <blockquote className="max-w-prose-lg">
              <p className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] text-ink-900 leading-snug tracking-tightish italic mb-10">
                "{teaserBrief.sections.summary.split('。')[0]}."
              </p>
              <footer className="font-sans text-[11px] uppercase tracking-[0.25em] text-ink-500">
                — 摘自 {teaserBrief.briefNumber}  ·  {FRAMEWORK_LABEL[teaserBrief.meta.framework] || teaserBrief.meta.framework}类
              </footer>
            </blockquote>

            <div className="mt-12">
              <Link
                href="/sample-brief"
                className="font-serif text-base text-ink-900 border-b border-seal-500 pb-0.5 hover:text-seal-500 transition-colors"
              >
                读完整简报 →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* WHO IS THIS FOR — 5 类决策                     */}
      {/* ============================================ */}
      <section className="border-t border-paper-300 bg-paper-50">
        <div className="max-w-prose-xl mx-auto px-6 py-24">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-10">
            · 为五类决策而做 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 mb-16 tracking-tightish leading-tight max-w-prose-lg">
            如果你正卡在以下任一类决定上 —
            <br />
            这份服务为你而做.
          </h2>

          <ol className="space-y-12">
            {FIVE_DOMAINS.map((d, i) => {
              const coreImg = [
                '/illustrations/core-01-parent-care.png',
                '/illustrations/core-02-child-path.png',
                '/illustrations/core-03-marriage.png',
                '/illustrations/core-04-career-turn.png',
                '/illustrations/core-05-migration.png',
              ][i];
              return (
                <li
                  key={d.ch}
                  className="grid grid-cols-1 md:grid-cols-[80px_1fr_1.1fr] gap-6 md:gap-10 items-center border-b border-paper-300 pb-10 last:border-b-0"
                >
                  <span className="font-serif italic text-seal-500 text-3xl tracking-widest select-none md:text-right">
                    {['I', 'II', 'III', 'IV', 'V'][i]}.
                  </span>
                  <div className="flex-1 order-3 md:order-2">
                    <h3 className="font-serif text-2xl text-ink-900 tracking-tightish mb-1">
                      {d.ch}
                    </h3>
                    <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-3">
                      {d.en}
                    </p>
                    <p className="font-serif text-[15px] text-ink-500 editorial-leading">
                      {d.note}
                    </p>
                  </div>
                  {coreImg && (
                    <div className="order-2 md:order-3 relative aspect-[16/10] bg-ink-900/5 overflow-hidden">
                      <Image
                        src={coreImg}
                        alt={`${d.ch} · ${d.en}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 32vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ============================================ */}
      {/* MEMBERSHIP TEASER                              */}
      {/* ============================================ */}
      <section className="border-t border-paper-300">
        <div className="max-w-prose-lg mx-auto px-6 py-24">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-8">
            · 加入 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 mb-10 tracking-tightish leading-tight">
            年度顾问会员 · ¥1988.
          </h2>
          <div className="space-y-5 font-serif text-reading text-ink-700 editorial-leading">
            <p>
              请一位资深顾问按小时聊重大决定: ¥1000-3000/小时. 走一遍完整 12 维分析 + 365 天跟踪:
              至少 ¥50,000.
            </p>
            <p>
              KEY 一年: <span className="text-ink-900 font-medium">¥1988</span>. 365 天无限决策简报.
              月度复盘. 30 / 90 / 365 天回访. 第一周不合适, 全退.
            </p>
            <p className="text-ink-500 italic">
              创始会员 (限 100 名) ¥4988 / 三年. 邀请制内测中.
            </p>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row gap-6 items-start sm:items-baseline">
            <Link
              href="/invite"
              className="font-serif text-lg text-ink-900 border-b-2 border-seal-500 pb-1 hover:text-seal-500 transition-colors"
            >
              申请加入 →
            </Link>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline">
              ·
            </span>
            <Link
              href="/sample-brief"
              className="font-serif text-lg text-ink-700 hover:text-seal-500 transition-colors"
            >
              先读样品
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER · editorial colophon                    */}
      {/* ============================================ */}
      <footer className="border-t border-paper-300 bg-paper-50">
        <div className="max-w-prose-xl mx-auto px-6 py-14 text-center">
          {/* 居中 fleuron + icon-quill (右侧装饰) · A8 + icon */}
          <div className="flex justify-center items-center gap-5 mb-8">
            <img
              src="/brand/fleurons/fleuron-key-derived-seal.svg"
              alt=""
              width={56}
              height={56}
              className="opacity-80"
            />
            <img
              src="/illustrations/icon-quill.png"
              alt=""
              width={40}
              height={40}
              className="opacity-60"
            />
          </div>

          <p className="font-serif text-base text-ink-900 mb-4">
            {footer.tagline}
          </p>

          <div className="flex gap-x-5 gap-y-2 text-[10px] font-sans uppercase tracking-[0.25em] text-ink-400 flex-wrap justify-center mb-8">
            {footer.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.emphasis
                    ? 'text-seal-500 hover:text-seal-700 transition-colors'
                    : 'hover:text-seal-500 transition-colors'
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-ink-400 mb-6">
            {footer.subtagline}
          </p>

          <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed whitespace-pre-line max-w-prose-md mx-auto">
            {footer.aigcDisclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Metadata
// ============================================================================
export const metadata = {
  title: 'KEY · AI-Native 决策顾问',
  description:
    '父母养老. 孩子出路. 婚姻去留. 职业转身. 要不要迁移. 这些决定太重, 不能一个人想. KEY 以软件的边际成本, 交付私人顾问级的人生决策结果.',
};
