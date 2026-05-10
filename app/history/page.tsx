'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DecisionRecord {
  id: number;
  user_id: number;
  question: string;
  ai_response: string;
  model_used: string;
  tokens_input: number | null;
  tokens_output: number | null;
  created_at: number;
  birth_date: string;
  gender: string;
}

export default function HistoryPage() {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then((data) => {
        setDecisions(data.decisions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex justify-between items-baseline">
          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">决策历史</h1>
            <p className="text-zinc-400 text-sm">
              共 {decisions.length} 条 · 永远只在你本地 SQLite 里
            </p>
          </div>
          <Link
            href="/"
            className="text-zinc-400 hover:text-zinc-100 text-sm transition"
          >
            ← 返回
          </Link>
        </header>

        {loading && <p className="text-zinc-500">加载中...</p>}

        {!loading && decisions.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">
            还没有决策记录。<Link href="/" className="text-zinc-300 hover:text-white underline ml-1">去拆解第一个</Link>
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
            const framework = d.model_used?.split('/').pop() || 'general';

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
                      {framework}
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

        <footer className="mt-16 text-center text-zinc-700 text-xs">
          所有决策记录只在你 Mac 本地 SQLite · 永不上传 · 永不外泄
        </footer>
      </div>
    </div>
  );
}
