'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';

interface MetaInfo {
  framework: string;
  frameworkName: string;
  confidence: number;
  matchedKeywords: string[];
  memoryStats?: {
    hardAnchors: number;
    factCards: number;
    boundaries: number;
    episodes: number;
    totalCards: number;
    totalDecisions: number;
  };
  model?: string;
  provider?: string;
  decisionId?: number;
}

interface DueCommitment {
  id: number;
  commitmentText: string;
  commitmentKind: string;
  duePhrase: string | null;
  promisedAt: number;
  dueAt: number | null;
}

export default function Home() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('female');
  const [decision, setDecision] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<MetaInfo | null>(null);
  const [dueCommits, setDueCommits] = useState<DueCommitment[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const uid = getOrCreateClientUid();
    setUserUid(uid);
    fetch('/api/commitments?due=1', { headers: { [UID_HEADER]: uid } })
      .then((r) => r.json())
      .then((d) => setDueCommits(d.commitments || []))
      .catch(() => {});
  }, []);

  async function actCommitment(id: number, action: 'fulfill' | 'cancel') {
    if (!userUid) return;
    await fetch('/api/commitments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
      body: JSON.stringify({ commitmentId: id, action }),
    });
    setDueCommits((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userUid) return;

    setLoading(true);
    setAnalysis('');
    setError(null);
    setMeta(null);

    try {
      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({ birthDate, gender, decision }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '出错了');
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (!data.trim()) continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'meta') {
              setMeta((prev) => ({
                framework: parsed.framework,
                frameworkName: parsed.frameworkName,
                confidence: parsed.confidence,
                matchedKeywords: parsed.matchedKeywords || [],
                memoryStats: parsed.memoryStats,
                ...prev,
              }));
            } else if (parsed.type === 'text') {
              setAnalysis((prev) => prev + parsed.content);
            } else if (parsed.type === 'done') {
              setMeta((prev) =>
                prev ? { ...prev, model: parsed.model, provider: parsed.provider, decisionId: parsed.decisionId } : null
              );
            } else if (parsed.type === 'error') {
              setError(parsed.message);
            }
          } catch (e) {}
        }
      }
    } catch (err: any) {
      setError(err.message || '网络错误');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Top Nav — 极简 */}
      <nav className="max-w-prose-xl mx-auto px-6 pt-8 pb-6 flex justify-between items-baseline">
        <div className="font-serif text-xl font-semibold tracking-tightish text-ink-900">
          Life OS
        </div>
        <div className="flex gap-6 text-sm text-ink-500">
          <Link href="/brain" className="hover:text-seal transition-colors">
            我的 Life Brain
          </Link>
          <Link href="/history" className="hover:text-seal transition-colors">
            历史
          </Link>
          <Link href="/onboarding" className="hover:text-seal transition-colors">
            建档
          </Link>
          <Link href="/about" className="hover:text-seal transition-colors">
            关于
          </Link>
        </div>
      </nav>

      <main className="max-w-prose-xl mx-auto px-6 pb-20">
        {/* Hero — 严肃出版物头版 */}
        {!showForm && !analysis && (
          <section className="pt-16 pb-12 animate-fade-in-soft">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-6">
              · Issue 001 · 2026 ·
            </p>
            <h1 className="font-serif text-editorial-xl text-ink-900 mb-8 tracking-tighter">
              35 岁后, 最难的<br />
              不是没有建议.<br />
              <span className="text-seal">是每个建议背后都有立场.</span>
            </h1>
            <div className="font-serif text-reading text-ink-500 max-w-prose-lg editorial-leading editorial-spacing">
              <p>
                父母养老、孩子出路、婚姻去留、职业转身、要不要迁移——
                这些决定太重, 不能靠鸡汤, 也不能靠冲动.
              </p>
              <p className="text-ink-700">
                <strong className="text-ink-900 font-semibold">Life OS 不替你决定.</strong>
                它记得你的背景, 用决策科学陪你把问题想透.
              </p>
              <p className="text-sm text-ink-400 pt-4 border-t border-paper-300 mt-8">
                不安慰你 · 不命令你 · 不替你决定 · 只陪你看清结构
              </p>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="btn-seal px-8 py-4 rounded-sm font-medium"
              >
                写下我最近最难的决定 →
              </button>
              <Link
                href="/onboarding"
                className="btn-ghost px-8 py-4 rounded-sm text-center"
              >
                先做 30 分钟深度建档
              </Link>
            </div>
          </section>
        )}

        {/* Due Commitments — 编辑提醒 */}
        {!showForm && !analysis && dueCommits.length > 0 && (
          <section className="my-12 border-l-2 border-seal pl-6">
            <p className="font-sans text-xs uppercase tracking-[0.15em] text-seal mb-4">
              · 你之前跟我聊到的事 ·
            </p>
            <div className="space-y-4">
              {dueCommits.slice(0, 3).map((c) => (
                <div key={c.id}>
                  <p className="font-serif text-reading text-ink-700">
                    {c.commitmentText}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs">
                    <span className="text-ink-400">
                      {c.duePhrase || c.commitmentKind}
                    </span>
                    <button onClick={() => actCommitment(c.id, 'fulfill')} className="text-sage hover:text-ink-700">
                      已完成
                    </button>
                    <button onClick={() => actCommitment(c.id, 'cancel')} className="text-ink-400 hover:text-ink-700">
                      取消
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Decision Form */}
        {showForm && (
          <section className="pt-8 pb-12 animate-fade-in-soft">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-4">
              · Decision Deep Dive ·
            </p>
            <h2 className="font-serif text-editorial-lg text-ink-900 mb-3 tracking-tighter">
              你最近最难的决定是什么?
            </h2>
            <p className="font-serif text-reading text-ink-500 mb-10 max-w-prose-lg">
              说清楚背景、卡点、和你最怕的事. 越具体, 越准.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-ink-500 mb-2">
                    生日
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-sm font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink-500 mb-2">
                    性别
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-sm font-sans"
                  >
                    <option value="female">女</option>
                    <option value="male">男</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink-500 mb-2">
                  你的决定
                </label>
                <textarea
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  required
                  minLength={20}
                  maxLength={2000}
                  rows={10}
                  placeholder="例如: 我 38 岁, 在大厂年薪 80 万. 想离职做独立咨询, 但有两个孩子要养、老婆刚停薪、上海一套房子贷款还有 12 年. 最近半年这个念头反复来反复去, 卡住了."
                  className="w-full px-4 py-4 rounded-sm font-serif text-reading text-ink-700 resize-none"
                />
                <p className="mt-2 text-xs text-ink-400 text-right">
                  {decision.length} / 2000
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || !userUid || !birthDate || decision.length < 20}
                  className="btn-seal px-8 py-3.5 rounded-sm flex-1"
                >
                  {loading ? '正在拆解...' : '开始拆解 →'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-ghost px-8 py-3.5 rounded-sm"
                >
                  返回
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="my-8 p-4 border-l-2 border-ember bg-paper-200">
            <p className="text-sm text-ember">{error}</p>
          </div>
        )}

        {/* Meta tag */}
        {meta && (
          <div className="mt-12 mb-6 flex flex-wrap gap-3 items-center text-xs font-sans">
            <span className="px-3 py-1.5 bg-paper-200 text-ink-700 rounded-sm">
              {meta.frameworkName}
              {meta.confidence > 0 && (
                <span className="text-ink-400 ml-2 font-mono">{Math.round(meta.confidence * 100)}%</span>
              )}
            </span>
            {meta.memoryStats && meta.memoryStats.totalCards > 0 && (
              <span className="px-3 py-1.5 bg-seal-50 text-seal-600 rounded-sm">
                已注入 memory · {meta.memoryStats.hardAnchors} 锚点 ·{' '}
                {meta.memoryStats.factCards + meta.memoryStats.boundaries + meta.memoryStats.episodes} 卡
              </span>
            )}
            {meta.model && (
              <span className="text-ink-400 ml-auto font-mono">
                {meta.provider}/{meta.model}
              </span>
            )}
          </div>
        )}

        {/* Analysis Report — 严肃出版物排版 */}
        {analysis && (
          <article className="prose prose-editorial max-w-none font-serif animate-fade-in-soft whitespace-pre-wrap">
            {analysis}
            {loading && <span className="ink-cursor" />}
          </article>
        )}

        {/* Footer */}
        {userUid && (
          <footer className="mt-32 pt-8 border-t border-paper-300 text-xs text-ink-400 font-mono">
            <div className="flex justify-between items-baseline">
              <span>Life OS · V1 dev</span>
              <span>id: {userUid.slice(0, 8)}…{userUid.slice(-4)}</span>
            </div>
            <p className="mt-3 text-ink-400 font-sans">
              所有数据只在你 Mac 本地 · 永不上传 · 永不外泄
            </p>
          </footer>
        )}
      </main>
    </div>
  );
}
