/**
 * /letters/[id] — 单封信详情 (来信 + KEY 回信)
 *
 * Phase 4a Day 6
 *
 * 设计哲学:
 *   - 上半: 我的信 (paper texture 卡片)
 *   - 中间: fleuron divider
 *   - 下半: KEY 编辑部回信 (drop cap + 引用块 + 印章落款)
 *   - 不允许气泡 / chat 历史 / streaming
 *   - 整封一次性显示, 即使等回信也要"信"的形式
 *
 * 状态处理:
 *   pending  → 等回信占位卡 + 每 5s polling
 *   replied  → 完整回信渲染
 *   failed   → 「未送达」卡 + 重试按钮
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import KeyWordmark from '@/components/KeyWordmark';
import BriefSeal from '@/components/BriefSeal';
import Fleuron from '@/components/Fleuron';

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
  durationMs: number | null;
}

function formatDateHeader(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getFullYear()} · ${d.getMonth() + 1} · ${d.getDate()} · ${weekdays[d.getDay()]}`;
}

// ============================================================================
// 来信卡片 (用户写的)
// ============================================================================
function IncomingLetterCard({ letter }: { letter: LetterRecord }) {
  return (
    <article className="relative p-8 md:p-12 bg-paper-100 border border-paper-300 letter-paper">
      <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-1">
        {formatDateHeader(letter.authoredAt)}
      </p>
      <p className="font-serif text-base text-ink-700 mb-8">致 KEY,</p>

      <div className="letter-prose whitespace-pre-line">
        {letter.userContent}
      </div>

      <div className="mt-10 flex items-baseline justify-end">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400">
          {letter.userCharCount} 字
        </span>
      </div>
    </article>
  );
}

// ============================================================================
// Pending 占位 — KEY 正在阅读
// ============================================================================
function PendingPlaceholder() {
  return (
    <article className="p-10 md:p-16 bg-paper-100 border border-paper-300 text-center">
      <div className="inline-block mb-6">
        <Fleuron variant="simple-diamond" seal width={48} />
      </div>
      <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
        KEY EDITORIAL OFFICE
      </p>
      <p className="font-serif text-xl text-ink-900 italic mb-3">
        正在阅读你的来信 ...
      </p>
      <p className="font-serif text-[14px] text-ink-500 editorial-leading max-w-prose-lg mx-auto">
        我们 5-30 秒回信. 这期间, 你可以离开 — 信回来了它就在这里.
        <br />
        也可以留下来等. 这一刻的安静本身也属于这封信.
      </p>
      <div className="mt-8 inline-flex items-center gap-2">
        <span className="ink-cursor" />
      </div>
    </article>
  );
}

// ============================================================================
// Failed 占位 — 未送达
// ============================================================================
function FailedPlaceholder({
  letter,
  onRetry,
  retrying,
}: {
  letter: LetterRecord;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <article className="p-10 md:p-12 bg-paper-100 border-2 border-ember/60 text-center">
      <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ember mb-4">
        信件未送达
      </p>
      <p className="font-serif text-reading text-ink-900 italic mb-3">
        编辑部这次没回成功.
      </p>
      <p className="font-serif text-[13px] text-ink-500 editorial-leading max-w-prose-lg mx-auto mb-8">
        {letter.failureReason || '原因不详, 可以重试.'}
      </p>
      <button
        onClick={onRetry}
        disabled={retrying}
        className={`font-serif text-sm px-6 py-2 border transition-colors ${
          retrying
            ? 'border-paper-400 text-ink-400 cursor-not-allowed'
            : 'border-seal-500 text-seal-500 hover:bg-seal-500 hover:text-paper-100'
        }`}
      >
        {retrying ? '重试中 ...' : '请编辑部再试一次 →'}
      </button>
    </article>
  );
}

// ============================================================================
// Reply — KEY 编辑部回信
// ============================================================================
function ReplyCard({ letter }: { letter: LetterRecord }) {
  const text = letter.replyContent || '';

  // 拆: 第一段 (称呼 + 第一段) | 其余段
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  const firstPara = paragraphs[0] || '';
  const restParas = paragraphs.slice(1);

  // 第一字下沉 — 取称呼后的第一个段落第一字
  // 实际上称呼自成一行, 第一段在它下面. 简化处理: 直接给整体应用 drop cap class via first para
  const firstChar = firstPara.charAt(0);
  const firstRest = firstPara.slice(1);
  const isCJK = firstChar.charCodeAt(0) >= 0x2e80;

  return (
    <article className="relative p-8 md:p-12 bg-paper-100 border-t-[3px] border-t-seal-500 border-x border-b border-paper-300 letter-paper">
      <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
        KEY EDITORIAL OFFICE · 回信
      </p>

      {/* 第一段 (含称呼) with drop cap, 复古字体 */}
      <p className="letter-prose mb-6">
        <span
          className={`drop-cap-char drop-cap-char--seal${isCJK ? ' drop-cap-char--cn' : ''}`}
        >
          {firstChar}
        </span>
        {firstRest}
      </p>

      {/* 其余段 — 自动识别引文块 (含 "—— xxx, 《xxx》" 行) */}
      {restParas.map((p, i) => {
        // 检测引文段: 包含 "——" 或 "—" + 引号内容
        const isQuote = /[""].*?[""][\s\S]*?[—――]/m.test(p) || /^[""].*[""]$/m.test(p);
        if (isQuote) {
          return (
            <blockquote
              key={i}
              className="my-8 pl-6 border-l-2 border-seal-500/40 font-serif text-[19px] text-ink-700 italic leading-[1.95] tracking-wide whitespace-pre-line"
            >
              {p}
            </blockquote>
          );
        }
        return (
          <p key={i} className="letter-prose mb-6 whitespace-pre-line">
            {p}
          </p>
        );
      })}

      {/* 落款 */}
      <div className="mt-12 pt-6 border-t border-paper-300 flex items-end justify-between gap-6">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-500">
            KEY
          </p>
          <p className="font-mono text-[10px] text-ink-400 uppercase tracking-wider mt-1">
            {letter.letterNumber}
            {letter.replyAuthoredAt &&
              ` · 回信于 ${formatDateHeader(letter.replyAuthoredAt)}`}
          </p>
          {letter.replyCharCount && (
            <p className="font-mono text-[10px] text-ink-400 mt-0.5">
              {letter.replyCharCount} 字
              {letter.durationMs ? ` · 撰稿 ${(letter.durationMs / 1000).toFixed(1)}s` : ''}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <BriefSeal variant="round-cn" size={72} seed={letter.letterNumber} />
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// 主组件
// ============================================================================
export default function LetterDetailPage() {
  const params = useParams<{ id: string }>();
  const letterId = params?.id;

  const [letter, setLetter] = useState<LetterRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  function fetchLetter() {
    if (!letterId) return;
    const uid = getOrCreateClientUid();
    return fetch(`/api/letters/${letterId}`, {
      headers: { [UID_HEADER]: uid },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          setLoading(false);
          return null;
        }
        setLetter(d.letter);
        setLoading(false);
        return d.letter as LetterRecord;
      })
      .catch((e) => {
        setError(e?.message || '加载失败');
        setLoading(false);
        return null;
      });
  }

  // 初始加载
  useEffect(() => {
    fetchLetter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letterId]);

  // pending → polling
  useEffect(() => {
    if (!letter || letter.status !== 'pending') {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }
    if (pollingRef.current) return; // already polling
    pollingRef.current = setInterval(() => {
      fetchLetter();
    }, 5000);
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter?.status]);

  async function handleRetry() {
    if (!letterId || retrying) return;
    setRetrying(true);
    try {
      const uid = getOrCreateClientUid();
      const res = await fetch(`/api/letters/${letterId}`, {
        method: 'POST',
        headers: { [UID_HEADER]: uid },
      });
      const d = await res.json();
      if (!res.ok || !d.success) {
        setError(d.error || '重试失败');
      } else {
        setLetter(d.letter); // 现在是 pending, useEffect 自动开 polling
      }
    } catch (e: any) {
      setError(e?.message || '重试失败');
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink-900">
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

      <main className="max-w-prose-xl mx-auto px-6 pt-12 pb-32">
        {loading && (
          <p className="font-serif italic text-ink-400 text-center py-16">读这封信中 ...</p>
        )}

        {error && !letter && (
          <div className="my-12 p-6 border-l-2 border-ember bg-paper-100">
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ember mb-2">
              错误
            </p>
            <p className="font-serif text-sm text-ink-700">{error}</p>
            <Link
              href="/letters"
              className="mt-4 inline-block font-sans text-[10px] uppercase tracking-[0.2em] text-seal-500 hover:text-seal-700"
            >
              ← 返回通信集
            </Link>
          </div>
        )}

        {letter && (
          <div className="space-y-12 animate-fade-in-soft">
            {/* Issue 编号 */}
            <div className="text-center">
              <span className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] text-ink-500 border-y border-paper-400 py-1 px-4">
                · {letter.letterNumber} ·
              </span>
            </div>

            {/* Onboarding letter (KEY 开场信) — 跳过"我的信" 卡片, 直接显示 KEY 开场信 */}
            {letter.frameworkMatched === 'onboarding' && letter.replyContent && (
              <>
                <section>
                  <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4 text-center">
                    KEY · 致每一位新通信人
                  </p>
                  <ReplyCard letter={letter} />
                </section>
                <div className="text-center pt-8 border-t border-paper-300 space-y-4">
                  <p className="font-serif italic text-[15px] text-ink-500">
                    现在, 轮到你写第一封.
                  </p>
                  <Link
                    href="/letters/new"
                    className="inline-block bg-seal-500 hover:bg-seal-700 text-paper-100 font-serif text-base px-8 py-3 transition-colors"
                  >
                    回这封信 →
                  </Link>
                </div>
              </>
            )}

            {/* 正常的 letter — 我的信 + 回信 */}
            {letter.frameworkMatched !== 'onboarding' && (
              <>
                <section>
                  <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-4 text-center">
                    我的信
                  </p>
                  <IncomingLetterCard letter={letter} />
                </section>

                {/* Fleuron divider — 中间停顿 */}
                <div className="flex items-center justify-center py-4">
                  <Fleuron variant="classical-west" seal width={64} />
                </div>

                {/* 回信 (按状态分支) */}
                <section>
                  <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4 text-center">
                    KEY · 回信
                  </p>
                  {letter.status === 'pending' && <PendingPlaceholder />}
                  {letter.status === 'failed' && (
                    <FailedPlaceholder letter={letter} onRetry={handleRetry} retrying={retrying} />
                  )}
                  {letter.status === 'replied' && letter.replyContent && (
                    <ReplyCard letter={letter} />
                  )}
                </section>

                {/* 写下一封 */}
                <div className="text-center pt-8 border-t border-paper-300">
                  <Link
                    href="/letters/new"
                    className="inline-block font-serif text-base text-ink-900 border-b-2 border-seal-500 pb-1 hover:text-seal-500 transition-colors"
                  >
                    写下一封 →
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
