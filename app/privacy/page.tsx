import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';
import { loadPrivacyContent } from '@/lib/content/legal';

export const metadata = {
  title: '隐私政策 — KEY',
};

export default function PrivacyPage() {
  const c = loadPrivacyContent();
  return (
    <div className="min-h-screen bg-paper">
      <nav className="max-w-prose-xl mx-auto px-6 pt-8 pb-6 flex justify-between items-baseline">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <Link href="/about" className="text-sm text-ink-500 hover:text-seal transition-colors">
          ← 关于
        </Link>
      </nav>

      <main className="max-w-prose-lg mx-auto px-6 pb-20">
        <header className="pt-12 pb-12">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-4">
            {c.header.eyebrow}
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 mb-3 tracking-tighter">
            {c.header.title}
          </h1>
          <p className="font-mono text-xs text-ink-400">{c.header.subtitle}</p>
        </header>

        <article
          className="prose prose-editorial max-w-none font-serif editorial-leading"
          dangerouslySetInnerHTML={{ __html: c.bodyHtml }}
        />

        <footer className="mt-16 pt-8 border-t border-paper-300 text-center font-mono text-xs text-ink-400">
          {c.footer}
        </footer>
      </main>
    </div>
  );
}
