/**
 * /admin/unsent-callbacks · owner 看 X 个 callback 到期 + 复制文案
 *
 * V1 manual mode (没 push channel · ICP 没下来):
 *   - 列出所有 send_intended 且 callback_due_at <= now 的信件
 *   - 显示用户 wechat_id (admin 之前填)
 *   - "复制文案" 按钮 (生成 "你 7 天前写过的信, 寄了吗?" 文案给 owner 粘到微信)
 *
 * 用户在 /unsent 页面会 surface "KEY 在问你" 收到自己 callback, 直接答.
 * 这页是 owner 主动发文案给那些**不会自己回来 /unsent** 的用户.
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CallbackItem {
  letterId: number;
  userId: number;
  recipientName: string | null;
  wechatId: string | null;
  category: string;
  recipientLabel: string | null;
  daysOverdue: number;
  contentPreview: string;
  callbackText: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  parent: '父母',
  child: '孩子',
  partner: '伴侣',
  boss: '老板',
  self: '自己',
  'past-self': '十年前的自己',
};

export default function UnsentCallbacksPage() {
  const [items, setItems] = useState<CallbackItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      const res = await fetch('/api/admin/unsent-callbacks');
      if (res.status === 401) {
        window.location.href = '/admin/login?from=/admin/unsent-callbacks';
        return;
      }
      const data = await res.json();
      if (!res.ok) setError(data.error || 'load failed');
      else setItems(data.items);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function copyText(text: string, id: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 px-6 py-8">
      <header className="max-w-5xl mx-auto flex justify-between items-baseline mb-10 flex-wrap gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-1">
            KEY · Admin · Unsent Callbacks
          </p>
          <h1 className="font-serif text-3xl">未交付的信 · 回访队列</h1>
        </div>
        <Link
          href="/admin"
          className="font-mono text-xs uppercase tracking-widest text-seal-400 hover:text-paper-50"
        >
          ← Admin
        </Link>
      </header>

      <div className="max-w-5xl mx-auto">
        <p className="font-serif italic text-paper-300 mb-8 leading-relaxed">
          这些用户 7+ 天前选了"想寄出", 还没回 KEY "寄了吗". V1 没自动 push channel —
          复制文案到微信发, 或在 admin 视图里看用户是否最近上线 (上线了她自己会看到).
        </p>

        {error && <p className="font-mono text-ember mb-6">{error}</p>}
        {!items && !error && <p className="font-mono text-paper-300/60">Loading...</p>}

        {items && items.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-serif italic text-paper-300">
              没有待回访的信件. 队列是空的.
            </p>
          </div>
        )}

        {items && items.length > 0 && (
          <ol className="space-y-6">
            {items.map((it) => (
              <li key={it.letterId} className="border border-paper-300/20 p-6 bg-paper-50/[0.02]">
                <div className="flex items-baseline justify-between mb-3 flex-wrap gap-3">
                  <div>
                    <p className="font-mono text-xs text-paper-50">
                      {it.recipientName || `user_${it.userId}`}{' '}
                      <span className="text-paper-300/40">· {CATEGORY_LABEL[it.category] || it.category}</span>
                      {it.recipientLabel && (
                        <span className="text-paper-300/60 italic"> · "{it.recipientLabel}"</span>
                      )}
                    </p>
                    <p className="font-mono text-[10px] text-paper-300/60 mt-1">
                      Wechat: {it.wechatId || <span className="text-amber">未填</span>} ·
                      过期 {it.daysOverdue} 天
                    </p>
                  </div>
                  <button
                    onClick={() => copyText(it.callbackText, it.letterId)}
                    className="px-3 py-1 font-mono text-[10px] uppercase tracking-widest border border-seal-400 text-seal-400 hover:bg-seal-500 hover:text-paper-50 transition-colors"
                  >
                    {copiedId === it.letterId ? '✓ 已复制' : '复制文案'}
                  </button>
                </div>

                <p className="font-serif italic text-[13px] text-paper-300/70 mb-4 leading-relaxed border-l border-paper-300/30 pl-3">
                  信开头: {it.contentPreview}{it.contentPreview.length === 80 ? '...' : ''}
                </p>

                <pre className="font-serif text-[14px] text-paper-50 leading-relaxed whitespace-pre-wrap bg-ink-900/50 p-3 border border-paper-300/10">
{it.callbackText}
                </pre>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
