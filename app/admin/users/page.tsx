/**
 * /admin/users — Owner 管账号 + 发邀请
 *
 * 显示:
 *   - 所有 admin users (含 owner 自己)
 *   - pending / used / expired invites
 *   - "邀请新编辑" 按钮 → 表单 → 生成链接 → 一键复制
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdminUserView {
  id: string;
  username: string;
  displayName: string;
  role: 'owner' | 'editor';
  email: string;
  createdAt: number;
  lastLoginAt: number | null;
  active: boolean;
}

interface InviteView {
  token: string;
  username: string;
  displayName: string;
  role: 'owner' | 'editor';
  note: string;
  createdBy: string;
  createdAt: number;
  expiresAt: number;
  usedAt: number | null;
  isUsed: boolean;
  isExpired: boolean;
  inviteUrl: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [invites, setInvites] = useState<InviteView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // invite form state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteDisplayName, setInviteDisplayName] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'owner'>('editor');
  const [inviteNote, setInviteNote] = useState('');
  const [creating, setCreating] = useState(false);

  // last created invite (for show + copy)
  const [lastInvite, setLastInvite] = useState<{
    inviteUrl: string;
    displayName: string;
    username: string;
    role: string;
  } | null>(null);

  function load() {
    fetch('/api/admin/users')
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = '/admin/login';
          return null;
        }
        if (r.status === 403) {
          setError('只有 owner 能管理账号');
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setUsers(d.users || []);
        setInvites(d.invites || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: inviteUsername.trim().toLowerCase(),
          displayName: inviteDisplayName.trim(),
          role: inviteRole,
          note: inviteNote.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || '邀请创建失败');
        setCreating(false);
        return;
      }
      const fullUrl = `${window.location.origin}${data.invite.inviteUrl}`;
      setLastInvite({
        inviteUrl: fullUrl,
        displayName: data.invite.displayName,
        username: data.invite.username,
        role: data.invite.role,
      });
      setShowInvite(false);
      setInviteUsername('');
      setInviteDisplayName('');
      setInviteRole('editor');
      setInviteNote('');
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  function fmtDate(unix: number | null): string {
    if (!unix) return '—';
    return new Date(unix * 1000).toLocaleString('zh-CN', {
      year: '2-digit', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  async function copyInvite() {
    if (!lastInvite) return;
    try {
      await navigator.clipboard.writeText(lastInvite.inviteUrl);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 p-6 md:p-10">
      <header className="flex justify-between items-baseline mb-10 flex-wrap gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-1">
            KEY · Admin · Users
          </p>
          <h1 className="font-serif text-3xl text-paper-50">账号管理</h1>
        </div>
        <div className="flex gap-4 items-baseline">
          <Link
            href="/admin/cms"
            className="font-mono text-xs uppercase tracking-widest text-seal-400 hover:text-paper-50 transition-colors"
          >
            CMS →
          </Link>
          <Link
            href="/admin"
            className="font-mono text-xs uppercase tracking-widest text-seal-400 hover:text-paper-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-3 border border-ember text-ember bg-ember/10 rounded-sm font-mono text-sm">
          {error}
        </div>
      )}

      {lastInvite && (
        <div className="mb-8 p-5 border border-sage bg-sage/5 rounded-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-sage mb-2">
            ✓ 邀请已创建 · 复制下面这个链接, 微信发给受邀人
          </p>
          <h3 className="font-serif text-lg mb-3">
            {lastInvite.displayName} <span className="text-paper-300/60 text-sm">({lastInvite.username}, {lastInvite.role})</span>
          </h3>
          <div className="flex items-center gap-3 bg-ink-700/60 p-3 rounded-sm">
            <code className="flex-1 font-mono text-[12px] break-all text-paper-200">
              {lastInvite.inviteUrl}
            </code>
            <button
              onClick={copyInvite}
              className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 bg-seal-500 hover:bg-seal-700 text-paper-50 transition-colors flex-shrink-0"
            >
              复制
            </button>
          </div>
          <p className="font-mono text-[10px] text-paper-300/50 mt-2">
            链接 7 天有效, 受邀人打开就设密码, 之后用用户名密码登录.
          </p>
          <button
            onClick={() => setLastInvite(null)}
            className="font-mono text-[10px] uppercase tracking-widest text-paper-300/40 hover:text-paper-50 mt-3"
          >
            关闭
          </button>
        </div>
      )}

      {/* Invite section */}
      <section className="mb-12">
        <div className="flex justify-between items-baseline mb-4 flex-wrap gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400">
            邀请新编辑
          </p>
          {!showInvite && (
            <button
              onClick={() => setShowInvite(true)}
              className="font-mono text-xs uppercase tracking-widest px-4 py-2 bg-seal-500 hover:bg-seal-700 text-paper-50 transition-colors"
            >
              + 创建邀请
            </button>
          )}
        </div>

        {showInvite && (
          <form
            onSubmit={submitInvite}
            className="border border-paper-300/20 p-5 rounded-sm space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-seal-400 mb-1">
                  用户名 (受邀人登录用)
                </label>
                <input
                  type="text"
                  className="users-input"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value.toLowerCase())}
                  placeholder="例: fashion-editor-1"
                  required
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-seal-400 mb-1">
                  显示名 (中文 OK)
                </label>
                <input
                  type="text"
                  className="users-input"
                  value={inviteDisplayName}
                  onChange={(e) => setInviteDisplayName(e.target.value)}
                  placeholder="例: 时尚编辑 A"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-seal-400 mb-1">
                角色
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={inviteRole === 'editor'}
                    onChange={() => setInviteRole('editor')}
                    className="accent-seal-500"
                  />
                  <span className="font-mono text-sm">
                    editor <span className="text-paper-300/60">— CMS 改 + 发布</span>
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={inviteRole === 'owner'}
                    onChange={() => setInviteRole('owner')}
                    className="accent-seal-500"
                  />
                  <span className="font-mono text-sm">
                    owner <span className="text-paper-300/60">— 全权限 (慎用)</span>
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-seal-400 mb-1">
                备注 (可选, 给你自己看)
              </label>
              <input
                type="text"
                className="users-input"
                value={inviteNote}
                onChange={(e) => setInviteNote(e.target.value)}
                placeholder="例: Vogue 前任编辑, 负责时尚 voice 调整"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="font-mono text-xs uppercase tracking-widest px-4 py-2 text-paper-300 hover:text-paper-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={creating || !inviteUsername || !inviteDisplayName}
                className="font-mono text-xs uppercase tracking-widest px-6 py-2 bg-seal-500 hover:bg-seal-700 text-paper-50 disabled:opacity-30 transition-colors"
              >
                {creating ? '创建中...' : '创建邀请链接'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Users list */}
      <section className="mb-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-4">
          ADMINS ({users.length})
        </p>
        {loading ? (
          <p className="font-mono text-sm text-paper-300/60">加载中...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="text-paper-300/60 text-[10px] uppercase tracking-wider">
                  <th className="text-left py-2">用户名</th>
                  <th className="text-left py-2">显示名</th>
                  <th className="text-left py-2">角色</th>
                  <th className="text-left py-2">Committer Email</th>
                  <th className="text-left py-2">创建</th>
                  <th className="text-left py-2">上次登录</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-paper-300/10">
                    <td className="py-2">{u.username}</td>
                    <td className="py-2 font-serif">{u.displayName}</td>
                    <td className="py-2">
                      <span
                        className={
                          u.role === 'owner' ? 'text-seal-400' : 'text-paper-300'
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 text-paper-300/60 text-[12px]">{u.email}</td>
                    <td className="py-2 text-paper-300/60 text-[12px]">{fmtDate(u.createdAt)}</td>
                    <td className="py-2 text-paper-300/60 text-[12px]">{fmtDate(u.lastLoginAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Invites list */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-4">
          PENDING & PAST INVITES ({invites.length})
        </p>
        {invites.length === 0 ? (
          <p className="font-mono text-sm text-paper-300/40">无邀请记录</p>
        ) : (
          <div className="space-y-2">
            {invites.map((i) => (
              <div
                key={i.token}
                className="border border-paper-300/10 p-3 rounded-sm flex items-baseline justify-between gap-4 flex-wrap"
              >
                <div className="flex-1 min-w-[200px]">
                  <p className="font-serif text-sm">
                    {i.displayName}{' '}
                    <span className="font-mono text-paper-300/60 text-[12px]">
                      ({i.username}, {i.role})
                    </span>
                  </p>
                  {i.note && (
                    <p className="font-mono text-[11px] text-paper-300/40 mt-1">
                      备注: {i.note}
                    </p>
                  )}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider">
                  {i.isUsed && <span className="text-sage">✓ 已接受 {fmtDate(i.usedAt!)}</span>}
                  {!i.isUsed && i.isExpired && (
                    <span className="text-paper-300/40">⌛ 已过期 {fmtDate(i.expiresAt)}</span>
                  )}
                  {!i.isUsed && !i.isExpired && i.inviteUrl && (
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}${i.inviteUrl}`;
                        navigator.clipboard.writeText(url).catch(() => {});
                        setLastInvite({
                          inviteUrl: url,
                          displayName: i.displayName,
                          username: i.username,
                          role: i.role,
                        });
                      }}
                      className="text-seal-400 hover:text-paper-50"
                    >
                      复制链接 (待接受, {fmtDate(i.expiresAt)} 过期)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx global>{`
        .users-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--paper-100);
          padding: 0.5rem 0.75rem;
          font-family: var(--font-source-serif), serif;
          font-size: 14px;
          border-radius: 2px;
        }
        .users-input:focus {
          outline: none;
          border-color: var(--burgundy-500);
        }
      `}</style>
    </div>
  );
}
