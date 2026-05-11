'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';

interface BrainData {
  brainContent: string | null;
  stats: {
    totalCards: number;
    totalDecisions: number;
    accountAgeDays: number;
  };
}

export default function BrainPage() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [data, setData] = useState<BrainData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getOrCreateClientUid();
    setUserUid(uid);
    fetch('/api/history', { headers: { [UID_HEADER]: uid } })
      .then((r) => r.json())
      .then((d) => {
        setData({
          brainContent: d.memory?.brainContent || null,
          stats: d.memory?.stats || { totalCards: 0, totalDecisions: 0, accountAgeDays: 0 },
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <nav className="max-w-prose-xl mx-auto px-6 pt-8 pb-6 flex justify-between items-baseline">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tightish text-ink-900">
          Life OS
        </Link>
        <div className="flex gap-6 text-sm text-ink-500">
          <Link href="/" className="hover:text-seal transition-colors">
            ← 决策
          </Link>
          <Link href="/history" className="hover:text-seal transition-colors">
            历史
          </Link>
        </div>
      </nav>

      <main className="max-w-prose-xl mx-auto px-6 pb-20">
        {/* Header */}
        <header className="pt-16 pb-12 animate-fade-in-soft">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-6">
            · Memorandum ·
          </p>
          <h1 className="font-serif text-editorial-xl text-ink-900 mb-6 tracking-tighter">
            我的 Life Brain
          </h1>
          <p className="font-serif text-reading text-ink-500 max-w-prose-lg editorial-leading">
            这是 AI 写给"未来的自己"的, 关于你的备忘录.
            它整合了你跟我聊过的所有重大决策、抽出来的事实、看到的人生模式. 每过一段时间自动更新.
          </p>
          <p className="font-serif text-sm text-ink-400 mt-4 italic">
            "我之所以懂你, 是因为我一直在场."
          </p>
        </header>

        {/* Stats strip */}
        {data && (
          <div className="border-t border-b border-paper-300 py-4 my-8 flex justify-between text-xs font-mono text-ink-500">
            <span>{data.stats.totalDecisions} 次决策</span>
            <span>·</span>
            <span>{data.stats.totalCards} 张 memory 卡</span>
            <span>·</span>
            <span>账号 {data.stats.accountAgeDays} 天</span>
          </div>
        )}

        {/* Brain content */}
        {loading && (
          <p className="text-ink-400 text-center py-12 font-serif">加载中...</p>
        )}

        {!loading && data && !data.brainContent && (
          <div className="text-center py-16 animate-fade-in-soft">
            <p className="font-serif text-reading text-ink-500 max-w-prose-lg mx-auto editorial-leading">
              你的 Life Brain 还没生成.
              AI 需要先认识你 — 至少 5 次重大决策对话, 或先完成{' '}
              <Link href="/onboarding" className="text-seal underline hover:text-seal-600">
                30 分钟深度建档
              </Link>
              , 它就会写出关于你的第一版备忘录.
            </p>
            <p className="mt-6 font-sans text-sm text-ink-400">
              当前: <strong className="text-ink-700 font-mono">{data.stats.totalDecisions}</strong> 次决策 · 距首次蒸馏还需{' '}
              <strong className="text-ink-700 font-mono">{Math.max(0, 5 - data.stats.totalDecisions)}</strong> 次
            </p>
            <div className="mt-10 flex gap-3 justify-center">
              <Link href="/onboarding" className="btn-seal px-6 py-3 rounded-sm">
                深度建档 →
              </Link>
              <Link href="/" className="btn-ghost px-6 py-3 rounded-sm">
                先聊一个决策
              </Link>
            </div>
          </div>
        )}

        {!loading && data && data.brainContent && (
          <article className="prose prose-editorial max-w-none font-serif animate-fade-in-soft whitespace-pre-wrap mt-8">
            {data.brainContent}
          </article>
        )}

        {/* Footer note */}
        {!loading && data && data.brainContent && (
          <footer className="mt-20 pt-8 border-t border-paper-300">
            <p className="font-sans text-xs text-ink-400 mb-2 uppercase tracking-wider">
              · About this brain ·
            </p>
            <p className="font-serif text-sm text-ink-500 editorial-leading">
              这份备忘录由 AI 自动写, 基于你过去的对话. 它会持续更新.
              你下次跟我聊新决定时, 我会读完这份再开口 — 这是我"记得你"的方式.
            </p>
            <p className="font-serif text-sm text-ink-400 mt-3 editorial-leading">
              如果你觉得某句话误解了你, 告诉我 — V1.5 后你可以直接编辑.
            </p>
          </footer>
        )}
      </main>
    </div>
  );
}
