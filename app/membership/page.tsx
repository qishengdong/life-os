/**
 * /membership — 会员制度页 (long-form essay, 不是 SaaS 网格)
 *
 * 6 节结构:
 *   I.   为什么是年, 不是月
 *   II.  价格的锚 (¥50K vs ¥1988)
 *   III. 三档会员 (观察者 / 年度 / 创始)
 *   IV.  第一周不合适全退
 *   V.   我们不做什么
 *   VI.  怎么加入
 *
 * 视觉一致性: 跟 /methodology + / + /sample-brief 同套 publication-grade pattern.
 */

import Link from 'next/link';
import { loadMembershipContent, type MembershipTier } from '@/lib/content/membership';
import KeyWordmark from '@/components/KeyWordmark';
import PageMasthead from '@/components/PageMasthead';

export const runtime = 'nodejs';

// 兼容旧的 Tier 别名
type Tier = MembershipTier;

// ============================================================================
// 顶部导航
// ============================================================================
function TopNav() {
  return (
    <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
      <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
      <div className="flex gap-6 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
        <Link href="/methodology" className="hover:text-seal-500 transition-colors">
          方法论
        </Link>
        <Link href="/sample-brief" className="hover:text-seal-500 transition-colors">
          样品
        </Link>
        <Link href="/" className="hover:text-seal-500 transition-colors">
          ← Home
        </Link>
      </div>
    </nav>
  );
}

// ============================================================================
// 章节标题
// ============================================================================
function SectionHeader({
  numeral,
  title,
  englishTitle,
}: {
  numeral: string;
  title: string;
  englishTitle: string;
}) {
  return (
    <div className="mb-12">
      <div className="flex items-baseline gap-6 mb-4">
        <span className="font-serif italic text-seal-500 text-5xl tracking-widest select-none leading-none">
          {numeral}.
        </span>
        <div>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight">
            {title}
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mt-2">
            {englishTitle}
          </p>
        </div>
      </div>
      <div className="h-px w-16 bg-seal-500/60" />
    </div>
  );
}

