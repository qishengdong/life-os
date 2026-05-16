/**
 * /admin/real-users · 真用户活跃度 dashboard
 *
 * Owner 看 Linda × 5 (后续 100 人) 的:
 * - 邀请 / 兑换状态 / onboarding 完成
 * - 最近活跃时间 / decision 数 / pulse 数 / 未交付的信数
 * - 微信号 (admin 后台手填 · 兜底 channel)
 * - 待 surface: outcome 到期 / unsent callback 到期
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RealUser {
  id: number;
  userUid: string;
  recoveryCodeTail: string | null;
  hasRecoveryCode: boolean;
  recoveryAckedAt: number | null;
  wechatId: string | null;
  accessStatus: string;
  onboardingCompletedAt: number | null;
  lastActiveAt: number | null;
  createdAt: number;
  inviteCode: string | null;
  recipientName: string | null;
  invitedBy: string | null;
  redeemedAt: number | null;
  counts: {
    decisions: number;
    pulses: number;
    unsent: number;
    unsentCallbackDue: number;
    outcomesDue: number;
  };
}

function ago(unix: number | null): string {
  if (!unix) return '—';
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 60) return '刚才';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 14) return `${Math.floor(diff / 86400)}d`;
  return new Date(unix * 1000).toISOString().slice(0, 10);
}

export default function RealUsersPage() {
  const [users, setUsers] = useState<RealUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingWechat, setEditingWechat] = useState<number | null>(null);
  const [wechatDraft, setWechatDraft] = useState('');

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      const res = await fetch('/api/admin/real-users');
      if (res.status === 401) {
        window.location.href = '/admin/login?from=/admin/real-users';
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'load failed');
      } else {
        setUsers(data.users);
      }
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function saveWechat(id: number) {
    try {
      const res = await fetch('/api/admin/real-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, wechatId: wechatDraft.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
      } else {
        setEditingWechat(null);
        setWechatDraft('');
        refresh();
      }
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 px-6 py-8">
      <header className="max-w-7xl mx-auto flex justify-between items-baseline mb-10 flex-wrap gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-1">
            KEY · Admin · Real Users
          </p>
          <h1 className="font-serif text-3xl">真用户活跃度</h1>
        </div>
        <Link
          href="/admin"
          className="font-mono text-xs uppercase tracking-widest text-seal-400 hover:text-paper-50"
        >
          ← Admin
        </Link>
      </header>

      {error && <p className="font-mono text-ember max-w-7xl mx-auto mb-6">{error}</p>}

      {!users && !error && (
        <p className="font-mono text-paper-300/60 max-w-7xl mx-auto">Loading...</p>
      )}

      {users && users.length === 0 && (
        <div className="max-w-2xl mx-auto py-20 text-center">
          <p className="font-serif italic text-paper-300 mb-4">
            还没有真用户. 创建一个邀请码, 邀请 Linda 进来.
          </p>
          <Link
            href="/admin/invites"
            className="font-mono text-xs uppercase tracking-widest text-seal-400 hover:text-paper-50"
          >
            + Invites →
          </Link>
        </div>
      )}

      {users && users.length > 0 && (
        <div className="max-w-7xl mx-auto">
          {/* 顶部 stat */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            <Stat label="Total" value={users.length} />
            <Stat label="Onboarded" value={users.filter((u) => u.onboardingCompletedAt).length} />
            <Stat
              label="Active 7d"
              value={users.filter((u) => u.lastActiveAt && u.lastActiveAt > Date.now() / 1000 - 7 * 86400).length}
            />
            <Stat
              label="Callbacks due"
              value={users.reduce((s, u) => s + u.counts.unsentCallbackDue + u.counts.outcomesDue, 0)}
              warn
            />
            <Stat
              label="No wechat"
              value={users.filter((u) => !u.wechatId).length}
              hint="无兜底"
            />
          </div>

          {/* 用户表 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-300/20 text-[10px] uppercase tracking-widest text-seal-400 text-left">
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Invite</th>
                  <th className="py-2 pr-3">Recovery</th>
                  <th className="py-2 pr-3">Wechat</th>
                  <th className="py-2 pr-3 text-right">Decisions</th>
                  <th className="py-2 pr-3 text-right">Pulses</th>
                  <th className="py-2 pr-3 text-right">Unsent</th>
                  <th className="py-2 pr-3 text-right">Callback due</th>
                  <th className="py-2 pr-3">Last active</th>
                  <th className="py-2 pr-3">Onboarded</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-paper-300/10 hover:bg-paper-50/5">
                    <td className="py-3 pr-3">
                      <p className="font-mono text-xs text-paper-50">
                        {u.recipientName || `user_${u.id}`}
                      </p>
                      <p className="font-mono text-[10px] text-paper-300/40">
                        {u.userUid.slice(0, 8)}...
                      </p>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-mono text-xs">
                        {u.inviteCode || <span className="text-paper-300/40">—</span>}
                      </p>
                      <p className="font-mono text-[10px] text-paper-300/60">
                        by {u.invitedBy || '—'} · {ago(u.redeemedAt)}
                      </p>
                    </td>
                    <td className="py-3 pr-3">
                      {u.hasRecoveryCode ? (
                        <span className="font-mono text-xs">
                          ...{u.recoveryCodeTail}
                          {u.recoveryAckedAt ? (
                            <span className="text-sage ml-1">✓</span>
                          ) : (
                            <span className="text-amber ml-1" title="未截图">⚠</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-paper-300/40">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      {editingWechat === u.id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            value={wechatDraft}
                            onChange={(e) => setWechatDraft(e.target.value)}
                            autoFocus
                            className="font-mono text-xs bg-paper-50/10 px-2 py-1 border border-seal-400 w-32"
                          />
                          <button
                            onClick={() => saveWechat(u.id)}
                            className="font-mono text-[10px] text-sage hover:text-paper-50"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingWechat(null);
                              setWechatDraft('');
                            }}
                            className="font-mono text-[10px] text-paper-300/60 hover:text-paper-50"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingWechat(u.id);
                            setWechatDraft(u.wechatId || '');
                          }}
                          className="font-mono text-xs text-left hover:text-seal-400"
                        >
                          {u.wechatId || <span className="text-paper-300/40">+ 填</span>}
                        </button>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-right font-mono">{u.counts.decisions || '—'}</td>
                    <td className="py-3 pr-3 text-right font-mono">{u.counts.pulses || '—'}</td>
                    <td className="py-3 pr-3 text-right font-mono">{u.counts.unsent || '—'}</td>
                    <td className="py-3 pr-3 text-right font-mono">
                      {u.counts.unsentCallbackDue + u.counts.outcomesDue > 0 ? (
                        <span className="text-amber">
                          {u.counts.unsentCallbackDue + u.counts.outcomesDue}
                        </span>
                      ) : (
                        <span className="text-paper-300/40">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs text-paper-300/80">
                      {ago(u.lastActiveAt)}
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs">
                      {u.onboardingCompletedAt ? (
                        <span className="text-sage">✓ {ago(u.onboardingCompletedAt)}</span>
                      ) : (
                        <span className="text-amber">未完成</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="font-mono text-[10px] text-paper-300/40 mt-6">
            隐私: 不显示完整恢复码 (核身只用末 4 位). 不显示用户 brain 内容 (owner 也不该读).
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  warn,
}: {
  label: string;
  value: number;
  hint?: string;
  warn?: boolean;
}) {
  return (
    <div className="border border-paper-300/20 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-seal-400 mb-2">{label}</p>
      <p className={`font-serif text-3xl ${warn && value > 0 ? 'text-amber' : 'text-paper-50'}`}>
        {value}
      </p>
      {hint && <p className="font-mono text-[10px] text-paper-300/60 mt-1">{hint}</p>}
    </div>
  );
}
