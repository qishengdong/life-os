/**
 * /decisions/[number] — 显示用户自己的某份 brief
 *
 * JOB-006.
 *
 * 客户端: 拉 GET /api/decision/brief/[number], 渲染 BriefRenderer.
 * 错误: 显示 "找不到这份简报 / 你不是这份简报的作者" (后端校验 user_id).
 *
 * 跟 /sample-brief 区别:
 *   - sample-brief: 静态 3 份示例, 公开, showSeal=true
 *   - decisions/[number]: 用户自己的, 私密, showSeal=false
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import { useParams } from 'next/navigation';
import KeyWordmark from '@/components/KeyWordmark';
import BriefRenderer from '@/components/BriefRenderer';
import type { DecisionBrief } from '@/lib/decision/brief-schema';

export default function DecisionBriefDetailPage() {
  const params = useParams<{ number: string }>();
  const number = params?.number;

  const [brief, setBrief] = useState<DecisionBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!number) return;
    const uid = getOrCreateClientUid();
    fetch(`/api/decision/brief/${number}`, {
      headers: { [UID_HEADER]: uid },
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setError(data.error || '找不到这份简报');
        } else {
          setBrief(data.brief as DecisionBrief);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || '网络错误');
        setLoading(false);
      });
  }, [number]);

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      {/* Top nav */}
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <div className="flex gap-6 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
          <Link href="/decisions/new" className="hover:text-seal-500 transition-colors">
            写新决定 →
          </Link>
          <Link href="/" className="hover:text-seal-500 transition-colors">
            ← Home
          </Link>
        </div>
      </nav>

      <main className="max-w-prose-xl mx-auto px-6 pb-24">
        {loading && (
          <div className="py-32 text-center">
            <p className="font-serif italic text-ink-400">加载简报 ...</p>
          </div>
        )}

        {error && !loading && (
          <div className="my-16 text-center max-w-prose-md mx-auto">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ember mb-3">
              错误
            </p>
            <h1 className="font-serif text-2xl text-ink-900 mb-3">{error}</h1>
            <p className="font-serif italic text-[15px] text-ink-500 mb-8">
              这份简报可能不存在, 或者不属于你 (只有作者能看). 简报号是错的?
            </p>
            <Link
              href="/decisions/new"
              className="inline-block px-6 py-3 bg-seal-500 hover:bg-seal-700 text-paper-100 font-serif text-base transition-colors"
            >
              写一份新的决定 →
            </Link>
          </div>
        )}

        {brief && (
          <div className="pt-8">
            <BriefRenderer brief={brief} showSeal={false} compactHeader={false} />

            {/* 底部 next-actions */}
            <div className="mt-20 pt-10 border-t border-paper-300 text-center">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
                · 接下来 ·
              </p>
              <p className="font-serif italic text-[15px] text-ink-500 max-w-prose-md mx-auto mb-8">
                30 / 90 / 365 天后, KEY 会回来问你: 你担心的事发生了吗?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/decisions/new"
                  className="font-serif text-base text-ink-900 border-b-2 border-seal-500 pb-1 hover:text-seal-500 transition-colors"
                >
                  写另一份决定
                </Link>
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline">
                  ·
                </span>
                <Link
                  href="/"
                  className="font-serif text-base text-ink-700 hover:text-seal-500 transition-colors"
                >
                  ← 回首页
                </Link>
              </div>
            </div>

            {/* 渐进式 surface · UX 方向 A · 仅在用户读完简报后才暴露其他功能 */}
            <div className="mt-16 pt-8 border-t border-paper-200">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-6 text-center">
                · KEY 还能做的 ·
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <Link
                  href="/pulse"
                  className="group block py-6 px-4 border border-paper-200 hover:border-seal-500 transition-colors"
                >
                  <p className="font-serif text-base text-ink-900 mb-2 group-hover:text-seal-500">今日一句 · 每天 30 秒</p>
                  <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
                    一句话写今天的状态. 累计成 KEY 越来越懂你的素材.
                  </p>
                </Link>
                <Link
                  href="/unsent"
                  className="group block py-6 px-4 border border-paper-200 hover:border-seal-500 transition-colors"
                >
                  <p className="font-serif text-base text-ink-900 mb-2 group-hover:text-seal-500">写不寄的信</p>
                  <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
                    给妈妈 / 老板 / 过去的自己 — 写出来不发送. 7 天后 KEY 问你寄不寄.
                  </p>
                </Link>
                <Link
                  href="/brain"
                  className="group block py-6 px-4 border border-paper-200 hover:border-seal-500 transition-colors"
                >
                  <p className="font-serif text-base text-ink-900 mb-2 group-hover:text-seal-500">看 KEY 怎么记得你</p>
                  <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
                    Brain 是你的私人档案. 不准就改, 不该有就删.
                  </p>
                </Link>
              </div>
              <p className="font-mono text-[10px] text-ink-400 text-center mt-6 tracking-wider">
                <Link href="/settings" className="hover:text-seal-500 transition-colors">· 设置 / 数据导出 / 删账户 ·</Link>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
