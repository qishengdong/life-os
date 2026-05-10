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
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-baseline">
          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">历史与记忆</h1>
            {memory && (
              <p className="text-zinc-400 text-sm">
                {memory.stats.totalDecisions} 次决策 · {memory.stats.totalCards} 条 memory · 账号 {memory.stats.accountAgeDays} 天
              </p>
            )}
          </div>
          <Link
            href="/"
            className="text-zinc-400 hover:text-zinc-100 text-sm transition"
          >
            ← 返回
          </Link>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-zinc-800">
          <button
            onClick={() => setTab('decisions')}
            className={`px-4 py-2 text-sm transition ${
              tab === 'decisions'
                ? 'text-zinc-100 border-b-2 border-zinc-100 -mb-px'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            决策历史 ({decisions.length})
          </button>
          <button
            onClick={() => setTab('memory')}
            className={`px-4 py-2 text-sm transition ${
              tab === 'memory'
                ? 'text-zinc-100 border-b-2 border-zinc-100 -mb-px'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            AI 关于你的 memory ({memory?.stats.totalCards ?? 0})
          </button>
        </div>

        {loading && <p className="text-zinc-500">加载中...</p>}

        {/* Decisions tab */}
        {tab === 'decisions' && !loading && (
          <>
            {decisions.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">
                还没有决策记录。
                <Link href="/" className="text-zinc-300 hover:text-white underline ml-1">
                  去拆解第一个
                </Link>
              </div>
            )}

            <div className="space-y-3">
              {decisions.map((d) => {
                const isExpanded = expandedId === d.id;
                const date = new Date(d.created_at * 1000);
                const dateStr = date.toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={d.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : d.id)}
                      className="w-full text-left p-5 hover:bg-zinc-800 transition"
                    >
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <p className="text-zinc-100 line-clamp-2">{d.question}</p>
                        <span className="text-zinc-600 text-xs whitespace-nowrap">{dateStr}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                          {d.framework || 'general'}
                        </span>
                        {d.tokens_input && d.tokens_output && (
                          <span className="text-zinc-600">
                            {d.tokens_input}+{d.tokens_output} tokens
                          </span>
                        )}
                        <span className="text-zinc-600 ml-auto">
                          {isExpanded ? '收起 ▲' : '展开 ▼'}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-zinc-800 p-5 bg-zinc-950/50">
                        <div className="mb-3">
                          <p className="text-xs text-zinc-500 mb-1">原问题:</p>
                          <p className="text-zinc-300 text-sm whitespace-pre-wrap">{d.question}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">分析结果:</p>
                          <article className="prose prose-invert prose-sm prose-zinc max-w-none whitespace-pre-wrap font-sans">
                            {d.ai_response}
                          </article>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Memory tab */}
        {tab === 'memory' && !loading && memory && (
          <div className="space-y-6">
            {memory.coreState.length === 0 &&
              memory.factual.length === 0 &&
              memory.boundary.length === 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">
                  AI 还没认识你。
                  <Link href="/" className="text-zinc-300 hover:text-white underline ml-1">
                    跑几次决策
                  </Link>{' '}
                  后,这里会逐渐积累 AI 关于你的硬锚点 / 事实 / 边界 / 事件 / 关系 / 心理信号.
                </div>
              )}

            {memory.coreState.length > 0 && (
              <MemorySection
                title="🔒 硬锚点 (永远成立的事实)"
                description="prompt 第 0 行注入,绝不能违反"
                items={memory.coreState.map((c: any) => ({
                  title: c.kind,
                  content: c.fact_text || c.factText,
                  meta: c.severity === 'hard' ? 'hard' : 'soft',
                }))}
                color="emerald"
              />
            )}

            {memory.boundary.length > 0 && (
              <MemorySection
                title="🚧 用户表达的硬边界"
                description="高置信度 boundary 也会 prepend 到 prompt 顶部"
                items={memory.boundary.map((c: any) => ({
                  title: c.title,
                  content: c.content,
                  meta: `confidence ${Math.round(c.confidence * 100)}%`,
                }))}
                color="amber"
              />
            )}

            {memory.factual.length > 0 && (
              <MemorySection
                title="📋 事实卡 (factual)"
                description="可能变化的软事实, append 到 prompt 末尾"
                items={memory.factual.map((c: any) => ({
                  title: c.title,
                  content: c.content,
                  meta: `confidence ${Math.round(c.confidence * 100)}%`,
                }))}
                color="zinc"
              />
            )}

            {memory.episodic.length > 0 && (
              <MemorySection
                title="📅 事件记忆 (episodic)"
                description="最近发生的事, AI 用于自然引用,不主动 callback"
                items={memory.episodic.map((c: any) => ({
                  title: c.title,
                  content: c.content,
                  meta: new Date(c.last_verified_at * 1000).toLocaleDateString('zh-CN'),
                }))}
                color="zinc"
              />
            )}

            {memory.relational.length > 0 && (
              <MemorySection
                title="🤝 关系网络 (relational)"
                description="用户跟父母 / 配偶 / 老板 / 兄弟姐妹的关系动态"
                items={memory.relational.map((c: any) => ({
                  title: c.title,
                  content: c.content,
                  meta: `confidence ${Math.round(c.confidence * 100)}%`,
                }))}
                color="zinc"
              />
            )}

            {memory.psychSignal.length > 0 && (
              <MemorySection
                title="🧠 心理信号 (psych_signal)"
                description="用于敏感度调整,AI 不主动提"
                items={memory.psychSignal.map((c: any) => ({
                  title: c.title,
                  content: c.content,
                  meta: `confidence ${Math.round(c.confidence * 100)}%`,
                }))}
                color="purple"
              />
            )}

            {memory.openLoops.length > 0 && (
              <MemorySection
                title="🔄 待跟进 (open loops)"
                description="用户提了但没解决的事,AI 主动 callback 时使用"
                items={memory.openLoops.map((c: any) => ({
                  title: c.title,
                  content: c.description || '',
                  meta: c.kind || '',
                }))}
                color="blue"
              />
            )}
          </div>
        )}

        <footer className="mt-16 text-center text-zinc-700 text-xs">
          所有 memory 只在你 Mac 本地 SQLite · 永不上传 · 永不外泄
        </footer>
      </div>
    </div>
  );
}

function MemorySection({
  title,
  description,
  items,
  color,
}: {
  title: string;
  description: string;
  items: Array<{ title: string; content: string; meta: string }>;
  color: string;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-zinc-300 mb-1">{title}</h2>
      <p className="text-xs text-zinc-600 mb-3">{description}</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
          >
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-zinc-100 text-sm font-medium">{item.title}</span>
              <span className="text-zinc-600 text-xs">{item.meta}</span>
            </div>
            {item.content && (
              <p className="text-zinc-400 text-sm">{item.content}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
