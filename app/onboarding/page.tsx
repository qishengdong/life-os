'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import { STAGES, type StageId, type OnboardingQuestion } from '@/lib/onboarding/schema';
import KeyWordmark from '@/components/KeyWordmark';

function DraggableRank({
  options, value, onChange,
}: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const items = value.length === options.length ? value : options;
  function move(idx: number, dir: -1 | 1) {
    const newItems = [...items];
    const target = idx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    onChange(newItems);
  }
  return (
    <div className="space-y-2">
      {items.map((opt, i) => (
        <div key={opt} className="flex items-center gap-3 bg-paper-200 border border-paper-300 rounded-sm px-4 py-3 hover:border-ink-400 transition-colors">
          <span className="text-ink-400 text-sm font-mono w-6">{i + 1}</span>
          <span className="flex-1 font-serif text-ink-900">{opt}</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-2 py-1 text-ink-500 hover:text-seal disabled:opacity-30 disabled:cursor-not-allowed transition-colors">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="px-2 py-1 text-ink-500 hover:text-seal disabled:opacity-30 disabled:cursor-not-allowed transition-colors">↓</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionRenderer({
  question, value, onChange,
}: { question: OnboardingQuestion; value: any; onChange: (v: any) => void }) {
  switch (question.type) {
    case 'text-short':
      return (
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} maxLength={question.maxLength} required={question.required}
          className="w-full px-4 py-3 rounded-sm font-sans" />
      );
    case 'text-long':
      return (
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} maxLength={question.maxLength} minLength={question.minLength} required={question.required} rows={5}
          className="w-full px-4 py-3 rounded-sm font-serif text-reading text-ink-700 resize-none" />
      );
    case 'date':
      return (
        <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} required={question.required}
          className="w-full px-4 py-3 rounded-sm font-sans" />
      );
    case 'select':
      return (
        <div className="space-y-2">
          {question.options?.map((opt) => (
            <button key={opt} type="button" onClick={() => onChange(opt)}
              className={`w-full text-left px-4 py-3 rounded-sm border transition-all font-serif ${
                value === opt ? 'bg-seal text-paper border-seal' : 'bg-paper-50 text-ink-900 border-paper-300 hover:border-ink-400'
              }`}>
              {opt}
            </button>
          ))}
        </div>
      );
    case 'rank':
      return <DraggableRank options={question.options || []} value={value || question.options || []} onChange={onChange} />;
    default:
      return null;
  }
}

