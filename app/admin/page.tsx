/**
 * /admin — 主仪表板. 一屏看完关键数据.
 *
 * 工具风, 不是 publication-grade. 黑底白字, 数字大, 信息密度高.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  users: { total: number; invited: number; guest: number; suspended: number; newThisWeek: number };
  briefs: {
    total: number;
    avgChars: number;
    avgTokens: number;
    avgAnalystMs: number;
    avgEditorMs: number;
    editorPassRate: number;
    thisWeek: number;
  };
  pulses: { total: number; thisWeek: number };
  invites: { total: number; pending: number; redeemed: number; revoked: number };
  emails: { total: number; sent: number; failed: number; dryRun: number; thisMonth: number };
  audit: { overallScore: number; dimCount: number; checks: Array<{ code: string; label: string; hits: number; mode: string }> };
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border border-ink-700 p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-paper-300/60 mb-2">
        {label}
      </p>
      <p className="font-serif text-3xl text-paper-50">{value}</p>
      {hint && <p className="font-mono text-[10px] text-paper-300/40 mt-2">{hint}</p>}
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'stats failed');
      } else {
        setStats(data);
      }
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // 30s 自动刷
    return () => clearInterval(t);
  }, []);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 p-6 md:p-10">
      {/* Header */}
      <header className="flex justify-between items-baseline mb-12">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-1">
            LifeOS · Admin Dashboard
          </p>
          <h1 className="font-serif text-3xl text-paper-50">Overview</h1>
        </div>
        <div className="flex gap-3 items-baseline">
          <Link
            href="/admin/invites"
            className="font-mono text-xs uppercase tracking-widest text-seal-400 hover:text-paper-50 transition-colors"
          >
            Invites →
          </Link>
          <button
            onClick={logout}
            className="font-mono text-xs uppercase tracking-widest text-paper-300/60 hover:text-ember transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {error && <p className="font-mono text-ember mb-6">{error}</p>}
      {!stats && !error && <p className="font-mono text-paper-300/60">Loading...</p>}

      {stats && (
        <div className="space-y-12">
          {/* === Invites === */}
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-4">
              Invites
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Metric label="Total" value={stats.invites.total} />
              <Metric label="Pending" value={stats.invites.pending} hint="未兑换" />
              <Metric label="Redeemed" value={stats.invites.redeemed} hint="已激活用户" />
              <Metric label="Revoked" value={stats.invites.revoked} />
            </div>
            <Link
              href="/admin/invites"
              className="inline-block mt-4 font-mono text-xs uppercase tracking-widest text-seal-400 hover:text-paper-50 transition-colors"
            >
              + 新建 / 管理 →
            </Link>
          </section>

          {/* === Users === */}
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-4">
              Users
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Metric label="Total" value={stats.users.total} />
              <Metric label="Invited" value={stats.users.invited} hint="已激活" />
              <Metric label="Guest" value={stats.users.guest} hint="未激活" />
              <Metric label="Suspended" value={stats.users.suspended} />
              <Metric label="New (7d)" value={stats.users.newThisWeek} />
            </div>
          </section>

          {/* === Briefs === */}
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-4">
              Decision Briefs
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Metric label="Total" value={stats.briefs.total} />
              <Metric label="This Week" value={stats.briefs.thisWeek} />
              <Metric
                label="Editor Pass %"
                value={`${stats.briefs.editorPassRate}%`}
                hint="第二轮 LLM 通过率"
              />
              <Metric label="Avg Chars" value={stats.briefs.avgChars} hint="2000-3500 范围" />
              <Metric
                label="Analyst Time"
                value={`${(stats.briefs.avgAnalystMs / 1000).toFixed(1)}s`}
              />
              <Metric
                label="Editor Time"
                value={`${(stats.briefs.avgEditorMs / 1000).toFixed(1)}s`}
              />
              <Metric label="Avg Tokens" value={stats.briefs.avgTokens.toLocaleString()} />
            </div>
          </section>

          {/* === Pulses === */}
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-4">
              Daily Pulses
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Metric label="Total" value={stats.pulses.total} />
              <Metric label="This Week" value={stats.pulses.thisWeek} />
            </div>
          </section>

          {/* === Emails === */}
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-4">
              Emails
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Metric label="Total" value={stats.emails.total} />
              <Metric label="Sent" value={stats.emails.sent} />
              <Metric label="Failed" value={stats.emails.failed} />
              <Metric label="Dry-run" value={stats.emails.dryRun} hint="V0 默认" />
              <Metric label="This Month" value={stats.emails.thisMonth} />
            </div>
          </section>

          {/* === Audit === */}
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-4">
              Audit
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Metric
                label="Real Grader 综合"
                value={stats.audit.overallScore.toFixed(2)}
                hint={`/5  ·  ${stats.audit.dimCount} dim`}
              />
            </div>
            <div className="border border-ink-700">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-ink-700 text-paper-300/60">
                    <th className="text-left p-3">Check</th>
                    <th className="text-left p-3">Label</th>
                    <th className="text-left p-3">Mode</th>
                    <th className="text-right p-3">Hits</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.audit.checks.map((c) => (
                    <tr key={c.code} className="border-b border-ink-700/50 last:border-b-0">
                      <td className="p-3 text-seal-400">{c.code}</td>
                      <td className="p-3 text-paper-50">{c.label}</td>
                      <td className="p-3 text-paper-300/60">{c.mode}</td>
                      <td className={`p-3 text-right ${c.hits > 0 ? 'text-amber' : 'text-paper-300/40'}`}>
                        {c.hits}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="pt-12 border-t border-ink-700 font-mono text-[10px] uppercase tracking-widest text-paper-300/40">
            Auto-refresh every 30s  ·  LifeOS V0 internal beta
          </footer>
        </div>
      )}
    </div>
  );
}
