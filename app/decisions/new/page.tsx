/**
 * /decisions/new — 提交一个决定 → 触发 brief pipeline → 跳详情页
 *
 * JOB-005.
 *
 * 设计:
 *   - 这是"结构化 brief"入口 (vs /letters/new "信件"入口)
 *   - 25-45 秒同步生成 — 全屏 overlay 显示进度 (Analyst → Editor → Inspector)
 *   - 完成跳 /decisions/[briefNumber]
 *
 * 跟 /letters/new 的区别:
 *   - letters: 写一封信, 拿一封信回复 (聊天感, 软)
 *   - decisions: 提交一个决定, 拿一份 publication-grade brief (杂志感, 硬)
 */

'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import KeyWordmark from '@/components/KeyWordmark';

const PROGRESS_STAGES = [
  { ms: 0, label: '正在准备 ...' },
  { ms: 2_000, label: '识别决策类型 (Framework 路由) ...' },
  { ms: 4_000, label: 'Analyst 撰写中 (12 维结构化分析) ...' },
  { ms: 20_000, label: 'Editor 改写 (publication-grade 语感) ...' },
  { ms: 35_000, label: 'Inspector 自审 (7 项守门) ...' },
];

export default function NewDecisionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <NewDecisionPageInner />
    </Suspense>
  );
}

function NewDecisionPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstRun = searchParams.get('welcome') === '1';
  const [userUid, setUserUid] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [decision, setDecision] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progressLabel, setProgressLabel] = useState(PROGRESS_STAGES[0].label);
  const [error, setError] = useState<string | null>(null);
  const submitStartedAt = useRef<number | null>(null);

  useEffect(() => {
    setUserUid(getOrCreateClientUid());
  }, []);

  // Rotate progress label by elapsed time
  useEffect(() => {
    if (!submitting) return;
    submitStartedAt.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - (submitStartedAt.current ?? Date.now());
      const stage = [...PROGRESS_STAGES].reverse().find((s) => elapsed >= s.ms);
      if (stage) setProgressLabel(stage.label);
    }, 500);
    return () => clearInterval(interval);
  }, [submitting]);

  const charCount = decision.length;
  const canSubmit = userUid && birthDate && decision.trim().length >= 20 && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !userUid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/decision/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({ birthDate, gender, decision: decision.trim() }),
      });
      const data = await res.json();
      if (data.shortCircuit) {
        setError(`安全短路 (${data.trigger}): ${data.response}`);
        setSubmitting(false);
        return;
      }
      if (!res.ok || !data.success) {
        setError(data.error || 'brief 生成失败');
        setSubmitting(false);
        return;
      }
      router.push(`/decisions/${data.briefNumber}`);
    } catch (e: any) {
      setError(e.message || '网络错误');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      {/* Top nav */}
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-center">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <Link
          href="/"
          className="text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500 hover:text-seal-500 transition-colors"
        >
          ← Home
        </Link>
      </nav>

      <main className="max-w-prose-lg mx-auto px-6 pb-20">
        {/* First-run welcome banner · 仅兑换后第一次显示 (?welcome=1) */}
        {isFirstRun && !submitting && (
          <div className="mt-6 mb-2 px-6 py-5 border-l-2 border-seal-500 bg-paper-50">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
              · 欢迎进入 KEY ·
            </p>
            <p className="font-serif text-reading text-ink-700 editorial-leading mb-2">
              你刚激活. KEY 不需要你先填一堆问卷 — 就从你最近真在卡的那件事开始.
            </p>
            <p className="font-serif italic text-[14px] text-ink-500">
              写得越具体 (谁 / 什么时候 / 卡在哪), 简报越准. 25-45 秒后你拿到第一份决策简报.
            </p>
          </div>
        )}

        <header className="pt-10 pb-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · KEY · Decision Brief ·
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 tracking-tighter mb-6 leading-tight">
            {isFirstRun ? '你的第一个决定.' : '写下你最近最难的决定.'}
          </h1>
          <p className="font-serif italic text-reading text-ink-700 editorial-leading">
            KEY 会跑完整 12 维分析 + Editor 改写 + Inspector 自审 ·
            产出一份 2000-3500 字结构化决策简报. 25-45 秒.
          </p>
        </header>

        {/* Form */}
        {!submitting && (
          <form onSubmit={submit} className="space-y-8">
            {/* Decision content (主) */}
            <div>
              <label className="font-sans text-[10px] uppercase tracking-[0.25em] text-seal-500 block mb-3">
                你要做什么决定?
              </label>
              <textarea
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                rows={10}
                maxLength={2000}
                minLength={20}
                placeholder="多写一点背景 / 关键约束 / 你卡在哪 — 越具体, 简报越对你有用. 至少 20 字."
                className="w-full px-5 py-4 bg-paper-50 border border-paper-300 focus:border-seal-500 focus:outline-none transition-colors font-serif text-reading text-ink-900 editorial-leading resize-y"
                required
              />
              <div className="flex justify-between mt-2 font-mono text-[11px] text-ink-400">
                <span>{charCount} 字</span>
                <span>建议 100-800 字, 越具体越好</span>
              </div>
            </div>

            {/* 身份 (因为 brief pipeline 需要) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-sans text-[10px] uppercase tracking-[0.25em] text-seal-500 block mb-2">
                  生日
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-paper-50 border border-paper-300 focus:border-seal-500 focus:outline-none transition-colors font-mono text-sm"
                />
              </div>
              <div>
                <label className="font-sans text-[10px] uppercase tracking-[0.25em] text-seal-500 block mb-2">
                  性别
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'female' | 'male' | 'other')}
                  className="w-full px-4 py-3 bg-paper-50 border border-paper-300 focus:border-seal-500 focus:outline-none transition-colors font-serif text-base"
                >
                  <option value="female">女</option>
                  <option value="male">男</option>
                  <option value="other">不愿透露</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="font-serif text-sm text-ember italic">{error}</p>
            )}

            <div className="pt-6 border-t border-paper-300">
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full md:w-auto px-10 py-3 bg-seal-500 hover:bg-seal-700 disabled:bg-ink-400 disabled:cursor-not-allowed text-paper-100 font-serif text-base transition-colors"
              >
                提交决定, 撰写简报 →
              </button>
              <p className="font-mono text-[11px] text-ink-400 mt-3">
                · 数据本地存储 (你的 UID 在浏览器). 隐私见 /privacy.
                <br />· 25-45 秒页面同步等待 — 撰写中请别关页.
              </p>
            </div>
          </form>
        )}

        {/* Submitting overlay */}
        {submitting && (
          <div className="fixed inset-0 bg-paper/95 backdrop-blur-sm flex items-center justify-center px-6 z-50">
            <div className="max-w-prose-md text-center">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
                · KEY ·
              </p>
              <h2 className="font-serif text-3xl text-ink-900 tracking-tighter mb-10 leading-tight">
                正在为你撰写决策简报.
              </h2>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="inline-block w-2 h-2 rounded-full bg-seal-500 animate-pulse" />
                <p className="font-serif italic text-base text-ink-700 leading-snug">
                  {progressLabel}
                </p>
              </div>
              <p className="font-mono text-[11px] text-ink-400">
                25-45 秒 · 请别关页 · 撰写完自动跳详情
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
