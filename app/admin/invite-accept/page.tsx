/**
 * /admin/invite-accept?token=xxx — 受邀人打开链接的页面
 *
 * 流程:
 *   1. 加载 invite 信息 (GET /api/admin/invite/[token])
 *   2. 显示: "你被邀请为 [displayName] (editor/owner)"
 *   3. 让受邀人设密码
 *   4. POST → 创建用户 + 自动登录 + 跳 /admin/cms
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-900" />}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get('token');

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<{
    username: string;
    displayName: string;
    role: 'owner' | 'editor';
    note?: string;
    expiresAt: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('链接缺少 token 参数');
      setLoading(false);
      return;
    }
    fetch(`/api/admin/invite/${token}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          setError(d.error || '邀请无效');
        } else {
          setInvite(d.invite);
          setDisplayName(d.invite.displayName);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== password2) {
      setError('两次密码不一致');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/invite/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, displayName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || '设置失败');
        setSubmitting(false);
        return;
      }
      // 成功 → 跳 CMS
      router.push('/admin/cms');
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 text-paper-50 p-10 font-mono text-sm text-paper-300/60">
        加载邀请...
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-ink-900 text-paper-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-3">
            KEY · Admin · Invite
          </p>
          <h1 className="font-serif text-2xl text-paper-50 mb-3">链接无效</h1>
          <p className="font-mono text-sm text-ember">{error}</p>
          <p className="font-mono text-[12px] text-paper-300/50 mt-4">
            让邀请你的人重新发一个链接, 或者直接 /admin/login 登录 (如果你已有账号)
          </p>
        </div>
      </div>
    );
  }

  if (!invite) return null;

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-3">
          KEY · Admin · 接受邀请
        </p>
        <h1 className="font-serif text-2xl text-paper-50 mb-3">
          欢迎, {invite.displayName}.
        </h1>
        <p className="font-mono text-[12px] text-paper-300/70 leading-relaxed mb-2">
          你被邀请加入 KEY 团队, 角色:{' '}
          <span className="text-seal-400">{invite.role}</span>
          {invite.role === 'editor' && ' (能改 CMS 内容 + 发布)'}
          {invite.role === 'owner' && ' (全权限 + 管账号)'}
        </p>
        <p className="font-mono text-[11px] text-paper-300/50 mb-8">
          登录用户名: <code className="bg-ink-700 px-1.5 py-0.5 rounded">{invite.username}</code>
          {' · '} 链接过期: {new Date(invite.expiresAt * 1000).toLocaleString('zh-CN')}
        </p>

        {error && (
          <div className="mb-6 p-3 border border-ember text-ember bg-ember/10 rounded-sm font-mono text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-paper-300 mb-1.5">
              显示名 (可改, 中文 OK)
            </label>
            <input
              type="text"
              className="invite-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-paper-300 mb-1.5">
              设密码 (至少 8 字符)
            </label>
            <input
              type="password"
              className="invite-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-paper-300 mb-1.5">
              再输一次
            </label>
            <input
              type="password"
              className="invite-input"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !password || password !== password2}
            className="w-full px-6 py-3 bg-seal-500 hover:bg-seal-700 text-paper-50 font-mono text-xs uppercase tracking-widest disabled:opacity-30 transition-colors mt-4"
          >
            {submitting ? '设置中 ...' : '接受邀请并登录'}
          </button>
        </form>

        <p className="mt-8 font-mono text-[10px] text-paper-300/40 leading-relaxed">
          完成后, 你直接进 /admin/cms. 之后用用户名 + 密码登录 /admin/login.
        </p>

        <style jsx global>{`
          .invite-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: var(--paper-100);
            padding: 0.65rem 0.9rem;
            font-family: var(--font-source-serif), serif;
            font-size: 15px;
            border-radius: 2px;
          }
          .invite-input:focus {
            outline: none;
            border-color: var(--burgundy-500);
          }
        `}</style>
      </div>
    </div>
  );
}
