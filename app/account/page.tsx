'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';

interface AccountData {
  email: string | null;
  emailVerifiedAt: number | null;
  preferences: {
    sunday_review: boolean;
    outcome_due: boolean;
    welcome: boolean;
    commitment: boolean;
  };
  emailServiceConfigured: boolean;
  recentEmails: Array<{
    id: number;
    email_type: string;
    subject: string;
    status: string;
    send_mode: string;
    sent_at: number | null;
    created_at: number;
  }>;
}

const EMAIL_TYPE_LABEL: Record<string, string> = {
  welcome: '欢迎',
  sunday_review: 'Sunday Review',
  outcome_due: 'Outcome 到期',
  commitment_reminder: 'Commitment 提醒',
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  'queued': { label: '排队中', color: 'text-ink-400' },
  'sent': { label: '已发送', color: 'text-sage' },
  'failed': { label: '失败', color: 'text-ember' },
  'dry-run': { label: 'Dry-run (开发模式)', color: 'text-amber' },
};

export default function AccountPage() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function load(uid: string) {
    fetch('/api/account', { headers: { [UID_HEADER]: uid } })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.email) setEmailInput(d.email);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    const uid = getOrCreateClientUid();
    setUserUid(uid);
    load(uid);
  }, []);

  async function saveEmail() {
    if (!userUid) return;
    setSaving(true); setMessage(null);
    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({ email: emailInput }),
      });
      const d = await res.json();
      if (!res.ok) setMessage(`错误: ${d.error}`);
      else { setMessage('已保存'); load(userUid); }
    } catch (e: any) {
      setMessage(`错误: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function togglePref(key: string, value: boolean) {
    if (!userUid) return;
    await fetch('/api/account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
      body: JSON.stringify({ preferences: { [key]: value } }),
    });
    load(userUid);
  }

  return (
    <div className="min-h-screen bg-paper">
      <nav className="max-w-prose-xl mx-auto px-6 pt-8 pb-6 flex justify-between items-baseline">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tightish text-ink-900">
          Life OS
        </Link>
        <Link href="/" className="text-sm text-ink-500 hover:text-seal transition-colors">← Pulse</Link>
      </nav>

      <main className="max-w-prose-lg mx-auto px-6 pb-20">
        <header className="pt-12 pb-12 animate-fade-in-soft">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-seal mb-4">· Account ·</p>
          <h1 className="font-serif text-editorial-lg text-ink-900 mb-3 tracking-tighter">账号 / 邮件</h1>
          <p className="font-serif text-sm text-ink-500 max-w-prose-lg editorial-leading">
            没邮箱也能用 Life OS, 但留邮箱后 Sunday Review 每周日会自动到你邮箱, Outcome 30 / 90 / 365 天到期会找你回来.
          </p>
        </header>

        {loading && <p className="text-ink-400 font-serif">加载中...</p>}

        {!loading && data && (
          <>
            {/* Email 输入 */}
            <section className="mb-12 pb-8 border-b border-paper-300 animate-fade-in-soft">
              <p className="font-sans text-xs uppercase tracking-[0.15em] text-seal mb-3">· 邮箱 ·</p>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 px-4 py-3 rounded-sm font-sans"
                />
                <button onClick={saveEmail} disabled={saving || !emailInput} className="btn-seal px-6 py-3 rounded-sm">
                  {saving ? '保存中' : '保存'}
                </button>
              </div>
              {message && <p className="mt-2 text-sm text-ink-500">{message}</p>}
              {!data.emailServiceConfigured && (
                <p className="mt-3 text-xs text-amber font-sans">
                  ⚠ 当前 V0 dev 模式: 邮件不真发, 只写入 emails_sent 表 + console log.
                  V1 部署后配 SMTP env vars 即可真发.
                </p>
              )}
            </section>

            {/* 订阅偏好 */}
            <section className="mb-12 pb-8 border-b border-paper-300">
              <p className="font-sans text-xs uppercase tracking-[0.15em] text-seal mb-4">· 订阅偏好 ·</p>
              <div className="space-y-4">
                {[
                  { key: 'welcome', label: '欢迎邮件 (首次建档后)', desc: '只发一次' },
                  { key: 'sunday_review', label: 'Weekly Review 推送', desc: '每周日 20:00' },
                  { key: 'outcome_due', label: 'Outcome 到期提醒', desc: '30 / 90 / 365 天 checkpoint' },
                  { key: 'commitment', label: 'Commitment 提醒', desc: 'AI 跟你许诺的事到期' },
                ].map((p) => {
                  const checked = (data.preferences as any)[p.key];
                  return (
                    <label key={p.key} className="flex items-start gap-4 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => togglePref(p.key, e.target.checked)}
                        className="mt-1.5 w-4 h-4 accent-seal"
                      />
                      <div className="flex-1">
                        <p className="font-serif text-ink-900 group-hover:text-seal transition-colors">{p.label}</p>
                        <p className="text-xs text-ink-400 font-sans">{p.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* 邮件历史 */}
            {data.recentEmails.length > 0 && (
              <section className="mb-12">
                <p className="font-sans text-xs uppercase tracking-[0.15em] text-seal mb-4">· 邮件历史 ·</p>
                <div className="space-y-1">
                  {data.recentEmails.map((e) => {
                    const status = STATUS_LABEL[e.status] || { label: e.status, color: 'text-ink-400' };
                    const typeLabel = EMAIL_TYPE_LABEL[e.email_type] || e.email_type;
                    return (
                      <div key={e.id} className="border-b border-paper-300 py-3 flex justify-between items-baseline">
                        <div>
                          <p className="font-serif text-sm text-ink-900">{e.subject}</p>
                          <p className="text-xs text-ink-400 mt-0.5 font-sans">{typeLabel} · {new Date((e.sent_at || e.created_at) * 1000).toLocaleString('zh-CN')}</p>
                        </div>
                        <span className={`text-xs font-sans ${status.color}`}>{status.label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 数据权利 — PIPL 第 44/45/47 条 */}
            <section className="mb-12 pb-8 border-t border-paper-300 pt-8">
              <p className="font-sans text-xs uppercase tracking-[0.15em] text-seal mb-3">· 你的数据权利 ·</p>
              <p className="font-serif text-sm text-ink-500 editorial-leading mb-5">
                《个人信息保护法》: 你可以随时导出或删除你的全部数据. 不需要给理由.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/api/account/data?download=1"
                  className="px-5 py-2.5 rounded-sm border border-paper-300 hover:border-seal hover:text-seal font-serif text-sm transition-colors"
                  onClick={(e) => {
                    if (userUid) {
                      e.preventDefault();
                      fetch('/api/account/data?download=1', { headers: { [UID_HEADER]: userUid } })
                        .then((r) => r.blob())
                        .then((blob) => {
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `life-os-data-${Date.now()}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        });
                    }
                  }}
                >
                  导出全部数据 (JSON)
                </a>
                <button
                  className="px-5 py-2.5 rounded-sm border border-ember/40 text-ember hover:bg-ember/5 font-serif text-sm transition-colors"
                  onClick={async () => {
                    if (!userUid) return;
                    const confirm1 = window.prompt(
                      '这会永久删除你在 Life OS 上的全部数据 (Pulse, 决策, Brain, Sunday Review, Commitment, Outcome, 邮件历史).\n\n这个操作不可逆.\n\n如果确定, 请输入: 删除我的全部数据'
                    );
                    if (confirm1 !== '删除我的全部数据') {
                      alert('已取消.');
                      return;
                    }
                    const res = await fetch('/api/account/data', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
                      body: JSON.stringify({ confirm: '删除我的全部数据' }),
                    });
                    const d = await res.json();
                    if (res.ok) {
                      alert(`删除完成. 共 ${d.totalRowsDeleted} 行被删除.\n\n刷新页面后会创建新的匿名身份.`);
                      window.location.href = '/';
                    } else {
                      alert(`删除失败: ${d.error}`);
                    }
                  }}
                >
                  永久删除全部数据
                </button>
              </div>
            </section>
          </>
        )}

        <footer className="mt-16 pt-8 border-t border-paper-300 text-xs text-ink-400 font-sans">
          隐私底线: 邮箱只用来发本服务相关通知. 永不卖. 永不分享.
          完整 <Link href="/privacy" className="text-seal underline">隐私政策</Link>.
        </footer>
      </main>
    </div>
  );
}
