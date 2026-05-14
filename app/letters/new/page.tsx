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
import { LETTER_STARTERS, BLANK_STARTER_ID } from '@/lib/letters/starters';

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
  const [starterSelected, setStarterSelected] = useState(false);  // 是否已过"选起点"这一步
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 选了 starter 之后, 把光标移到末尾 + focus
  useEffect(() => {
    if (!starterSelected) return;
    const ta = textareaRef.current;
    if (!ta) return;
    ta.focus();
    const end = ta.value.length;
    ta.setSelectionRange(end, end);
  }, [starterSelected]);

  // 自动扩展高度
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.max(400, ta.scrollHeight)}px`;
  }, [content, starterSelected]);

  function pickStarter(starterId: string) {
    if (starterId === BLANK_STARTER_ID) {
      setContent('');
    } else {
      const starter = LETTER_STARTERS.find((s) => s.id === starterId);
      if (starter) setContent(starter.text);
    }
    setStarterSelected(true);
  }

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
        {/* Step 1 · 选起点 (批改模板, 还没进信纸) */}
        {!starterSelected && (
          <section className="animate-fade-in-soft">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
              · 选一个起点, 在它上面改 ·
            </p>
            <h1 className="font-serif text-editorial text-ink-900 tracking-tighter leading-tight mb-4">
              你不必从空白开始.
            </h1>
            <p className="font-serif italic text-reading text-ink-500 editorial-leading max-w-prose-lg mb-12">
              中文里最舒服的一个动作是 "改". 挑一句, 删它一半, 加你想说的. 不挑也行 — 进空白信纸.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
              {LETTER_STARTERS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => pickStarter(s.id)}
                  className="text-left border border-paper-300 hover:border-seal-500 hover:bg-paper-100 transition-colors p-5 group"
                >
                  <p className="font-serif text-base text-ink-900 leading-snug mb-2 group-hover:text-seal-700 transition-colors">
                    {s.text.replace(/\s+$/, '')} <span className="text-ink-400">...</span>
                  </p>
                  {s.hint && (
                    <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400">
                      {s.hint}
                    </p>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => pickStarter(BLANK_STARTER_ID)}
              className="font-serif italic text-base text-ink-500 border-b border-paper-400 hover:border-seal-500 hover:text-seal-500 pb-0.5 transition-colors"
            >
              或者, 我自己写 →
            </button>
          </section>
        )}

        {/* Step 2 · 信抬头 + 信纸 (选完起点) */}
        {starterSelected && (
          <>
            <div className="mb-10 animate-fade-in-soft flex justify-between items-baseline flex-wrap gap-4">
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
                  {formatTodayHeader()}
                </p>
                <p className="font-serif text-base text-ink-700">致 KEY 编辑部,</p>
              </div>
              <button
                onClick={() => {
                  setStarterSelected(false);
                  setContent('');
                }}
                type="button"
                className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hover:text-seal-500 transition-colors"
              >
                ← 换一个起点
              </button>
            </div>

            <form onSubmit={handleSubmit}>
          {/* 信纸 textarea — 复古信笺: 横向轻线 + 复古字体 + 钢笔光标 */}
          <div className="relative animate-fade-in-soft letter-paper py-3 px-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="letter-prose w-full bg-transparent border-0 outline-none resize-none p-0 placeholder:text-ink-300"
              style={{
                minHeight: '400px',
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

          {/* 寄出按钮 — "緘" 字红章风 */}
          <div className="mt-16 flex items-center gap-6 flex-wrap">
            <button type="submit" disabled={!canSubmit} className="btn-jian">
              {submitting ? '寄出中 ...' : '寄出'}
            </button>
            {!submitting && (
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline">
                KEY 编辑部约 5-30 秒回信
              </span>
            )}
          </div>
        </form>
          </>
        )}
      </main>
    </div>
  );
}
