'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import KeyWordmark from '@/components/KeyWordmark';

interface ReviewRecord {
  id: number;
  weekStart: number;
  weekEnd: number;
  content: string;
  pulseCount: number;
  decisionCount: number;
  charCount: number;
  readAt: number | null;
  generatedAt: number;
}

export default function ReviewPage() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [current, setCurrent] = useState<ReviewRecord | null>(null);
  const [history, setHistory] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  function loadReview(uid: string, markRead = false) {
    const suffix = markRead ? '?mark=1' : '';
    fetch(`/api/sunday-review${suffix}`, { headers: { [UID_HEADER]: uid } })
      .then((r) => r.json())
      .then((d) => {
        setCurrent(d.currentWeek);
        setHistory(d.history || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    const uid = getOrCreateClientUid();
    setUserUid(uid);
    loadReview(uid, true); // 自动标记已读
  }, []);

  async function triggerGenerate(force = false) {
    if (!userUid) return;
    setGenerating(true); setError(null);
    try {
      const res = await fetch(`/api/sunday-review${force ? '?force=1' : ''}`, {
        method: 'POST',
        headers: { [UID_HEADER]: userUid },
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        setError(data.error || data.reason || '生成失败');
      } else {
        loadReview(userUid);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  const formatRange = (start: number, end: number) => {
    const s = new Date(start * 1000);
    const e = new Date(end * 1000);
    const sStr = s.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    const eStr = e.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    return `${sStr} → ${eStr}`;
  };

  return (
    <div className="min-h-screen bg-paper">
      <nav className="max-w-prose-xl mx-auto px-6 pt-8 pb-6 flex justify-between items-baseline">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <div className="flex gap-6 text-sm text-ink-500">
          <Link href="/pulse" className="hover:text-seal transition-colors">← Pulse</Link>
          <Link href="/brain" className="hover:text-seal transition-colors">Life Brain</Link>
          <Link href="/history" className="hover:text-seal transition-colors">历史</Link>
        </div>
      </nav>

      <main className="max-w-prose-xl mx-auto px-6 pb-20">
        {/* Header */}
        <header className="pt-12 pb-12 animate-fade-in-soft">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-4">
            · Weekly Review ·
          </p>
          <h1 className="font-serif text-editorial-xl text-ink-900 mb-4 tracking-tighter leading-[1.1]">
            这周 AI 看见了什么
          </h1>
          <p className="font-serif text-reading text-ink-500 max-w-prose-lg editorial-leading">
            每周, AI 把你这 7 天的 Pulse 和决策放在一起, 找你反复提到的事、你没说出口的张力、下周值得观察的信号. 不是流水账, 是 pattern recognition.
          </p>
          <p className="font-serif text-lg text-ink-900 mt-6 italic border-l-4 border-seal pl-4">
            "在人生最难选的时候, 有一个长期记得你的人."
          </p>
        </header>

        {loading && <p className="text-ink-400 font-serif">加载中...</p>}

        {/* Current Week */}
        {!loading && current && (
          <section className="mb-16 animate-fade-in-soft">
            <div className="flex justify-between items-baseline mb-6 pb-3 border-b border-paper-300">
              <div>
                <p className="font-sans text-xs uppercase tracking-[0.15em] text-seal">本周</p>
                <p className="font-mono text-sm text-ink-500 mt-1">
                  {formatRange(current.weekStart, current.weekEnd)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-ink-400">
                  {current.pulseCount} Pulses · {current.decisionCount} 决策
                </p>
                <p className="font-mono text-xs text-ink-400 mt-1">
                  {current.charCount} 字
                </p>
              </div>
            </div>
            <article className="prose prose-editorial max-w-none font-serif whitespace-pre-wrap">
              {current.content}
            </article>
          </section>
        )}

        {/* No review yet */}
        {!loading && !current && (
          <section className="my-16 text-center animate-fade-in-soft">
            <p className="font-serif text-reading text-ink-500 mb-8 editorial-leading max-w-prose-lg mx-auto">
              本周还没有 Review.
              <br />
              当你这周写过 ≥3 条 Pulses, 可以生成 — 也可以等周日 20:00 自动出.
            </p>
            <button
              onClick={() => triggerGenerate(false)}
              disabled={generating}
              className="btn-seal px-8 py-3 rounded-sm"
            >
              {generating ? '生成中... (15-30 秒)' : '生成本周 Review'}
            </button>
          </section>
        )}

        {/* Force regenerate option */}
        {!loading && current && (
          <div className="my-8 text-center">
            <button
              onClick={() => triggerGenerate(true)}
              disabled={generating}
              className="text-sm text-ink-400 hover:text-seal transition-colors"
            >
              {generating ? '重新生成中...' : '重新生成本周 Review (覆盖)'}
            </button>
          </div>
        )}

        {error && (
          <div className="my-8 p-4 border-l-2 border-ember bg-paper-200">
            <p className="text-sm text-ember font-sans">{error}</p>
          </div>
        )}

        {/* History */}
        {!loading && history.length > 1 && (
          <section className="mt-16 pt-8 border-t border-paper-300 animate-fade-in-soft">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-4">
              · 历史 · {history.length - 1} 周回顾 ·
            </p>
            <div className="space-y-1">
              {history.slice(1).map((r) => {
                const isExpanded = expandedHistoryId === r.id;
                return (
                  <article key={r.id} className="border-b border-paper-300 py-4">
                    <button
                      onClick={() => setExpandedHistoryId(isExpanded ? null : r.id)}
                      className="w-full text-left group"
                    >
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="font-serif text-ink-900 group-hover:text-seal transition-colors">
                          {formatRange(r.weekStart, r.weekEnd)}
                        </p>
                        <span className="text-xs text-ink-400 font-mono">
                          {r.pulseCount} Pulses · {r.charCount} 字
                        </span>
                      </div>
                    </button>
                    {isExpanded && (
                      <article className="mt-4 pt-4 border-t border-paper-300 prose prose-editorial max-w-none font-serif whitespace-pre-wrap animate-fade-in-soft">
                        {r.content}
                      </article>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <footer className="mt-20 pt-8 border-t border-paper-300">
          <p className="font-sans text-xs text-ink-400 text-center">
            Sunday Review 每周日 20:00 自动生成 (V1.5 加 cron 后).
            <br />
            目前手动触发. Pro 用户永久存档, Free 用户 30 天后归档.
          </p>
        </footer>
      </main>
    </div>
  );
}
