'use client';

import { useState } from 'react';

export default function Home() {
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('female');
  const [decision, setDecision] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ model?: string; provider?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAnalysis(null);
    setError(null);
    setMeta(null);

    try {
      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, gender, decision }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '出错了');
      } else {
        setAnalysis(data.analysis);
        setMeta({ model: data.model, provider: data.provider });
      }
    } catch (err: any) {
      setError(err.message || '网络错误');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-3 tracking-tight">Life OS</h1>
          <p className="text-zinc-400 text-lg">反鸡汤决策伙伴 — 不给你答案,帮你看清结构</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-2">生日</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">性别</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:border-zinc-600 focus:outline-none"
              >
                <option value="female">女</option>
                <option value="male">男</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              你最近最纠结的一个决策
              <span className="text-zinc-600 ml-2 text-xs">说清楚背景和卡点 — 越具体越准</span>
            </label>
            <textarea
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              required
              minLength={20}
              maxLength={2000}
              rows={9}
              placeholder="例如:我 38 岁,在大厂年薪 80 万,但每天痛苦得睡不着。想离职做独立咨询,但有两个孩子要养、老婆刚停薪、上海一套房子贷款还有 12 年。最近半年这个念头反复来反复去,卡住了。"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 resize-none focus:border-zinc-600 focus:outline-none"
            />
            <p className="text-xs text-zinc-600 mt-1 text-right">{decision.length} / 2000</p>
          </div>

          <button
            type="submit"
            disabled={loading || !birthDate || decision.length < 20}
            className="w-full bg-zinc-100 text-zinc-900 font-semibold py-3 rounded-lg hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition"
          >
            {loading ? '正在拆解...(15-30 秒)' : '开始拆解'}
          </button>
        </form>

        {error && (
          <div className="bg-red-950 border border-red-900 rounded-lg p-4 mb-6 text-red-200">
            <strong>出错了:</strong> {error}
          </div>
        )}

        {analysis && (
          <div className="space-y-2">
            {meta && (
              <p className="text-xs text-zinc-600">
                模型: {meta.provider} / {meta.model}
              </p>
            )}
            <article className="prose prose-invert prose-zinc max-w-none bg-zinc-900 border border-zinc-800 rounded-lg p-6 whitespace-pre-wrap font-sans">
              {analysis}
            </article>
          </div>
        )}

        <footer className="mt-16 text-center text-zinc-700 text-xs">
          Life OS V0 · Local-first · DeepSeek powered
        </footer>
      </div>
    </div>
  );
}
