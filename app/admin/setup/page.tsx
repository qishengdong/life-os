/**
 * /admin/setup — 一次性 · 创建第一个 Owner 账号
 *
 * 流程:
 *   1. 访问 /admin → 系统检测无 admin → 重定向到 /admin/setup
 *   2. 这页表单: username / displayName / password / (bootstrap key, 如果 ADMIN_TOKEN 已设)
 *   3. 提交 → /api/admin/setup → 创建 owner + 自动登录 + 跳 /admin
 *   4. setup 完成后这个页面会自动跳走 (因为 setupCompleted=true)
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-900" />}>
      <SetupInner />
    </Suspense>
  );
}

async function SetupInner() {
  const router = useRouter();
  const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null);
  const [bootstrapKeyRequired, setBootstrapKeyRequired] = useState(false);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [bootstrapKey, setBootstrapKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/setup')
      .then((r) => r.json())
      .then((d) => {
        setSetupCompleted(d.setupCompleted);
        setBootstrapKeyRequired(d.bootstrapKeyRequired);
        if (d.setupCompleted) {
          // already done — go to login
          setTimeout(() => router.push('/admin/login'), 500);
        }
      })
      .catch(() => setSetupCompleted(false));
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== password2) {
      setError('两次密码不一致');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, displayName, password, bootstrapKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'setup failed');
        setSubmitting(false);
        return;
      }
      // success — 自动登录了, 跳 /admin
      router.push('/admin');
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  if (setupCompleted === null) {
    return <div className="min-h-screen bg-ink-900 text-paper-50 p-10 font-mono text-sm text-paper-300/60">加载中...</div>;
  }

  if (setupCompleted) {
    return (
      <div className="min-h-screen bg-ink-900 text-paper-50 p-10">
        <p className="font-mono text-sm text-sage">✓ Setup 已完成. 跳登录页...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <header className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-3">
            KEY · Admin Setup
          </p>
          <h1 className="font-serif text-3xl text-paper-50 mb-3">创建第一个 Owner 账号</h1>
          <p className="font-mono text-[12px] text-paper-300/70 leading-relaxed">
            首次部署后, 你需要创建一个 owner 账号. 完成后, 你能登录 /admin · 管理内容 · 邀请编辑.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-3 border border-ember text-ember bg-ember/10 rounded-sm font-mono text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <Field label="USERNAME · 登录用 (小写字母 / 数字 / .  _  -)">
            <input
              type="text"
              className="setup-input"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="e.g. xiao"
              autoFocus
              autoComplete="username"
              required
            />
          </Field>

          <Field label="DISPLAY NAME · 在 UI / commit 里的显示名 (中文 OK)">
            <input
              type="text"
              className="setup-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Xiao · 小石 · 张总编"
              required
            />
          </Field>

          <Field label="PASSWORD · 至少 8 字符">
            <input
              type="password"
              className="setup-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </Field>

          <Field label="CONFIRM PASSWORD">
            <input
              type="password"
              className="setup-input"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </Field>

          {bootstrapKeyRequired && (
            <Field
              label="BOOTSTRAP KEY · 把 Vercel 上的 ADMIN_TOKEN 值贴这里"
              hint="一次性, 用于防止陌生人随便创号. setup 完成后此字段消失."
            >
              <input
                type="password"
                className="setup-input"
                value={bootstrapKey}
                onChange={(e) => setBootstrapKey(e.target.value)}
                placeholder="paste ADMIN_TOKEN here"
                autoComplete="off"
                required
              />
            </Field>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 bg-seal-500 hover:bg-seal-700 disabled:opacity-30 text-paper-50 font-mono text-xs uppercase tracking-widest py-3 transition-colors"
          >
            {submitting ? '创建中 ...' : '创建 Owner 账号并登录 →'}
          </button>
        </form>

        <p className="mt-8 font-mono text-[10px] text-paper-300/40">
          密码使用 scrypt (N=16384, r=8, p=1, 64MB) 哈希.
          <br />
          账号数据写到 lib/content/data/admin-config.json (git committed).
        </p>

        <style jsx global>{`
          .setup-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: var(--paper-100);
            padding: 0.65rem 0.9rem;
            font-family: var(--font-source-serif), serif;
            font-size: 15px;
            border-radius: 2px;
          }
          .setup-input:focus {
            outline: none;
            border-color: var(--burgundy-500);
          }
        `}</style>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-seal-400 mb-1.5">
        {label}
      </span>
      {hint && (
        <span className="block font-mono text-[10px] text-paper-300/50 mb-1.5">
          {hint}
        </span>
      )}
      {children}
    </label>
  );
}
