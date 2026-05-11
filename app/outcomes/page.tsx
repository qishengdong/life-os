'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';

const JUDGMENT_LABEL: Record<string, string> = {
  'as-expected': '基本符合预期',
  'better': '比预期好',
  'worse': '比预期差',
  'mixed': '有得有失',
  'too-early': '还看不清',
  'cancelled': '没真做',
};

const JUDGMENT_COLOR: Record<string, string> = {
  'as-expected': 'text-sage',
  'better': 'text-sage',
  'worse': 'text-ember',
  'mixed': 'text-amber',
  'too-early': 'text-ink-400',
  'cancelled': 'text-ink-400',
};

interface Outcome {
  id: number;
  decisionId: number;
  checkpointDays: number;
  dueAt: number;
  askedAt: number | null;
  userResponse: string | null;
  outcomeJudgment: string | null;
  aiReflection: string | null;
  decisionQuestion: string;
  decisionFramework: string | null;
  decisionCreatedAt: number;
}

interface OutcomeStats {
  totalDecisions: number;
  totalCheckpoints: number;
  resolvedCheckpoints: number;
  dueCheckpoints: number;
  futureCheckpoints: number;
  judgments: {
    asExpected: number; better: number; worse: number; mixed: number; tooEarly: number; cancelled: number;
  };
}

