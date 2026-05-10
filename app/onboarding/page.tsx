'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import { STAGES, type StageId, type OnboardingQuestion } from '@/lib/onboarding/schema';

interface DraggableRankProps {
  options: string[];
  value: string[];
  onChange: (newOrder: string[]) => void;
}

function DraggableRank({ options, value, onChange }: DraggableRankProps) {
  // 简单上下移动 (不用真 drag-drop, V0 简化)
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
        <div
          key={opt}
          className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
        >
          <span className="text-zinc-500 text-sm font-mono w-6">{i + 1}</span>
          <span className="flex-1 text-zinc-100">{opt}</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="px-2 py-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              className="px-2 py-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ↓
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: OnboardingQuestion;
  value: any;
  onChange: (v: any) => void;
}) {
  switch (question.type) {
    case 'text-short':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={question.maxLength}
          required={question.required}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:border-zinc-600 focus:outline-none"
        />
      );
    case 'text-long':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={question.maxLength}
          minLength={question.minLength}
          required={question.required}
          rows={5}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 resize-none focus:border-zinc-600 focus:outline-none"
        />
      );
    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:border-zinc-600 focus:outline-none"
        />
      );
    case 'select':
      return (
        <div className="space-y-2">
          {question.options?.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                value === opt
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                  : 'bg-zinc-900 text-zinc-100 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    case 'rank':
      return (
        <DraggableRank
          options={question.options || []}
          value={value || question.options || []}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<StageId, Record<string, any>>>({
    identity: {},
    values: {},
    personality: {},
    'life-events': {},
    'current-state': {},
    vision: {},
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUserUid(getOrCreateClientUid());
  }, []);

  const currentStage = STAGES[currentStageIdx];
  const isLastStage = currentStageIdx === STAGES.length - 1;
  const isFirstStage = currentStageIdx === 0;

  function setAnswer(stageId: StageId, questionId: string, value: any) {
    setAnswers((prev) => ({
      ...prev,
      [stageId]: { ...prev[stageId], [questionId]: value },
    }));
  }

  function canProceed(): boolean {
    if (!currentStage.required) return true;
    return currentStage.questions
      .filter((q) => q.required)
      .every((q) => {
        const v = answers[currentStage.id]?.[q.id];
        return v !== undefined && v !== null && v !== '';
      });
  }

  async function handleSubmit() {
    if (!userUid) return;
    setSubmitting(true);
    setError(null);

    const responses = STAGES.map((s) => ({
      stage: s.id,
      answers: answers[s.id],
      completedAt: Math.floor(Date.now() / 1000),
    })).filter((r) => Object.keys(r.answers).length > 0);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({ responses }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '出错了');
      } else {
        setSubmitted(data);
      }
    } catch (e: any) {
      setError(e.message || '网络错误');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen p-6 md:p-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">建档完成 ✓</h1>
            <p className="text-zinc-400 mb-6">
              AI 已经从你的访谈里抽出了:
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8 text-left">
              <div className="bg-zinc-950 rounded p-4">
                <div className="text-3xl font-bold text-emerald-400">
                  {submitted.coreStateInserted}
                </div>
                <div className="text-zinc-500 text-sm mt-1">硬锚点</div>
              </div>
              <div className="bg-zinc-950 rounded p-4">
                <div className="text-3xl font-bold text-emerald-400">
                  {submitted.cardsInserted}
                </div>
                <div className="text-zinc-500 text-sm mt-1">RMC 卡</div>
              </div>
              <div className="bg-zinc-950 rounded p-4">
                <div className="text-3xl font-bold text-emerald-400">
                  {submitted.brainCharCount}
                </div>
                <div className="text-zinc-500 text-sm mt-1">brain 字符</div>
              </div>
            </div>
            <p className="text-zinc-400 text-sm mb-8">
              耗时 {(submitted.durationMs / 1000).toFixed(1)}s · 你现在可以开始第一个真实决策, AI 已经认识你了.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/"
                className="bg-zinc-100 text-zinc-900 font-semibold py-3 px-6 rounded-lg hover:bg-white transition"
              >
                开始第一个决策 →
              </Link>
              <Link
                href="/history"
                className="text-zinc-400 hover:text-zinc-100 py-3 px-6 transition"
              >
                看看 brain 长啥样
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-zinc-500 mb-2">
            <span>
              Stage {currentStageIdx + 1} / {STAGES.length}
            </span>
            <span>
              约 {STAGES.slice(currentStageIdx).reduce((s, x) => s + x.estimatedMinutes, 0)} 分钟剩余
            </span>
          </div>
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-100 transition-all"
              style={{ width: `${((currentStageIdx + 1) / STAGES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Stage header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{currentStage.title}</h1>
          <p className="text-zinc-400">{currentStage.description}</p>
          {!currentStage.required && (
            <p className="text-zinc-600 text-xs mt-2">这一阶段可跳过 — 但 AI 越懂你越准</p>
          )}
        </header>

        {/* Questions */}
        <div className="space-y-8">
          {currentStage.questions.map((q) => (
            <div key={q.id}>
              <label className="block text-zinc-100 mb-2">
                {q.prompt}
                {q.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {q.helper && <p className="text-zinc-500 text-xs mb-2">{q.helper}</p>}
              <QuestionRenderer
                question={q}
                value={answers[currentStage.id]?.[q.id]}
                onChange={(v) => setAnswer(currentStage.id, q.id, v)}
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-8 bg-red-950 border border-red-900 rounded-lg p-4 text-red-200">
            {error}
          </div>
        )}

        {/* Nav */}
        <div className="mt-12 flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentStageIdx((i) => Math.max(0, i - 1))}
            disabled={isFirstStage}
            className="text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ← 上一步
          </button>

          <div className="flex gap-3">
            {!currentStage.required && (
              <button
                type="button"
                onClick={() =>
                  isLastStage ? handleSubmit() : setCurrentStageIdx((i) => i + 1)
                }
                className="text-zinc-500 hover:text-zinc-300 px-4 py-2 transition"
              >
                跳过这一阶段
              </button>
            )}

            {isLastStage ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !canProceed()}
                className="bg-zinc-100 text-zinc-900 font-semibold py-3 px-8 rounded-lg hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition"
              >
                {submitting ? '建档中...' : '完成建档'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStageIdx((i) => i + 1)}
                disabled={!canProceed()}
                className="bg-zinc-100 text-zinc-900 font-semibold py-3 px-8 rounded-lg hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition"
              >
                下一步 →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
