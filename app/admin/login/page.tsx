/**
 * /admin/login — username + password 登录
 *
 * 流程:
 *   - 若 admin 未 setup → 自动跳 /admin/setup
 *   - 否则: 输 username + password → POST /api/admin/login → set cookie → 跳 /admin
 *
 * 视觉: 跟其他 /admin 一致, 黑底工具感.
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-900" />}>
      <AdminLoginInner />
    </Suspense>
  );
}

async function AdminLoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const from = sp.get('from') || '/admin/cms';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    fetch('/api/admin/login')
      .then((r) => r.json())
      .then((d) => {
        if (d.needsSetup) {
          setNeedsSetup(true);
          setTimeout(() => router.push('/admin/setup'), 800);
        } else if (d.authed) {
          router.push(from);
        }
      })
      .catch(() => {});
  }, [from, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsSetup) {
          router.push('/admin/setup');
          return;
        }
        setError(data.error || '登录失败');
        setSubmitting(false);
        return;
      }
      router.push(from);
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  if (needsSetup) {
    return (
      <div className="min-h-screen bg-ink-900 text-paper-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-3">
            KEY · Admin
          </p>
          <p className="font-serif text-xl mb-2">Admin 未 setup</p>
          <p className="font-mono text-sm text-paper-300/60">跳转到 setup 页 ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-2">
          KEY · Admin
        </p>
        <h1 className="font-serif text-3xl mb-10 tracking-tightish">登录</h1>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-paper-300 block mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              spellCheck={false}
              className="w-full px-4 py-3 bg-ink-700 border border-ink-700 focus:border-seal-400 focus:outline-none font-mono text-sm text-paper-50 placeholder:text-paper-300/30"
              placeholder="xiao"
              required
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-paper-300 block mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-ink-700 border border-ink-700 focus:border-seal-400 focus:outline-none font-mono text-sm text-paper-50 placeholder:text-paper-300/30"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !username || !password}
            className="w-full px-6 py-3 bg-seal-500 hover:bg-seal-600 text-paper-50 font-mono text-sm uppercase tracking-widest disabled:bg-ink-700 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'verifying...' : '登录'}
          </button>
          {error && <p className="font-mono text-sm text-ember">{error}</p>}
        </form>

        <p className="mt-10 font-mono text-[10px] text-paper-300/40 leading-relaxed">
          密码 scrypt 哈希 (N=16384, r=8, p=1, 64MB cost) + 失败 400ms 延迟.
          <br />
          Session cookie 7 天过期.
          <br />
          忘记密码? 让 owner 重置, 或重新邀请你.
        </p>
      </div>
    </div>
  );
}
