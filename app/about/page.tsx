import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';
import { loadAboutContent } from '@/lib/content/about';

export const metadata = {
  title: '关于 KEY',
};

export default function AboutPage() {
  const c = loadAboutContent();
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
        <header className="pt-12 pb-12 animate-fade-in-soft">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_0.85fr] gap-10 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-6">
                {c.hero.eyebrow}
              </p>
              <h1 className="font-serif text-editorial-lg text-ink-900 mb-4 tracking-tighter">
                {c.hero.title}
              </h1>
              <p className="font-serif text-reading text-ink-500 editorial-leading">
                {c.hero.subtitle}
              </p>
            </div>
            <div className="order-1 md:order-2 relative aspect-[4/5] bg-ink-900/5 overflow-hidden">
              <img
                src="/illustrations/channel-about.png"
                alt="半开的古典木门"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-seal-500" />
            </div>
          </div>
        </header>

        <section className="mb-16 animate-fade-in-soft">
          <p className="font-serif text-2xl text-seal mb-3 tracking-tightish leading-tight">
            {c.intro.kicker}
          </p>
          <h2 className="font-serif text-3xl text-ink-900 mb-6 tracking-tighter leading-tight">
            {c.intro.title}
          </h2>
          <div className="prose prose-editorial max-w-none font-serif">
            {c.intro.body.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
            <p className="text-xl italic text-ink-900 border-l-4 border-seal pl-6 my-10 leading-snug">
              {c.intro.tagline}
            </p>
          </div>
        </section>

        <section className="mb-16 animate-fade-in-soft">
          <h2 className="font-serif text-2xl text-ink-900 mb-5 tracking-tightish">
            {c.notWhat.title}
          </h2>
          <ul className="font-serif text-reading text-ink-700 space-y-3 editorial-leading">
            {c.notWhat.items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-seal">·</span>
                <span dangerouslySetInnerHTML={{
                  __html: item.replace(/\[([^\]]+)\]/g, '<span class="font-mono text-seal">$1</span>'),
                }} />
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16 animate-fade-in-soft">
          <h2 className="font-serif text-2xl text-ink-900 mb-5 tracking-tightish">
            {c.privacy.title}
          </h2>
          <ul className="font-serif text-reading text-ink-700 space-y-3 editorial-leading">
            {c.privacy.items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-seal font-mono">{String(i + 1).padStart(2, '0')}</span>
                <span dangerouslySetInnerHTML={{
                  __html: item.replace(
                    /\[([^\]]+)\]\(([^)]+)\)/g,
                    '<a href="$2" class="text-seal underline hover:text-seal-600">$1</a>',
                  ),
                }} />
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16 animate-fade-in-soft">
          <h2 className="font-serif text-2xl text-ink-900 mb-5 tracking-tightish">
            {c.emergency.title}
          </h2>
          <p className="font-serif text-reading text-ink-500 mb-4">{c.emergency.intro}</p>
          <div className="bg-paper-200 border-l-4 border-seal p-6 space-y-2 font-serif text-ink-700">
            {c.emergency.contacts.map((contact, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <span>{contact.label}</span>
                <span className="font-mono text-seal">{contact.phone}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {c.links.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="border border-paper-300 rounded-sm p-6 hover:border-seal transition-colors group"
            >
              <h3 className="font-serif text-lg text-ink-900 mb-2 group-hover:text-seal">
                {link.label}
              </h3>
              <p className="text-sm text-ink-500 font-sans">{link.desc}</p>
            </Link>
          ))}
        </div>

        <footer className="text-center pt-8 border-t border-paper-300">
          <p className="font-mono text-xs text-ink-400">{c.footer.smallText}</p>
          <p className="font-serif text-sm text-ink-400 italic mt-4">{c.footer.italic}</p>
        </footer>
      </main>
    </div>
  );
}
