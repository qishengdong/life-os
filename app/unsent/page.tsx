/**
 * /unsent — 未交付的信
 *
 * KEY 真护城河 L2 · 用户在这里 surface 想说没说的话 · 6 类收件人.
 * Day 2 V1: 写 + 列表 + category 过滤. 不展示寄/不寄选项 (Day 4 加).
 *
 * "有些话不一定要寄出, 但不该消失."
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import KeyWordmark from '@/components/KeyWordmark';
import PageMasthead from '@/components/PageMasthead';

const CATEGORIES = [
  { key: 'parent',    label: '给父母',       hint: '想说但没机会 / 没敢说的话' },
  { key: 'child',     label: '给孩子',       hint: '现在不好说, 或者她 / 他还听不懂' },
  { key: 'partner',   label: '给伴侣',       hint: '吵架后没说的, 或者一直没说出口的' },
  { key: 'boss',      label: '给老板/同事',   hint: '想表态但说不出 · 或者已经离开的人' },
  { key: 'self',      label: '给自己',       hint: '今天的你想对未来的自己说一句' },
  { key: 'past-self', label: '给十年前的自己', hint: '那个还没做选择的你, 现在你想跟他/她说什么' },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]['key'];

interface UnsentLetter {
  id: number;
  category: CategoryKey;
  recipientLabel: string | null;
  content: string;
  status: 'drafted' | 'send_intended' | 'archived' | 'sent' | 'not_sent';
  callbackDueAt: number | null;
  callbackDoneAt: number | null;
  createdAt: number;
}

function categoryLabel(key: CategoryKey): string {
  return CATEGORIES.find((c) => c.key === key)?.label || key;
}

function formatDate(unix: number): string {
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function TopNav() {
  return (
    <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
      <Link href="/" aria-label="KEY home" className="block">
        <KeyWordmark variant="nav" height={22} />
      </Link>
      <div className="flex gap-6 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
        <Link href="/pulse" className="hover:text-seal-500 transition-colors">Pulse</Link>
        <Link href="/letters/new" className="hover:text-seal-500 transition-colors">写给 KEY</Link>
        <Link href="/brain" className="hover:text-seal-500 transition-colors">Brain</Link>
        <Link href="/" className="hover:text-seal-500 transition-colors">← Home</Link>
      </div>
    </nav>
  );
}

export default function UnsentPage() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [letters, setLetters] = useState<UnsentLetter[] | null>(null);
  const [counts, setCounts] = useState<Record<CategoryKey, number> | null>(null);
  const [filter, setFilter] = useState<CategoryKey | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // 写入态
  const [composeCategory, setComposeCategory] = useState<CategoryKey | null>(null);
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUserUid(getOrCreateClientUid());
  }, []);

  useEffect(() => {
    if (!userUid) return;
    refresh();
  }, [userUid, filter]);

  async function refresh() {
    if (!userUid) return;
    setLoading(true);
    try {
      const qs = filter === 'all' ? '' : `?category=${filter}`;
      const res = await fetch(`/api/unsent${qs}`, {
        headers: { [UID_HEADER]: userUid },
      });
      if (res.ok) {
        const data = await res.json();
        setLetters(data.letters);
        setCounts(data.counts);
      }
    } finally {
      setLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userUid || !composeCategory || !content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/unsent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({
          category: composeCategory,
          recipientLabel: recipient.trim() || null,
          content: content.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '保存失败');
      } else {
        setComposeCategory(null);
        setRecipient('');
        setContent('');
        await refresh();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <TopNav />
      <PageMasthead eyebrow="UNSENT" volume="未交付的信 · 私人档案" right="MMXXVI" />

      {/* HERO */}
      <header className="max-w-prose-lg mx-auto px-6 pt-12 pb-10">
        <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter mb-6 leading-[1.1]">
          有些话不一定要寄出, 但不该消失.
        </h1>
        <p className="font-serif text-reading text-ink-700 editorial-leading">
          给父母、孩子、伴侣、老板、十年前那个没选的自己. 写下来. KEY 替你保管.
          需要时, 这些片段会被整理成你重大决策的真实背景.
        </p>
      </header>

      {/* 写入区 — 选 category 展开 form */}
      <section className="max-w-prose-xl mx-auto px-6 pb-12 border-b border-paper-300">
        {!composeCategory ? (
          <>
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
              · 写一封 ·
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES.map((c) => {
                const cnt = counts?.[c.key] ?? 0;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                      setComposeCategory(c.key);
                      setError(null);
                    }}
                    className="text-left border border-paper-300 hover:border-seal-500 transition-colors p-5 bg-paper hover:bg-paper-50"
                  >
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-serif text-xl text-ink-900 tracking-tightish">
                        {c.label}
                      </h3>
                      {cnt > 0 && (
                        <span className="font-mono text-[11px] text-seal-500">{cnt} 封</span>
                      )}
                    </div>
                    <p className="font-serif text-[14px] text-ink-500 editorial-leading">
                      {c.hint}
                    </p>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="flex items-baseline justify-between">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500">
                · {categoryLabel(composeCategory)} ·
              </p>
              <button
                type="button"
                onClick={() => {
                  setComposeCategory(null);
                  setRecipient('');
                  setContent('');
                  setError(null);
                }}
                className="font-serif italic text-sm text-ink-500 hover:text-seal-500"
              >
                取消
              </button>
            </div>

            <div>
              <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 block mb-2">
                给谁 (可空)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder='例: "妈妈" / "12 岁的我" / "前老板老李"'
                maxLength={80}
                className="w-full px-4 py-2.5 font-serif text-[15px] border border-paper-300 bg-paper-50 focus:border-seal-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 block mb-2">
                想说的话
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="不评判. 不修辞. 想到什么写什么."
                rows={10}
                maxLength={5000}
                className="w-full px-4 py-3 font-serif text-[15px] leading-relaxed border border-paper-300 bg-paper-50 focus:border-seal-500 focus:outline-none transition-colors"
                autoFocus
              />
              <p className="font-mono text-[10px] text-ink-400 mt-1.5 text-right">
                {content.length} / 5000
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-8 py-3 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 disabled:bg-ink-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '保存中...' : '保存 (寄不寄, 之后再决定)'}
            </button>
            {error && (
              <p className="font-serif text-sm text-ember italic">{error}</p>
            )}
            <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed pt-2">
              这一封 KEY 替你存着. 之后想"寄出" / "留档不寄"都可以再选.
              寄出意图会让 KEY 7 天后问你"寄了吗" — 但你想"留着不动"也行.
            </p>
          </form>
        )}
      </section>

      {/* 列表 */}
      <section className="max-w-prose-xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500">
            · 你的档案 ·
          </p>
          <div className="flex gap-2 flex-wrap text-[11px] font-sans uppercase tracking-[0.15em]">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 border transition-colors ${
                filter === 'all' ? 'border-seal-500 text-seal-500' : 'border-paper-300 text-ink-500 hover:text-ink-900'
              }`}
            >
              全部 {letters && filter === 'all' ? `(${letters.length})` : ''}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setFilter(c.key)}
                className={`px-3 py-1 border transition-colors ${
                  filter === c.key ? 'border-seal-500 text-seal-500' : 'border-paper-300 text-ink-500 hover:text-ink-900'
                }`}
              >
                {c.label.replace('给', '')}
                {counts && counts[c.key] > 0 ? ` (${counts[c.key]})` : ''}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="font-serif italic text-sm text-ink-500">载入中...</p>
        ) : !letters || letters.length === 0 ? (
          <p className="font-serif italic text-ink-500 leading-relaxed py-12 text-center">
            {filter === 'all'
              ? '还没有信. 上面选一类, 写第一封.'
              : `${categoryLabel(filter as CategoryKey)} · 还没写过.`}
          </p>
        ) : (
          <ol className="space-y-6">
            {letters.map((l) => (
              <LetterCard
                key={l.id}
                letter={l}
                userUid={userUid}
                onChanged={refresh}
              />
            ))}
          </ol>
        )}
      </section>

      <footer className="border-t border-paper-300 bg-paper-50">
        <div className="max-w-prose-xl mx-auto px-6 py-10 text-center">
          <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
            KEY · 长期跟你通信的私人顾问 · 这些档案只有你能读.
          </p>
        </div>
      </footer>
    </div>
  );
}

function LetterCard({
  letter: l,
  userUid,
  onChanged,
}: {
  letter: UnsentLetter;
  userUid: string | null;
  onChanged: () => void;
}) {
  const [acting, setActing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function patch(action: 'send_intent' | 'archive' | 'callback_sent' | 'callback_not_sent') {
    if (!userUid || acting) return;
    setActing(true);
    setErr(null);
    try {
      const res = await fetch(`/api/unsent/${l.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) setErr(data.error || '操作失败');
      else onChanged();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setActing(false);
    }
  }

  const callbackDueDays = l.status === 'send_intended' && l.callbackDueAt
    ? Math.floor((l.callbackDueAt - Date.now() / 1000) / 86400)
    : null;
  const callbackDue = callbackDueDays !== null && callbackDueDays <= 0;

  return (
    <li className="border-b border-paper-300 pb-6">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-seal-500">
            {categoryLabel(l.category)}
          </span>
          {l.recipientLabel && (
            <span className="font-serif italic text-[13px] text-ink-500">
              · {l.recipientLabel}
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] text-ink-400">{formatDate(l.createdAt)}</span>
      </div>
      <p className="font-serif text-reading text-ink-900 editorial-leading whitespace-pre-wrap mb-4">
        {l.content}
      </p>

      {/* 状态 + 操作 */}
      {l.status === 'drafted' && (
        <div className="border-t border-paper-300 pt-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink-500 mb-3">
            · 接下来 ·
          </p>
          <div className="flex flex-wrap gap-3 items-baseline">
            <button
              type="button"
              onClick={() => patch('send_intent')}
              disabled={acting}
              className="px-5 py-2 font-serif text-sm text-paper bg-ink-900 hover:bg-seal-500 disabled:bg-ink-400 transition-colors"
            >
              想寄出 · 7 天后 KEY 问我
            </button>
            <button
              type="button"
              onClick={() => patch('archive')}
              disabled={acting}
              className="px-5 py-2 font-serif text-sm text-ink-900 border border-ink-900/30 hover:border-seal-500 hover:text-seal-500 transition-colors"
            >
              留档不寄
            </button>
            <span className="font-serif italic text-[12px] text-ink-500">
              不决定也行 — 它已经被保管了.
            </span>
          </div>
        </div>
      )}

      {l.status === 'send_intended' && callbackDue && (
        <div className="border-t border-amber/40 pt-4 mt-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-amber mb-2">
            ⚠ KEY 在问你
          </p>
          <p className="font-serif text-[15px] text-ink-900 mb-3">寄了吗?</p>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => patch('callback_sent')}
              disabled={acting}
              className="px-4 py-1.5 font-serif text-sm text-paper bg-sage hover:opacity-80 transition-opacity"
            >
              寄了
            </button>
            <button
              type="button"
              onClick={() => patch('callback_not_sent')}
              disabled={acting}
              className="px-4 py-1.5 font-serif text-sm text-ink-900 border border-ink-900/30 hover:border-seal-500 transition-colors"
            >
              最终没寄
            </button>
          </div>
        </div>
      )}

      {l.status === 'send_intended' && !callbackDue && (
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-seal-500 mt-3">
          · 想寄出 · KEY 还在等
          {callbackDueDays !== null && callbackDueDays > 0 ? ` · ${callbackDueDays} 天后问 ·` : ' ·'}
        </p>
      )}

      {l.status === 'archived' && (
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 mt-3">
          · 留档不寄 ·
        </p>
      )}
      {l.status === 'sent' && (
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-sage mt-3">
          · 已寄 ·
        </p>
      )}
      {l.status === 'not_sent' && (
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 mt-3">
          · 最终没寄 · 留在档案 ·
        </p>
      )}

      {err && <p className="font-serif text-sm text-ember italic mt-3">{err}</p>}
    </li>
  );
}
