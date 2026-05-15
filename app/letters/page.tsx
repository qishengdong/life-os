/**
 * /letters — 我们的通信集 (信件流主页)
 *
 * Phase 4a Day 4
 *
 * 设计哲学:
 *   - 像翻一本"装订过的通信集", 不像 inbox 列表
 *   - 大日期, 小编号, 用户开头节选 + KEY 回信节选, 状态标
 *   - 顶部一个 "写一封新的信" 大 CTA (这是 KEY 真正的高频入口)
 *   - 永远不显示"对话历史"语义
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import KeyWordmark from '@/components/KeyWordmark';
import PageMasthead from '@/components/PageMasthead';
import { FleuronDivider } from '@/components/Fleuron';

interface LetterRecord {
  id: number;
  userContent: string;
  userCharCount: number;
  replyContent: string | null;
  replyCharCount: number | null;
  replyAuthoredAt: number | null;
  letterNumber: string;
  status: 'pending' | 'replied' | 'failed';
  failureReason: string | null;
  frameworkMatched: string | null;
  authoredAt: number;
}

interface LettersResponse {
  letters: LetterRecord[];
  counts: { total: number; replied: number; pending: number; failed: number };
}

function formatDate(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getFullYear()} · ${d.getMonth() + 1} · ${d.getDate()} · ${weekdays[d.getDay()]}`;
}

function truncate(text: string, n: number): string {
  if (!text) return '';
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= n) return trimmed;
  return trimmed.slice(0, n) + '...';
}

const FRAMEWORK_LABEL: Record<string, string> = {
  'parent-care': '父母',
  marriage: '婚姻',
  'child-education': '子女',
  'work-meaning': '工作 · 意义',
  self: '自我',
  general: '日常',
};

// ============================================================================
// 单封信卡片 (含 onboarding letter 特化)
// ============================================================================
function LetterCard({ letter }: { letter: LetterRecord }) {
  const isOnboarding = letter.frameworkMatched === 'onboarding';
  const isReplied = letter.status === 'replied';
  const isPending = letter.status === 'pending';
  const isFailed = letter.status === 'failed';

  // KEY 开场信 — 特殊版式
  if (isOnboarding) {
    return (
      <Link
        href={`/letters/${letter.id}`}
        className="block group border-l-[3px] border-l-seal-500 border-y border-r border-paper-300 bg-paper-100/60 px-6 py-7 hover:bg-paper-100 transition-colors mb-6"
      >
        <div className="flex items-baseline justify-between mb-3 gap-4 flex-wrap">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500">
            · KEY 编辑部 · 致每一位新读者 ·
          </span>
          <span className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">
            {letter.letterNumber}
          </span>
        </div>
        <p className="font-serif italic text-reading text-ink-700 editorial-leading">
          {truncate(letter.replyContent || '', 110)}
        </p>
        <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.2em] text-seal-500">
          ↪ 打开 · 回这封信
        </p>
      </Link>
    );
  }

  return (
    <Link
      href={`/letters/${letter.id}`}
      className="block group border-b border-paper-300 py-8 hover:bg-paper-100/40 transition-colors"
    >
      <div className="flex items-baseline justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-baseline gap-4">
          <span className="font-serif text-2xl text-seal-500 tracking-tighter group-hover:text-seal-700 transition-colors">
            {formatDate(letter.authoredAt)}
          </span>
          {letter.frameworkMatched && (
            <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-ink-400">
              · {FRAMEWORK_LABEL[letter.frameworkMatched] || letter.frameworkMatched} ·
            </span>
          )}
        </div>
        <span className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">
          {letter.letterNumber}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <p className="font-serif text-base text-ink-700 editorial-leading">
          {truncate(letter.userContent, 80)}
        </p>
        {isReplied && letter.replyContent && (
          <p className="font-serif italic text-[14px] text-ink-500 editorial-leading pl-4 border-l-2 border-seal-500/30">
            KEY 回 · {truncate(letter.replyContent, 80)}
          </p>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400">
          {letter.userCharCount} 字
          {isReplied && letter.replyCharCount ? ` · KEY 回 ${letter.replyCharCount} 字` : ''}
        </span>
        <span
          className={`font-sans text-[10px] uppercase tracking-[0.2em] ${
            isReplied
              ? 'text-seal-500'
              : isPending
                ? 'text-ink-500'
                : 'text-ember'
          }`}
        >
          {isReplied && '✓ 已回信 · 阅读 →'}
          {isPending && '⧖ KEY 在读 ...'}
          {isFailed && '⚠ 未送达 · 重试 →'}
        </span>
      </div>
    </Link>
  );
}

// ============================================================================
// 主页面
// ============================================================================
export default function LettersPage() {
  const [data, setData] = useState<LettersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const uid = getOrCreateClientUid();
    fetch('/api/letters', { headers: { [UID_HEADER]: uid } })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e?.message || '加载失败');
        setLoading(false);
      });
  }, []);

  const hasLetters = !loading && data && data.letters.length > 0;
  const isEmpty = !loading && data && data.letters.length === 0;

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      {/* Top nav */}
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
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

      <PageMasthead eyebrow="LETTERS · 通信集" volume="MMXXVI" />

      {/* Header · 左文 + 右图 (channel-publication: 精装刊物 + 眼镜书签) */}
      <header className="max-w-prose-xl mx-auto px-6 pt-16 pb-12 animate-fade-in-soft">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-14 items-center">
          <div className="order-2 md:order-1">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
              · KEY EDITORIAL OFFICE · LETTERS ·
            </p>
            <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter leading-[1.05] mb-6">
              我们的通信集
            </h1>
            <p className="font-serif italic text-reading text-ink-700 editorial-leading">
              那些跟谁都说不出口的, 写给 KEY. 我们 3-10 分钟回信. 永远不评价, 不"加油", 不哄你 —
              但真的读你写的字, 真的记得你说过什么.
            </p>

            <div className="mt-10 flex items-baseline gap-6 flex-wrap">
              <Link
                href="/letters/new"
                className="inline-block bg-seal-500 hover:bg-seal-700 text-paper-100 font-serif text-base px-8 py-3 transition-colors"
              >
                写一封新的信 →
              </Link>
              {data && data.counts.total > 0 && (
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400">
                  累计 {data.counts.total} 封 · {data.counts.replied} 已回 · {data.counts.pending} 在读
                  {data.counts.failed > 0 && ` · ${data.counts.failed} 未送达`}
                </span>
              )}
            </div>
          </div>
          <div className="order-1 md:order-2 relative aspect-[4/5] bg-ink-900/5 overflow-hidden shadow-sm">
            <img
              src="/illustrations/channel-publication.png"
              alt="一摞精装刊物"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-seal-500" />
          </div>
        </div>
      </header>

      <FleuronDivider variant="simple-diamond" seal />

      {/* List */}
      <main className="max-w-prose-xl mx-auto px-6 pb-24">
        {loading && (
          /* A6 · skeleton rows (no spinner) */
          <div className="my-12 space-y-4 max-w-prose-lg mx-auto">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="border border-paper-300 rounded-sm p-6 bg-paper-50 animate-pulse"
              >
                <div className="h-3 w-24 bg-paper-300 rounded mb-3" />
                <div className="h-4 w-3/4 bg-paper-300 rounded mb-2" />
                <div className="h-3 w-1/2 bg-paper-300 rounded" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="my-12 p-6 border-l-2 border-ember bg-paper-100">
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ember mb-2">
              错误
            </p>
            <p className="font-serif text-sm text-ink-700">{error}</p>
          </div>
        )}

        {isEmpty && (
          /* A6 · editorial empty state */
          <div className="my-20 text-center max-w-[26em] mx-auto">
            <p className="font-serif italic text-[19px] text-ink-900 leading-snug mb-5">
              你还没寄出第一封.
            </p>
            <p className="font-serif italic text-[19px] text-ink-700 leading-snug mb-10">
              大多数人写的第一封, 也是他们三个月内回头读最多的一封.
            </p>
            <img
              src="/brand/fleurons/fleuron-simple-diamond-seal.svg"
              alt=""
              width={48}
              height={48}
              className="mx-auto opacity-70"
            />
          </div>
        )}

        {hasLetters && (
          <div className="animate-fade-in-soft">
            {data!.letters.map((l) => (
              <LetterCard key={l.id} letter={l} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-paper-300 bg-paper-50">
        <div className="max-w-prose-xl mx-auto px-6 py-8 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400">
            KEY Editorial Office · Letters · 没有评价 · 真有记忆
          </p>
        </div>
      </footer>
    </div>
  );
}
