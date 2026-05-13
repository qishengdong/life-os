'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';

interface DecisionRecord {
  id: number;
  question: string;
  ai_response: string;
  model_used: string;
  framework: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  created_at: number;
}

interface MemoryView {
  coreState: any[];
  factual: any[];
  boundary: any[];
  episodic: any[];
  relational: any[];
  psychSignal: any[];
  openLoops: any[];
  brainContent: string | null;
  stats: {
    totalCards: number;
    totalDecisions: number;
    accountAgeDays: number;
  };
}

export default function HistoryPage() {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [memory, setMemory] = useState<MemoryView | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [tab, setTab] = useState<'decisions' | 'memory'>('decisions');

  useEffect(() => {
    const uid = getOrCreateClientUid();
    fetch('/api/history', { headers: { [UID_HEADER]: uid } })
      .then((r) => r.json())
      .then((data) => {
        setDecisions(data.decisions || []);
        setMemory(data.memory || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <nav className="max-w-prose-xl mx-auto px-6 pt-8 pb-6 flex justify-between items-baseline">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tightish text-ink-900">
          KEY
        </Link>
        <div className="flex gap-6 text-sm text-ink-500">
          <Link href="/pulse" className="hover:text-seal transition-colors">← 决策</Link>
          <Link href="/brain" className="hover:text-seal transition-colors">我的 Life Brain</Link>
        </div>
      </nav>

      <main className="max-w-prose-xl mx-auto px-6 pb-20">
        {/* Header */}
        <header className="pt-12 pb-8 animate-fade-in-soft">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-4">
            · Archive ·
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 mb-3 tracking-tighter">
            历史与档案
          </h1>
          {memory && (
            <p className="font-serif text-sm text-ink-500">
              <span className="font-mono">{memory.stats.totalDecisions}</span> 次决策 ·{' '}
              <span className="font-mono">{memory.stats.totalCards}</span> 张 memory 卡 · 账号{' '}
              <span className="font-mono">{memory.stats.accountAgeDays}</span> 天
            </p>
          )}
        </header>

        {/* Tabs */}
        <div className="flex gap-8 mb-10 border-b border-paper-300">
          <button
            onClick={() => setTab('decisions')}
            className={`pb-3 text-sm transition-colors -mb-px ${
              tab === 'decisions'
                ? 'text-seal border-b-2 border-seal font-medium'
                : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            决策历史 ({decisions.length})
          </button>
          <button
            onClick={() => setTab('memory')}
            className={`pb-3 text-sm transition-colors -mb-px ${
              tab === 'memory'
                ? 'text-seal border-b-2 border-seal font-medium'
                : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            AI 关于你的 memory ({memory?.stats.totalCards ?? 0})
          </button>
        </div>

        {loading && <p className="text-ink-400 text-center py-12 font-serif">加载中...</p>}

        {/* Decisions Tab */}
        {tab === 'decisions' && !loading && (
          <>
            {decisions.length === 0 && (
              <div className="text-center py-16 animate-fade-in-soft">
                <p className="font-serif text-reading text-ink-500 mb-6">
                  还没有决策记录.
                </p>
                <Link href="/pulse" className="btn-seal px-6 py-3 rounded-sm">
                  写下第一个决策 →
                </Link>
              </div>
            )}

            <div className="space-y-1">
              {decisions.map((d) => {
                const isExpanded = expandedId === d.id;
                const date = new Date(d.created_at * 1000);
                const dateStr = date.toLocaleString('zh-CN', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit',
                });

                return (
                  <article
                    key={d.id}
                    className="border-b border-paper-300 py-5"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : d.id)}
                      className="w-full text-left group"
                    >
                      <div className="flex justify-between items-baseline gap-4 mb-2">
                        <p className="font-serif text-reading text-ink-900 line-clamp-2 group-hover:text-seal transition-colors">
                          {d.question}
                        </p>
                        <span className="text-xs text-ink-400 whitespace-nowrap font-mono">
                          {dateStr}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span className="px-2 py-0.5 bg-paper-200 text-ink-500 rounded-sm">
                          {d.framework || 'general'}
                        </span>
                        {d.tokens_input && d.tokens_output && (
                          <span className="text-ink-400 font-mono">
                            {d.tokens_input}+{d.tokens_output} tokens
                          </span>
                        )}
                        <span className="text-ink-400 ml-auto">
                          {isExpanded ? '收起 ▴' : '展开 ▾'}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-paper-300 animate-fade-in-soft">
                        <p className="text-xs uppercase tracking-wider text-ink-400 mb-2">
                          原问题
                        </p>
                        <p className="font-serif text-ink-700 mb-6 whitespace-pre-wrap">
                          {d.question}
                        </p>
                        <p className="text-xs uppercase tracking-wider text-ink-400 mb-2">
                          分析
                        </p>
                        <article className="prose prose-editorial max-w-none font-serif whitespace-pre-wrap">
                          {d.ai_response}
                        </article>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}

        {/* Memory Tab */}
        {tab === 'memory' && !loading && memory && (
          <div className="space-y-12 animate-fade-in-soft">
            {memory.coreState.length === 0 &&
              memory.factual.length === 0 &&
              memory.boundary.length === 0 && (
                <div className="text-center py-16">
                  <p className="font-serif text-reading text-ink-500 max-w-prose-lg mx-auto editorial-leading">
                    AI 还没认识你. 跑几次决策, 它就会自动从对话里抽出关于你的硬锚点 / 事实 / 边界 / 事件 / 关系 / 心理信号.
                  </p>
                  <p className="font-serif text-sm text-ink-400 mt-4">
                    完整叙事备忘录见{' '}
                    <Link href="/brain" className="text-seal underline">我的 Life Brain</Link>
                  </p>
                </div>
              )}

            {memory.coreState.length > 0 && (
              <MemorySection
                title="硬锚点"
                description="永久成立的事实, AI 每次回答前都会读"
                items={memory.coreState.map((c: any) => ({
                  title: c.kind, content: c.factText,
                  meta: c.severity === 'hard' ? 'hard' : 'soft',
                }))}
              />
            )}

            {memory.boundary.length > 0 && (
              <MemorySection
                title="你的硬边界"
                description="你明确表达过的不愿被推动的事"
                items={memory.boundary.map((c: any) => ({
                  title: c.title, content: c.content,
                  meta: `${Math.round(c.confidence * 100)}%`,
                }))}
              />
            )}

            {memory.factual.length > 0 && (
              <MemorySection
                title="事实"
                description="可能会变, 当前为真"
                items={memory.factual.map((c: any) => ({
                  title: c.title, content: c.content,
                  meta: `${Math.round(c.confidence * 100)}%`,
                }))}
              />
            )}

            {memory.episodic.length > 0 && (
              <MemorySection
                title="近期事件"
                description="AI 自然引用, 不主动 callback"
                items={memory.episodic.map((c: any) => ({
                  title: c.title, content: c.content,
                  meta: new Date(c.last_verified_at * 1000).toLocaleDateString('zh-CN'),
                }))}
              />
            )}

            {memory.relational.length > 0 && (
              <MemorySection
                title="关系网络"
                description="你跟父母 / 配偶 / 孩子 / 老板 的动态"
                items={memory.relational.map((c: any) => ({
                  title: c.title, content: c.content,
                  meta: `${Math.round(c.confidence * 100)}%`,
                }))}
              />
            )}

            {memory.psychSignal.length > 0 && (
              <MemorySection
                title="心理信号"
                description="AI 用于调整敏感度, 不主动提"
                items={memory.psychSignal.map((c: any) => ({
                  title: c.title, content: c.content,
                  meta: `${Math.round(c.confidence * 100)}%`,
                }))}
              />
            )}

            {memory.openLoops.length > 0 && (
              <MemorySection
                title="待跟进"
                description="你提了但还没解决的事"
                items={memory.openLoops.map((c: any) => ({
                  title: c.title, content: c.description || '',
                  meta: c.kind || '',
                }))}
              />
            )}
          </div>
        )}

        <footer className="mt-20 pt-8 border-t border-paper-300 text-xs text-ink-400 font-sans">
          所有 memory 只在你 Mac 本地 · 永不上传 · 永不外泄
        </footer>
      </main>
    </div>
  );
}

function MemorySection({
  title, description, items,
}: {
  title: string;
  description: string;
  items: Array<{ title: string; content: string; meta: string }>;
}) {
  return (
    <section>
      <header className="mb-4">
        <h2 className="font-serif text-xl text-ink-900 tracking-tightish mb-1">{title}</h2>
        <p className="text-xs text-ink-400 font-sans">{description}</p>
      </header>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="border-l-2 border-paper-300 pl-4 py-2 hover:border-seal transition-colors"
          >
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-serif text-ink-900 font-medium">{item.title}</span>
              <span className="text-xs text-ink-400 font-mono">{item.meta}</span>
            </div>
            {item.content && (
              <p className="font-serif text-sm text-ink-500 editorial-leading">{item.content}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
