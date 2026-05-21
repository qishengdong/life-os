/**
 * WeeklyPatternMirror · 周末关联 hero card · 5/20 ship · C2
 *
 * 仅周六/周日触发. 显示本周 pattern + 3 条真原文 evidence + 1 反问.
 *
 * 跟 MorningMirror 区别:
 *   - Morning: 单条 pulse 的反问
 *   - Weekly: 多条 pulse 的 pattern, 摆出来让用户看自己
 */
'use client';

import { useEffect, useState } from 'react';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';

interface WeeklyPatternData {
  hasPattern: true;
  patternTheme: string;
  evidence: Array<{ pulseId: number; content: string; createdAt: number }>;
  question: string;
}

function formatRelativeDay(timestamp: number): string {
  const days = Math.floor((Date.now() / 1000 - timestamp) / 86400);
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  return `${days} 天前`;
}

export default function WeeklyPatternMirror() {
  const [pattern, setPattern] = useState<WeeklyPatternData | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getOrCreateClientUid();
    fetch('/api/weekly-pattern', {
      headers: { [UID_HEADER]: uid },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.pattern?.hasPattern) {
          setPattern(data.pattern);
          // fire-and-forget · 记 view
          fetch('/api/weekly-pattern', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', [UID_HEADER]: uid },
            body: JSON.stringify({ action: 'view' }),
          }).catch(() => null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function dismiss() {
    setDismissed(true);
    const uid = getOrCreateClientUid();
    fetch('/api/weekly-pattern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [UID_HEADER]: uid },
      body: JSON.stringify({ action: 'dismiss' }),
    }).catch(() => null);
  }

  if (loading || !pattern || dismissed) return null;

  return (
    <section className="mb-12 pt-8">
      <div className="border-2 border-seal-500 bg-paper-50 px-7 py-7">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
          · 周末关联 · 本周你说过的 ·
        </p>

        <h2 className="font-serif text-xl text-ink-900 tracking-tightish leading-tight mb-6">
          {pattern.patternTheme}.
        </h2>

        {/* 3 条真原文 evidence */}
        <div className="space-y-4 mb-6 pl-4 border-l-2 border-seal-500/30">
          {pattern.evidence.map((ev) => (
            <div key={ev.pulseId} className="font-serif italic text-[14px] text-ink-700 leading-relaxed">
              <p className="font-sans text-[10px] uppercase tracking-widest text-ink-400 mb-1 not-italic">
                · {formatRelativeDay(ev.createdAt)} ·
              </p>
              <p>&ldquo;{ev.content.length > 150 ? ev.content.slice(0, 150) + '...' : ev.content}&rdquo;</p>
            </div>
          ))}
        </div>

        {/* 反问 */}
        <p className="font-serif text-reading text-ink-900 leading-relaxed mb-6 pt-5 border-t border-paper-300">
          {pattern.question}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/pulse"
            onClick={() => {
              const uid = getOrCreateClientUid();
              fetch('/api/weekly-pattern', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', [UID_HEADER]: uid },
                body: JSON.stringify({ action: 'respond' }),
              }).catch(() => null);
            }}
            className="inline-block px-6 py-2.5 font-serif text-[14px] text-paper bg-ink-900 hover:bg-seal-500 transition-colors text-center"
          >
            写一句回应 →
          </a>
          <button
            type="button"
            onClick={dismiss}
            className="inline-block px-6 py-2.5 font-serif text-[14px] text-ink-500 hover:text-seal-500 transition-colors"
          >
            只是看一眼
          </button>
        </div>
      </div>
    </section>
  );
}
