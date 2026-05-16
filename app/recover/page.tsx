/**
 * /recover — 用户在新设备 / 清数据后用恢复码找回 brain.
 *
 * 流程:
 *   1. 读取当前 device 的 localStorage UUID (新设备就是空白 UUID)
 *   2. 输入 KEY-XXXX-XXXX
 *   3. POST /api/auth/recover { recoveryCode } + X-User-UID header (新设备 UUID)
 *   4. server 把 user.user_uid swap 到新 UUID, 历史 brain/decisions/letters 跟过来
 *   5. 跳转到 /onboarding (如果未完成) 或 /pulse (默认登录后落点)
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import KeyWordmark from '@/components/KeyWordmark';
import PageMasthead from '@/components/PageMasthead';

function TopNav() {
  return (
    <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
      <Link href="/" aria-label="KEY home" className="block">
        <KeyWordmark variant="nav" height={22} />
      </Link>
      <div className="flex gap-6 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
        <Link href="/methodology" className="hover:text-seal-500 transition-colors">方法论</Link>
        <Link href="/invite" className="hover:text-seal-500 transition-colors">没邀请码</Link>
        <Link href="/" className="hover:text-seal-500 transition-colors">← Home</Link>
      </div>
    </nav>
  );
}

export default function RecoverPage() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setUserUid(getOrCreateClientUid());
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userUid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({ recoveryCode: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '恢复失败');
      } else {
        setSuccess(data.message || '欢迎回来.');
        setTimeout(() => router.push('/pulse'), 1500);
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
      <PageMasthead eyebrow="RECOVER" volume="找回 · 私人通信" right="MMXXVI" />

      <header className="max-w-prose-lg mx-auto px-6 pt-16 pb-10">
        <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter mb-6 leading-[1.1]">
          找回你的 KEY.
        </h1>
        <p className="font-serif text-reading text-ink-700 editorial-leading mb-10">
          换了设备 / 清了 Safari 数据 / 误删了浏览器? 用兑换邀请时保存的恢复码找回 brain.
          一切历史 — 你写过的信, 做过的决策, KEY 给你的简报 — 都还在.
        </p>

        {success ? (
          <div className="border-2 border-seal-500 bg-paper-50 p-8 max-w-prose-md">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
              ✓ 已找回
            </p>
            <p className="font-serif text-reading text-ink-900 mb-1">{success}</p>
            <p className="font-serif text-sm text-ink-500 italic">正在带你回到 KEY...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="max-w-prose-md space-y-5">
            <div>
              <label className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 block mb-3">
                恢复码
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="KEY-XXXX-XXXX"
                spellCheck={false}
                autoComplete="off"
                className="w-full px-5 py-3.5 font-mono text-base tracking-widest uppercase border border-paper-300 bg-paper-50 focus:border-seal-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !code.trim()}
              className="px-8 py-3 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 disabled:bg-ink-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '找回中...' : '找回 →'}
            </button>
            {error && (
              <p className="font-serif text-sm text-ember italic">{error}</p>
            )}
          </form>
        )}
      </header>

      <section className="border-t border-paper-300 bg-paper-50">
        <div className="max-w-prose-lg mx-auto px-6 py-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · 恢复码丢了 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-6">
            加管理员微信兜底.
          </h2>
          <div className="space-y-4 font-serif text-reading text-ink-700 editorial-leading">
            <p>
              恢复码我们也没法补发 — 它从未存在我们服务器上的明文里, 只在你截图的那一刻被显示过.
            </p>
            <p>
              真的丢了, 加管理员微信 (邀请你的那位 / 或 hello@lifeos.cn 邮件请求微信号),
              我们核对你的邀请人 + 邀请时间 + 一些你 brain 里的真实信号, 帮你手工 swap 设备 ID.
            </p>
            <p className="text-ink-500 italic text-[14px]">
              这套兜底只对内测期 100 个名额有效. 不是 self-service 路径, 是 founder 给真用户的人工担保.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
