/**
 * /offline — service worker fallback · 5/20 ship
 *
 * 网断时, SW 找不到缓存就跳到这页.
 * 简洁 · 不假装能用 · 告诉用户怎么办.
 */
import Link from 'next/link';
import KeyWordmark from '@/components/KeyWordmark';

export const metadata = {
  title: 'KEY · 离线',
  description: '网恢复了再来.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-paper text-ink-900 flex flex-col">
      <nav className="max-w-prose-xl mx-auto w-full px-6 pt-10 pb-6">
        <Link href="/" aria-label="KEY home" className="block w-fit">
          <KeyWordmark variant="nav" height={22} />
        </Link>
      </nav>

      <main className="max-w-prose-md mx-auto px-6 flex-1 flex flex-col justify-center text-center pb-24">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
          · 网断了 ·
        </p>
        <h1 className="font-serif text-editorial-lg text-ink-900 tracking-tightish leading-tight mb-6">
          暂时连不上 KEY.
        </h1>
        <p className="font-serif italic text-reading text-ink-500 leading-relaxed mb-10">
          你的档案在云端, 没丢. 网恢复了再来 — KEY 等你.
        </p>
        <div>
          <a
            href="/home"
            className="inline-block px-8 py-3 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 transition-colors"
          >
            重试 →
          </a>
        </div>
        <footer className="pt-16 font-mono text-[10px] uppercase tracking-widest text-ink-400">
          keypoint.life
        </footer>
      </main>
    </div>
  );
}
