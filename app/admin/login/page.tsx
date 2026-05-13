/**
 * /admin/login — 极简 admin token 输入页
 *
 * 没有 publication-grade craft — 这是工具页. 黑底白字 quasi-terminal 感.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const from = sp.get('from') || '/admin';

  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminEnabled, setAdminEnabled] = useState(true);

  useEffect(() => {
    // 检查 admin 是否启用
    fetch('/api/admin/login')
      .then((r) => r.json())
      .then((d) => {
        if (!d.adminEnabled) {
          setAdminEnabled(false);
        } else if (d.authed) {
          router.push(from);
        }
      });
  }, [from, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '登录失败');
      } else {
        router.push(from);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!adminEnabled) {
    return (
      <div className="min-h-screen bg-ink-900 text-paper-50 flex items-center justify-center p-6">
        <div className="max-w-md">
          <h1 className="font-serif text-3xl mb-4 text-seal-400">Admin disabled</h1>
          <p className="font-mono text-sm leading-relaxed">
            ADMIN_TOKEN env var is not set or too short (&lt; 8 chars).
            <br />
            <br />
            Set it in <code className="bg-ink-700 px-2 py-0.5 rounded">.env.local</code>:
            <br />
            <code className="bg-ink-700 px-2 py-0.5 rounded mt-2 inline-block">
              ADMIN_TOKEN=&lt;random-long-string-≥16-chars&gt;
            </code>
            <br />
            <br />
            Then restart dev server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-2">
          LifeOS · Admin
        </p>
        <h1 className="font-serif text-3xl mb-10 tracking-tightish">Admin Login</h1>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-paper-300 block mb-2">
              ADMIN_TOKEN
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="paste admin token..."
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className="w-full px-4 py-3 bg-ink-700 border border-ink-700 focus:border-seal-400 focus:outline-none font-mono text-sm text-paper-50 placeholder:text-paper-300/30"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !token}
            className="w-full px-6 py-3 bg-seal-500 hover:bg-seal-600 text-paper-50 font-mono text-sm uppercase tracking-widest disabled:bg-ink-700 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'verifying...' : 'login'}
          </button>
          {error && <p className="font-mono text-sm text-ember">{error}</p>}
        </form>

        <p className="mt-12 font-mono text-[10px] text-paper-300/40 leading-relaxed">
          Brute force protection: 500ms delay on failed attempts.
          <br />
          Token is verified server-side with constant-time compare.
          <br />
          Cookie expires after 7 days.
        </p>
      </div>
    </div>
  );
}