export default function OutcomesPage() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [due, setDue] = useState<Outcome[]>([]);
  const [resolved, setResolved] = useState<Outcome[]>([]);
  const [stats, setStats] = useState<OutcomeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeOutcomeId, setActiveOutcomeId] = useState<number | null>(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedResolvedId, setExpandedResolvedId] = useState<number | null>(null);

  function load(uid: string) {
    fetch('/api/outcomes', { headers: { [UID_HEADER]: uid } })
      .then((r) => r.json())
      .then((d) => {
        setDue(d.due || []);
        setResolved(d.resolved || []);
        setStats(d.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    const uid = getOrCreateClientUid();
    setUserUid(uid);
    load(uid);
  }, []);

  async function submitOutcome(outcomeId: number) {
    if (!userUid || response.length < 20) return;
    setSubmitting(true); setError(null);
    try {
      const res = await fetch('/api/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({ outcomeId, userResponse: response }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '出错了'); }
      else {
        setActiveOutcomeId(null);
        setResponse('');
        load(userUid);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const formatDate = (ts: number) => new Date(ts * 1000).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });

  const regretFreeRate = stats && stats.resolvedCheckpoints > 0
    ? Math.round((stats.judgments.asExpected + stats.judgments.better + stats.judgments.mixed) / stats.resolvedCheckpoints * 100)
    : null;

  return (
    <div className="min-h-screen bg-paper">
      <nav className="max-w-prose-xl mx-auto px-6 pt-8 pb-6 flex justify-between items-baseline">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tightish text-ink-900">
          Life OS
        </Link>
        <div className="flex gap-6 text-sm text-ink-500">
          <Link href="/" className="hover:text-seal transition-colors">← Pulse</Link>
          <Link href="/review" className="hover:text-seal transition-colors">Weekly Review</Link>
          <Link href="/brain" className="hover:text-seal transition-colors">Life Brain</Link>
        </div>
      </nav>

      <main className="max-w-prose-xl mx-auto px-6 pb-20">
        {/* Header */}
        <header className="pt-12 pb-12 animate-fade-in-soft">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-4">
            · Decision Ledger ·
          </p>
          <h1 className="font-serif text-editorial-xl text-ink-900 mb-4 tracking-tighter leading-[1.1]">
            我的决策账本
          </h1>
          <p className="font-serif text-reading text-ink-500 max-w-prose-lg editorial-leading">
            每个重大决策做出后, AI 会在 30 / 90 / 365 天后回来问你"当时担心的事现在怎么样了". 这是 Life OS 真正区别于一次性建议的地方 — 你不只是被分析一次, 是被陪着走过一段路.
          </p>
        </header>

        {/* Stats Dashboard */}
        {stats && stats.totalDecisions > 0 && (
          <section className="mb-12 border-y border-paper-300 py-8 animate-fade-in-soft">
            <p className="font-sans text-xs uppercase tracking-[0.15em] text-seal mb-6">· 你的决策数据 ·</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="font-mono text-3xl text-ink-900 mb-1">{stats.totalDecisions}</div>
                <div className="text-xs uppercase tracking-wider text-ink-400">重大决策</div>
              </div>
              <div>
                <div className="font-mono text-3xl text-ink-900 mb-1">{stats.resolvedCheckpoints}</div>
                <div className="text-xs uppercase tracking-wider text-ink-400">已复盘</div>
              </div>
              <div>
                <div className="font-mono text-3xl text-seal mb-1">{stats.dueCheckpoints}</div>
                <div className="text-xs uppercase tracking-wider text-ink-400">到期待答</div>
              </div>
              <div>
                {regretFreeRate !== null ? (
                  <>
                    <div className="font-mono text-3xl text-sage mb-1">{regretFreeRate}%</div>
                    <div className="text-xs uppercase tracking-wider text-ink-400">不后悔率</div>
                  </>
                ) : (
                  <>
                    <div className="font-mono text-3xl text-ink-400 mb-1">—</div>
                    <div className="text-xs uppercase tracking-wider text-ink-400">不后悔率</div>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {loading && <p className="text-ink-400 font-serif">加载中...</p>}

        {/* Empty state */}
        {!loading && stats && stats.totalDecisions === 0 && (
          <section className="my-16 text-center animate-fade-in-soft">
            <p className="font-serif text-reading text-ink-500 max-w-prose-lg mx-auto editorial-leading">
              你还没做过重大决策. 写下第一个之后, 30 天后 AI 会回来问"当时担心的事现在怎么样了".
            </p>
            <div className="mt-8">
              <Link href="/" className="btn-seal px-6 py-3 rounded-sm">
                写下第一个决策 →
              </Link>
            </div>
          </section>
        )}

        {/* Due outcomes */}
        {!loading && due.length > 0 && (
          <section className="mb-16 animate-fade-in-soft">
            <p className="font-sans text-xs uppercase tracking-[0.15em] text-seal mb-6">· 到了回看时间 · {due.length} 件 ·</p>
            <div className="space-y-6">
              {due.map((o) => {
                const isActive = activeOutcomeId === o.id;
                return (
                  <article key={o.id} className="border-l-4 border-seal pl-6 py-2">
                    <div className="flex justify-between items-baseline mb-2">
                      <p className="font-mono text-xs text-ink-400">
                        {o.checkpointDays} 天前 ({formatDate(o.decisionCreatedAt)}) · {o.decisionFramework || 'general'}
                      </p>
                    </div>
                    <p className="font-serif text-ink-900 mb-3 line-clamp-2">{o.decisionQuestion}</p>
                    {!isActive ? (
                      <button onClick={() => setActiveOutcomeId(o.id)} className="text-sm text-seal hover:text-seal-600 transition-colors">
                        告诉 AI 现在怎么样了 →
                      </button>
                    ) : (
                      <div className="mt-4 animate-fade-in-soft">
                        <p className="font-serif text-sm text-ink-500 mb-3 editorial-leading">
                          当时你担心的事现在怎么样了? 实际发生了什么? 哪个 PreMortem 假设命中了, 哪个完全错了?
                        </p>
                        <textarea
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          rows={5}
                          minLength={20}
                          maxLength={2000}
                          placeholder="20-2000 字. 越具体越好. 例: '我当时担心老婆会反对, 实际她反而轻松了, 因为我没意识到她其实更怕我硬撑. 但我以为离职后会很轻松 — 实际我开始焦虑没收入.'"
                          className="w-full px-4 py-3 rounded-sm font-serif text-reading text-ink-700 resize-none"
                        />
                        <div className="flex justify-between items-center mt-3">
                          <span className="font-mono text-xs text-ink-400">{response.length} / 2000</span>
                          <div className="flex gap-2">
                            <button onClick={() => { setActiveOutcomeId(null); setResponse(''); }} className="text-sm text-ink-500 px-3 py-2">取消</button>
                            <button
                              onClick={() => submitOutcome(o.id)}
                              disabled={submitting || response.length < 20}
                              className="btn-seal px-6 py-2 rounded-sm text-sm"
                            >
                              {submitting ? '处理中...' : '提交 →'}
                            </button>
                          </div>
                        </div>
                        {error && <p className="text-sm text-ember mt-2">{error}</p>}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* No due */}
        {!loading && stats && stats.totalDecisions > 0 && due.length === 0 && stats.resolvedCheckpoints === 0 && (
          <section className="my-16 text-center">
            <p className="font-serif text-reading text-ink-500 max-w-prose-lg mx-auto editorial-leading">
              暂时没有到期的回看. 你最近一次决策的 30 天 checkpoint 还在路上.
            </p>
            <p className="font-mono text-xs text-ink-400 mt-3">
              {stats.futureCheckpoints} 个 checkpoint 在未来等你
            </p>
          </section>
        )}

        {/* Resolved history */}
        {!loading && resolved.length > 0 && (
          <section className="mt-16 pt-8 border-t border-paper-300 animate-fade-in-soft">
            <p className="font-sans text-xs uppercase tracking-[0.15em] text-seal mb-6">· 已复盘 · {resolved.length} 件 ·</p>
            <div className="space-y-1">
              {resolved.map((o) => {
                const isExpanded = expandedResolvedId === o.id;
                const judgmentLabel = o.outcomeJudgment ? JUDGMENT_LABEL[o.outcomeJudgment] : '';
                const judgmentColor = o.outcomeJudgment ? JUDGMENT_COLOR[o.outcomeJudgment] : '';
                return (
                  <article key={o.id} className="border-b border-paper-300 py-4">
                    <button onClick={() => setExpandedResolvedId(isExpanded ? null : o.id)} className="w-full text-left group">
                      <div className="flex justify-between items-baseline mb-2 gap-4">
                        <p className="font-serif text-ink-900 group-hover:text-seal transition-colors line-clamp-1">
                          {o.decisionQuestion}
                        </p>
                        <span className="text-xs text-ink-400 font-mono whitespace-nowrap">{o.checkpointDays}d</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs">
                        <span className={`font-sans ${judgmentColor}`}>{judgmentLabel}</span>
                        <span className="text-ink-400">{isExpanded ? '收起 ▴' : '展开 ▾'}</span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-paper-300 animate-fade-in-soft">
                        <p className="text-xs uppercase tracking-wider text-ink-400 mb-2">你的回答</p>
                        <p className="font-serif text-ink-700 whitespace-pre-wrap mb-4">{o.userResponse}</p>
                        <p className="text-xs uppercase tracking-wider text-ink-400 mb-2">AI 复盘</p>
                        <article className="prose prose-editorial max-w-none font-serif whitespace-pre-wrap text-sm">
                          {o.aiReflection}
                        </article>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <footer className="mt-20 pt-8 border-t border-paper-300 text-center text-xs text-ink-400 font-sans">
          每个重大决策, 30 / 90 / 365 天后 AI 回来问 — 你不只是被分析一次, 是被陪着走过一段路.
        </footer>
      </main>
    </div>
  );
}
