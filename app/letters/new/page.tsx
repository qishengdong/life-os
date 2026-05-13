/**
 * /letters/new — 写一封新的信
 *
 * Phase 4a Day 5
 *
 * 设计哲学:
 *   - 一张信纸, 不是 input form
 *   - 无 placeholder (拒绝 "今天怎么样?")
 *   - paper texture + font-serif + 行距 1.75
 *   - 寄出按钮是 burgundy stamp 风
 *   - 提交后立刻跳详情页 (status=pending), 让用户跟 KEY 等回信
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import KeyWordmark from '@/components/KeyWordmark';

function formatTodayHeader(): string {
  const d = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getFullYear()} · ${d.getMonth() + 1} · ${d.getDate()} · ${weekdays[d.getDay()]}`;
}

function countCharsCN(text: string): number {
  return text.replace(/\s+/g, '').replace(/[\p{P}]/gu, '').length;
}

export default function NewLetterPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动 focus + 自动扩展高度
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.max(400, ta.scrollHeight)}px`;
  }, [content]);

  const charCount = countCharsCN(content);
  const canSubmit = charCount >= 20 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const uid = getOrCreateClientUid();
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: uid },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || '寄出失败');
        setSubmitting(false);
        return;
      }
      // 立刻跳详情页, status=pending
      router.push(`/letters/${data.letter.id}?status=pending`);
    } catch (e: any) {
      setError(e?.message || '网络错误');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      {/* Top nav */}
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <Link
          href="/letters"
          className="text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500 hover:text-seal-500 transition-colors"
        >
          ← 通信集
        </Link>
      </nav>

      <main className="max-w-prose-xl mx-auto px-6 pt-16 pb-32">
        {/* 信抬头 */}
        <div className="mb-10 animate-fade-in-soft">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
            {formatTodayHeader()}
          </p>
          <p className="font-serif text-base text-ink-700">致 KEY 编辑部,</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 信纸 textarea — 不像 textarea */}
          <div className="relative animate-fade-in-soft">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent border-0 outline-none resize-none font-serif text-reading text-ink-900 editorial-leading p-0 placeholder:text-ink-300"
              style={{
                minHeight: '400px',
                lineHeight: '1.75',
              }}
              disabled={submitting}
              maxLength={8000}
              spellCheck={false}
            />
          </div>

          {/* 字数计数 — 极小, 右下 */}
          <div className="mt-6 flex items-baseline justify-end">
            <span className="font-mono text-[10px] text-ink-300">
              {charCount} 字
              {charCount > 0 && charCount < 20 && ' · 至少 20 字'}
            </span>
          </div>

          {error && (
            <div className="mt-8 p-4 border-l-2 border-ember bg-paper-100">
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ember mb-1">
                未寄出
              </p>
              <p className="font-serif text-sm text-ink-700">{error}</p>
            </div>
          )}

          {/* 寄出按钮 — burgundy stamp 风 */}
          <div className="mt-16 flex items-baseline gap-6">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`font-serif text-base px-8 py-3 border-2 transition-colors ${
                canSubmit
                  ? 'border-seal-500 bg-seal-500 text-paper-100 hover:bg-seal-700 hover:border-seal-700 cursor-pointer'
                  : 'border-paper-400 bg-paper-200 text-ink-400 cursor-not-allowed'
              }`}
              style={{ letterSpacing: '0.1em' }}
            >
              {submitting ? '寄出中 ...' : '寄出 →'}
            </button>
            {!submitting && (
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline">
                KEY 编辑部约 5-30 秒回信
              </span>
            )}
          </div>
        </form>

        {/* 写作提示 — 极克制, 仅在内容空时显示 */}
        {content.length === 0 && (
          <div className="mt-20 max-w-prose-lg animate-fade-in-soft">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-4">
              · 给你的几个起点 · (不必照写)
            </p>
            <ul className="space-y-2 font-serif italic text-[14px] text-ink-500 editorial-leading">
              <li>"今天我心里在想..."</li>
              <li>"有件事我跟谁都没说..."</li>
              <li>"我最近反复想到..."</li>
              <li>"上次写过的那件事, 后来..."</li>
              <li>或者, 不带任何起点, 直接写.</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