// ============================================================================
// 段落 essay 组件
// ============================================================================
function Essay({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-5">
      {paragraphs.map((p, i) => (
        <p key={i} className="font-serif text-reading text-ink-700 editorial-leading">
          {p}
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// 三档会员单档渲染 (像杂志侧边专栏, 不像 SaaS pricing card)
// ============================================================================
function TierBlock({ tier }: { tier: Tier }) {
  return (
    <article className="py-12 border-t border-paper-300 first:border-t-0">
      <div className="grid md:grid-cols-[200px_1fr] gap-10">
        {/* 左栏: 名称 + 价格 */}
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
            会员 · {tier.numeral}
          </p>
          <h3 className="font-serif text-3xl text-ink-900 tracking-tightish mb-1">
            {tier.name}
          </h3>
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-6">
            {tier.englishName}
          </p>
          <div className="font-serif text-4xl text-ink-900 tracking-tighter mb-1">
            {tier.price}
          </div>
          <p className="font-serif italic text-sm text-ink-500">{tier.priceNote}</p>
        </div>

        {/* 右栏: 详情 */}
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-3">
            适合谁
          </p>
          <p className="font-serif text-reading text-ink-900 editorial-leading mb-8">
            {tier.who}
          </p>

          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-3">
            交付内容
          </p>
          <ol className="space-y-2 mb-8">
            {tier.includes.map((item, i) => (
              <li
                key={i}
                className="font-serif text-[15px] text-ink-700 editorial-leading flex gap-3"
              >
                <span className="font-serif italic text-seal-500 text-sm w-5 shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>

          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-3">
            注脚
          </p>
          <p className="font-serif italic text-[15px] text-ink-500 editorial-leading">
            {tier.notes}
          </p>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// 主页面
// ============================================================================
export default function MembershipPage() {
  const {
    hero: HERO,
    whyYear: WHY_YEAR,
    anchor: ANCHOR,
    tiers: TIERS,
    refund: REFUND,
    weDoNot: WE_DO_NOT,
    join: JOIN,
  } = loadMembershipContent();

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <TopNav />
      <PageMasthead eyebrow="MEMBERSHIP" volume="创始号" right="MMXXVI" />

      {/* ============================================ */}
      {/* HERO                                          */}
      {/* ============================================ */}
      <header className="max-w-prose-lg mx-auto px-6 pt-20 pb-20 border-b border-paper-300">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
          {HERO.eyebrow}
        </p>
        <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter mb-10 leading-[1.1]">
          {HERO.title}
        </h1>
        <div className="space-y-5 max-w-prose-lg">
          {HERO.subtitle.map((p, i) => (
            <p
              key={i}
              className="font-serif text-reading text-ink-700 editorial-leading"
            >
              {p}
            </p>
          ))}
        </div>
      </header>

      {/* ============================================ */}
      {/* I. 为什么是年, 不是月                          */}
      {/* ============================================ */}
      <section className="max-w-prose-xl mx-auto px-6 py-24 border-b border-paper-300">
        <SectionHeader
          numeral={WHY_YEAR.numeral}
          title={WHY_YEAR.title}
          englishTitle={WHY_YEAR.englishTitle}
        />
        <Essay paragraphs={WHY_YEAR.body} />
      </section>

      {/* ============================================ */}
      {/* II. 价格的锚                                  */}
      {/* ============================================ */}
      <section className="bg-paper-50 border-b border-paper-300">
        <div className="max-w-prose-xl mx-auto px-6 py-24">
          <SectionHeader
            numeral={ANCHOR.numeral}
            title={ANCHOR.title}
            englishTitle={ANCHOR.englishTitle}
          />

          {/* B8 · 三 anchor 卡, 宽度可视化 (100% / 6% / 4%) */}
          <div className="my-12 space-y-4">
            {/* Card 1 · ¥50K full-width */}
            <div className="bg-paper-200/80 h-20 md:h-24 px-5 md:px-8 flex items-center justify-between gap-6">
              <span className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.28em] text-ink-700 leading-snug">
                RESIDENT CONSULTANT · 12-DIM + 365D
              </span>
              <span className="font-serif text-xl md:text-2xl text-ink-900 tracking-tightish shrink-0">
                ≥ ¥50,000
              </span>
            </div>
            {/* Card 2 · ¥3K 6% width (mobile full) */}
            <div className="flex items-stretch gap-5">
              <div className="bg-paper-200/80 h-20 md:h-24 w-full md:w-[6%] md:min-w-[60px] px-4 md:px-3 flex items-center md:justify-center">
                <span className="md:hidden font-sans text-[10px] uppercase tracking-[0.28em] text-ink-700">
                  RESIDENT CONSULTANT · 1 HR
                </span>
              </div>
              <div className="hidden md:flex flex-col justify-center">
                <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-ink-700 mb-1">
                  RESIDENT CONSULTANT · 1 HR
                </span>
                <span className="font-serif text-xl text-ink-700">¥1,000–3,000</span>
              </div>
              <div className="md:hidden flex flex-col justify-center ml-auto">
                <span className="font-serif text-base text-ink-700">¥1,000–3,000</span>
              </div>
            </div>
            {/* Card 3 · KEY ¥1988 4% width BURGUNDY */}
            <div className="flex items-stretch gap-5">
              <div className="bg-seal-500 h-20 md:h-24 w-full md:w-[4%] md:min-w-[44px] px-4 md:px-2 flex items-center md:justify-center">
                <span className="md:hidden font-sans text-[10px] uppercase tracking-[0.28em] text-paper-100">
                  KEY · ANNUAL
                </span>
              </div>
              <div className="hidden md:flex flex-col justify-center">
                <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-seal-500 mb-1">
                  KEY · ANNUAL
                </span>
                <span className="font-serif text-2xl text-seal-500 tracking-tighter">¥1988</span>
              </div>
              <div className="md:hidden flex flex-col justify-center ml-auto">
                <span className="font-serif text-base text-seal-500">¥1988</span>
              </div>
            </div>
          </div>

          <Essay paragraphs={ANCHOR.body} />
        </div>
      </section>

      {/* ============================================ */}
      {/* III. 我们不做什么 (B7 · 移到 tiers 前)         */}
      {/* ============================================ */}
      <section className="max-w-prose-xl mx-auto px-6 py-24 border-b border-paper-300">
        <SectionHeader
          numeral={WE_DO_NOT.numeral}
          title={WE_DO_NOT.title}
          englishTitle={WE_DO_NOT.englishTitle}
        />
        <p className="font-serif text-reading text-ink-700 editorial-leading max-w-prose-lg mb-12">
          {WE_DO_NOT.intro}
        </p>

        <ol className="space-y-8">
          {WE_DO_NOT.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-6 border-b border-paper-300 pb-8 last:border-b-0"
            >
              <span className="font-serif italic text-seal-500 text-xl tracking-widest select-none w-10 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <h3 className="font-serif text-xl text-ink-900 mb-3 tracking-tightish">
                  {item.title}
                </h3>
                <p className="font-serif text-reading text-ink-500 editorial-leading">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ============================================ */}
      {/* IV. 三档会员 (B7 · 原 III, 现 IV)              */}
      {/* ============================================ */}
      <section className="bg-paper-50 border-b border-paper-300">
        <div className="max-w-prose-xl mx-auto px-6 py-24">
          <SectionHeader
            numeral="IV"
            title="三档会员"
            englishTitle="Three Tiers"
          />
          <div>
            {TIERS.map((t) => (
              <TierBlock key={t.numeral} tier={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* V. 第一周不合适全退 (B7 · 原 IV, 现 V)         */}
      {/* ============================================ */}
      <section className="max-w-prose-xl mx-auto px-6 py-24 border-b border-paper-300">
        <SectionHeader
          numeral={REFUND.numeral}
          title={REFUND.title}
          englishTitle={REFUND.englishTitle}
        />
        <Essay paragraphs={REFUND.body} />

        <div className="mt-10 pl-6 border-l-2 border-seal-500/40">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-seal-500 mb-3">
            流程
          </p>
          <ol className="space-y-2">
            {REFUND.process.map((step, i) => (
              <li
                key={i}
                className="font-serif text-[15px] text-ink-700 editorial-leading flex gap-3"
              >
                <span className="font-serif italic text-seal-500 text-sm w-5 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================================ */}
      {/* VI. 怎么加入                                  */}
      {/* ============================================ */}
      <section className="bg-paper-50">
        <div className="max-w-prose-lg mx-auto px-6 py-24">
          <SectionHeader
            numeral={JOIN.numeral}
            title={JOIN.title}
            englishTitle={JOIN.englishTitle}
          />
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-6">
            {JOIN.body[0]}
          </p>
          <ol className="space-y-2 mb-12 pl-6 border-l-2 border-seal-500/40">
            {JOIN.steps.map((s, i) => (
              <li
                key={i}
                className="font-serif text-[15px] text-ink-700 editorial-leading flex gap-3"
              >
                <span className="font-serif italic text-seal-500 text-sm w-5 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>

          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-baseline">
            <a
              href={JOIN.ctaPrimary.href}
              className="font-serif text-lg text-ink-900 border-b-2 border-seal-500 pb-1 hover:text-seal-500 transition-colors"
            >
              {JOIN.ctaPrimary.label} →
            </a>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline">
              ·
            </span>
            <Link
              href={JOIN.ctaSecondary.href}
              className="font-serif text-base text-ink-700 hover:text-seal-500 transition-colors"
            >
              {JOIN.ctaSecondary.label}
            </Link>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline">
              ·
            </span>
            <Link
              href={JOIN.ctaTertiary.href}
              className="font-serif text-base text-ink-700 hover:text-seal-500 transition-colors"
            >
              {JOIN.ctaTertiary.label}
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER                                        */}
      {/* ============================================ */}
      <footer className="border-t border-paper-300 bg-paper">
        <div className="max-w-prose-xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-6">
            <div className="flex items-center gap-3">
              <KeyWordmark variant="mark-only" height={20} ariaLabel="KEY mark" />
              <p className="font-serif text-base text-ink-900">
                KEY Editorial Office · Membership
              </p>
            </div>
            <div className="flex gap-6 text-[10px] font-sans uppercase tracking-[0.25em] text-ink-400">
              <Link href="/methodology" className="hover:text-seal-500 transition-colors">方法论</Link>
              <Link href="/sample-brief" className="hover:text-seal-500 transition-colors">样品</Link>
              <Link href="/" className="hover:text-seal-500 transition-colors">封面</Link>
              <Link href="/terms" className="hover:text-seal-500 transition-colors">服务条款</Link>
              <Link href="/privacy" className="hover:text-seal-500 transition-colors">隐私</Link>
            </div>
          </div>
          <p className="mt-6 text-[10px] font-sans uppercase tracking-[0.25em] text-ink-400">
            邀请制内测中 · AIGC 备案中 · 第一周不合适全退
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
  title: 'Membership · KEY',
  description:
    '年度顾问会员 ¥1988. 私人决策顾问的产出, AI 的边际成本, 杂志级的阅读体验. 第一周不合适全退. 邀请制内测中.',
};