export default function OnboardingPage() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<StageId, Record<string, any>>>({
    identity: {}, values: {}, personality: {}, 'life-events': {}, 'current-state': {}, vision: {},
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCheck, setStatusCheck] = useState<'pending' | 'ok' | 'redirect'>('pending');

  /** JOB-002 · gate · 已经 onboard 过的用户跳过这页 (除非 ?force=1 重做) */
  useEffect(() => {
    const uid = getOrCreateClientUid();
    setUserUid(uid);

    const force = new URLSearchParams(window.location.search).get('force');
    if (force === '1') {
      setStatusCheck('ok');
      return;
    }

    fetch('/api/onboarding/status', { headers: { [UID_HEADER]: uid } })
      .then((r) => r.json())
      .then((d) => {
        if (d?.completed) {
          // 已完成 → 跳 /letters (默认 next step)
          window.location.href = '/letters';
          setStatusCheck('redirect');
        } else {
          setStatusCheck('ok');
        }
      })
      .catch(() => setStatusCheck('ok'));
  }, []);

  const currentStage = STAGES[currentStageIdx];
  const isLastStage = currentStageIdx === STAGES.length - 1;
  const isFirstStage = currentStageIdx === 0;

  function setAnswer(stageId: StageId, qid: string, v: any) {
    setAnswers((prev) => ({ ...prev, [stageId]: { ...prev[stageId], [qid]: v } }));
  }

  function canProceed(): boolean {
    if (!currentStage.required) return true;
    return currentStage.questions.filter((q) => q.required).every((q) => {
      const v = answers[currentStage.id]?.[q.id];
      return v !== undefined && v !== null && v !== '';
    });
  }

  async function handleSubmit() {
    if (!userUid) return;
    setSubmitting(true); setError(null);
    const responses = STAGES.map((s) => ({
      stage: s.id, answers: answers[s.id], completedAt: Math.floor(Date.now() / 1000),
    })).filter((r) => Object.keys(r.answers).length > 0);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({ responses }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || '出错了');
      else setSubmitted(data);
    } catch (e: any) {
      setError(e.message || '网络错误');
    } finally {
      setSubmitting(false);
    }
  }

  // JOB-002 · gate · 还在检查状态时, 渲染空 paper 避免闪
  if (statusCheck === 'pending' || statusCheck === 'redirect') {
    return <div className="min-h-screen bg-paper" />;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper">
        <main className="max-w-prose-lg mx-auto px-6 pt-20 pb-20">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-6 text-center">
            · 建档完成 ·
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 mb-8 text-center tracking-tighter">
            它已经开始记得你了
          </h1>
          <p className="font-serif text-reading text-ink-500 editorial-leading text-center mb-12 max-w-prose-lg mx-auto">
            从你的访谈里, AI 抽出了你的核心档案.
            下次跟它聊任何事 — 不管是今天的 Pulse 还是重大决策 — 它已经懂你的背景, 不用你从头解释.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-12 border-y border-paper-300 py-6">
            <div className="text-center">
              <div className="font-mono text-3xl text-seal">{submitted.coreStateInserted}</div>
              <div className="text-xs uppercase tracking-wider text-ink-400 mt-1">硬锚点</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-3xl text-seal">{submitted.cardsInserted}</div>
              <div className="text-xs uppercase tracking-wider text-ink-400 mt-1">RMC 卡</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-3xl text-seal">{submitted.brainCharCount}</div>
              <div className="text-xs uppercase tracking-wider text-ink-400 mt-1">Brain 字符</div>
            </div>
          </div>

          <p className="text-xs text-ink-400 text-center mb-10 font-mono">
            耗时 {(submitted.durationMs / 1000).toFixed(1)}s
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/your-pattern" className="btn-seal px-8 py-3 rounded-sm text-center">
              看你的决策画像 →
            </Link>
            <Link href="/brain" className="btn-ghost px-8 py-3 rounded-sm text-center">
              直接看 KEY 怎么记得我
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <nav className="max-w-prose-lg mx-auto px-6 pt-8 pb-6">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
      </nav>

      <main className="max-w-prose-lg mx-auto px-6 pb-20">
        {/* Progress */}
        <div className="mb-12 pt-4">
          <div className="flex justify-between text-xs uppercase tracking-wider text-ink-400 mb-3 font-sans">
            <span>Stage {currentStageIdx + 1} / {STAGES.length}</span>
            <span>约 {STAGES.slice(currentStageIdx).reduce((s, x) => s + x.estimatedMinutes, 0)} 分钟剩余</span>
          </div>
          <div className="h-px bg-paper-300 relative">
            <div className="absolute inset-y-0 left-0 bg-seal transition-all" style={{ width: `${((currentStageIdx + 1) / STAGES.length) * 100}%`, height: '1px' }} />
          </div>
        </div>

        {/* Stage header */}
        <header className="mb-12 animate-fade-in-soft">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-4">
            · Onboarding · {currentStage.id} ·
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 mb-3 tracking-tighter">
            {currentStage.title}
          </h1>
          <p className="font-serif text-reading text-ink-500 editorial-leading max-w-prose-lg">
            {currentStage.description}
          </p>
          {!currentStage.required && (
            <p className="font-sans text-xs text-ink-400 mt-3">
              这一阶段可跳过 — 但 AI 越懂你, 答案越准
            </p>
          )}
        </header>

        {/* Questions */}
        <div className="space-y-12">
          {currentStage.questions.map((q) => (
            <div key={q.id} className="animate-fade-in-soft">
              <label className="block font-serif text-ink-900 text-lg mb-2 leading-snug">
                {q.prompt}
                {q.required && <span className="text-seal ml-1">*</span>}
              </label>
              {q.helper && <p className="text-xs text-ink-400 mb-3 font-sans">{q.helper}</p>}
              <QuestionRenderer
                question={q}
                value={answers[currentStage.id]?.[q.id]}
                onChange={(v) => setAnswer(currentStage.id, q.id, v)}
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-12 p-4 border-l-2 border-ember bg-paper-200">
            <p className="text-sm text-ember font-sans">{error}</p>
          </div>
        )}

        {/* Nav */}
        <div className="mt-16 pt-8 border-t border-paper-300 flex justify-between items-center">
          <button type="button" onClick={() => setCurrentStageIdx((i) => Math.max(0, i - 1))} disabled={isFirstStage}
            className="text-ink-500 hover:text-seal disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-sans text-sm">
            ← 上一步
          </button>
          <div className="flex gap-3">
            {!currentStage.required && (
              <button type="button" onClick={() => isLastStage ? handleSubmit() : setCurrentStageIdx((i) => i + 1)}
                className="text-ink-400 hover:text-ink-700 px-4 py-2 transition-colors font-sans text-sm">
                跳过
              </button>
            )}
            {isLastStage ? (
              <button type="button" onClick={handleSubmit} disabled={submitting || !canProceed()}
                className="btn-seal px-8 py-3 rounded-sm">
                {submitting ? '建档中...' : '完成建档 →'}
              </button>
            ) : (
              <button type="button" onClick={() => setCurrentStageIdx((i) => i + 1)} disabled={!canProceed()}
                className="btn-seal px-8 py-3 rounded-sm">
                下一步 →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
