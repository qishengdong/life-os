/**
 * /admin/invites — 邀请码管理
 *
 * 上半: 新建邀请码 form
 * 下半: 已有邀请码列表
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Invite {
  id: number;
  code: string;
  recipientName: string | null;
  recipientEmail: string | null;
  invitedBy: string;
  note: string | null;
  redeemedByUserId: number | null;
  redeemedAt: number | null;
  revokedAt: number | null;
  createdAt: number;
  status: 'pending' | 'redeemed' | 'revoked';
}

interface Summary {
  total: number;
  pending: number;
  redeemed: number;
  revoked: number;
}

function fmtDate(ts: number | null): string {
  if (!ts) return '—';
  const d = new Date(ts * 1000);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New invite form
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [justCreated, setJustCreated] = useState<Invite | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/admin/invites');
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'load failed');
      } else {
        setInvites(data.invites);
        setSummary(data.summary);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createInvite(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: recipientName || undefined,
          recipientEmail: recipientEmail || undefined,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'create failed');
      } else {
        setJustCreated(data.invite);
        // 自动复制到剪贴板
        try {
          await navigator.clipboard.writeText(data.invite.code);
        } catch {
          // ignore
        }
        setRecipientName('');
        setRecipientEmail('');
        setNote('');
        load();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function revoke(id: number) {
    if (!confirm('撤销这个邀请码? 操作不可逆.')) return;
    const res = await fetch(`/api/admin/invites/${id}?action=revoke`, { method: 'POST' });
    if (res.ok) load();
    else {
      const d = await res.json();
      alert(d.error || 'revoke failed');
    }
  }

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 p-6 md:p-10">
      <header className="flex justify-between items-baseline mb-12">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-1">
            KEY · Admin
          </p>
          <h1 className="font-serif text-3xl text-paper-50">Invites</h1>
        </div>
        <Link
          href="/admin"
          className="font-mono text-xs uppercase tracking-widest text-seal-400 hover:text-paper-50 transition-colors"
        >
          ← Overview
        </Link>
      </header>

      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-12">
          <Metric label="Total" value={summary.total} />
          <Metric label="Pending" value={summary.pending} />
          <Metric label="Redeemed" value={summary.redeemed} />
          <Metric label="Revoked" value={summary.revoked} />
        </div>
      )}

      {/* New invite form */}
      <section className="mb-12 border border-ink-700 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-4">
          New Invite
        </p>

        {justCreated ? (
          <div className="mb-6 p-5 border border-seal-400/40 bg-seal-500/10">
            <p className="font-mono text-xs uppercase tracking-widest text-seal-400 mb-2">
              ✓ Created (copied to clipboard)
            </p>
            <p className="font-mono text-2xl tracking-widest text-paper-50 mb-3">
              {justCreated.code}
            </p>
            <p className="font-mono text-xs text-paper-300/60 mb-1">
              Recipient: {justCreated.recipientName || '(unnamed)'}{' '}
              {justCreated.recipientEmail && `· ${justCreated.recipientEmail}`}
            </p>
            <p className="font-mono text-xs text-paper-300/60">
              Send the recipient: <code className="bg-ink-700 px-2 py-0.5">https://[yourdomain]/invite</code> +
              code <code className="bg-ink-700 px-2 py-0.5">{justCreated.code}</code>
            </p>
            <button
              onClick={() => setJustCreated(null)}
              className="mt-4 font-mono text-xs uppercase tracking-widest text-paper-300/60 hover:text-paper-50"
            >
              dismiss · 创建下一个 →
            </button>
          </div>
        ) : null}

        <form onSubmit={createInvite} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-paper-300/60 block mb-2">
                Recipient name (optional)
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="张某"
                className="w-full px-3 py-2 bg-ink-700 border border-ink-700 focus:border-seal-400 focus:outline-none font-mono text-sm text-paper-50"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-paper-300/60 block mb-2">
                Recipient email (optional)
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="zhang@..."
                className="w-full px-3 py-2 bg-ink-700 border border-ink-700 focus:border-seal-400 focus:outline-none font-mono text-sm text-paper-50"
              />
            </div>
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-paper-300/60 block mb-2">
              Note (optional, for your records)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="前 GQ 总编 / 朋友推荐 / 内测第 N 批"
              className="w-full px-3 py-2 bg-ink-700 border border-ink-700 focus:border-seal-400 focus:outline-none font-mono text-sm text-paper-50"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-seal-500 hover:bg-seal-600 text-paper-50 font-mono text-xs uppercase tracking-widest disabled:bg-ink-700 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'generating...' : '+ generate code'}
          </button>
          {error && <p className="font-mono text-sm text-ember">{error}</p>}
        </form>
      </section>

      {/* Invite list */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-4">
          All Invites ({invites.length})
        </p>
        {loading ? (
          <p className="font-mono text-paper-300/60">Loading...</p>
        ) : invites.length === 0 ? (
          <p className="font-mono text-paper-300/60 italic">No invites yet.</p>
        ) : (
          <div className="border border-ink-700 overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-ink-700 text-paper-300/60 text-left">
                  <th className="p-3">Code</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Note</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Redeemed</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => (
                  <tr key={inv.id} className="border-b border-ink-700/50 last:border-b-0">
                    <td className="p-3 text-seal-400 tracking-widest">{inv.code}</td>
                    <td className="p-3 text-paper-50">
                      {inv.recipientName || '—'}
                      {inv.recipientEmail && (
                        <span className="text-paper-300/40 ml-2">{inv.recipientEmail}</span>
                      )}
                    </td>
                    <td className="p-3 text-paper-300/60">{inv.note || '—'}</td>
                    <td className="p-3">
                      <span
                        className={
                          inv.status === 'pending'
                            ? 'text-amber'
                            : inv.status === 'redeemed'
                            ? 'text-sage'
                            : 'text-paper-300/40'
                        }
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-paper-300/60">{fmtDate(inv.createdAt)}</td>
                    <td className="p-3 text-paper-300/60">
                      {inv.redeemedAt ? `${fmtDate(inv.redeemedAt)} · u#${inv.redeemedByUserId}` : '—'}
                    </td>
                    <td className="p-3 text-right">
                      {inv.status === 'pending' && (
                        <button
                          onClick={() => revoke(inv.id)}
                          className="font-mono text-[10px] uppercase tracking-widest text-ember hover:text-amber transition-colors"
                        >
                          revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-ink-700 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-paper-300/60 mb-2">
        {label}
      </p>
      <p className="font-serif text-3xl text-paper-50">{value}</p>
    </div>
  );
}
