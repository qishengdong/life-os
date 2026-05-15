import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';
import { loadPricingContent } from '@/lib/content/pricing';

export const metadata = {
  title: '定价 — KEY',
};

export default function PricingPage() {
  const { hero: HERO, tiers: TIERS, whyThisPrice: WHY, faq: FAQ, footer: FT } = loadPricingContent();

  return (
    <div className="min-h-screen bg-paper">
      <nav className="max-w-prose-xl mx-auto px-6 pt-8 pb-6 flex justify-between items-baseline">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <div className="flex gap-6 text-sm text-ink-500">
          <Link href="/" className="hover:text-seal transition-colors">← 回主页</Link>
        </div>
      </nav>

      <main className="max-w-prose-xl mx-auto px-6 pb-20">
        <header className="pt-16 pb-12 animate-fade-in-soft text-center">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-6">
            {HERO.eyebrow}
          </p>
          <p className="font-serif text-xl md:text-2xl text-seal mb-3 tracking-tightish">
            {HERO.kicker}
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 mb-6 tracking-tighter whitespace-pre-line">
            {HERO.title}
          </h1>
          <p className="font-serif text-reading text-ink-500 editorial-leading max-w-prose-lg mx-auto">
            {HERO.body}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-paper-50 border rounded-sm p-8 ${
                tier.badge ? 'border-seal shadow-sm' : 'border-paper-300'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-seal text-paper text-xs font-sans px-3 py-1 rounded-sm">
                    {tier.badge}
                  </span>
                </div>
              )}

              <header className="mb-6 pb-6 border-b border-paper-300">
                <h2 className="font-serif text-2xl text-ink-900 mb-2">{tier.name}</h2>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-serif text-4xl text-ink-900 font-semibold tracking-tighter">
                    {tier.price}
                  </span>
                  <span className="text-ink-500 font-sans text-sm">{tier.pricePeriod}</span>
                </div>
                <p className="font-mono text-xs text-ink-400 mb-3">{tier.yearly}</p>
                <p className="font-serif text-sm text-ink-500 leading-relaxed">{tier.position}</p>
              </header>

              <ul className="space-y-2.5 mb-8 min-h-[280px]">
                {tier.bullets.map((b, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${b.included ? 'text-ink-700' : 'text-ink-300'}`}>
                    <span className={`font-mono mt-0.5 ${b.included ? 'text-seal' : 'text-ink-300'}`}>
                      {b.included ? '✓' : '—'}
                    </span>
                    <span className={`font-serif ${b.emphasis && b.included ? 'font-medium text-ink-900' : ''}`}>
                      {b.feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={`block text-center py-3 rounded-sm font-medium transition-all ${
                  tier.ctaStyle === 'seal' ? 'btn-seal' : 'btn-ghost'
                }`}
              >
                {tier.cta} →
              </Link>
            </div>
          ))}
        </div>

        {/* 为什么这个价格 */}
        <section className="max-w-prose-lg mx-auto mb-16 animate-fade-in-soft">
          <h2 className="font-serif text-2xl text-ink-900 mb-6 text-center tracking-tightish">
            {WHY.title}
          </h2>
          <div className="prose prose-editorial max-w-none font-serif">
            <p className="whitespace-pre-line">{WHY.intro}</p>
            <ul>
              {WHY.comparisons.map((c, i) => (
                <li key={i}>
                  <strong>{c.name}</strong> {c.price} — {c.note}
                </li>
              ))}
            </ul>
            <p>
              <strong>{WHY.summary}</strong>
            </p>
            <p className="italic text-seal">{WHY.tagline}</p>
          </div>
        </section>

        <section className="max-w-prose-lg mx-auto mb-12 animate-fade-in-soft border-t border-paper-300 pt-12">
          <h2 className="font-serif text-2xl text-ink-900 mb-6 tracking-tightish">
            {FAQ.title}
          </h2>
          <dl className="space-y-8 font-serif">
            {FAQ.items.map((item, i) => (
              <div key={i}>
                <dt className="text-ink-900 mb-2 font-medium">{item.q}</dt>
                <dd className="text-ink-500 text-reading editorial-leading">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="text-center pt-8 border-t border-paper-300">
          <p className="font-mono text-xs text-ink-400 mb-2">{FT.smallText}</p>
          <p className="font-serif text-sm text-ink-400 italic">{FT.italic}</p>
        </footer>
      </main>
    </div>
  );
}
