'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import type { PulseQuestion, PulseTag } from '@/lib/pulse/schema';
import { TAG_DISPLAY } from '@/lib/pulse/schema';

interface PulseStats {
  totalPulses: number;
  todayPulses: number;
  weekPulses: number;
}

interface DueCommitment {
  id: number;
  commitmentText: string;
  commitmentKind: string;
  duePhrase: string | null;
}

interface DecisionMeta {
  framework: string;
  frameworkName: string;
  confidence: number;
  memoryStats?: { hardAnchors: number; factCards: number; boundaries: number; episodes: number; totalCards: number; totalDecisions: number; };
  model?: string;
  provider?: string;
  decisionId?: number;
}

type Mode = 'pulse' | 'pulse-response' | 'decision' | 'decision-response';

export default function Home() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('pulse');

  // Pulse state
  const [todayQuestion, setTodayQuestion] = useState<PulseQuestion | null>(null);
  const [pulseStats, setPulseStats] = useState<PulseStats>({ totalPulses: 0, todayPulses: 0, weekPulses: 0 });
  const [pulseContent, setPulseContent] = useState('');
  const [pulseLoading, setPulseLoading] = useState(false);
  const [pulseError, setPulseError] = useState<string | null>(null);
  const [pulseResponse, setPulseResponse] = useState<{ aiResponse: string; tags: PulseTag[] } | null>(null);

  // Decision state
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('female');
  const [decision, setDecision] = useState('');
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [decisionMeta, setDecisionMeta] = useState<DecisionMeta | null>(null);

  // Misc
  const [dueCommits, setDueCommits] = useState<DueCommitment[]>([]);
  const [hasUnreadReview, setHasUnreadReview] = useState(false);
  const [dueOutcomesCount, setDueOutcomesCount] = useState(0);

  useEffect(() => {
    const uid = getOrCreateClientUid();
    setUserUid(uid);
    Promise.all([
      fetch('/api/pulse', { headers: { [UID_HEADER]: uid } }).then((r) => r.json()),
      fetch('/api/commitments?due=1', { headers: { [UID_HEADER]: uid } }).then((r) => r.json()),
      fetch('/api/sunday-review', { headers: { [UID_HEADER]: uid } }).then((r) => r.json()),
      fetch('/api/outcomes', { headers: { [UID_HEADER]: uid } }).then((r) => r.json()),
    ])
      .then(([pulseData, commitData, reviewData, outcomeData]) => {
        setTodayQuestion(pulseData.todayQuestion);
        setPulseStats(pulseData.stats);
        setDueCommits(commitData.commitments || []);
        setHasUnreadReview(reviewData.hasUnread || false);
        setDueOutcomesCount((outcomeData.due || []).length);
      })
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

  async function submitPulse(e: React.FormEvent) {
    e.preventDefault();
    if (!userUid || !todayQuestion) return;
    setPulseLoading(true); setPulseError(null);
    try {
      const res = await fetch('/api/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({ questionId: todayQuestion.id, content: pulseContent }),
      });
      const data = await res.json();
      if (!res.ok) { setPulseError(data.error || '出错了'); setPulseLoading(false); return; }
      setPulseResponse({ aiResponse: data.aiResponse, tags: data.tags });
      setPulseStats(data.stats);
      setTodayQuestion(data.nextQuestion);
      setMode('pulse-response');
    } catch (e: any) {
      setPulseError(e.message || '网络错误');
    } finally {
      setPulseLoading(false);
    }
  }

  function startAnotherPulse() {
    setPulseContent('');
    setPulseResponse(null);
    setMode('pulse');
  }

  async function submitDecision(e: React.FormEvent) {
    e.preventDefault();
    if (!userUid) return;
    setDecisionLoading(true); setAnalysis(''); setDecisionError(null); setDecisionMeta(null);
    setMode('decision-response');
    try {
      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({ birthDate, gender, decision }),
      });
      if (!res.ok) {
        const data = await res.json();
        setDecisionError(data.error || '出错了');
        setDecisionLoading(false);
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
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === 'meta') {
              setDecisionMeta((prev) => ({
                framework: parsed.framework,
                frameworkName: parsed.frameworkName,
                confidence: parsed.confidence,
                memoryStats: parsed.memoryStats,
                ...prev,
              }));
            } else if (parsed.type === 'text') {
              setAnalysis((prev) => prev + parsed.content);
            } else if (parsed.type === 'done') {
              setDecisionMeta((prev) => prev ? { ...prev, model: parsed.model, provider: parsed.provider, decisionId: parsed.decisionId } : null);
            } else if (parsed.type === 'error') {
              setDecisionError(parsed.message);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setDecisionError(err.message || '网络错误');
    } finally {
      setDecisionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <nav className="max-w-prose-xl mx-auto px-6 pt-8 pb-6 flex justify-between items-baseline">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tightish text-ink-900 hover:text-seal transition-colors">KEY</Link>
        <div className="flex gap-4 text-sm text-ink-500">
          <Link href="/methodology" className="hover:text-seal transition-colors">方法论</Link>
          <Link href="/sample-brief" className="hover:text-seal transition-colors">样品</Link>
          <Link href="/review" className="hover:text-seal transition-colors">Weekly</Link>
          <Link href="/outcomes" className="hover:text-seal transition-colors">账本</Link>
          <Link href="/brain" className="hover:text-seal transition-colors">Brain</Link>
          <Link href="/history" className="hover:text-seal transition-colors">历史</Link>
          <Link href="/account" className="hover:text-seal transition-colors">邮箱</Link>
        </div>
      </nav>

      <main className="max-w-prose-xl mx-auto px-6 pb-20">

        {/* ===== UNREAD WEEKLY REVIEW BANNER ===== */}
        {hasUnreadReview && mode === 'pulse' && (
          <Link href="/review" className="block mb-4 mt-6 group animate-fade-in-soft">
            <div className="border-l-4 border-seal bg-seal-50 px-5 py-4 hover:bg-paper-200 transition-colors">
              <p className="font-sans text-xs uppercase tracking-[0.15em] text-seal mb-1">
                · 这周的 Weekly Review 已生成 ·
              </p>
              <p className="font-serif text-reading text-ink-900 group-hover:text-seal transition-colors">
                这周 AI 看见了什么 — 点开看 →
              </p>
            </div>
          </Link>
        )}

        {/* ===== DUE OUTCOMES BANNER ===== */}
        {dueOutcomesCount > 0 && mode === 'pulse' && (
          <Link href="/outcomes" className="block mb-6 mt-2 group animate-fade-in-soft">
            <div className="border-l-4 border-gilt bg-paper-200 px-5 py-4 hover:bg-paper-300 transition-colors">
              <p className="font-sans text-xs uppercase tracking-[0.15em] text-gilt-500 mb-1">
                · 到了回看时间 · {dueOutcomesCount} 件 ·
              </p>
              <p className="font-serif text-reading text-ink-900 group-hover:text-seal transition-colors">
                你之前做的决定, AI 想知道现在怎么样了 →
              </p>
            </div>
          </Link>
        )}

        {/* ===== NEW USER MARKETING HERO (totalPulses === 0) ===== */}
        {mode === 'pulse' && pulseStats.totalPulses === 0 && (
          <section className="pt-16 pb-12 animate-fade-in-soft">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-8">
              · Issue 001 · 2026 ·
            </p>
            <p className="font-serif text-2xl md:text-3xl text-seal mb-4 tracking-tightish leading-tight">
              重大决定, 别一个人硬扛。
            </p>
            <h1 className="font-serif text-editorial-xl text-ink-900 mb-10 tracking-tighter leading-[1.1]">
              陪你把<br />人生难题想清楚。
            </h1>
            <div className="font-serif text-reading text-ink-700 max-w-prose-lg editorial-leading editorial-spacing mb-12">
              <p>
                父母养老、孩子出路、婚姻去留、职业转身、要不要迁移——
                这些决定太重, 不能只靠冲动, 也不能靠几句安慰.
              </p>
              <p>
                <strong className="text-ink-900">KEY 不替你做决定, 也不用鸡汤安慰你.</strong>
                它记得你的背景, 陪你一步步拆开真正困住你的问题.
              </p>
              <p className="text-sm text-ink-400 pt-4 border-t border-paper-300 mt-8 font-sans">
                陪你想清楚 · 看清代价 · 长期记得你
              </p>
            </div>
          </section>
        )}

        {/* ===== PULSE MODE ===== */}
        {mode === 'pulse' && (
          <section className={pulseStats.totalPulses === 0 ? 'pt-4 pb-12 animate-fade-in-soft' : 'pt-12 animate-fade-in-soft'}>
            {pulseStats.totalPulses === 0 && (
              <div className="mb-10 pb-8 border-b border-paper-300">
                <p className="font-sans text-xs uppercase tracking-[0.15em] text-ink-400 mb-3">
                  · 今天就先试一个 Pulse — 3 分钟 ·
                </p>
                <p className="font-serif text-sm text-ink-500 max-w-prose-lg editorial-leading">
                  Pulse 不是日记, 是"人生信号采集". 5 类轮换问题, 每天 3 分钟.
                  累积起来, AI 看见你的 pattern; 重大决策来时, 它已经懂你的背景, 不用从头解释.
                </p>
              </div>
            )}

            <div className="flex justify-between items-baseline mb-6">
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal">
                · Daily Pulse · Pulse #{pulseStats.totalPulses + 1} ·
              </p>
              {pulseStats.weekPulses > 0 && (
                <p className="font-mono text-xs text-ink-400">
                  本周 {pulseStats.weekPulses} 条
                </p>
              )}
            </div>

            {!todayQuestion && (
              <p className="text-ink-400 font-serif">加载中...</p>
            )}

            {todayQuestion && (
              <>
                <h1 className="font-serif text-editorial-lg text-ink-900 mb-3 tracking-tighter leading-tight">
                  {todayQuestion.prompt}
                </h1>
                <p className="font-serif text-sm text-ink-500 mb-8 italic">
                  {todayQuestion.helper}
                </p>

                <form onSubmit={submitPulse} className="space-y-4">
                  <textarea
                    value={pulseContent}
                    onChange={(e) => setPulseContent(e.target.value)}
                    placeholder={todayQuestion.exampleAnswer || '5-500 字 — 不需要工整, 真实就好.'}
                    rows={6}
                    minLength={5}
                    maxLength={500}
                    required
                    className="w-full px-4 py-4 rounded-sm font-serif text-reading text-ink-700 resize-none"
                  />
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-ink-400 font-mono">
                      {pulseContent.length} / 500
                    </span>
                    <div className="flex gap-3">
                      {pulseStats.totalPulses >= 1 && (
                        <Link
                          href="/history"
                          className="text-sm text-ink-500 hover:text-seal transition-colors px-4 py-2"
                        >
                          看我的 Pulse 历史
                        </Link>
                      )}
                      <button
                        type="submit"
                        disabled={pulseLoading || !userUid || pulseContent.length < 5}
                        className="btn-seal px-8 py-3 rounded-sm"
                      >
                        {pulseLoading ? '处理中...' : '记下来 →'}
                      </button>
                    </div>
                  </div>
                </form>

                {pulseError && (
                  <div className="mt-6 p-4 border-l-2 border-ember bg-paper-200">
                    <p className="text-sm text-ember font-sans">{pulseError}</p>
                  </div>
                )}

                {/* Due commitments — 编辑提醒 */}
                {dueCommits.length > 0 && (
                  <div className="mt-16 pt-8 border-t border-paper-300">
                    <p className="font-sans text-xs uppercase tracking-[0.15em] text-seal mb-4">
                      · 你之前跟我聊到的事 ·
                    </p>
                    <div className="space-y-4">
                      {dueCommits.slice(0, 3).map((c) => (
                        <div key={c.id} className="border-l-2 border-paper-300 pl-4">
                          <p className="font-serif text-reading text-ink-700">{c.commitmentText}</p>
                          <div className="mt-2 flex items-center gap-4 text-xs">
                            <span className="text-ink-400">{c.duePhrase || c.commitmentKind}</span>
                            <button onClick={() => actCommitment(c.id, 'fulfill')} className="text-sage hover:text-ink-700">已完成</button>
                            <button onClick={() => actCommitment(c.id, 'cancel')} className="text-ink-400 hover:text-ink-700">取消</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision Deep Dive — secondary CTA */}
                <div className="mt-20 pt-8 border-t border-paper-300">
                  <p className="font-sans text-xs uppercase tracking-[0.15em] text-ink-400 mb-3">
                    · 真正卡了几周的决定 ·
                  </p>
                  <p className="font-serif text-reading text-ink-500 editorial-leading mb-4 max-w-prose-lg">
                    Pulse 是日常信号. 真正卡了几周的决定 — 父母养老、孩子留学、要不要离职、要不要离婚 —
                    用 Decision Deep Dive 一层层想清楚. 12 维拆解, 不替你做决定, 让你看见代价.
                  </p>
                  <button
                    onClick={() => setMode('decision')}
                    className="btn-ghost px-6 py-3 rounded-sm"
                  >
                    把它想清楚 →
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* ===== PULSE RESPONSE ===== */}
        {mode === 'pulse-response' && pulseResponse && (
          <section className="pt-12 animate-fade-in-soft">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-6">
              · Recorded ·
            </p>

            {/* Tag chips */}
            {pulseResponse.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {pulseResponse.tags.map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 bg-paper-200 text-ink-700 rounded-sm font-sans">
                    {TAG_DISPLAY[tag] || tag}
                  </span>
                ))}
              </div>
            )}

            {/* AI response — 编辑部 pullquote 风格 */}
            <blockquote className="font-serif text-2xl text-ink-900 leading-snug border-l-4 border-seal pl-6 mb-12 italic">
              {pulseResponse.aiResponse}
            </blockquote>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={startAnotherPulse} className="btn-seal px-6 py-3 rounded-sm">
                再写一条 Pulse →
              </button>
              <button onClick={() => { setMode('decision'); setPulseResponse(null); }} className="btn-ghost px-6 py-3 rounded-sm">
                把这件事想清楚 (Deep Dive)
              </button>
            </div>

            <p className="mt-10 pt-6 border-t border-paper-300 font-sans text-xs text-ink-400">
              这条 Pulse 已写入你的 RMC episodic.
              累积到一定量, AI 会在 Weekly Review 里识别你的 pattern.
              当前共 {pulseStats.totalPulses} 条 / 本周 {pulseStats.weekPulses} 条.
            </p>
          </section>
        )}

        {/* ===== DECISION MODE ===== */}
        {mode === 'decision' && (
          <section className="pt-8 pb-12 animate-fade-in-soft">
            <button onClick={() => setMode('pulse')} className="text-sm text-ink-500 hover:text-seal mb-4">
              ← 回到 Pulse
            </button>
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-4">
              · Decision Deep Dive · 12 维协议 ·
            </p>
            <h2 className="font-serif text-editorial-lg text-ink-900 mb-3 tracking-tighter">
              你最近最难想清楚的决定是什么?
            </h2>
            <p className="font-serif text-reading text-ink-500 mb-10 max-w-prose-lg editorial-leading">
              说清楚背景、卡点、和你最怕的事. 越具体, 越准.
              我不替你决定, 但会陪你看清代价.
            </p>

            <form onSubmit={submitDecision} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-ink-500 mb-2">生日</label>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required
                    className="w-full px-4 py-3 rounded-sm font-sans" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink-500 mb-2">性别</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-sm font-sans">
                    <option value="female">女</option>
                    <option value="male">男</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink-500 mb-2">你的决定</label>
                <textarea value={decision} onChange={(e) => setDecision(e.target.value)} required minLength={20} maxLength={2000} rows={10}
                  placeholder="例如: 我 38 岁, 在大厂年薪 80 万. 想离职做独立咨询, 但有两个孩子要养、老婆刚停薪、上海一套房子贷款还有 12 年. 最近半年这个念头反复来反复去, 卡住了."
                  className="w-full px-4 py-4 rounded-sm font-serif text-reading text-ink-700 resize-none" />
                <p className="mt-2 text-xs text-ink-400 text-right font-mono">{decision.length} / 2000</p>
              </div>

              <button type="submit" disabled={decisionLoading || !userUid || !birthDate || decision.length < 20}
                className="btn-seal w-full px-8 py-3.5 rounded-sm">
                {decisionLoading ? '正在拆解...' : '开始拆解 →'}
              </button>
            </form>
          </section>
        )}

        {/* ===== DECISION RESPONSE ===== */}
        {mode === 'decision-response' && (
          <section className="pt-12 animate-fade-in-soft">
            <button onClick={() => { setMode('pulse'); setAnalysis(''); setDecisionMeta(null); }} className="text-sm text-ink-500 hover:text-seal mb-4">
              ← 完成
            </button>

            {decisionError && (
              <div className="mb-8 p-4 border-l-2 border-ember bg-paper-200">
                <p className="text-sm text-ember">{decisionError}</p>
              </div>
            )}

            {decisionMeta && (
              <div className="mb-6 flex flex-wrap gap-3 items-center text-xs font-sans">
                <span className="px-3 py-1.5 bg-paper-200 text-ink-700 rounded-sm">
                  {decisionMeta.frameworkName}
                  {decisionMeta.confidence > 0 && <span className="text-ink-400 ml-2 font-mono">{Math.round(decisionMeta.confidence * 100)}%</span>}
                </span>
                {decisionMeta.memoryStats && decisionMeta.memoryStats.totalCards > 0 && (
                  <span className="px-3 py-1.5 bg-seal-50 text-seal-600 rounded-sm">
                    已注入 memory · {decisionMeta.memoryStats.hardAnchors} 锚 · {decisionMeta.memoryStats.factCards + decisionMeta.memoryStats.boundaries + decisionMeta.memoryStats.episodes} 卡
                  </span>
                )}
                {decisionMeta.model && (
                  <span className="text-ink-400 ml-auto font-mono">{decisionMeta.provider}/{decisionMeta.model}</span>
                )}
              </div>
            )}

            <article className="prose prose-editorial max-w-none font-serif whitespace-pre-wrap">
              {analysis}
              {decisionLoading && <span className="ink-cursor" />}
            </article>
          </section>
        )}

        {/* Footer */}
        {userUid && (
          <footer className="mt-32 pt-8 border-t border-paper-300 text-xs text-ink-400 font-mono">
            <div className="flex justify-between items-baseline">
              <span>KEY · V1 dev</span>
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
