/**
 * /settings · 用户隐私 + 数据自助
 *
 * - 导出全部数据 (JSON download)
 * - 删除账户 (irreversible · 必须输入 "DELETE MY KEY" 确认)
 * - 查看 (不显示) 自己的恢复码尾 — 提示用户去 /recover 测试
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import KeyHeader from '@/components/KeyHeader';
import KeyWordmark from '@/components/KeyWordmark';
import PageMasthead from '@/components/PageMasthead';

function TopNav() {
  return (
    <KeyHeader current="settings" />
  );
}

export default function SettingsPage() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    setUserUid(getOrCreateClientUid());
  }, []);

  async function exportData() {
    if (!userUid || exporting) return;
    setExporting(true);
    setError(null);
    try {
      const res = await fetch('/api/user/export', {
        headers: { [UID_HEADER]: userUid },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '导出失败');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `key-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    if (!userUid || deleting || confirmText !== 'DELETE MY KEY') return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({ confirmation: 'DELETE MY KEY' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '删除失败');
      } else {
        // 清 localStorage UUID, 用户回到匿名访客
        try {
          localStorage.removeItem('life_os_uid');
        } catch {}
        setDeleted(true);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  if (deleted) {
    // ✋ 删除后故意不显示 TopNav · 用户现在是匿名访客, 链接 (Pulse/Brain/未交付的信)
    // 都被 middleware 挡回 /invite · 显示链接反而 confusing
    return (
      <div className="min-h-screen bg-paper text-ink-900 flex flex-col">
        {/* 简化顶: 只有 wordmark, 没有 nav */}
        <header className="max-w-prose-xl mx-auto w-full px-6 pt-10 pb-6">
          <Link href="/" aria-label="KEY home" className="block w-fit">
            <KeyWordmark variant="nav" height={22} />
          </Link>
        </header>

        <main className="flex-1 max-w-prose-md mx-auto px-6 py-24 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ember mb-6">
            · 数据已删除 ·
          </p>
          <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tightish mb-8 leading-[1.1]">
            KEY 已经忘掉你.
          </h1>
          <div className="font-serif italic text-reading text-ink-500 leading-relaxed mb-10 space-y-3">
            <p>
              brain / 决策 / 简报 / Pulse / 信件 / 未交付的信 / outcome — 全部删了.
            </p>
            <p className="text-[14px] text-ink-400">
              你现在是 keypoint.life 的匿名访客. 之前的恢复码 (KEY-XXXX-XXXX) 也作废.
            </p>
            <p className="text-[14px] text-ink-400">
              哪天想回来, 重新拿一个邀请码就行. 谢谢用过 KEY.
            </p>
          </div>
          <Link
            href="/"
            className="font-serif text-base text-ink-900 border-b-2 border-seal-500 pb-1 hover:text-seal-500 transition-colors inline-block"
          >
            回首页 →
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <TopNav />
      <PageMasthead eyebrow="SETTINGS" volume="账户 · 隐私" right="MMXXVI" />

      <header className="max-w-prose-lg mx-auto px-6 pt-12 pb-10">
        <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter mb-6 leading-[1.1]">
          账户与隐私.
        </h1>
        <p className="font-serif text-reading text-ink-700 editorial-leading">
          这一页全是不可逆动作. 慢慢看, 不催.
        </p>
      </header>

      {/* 恢复码 */}
      <section className="max-w-prose-lg mx-auto px-6 py-10 border-t border-paper-300">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
          · 恢复码 ·
        </p>
        <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-4">
          换设备的钥匙.
        </h2>
        <div className="space-y-4 font-serif text-reading text-ink-700 editorial-leading">
          <p>
            兑换邀请那天 KEY 给了你一段 <code className="font-mono text-ink-900 px-1 bg-paper-50">KEY-XXXX-XXXX</code> 的恢复码.
            屏幕只显示了一次, 服务器上不再保存明文.
          </p>
          <p>
            换 iPhone / 清 Safari / 误删 KEY 数据时, 去 <Link href="/recover" className="text-seal-500 underline underline-offset-2 hover:text-seal-700">/recover</Link>
            输入恢复码, brain 会跟过来.
          </p>
          <p className="text-[14px] text-ink-500 italic">
            建议: 复制到密码管理器 (1Password / Bitwarden) 或截图存到 iCloud 相册.
            真丢了, 加管理员微信兜底.
          </p>
        </div>
      </section>

      {/* 导出 */}
      <section className="max-w-prose-lg mx-auto px-6 py-10 border-t border-paper-300 bg-paper-50">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
          · 导出我的全部数据 ·
        </p>
        <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-4">
          一份 JSON, 你 own.
        </h2>
        <p className="font-serif text-reading text-ink-700 editorial-leading mb-6">
          含 profile / 决策 / 简报 / Pulse / 信件 / 未交付的信 / brain / outcome /
          pattern insight 全部.
        </p>
        <button
          type="button"
          onClick={exportData}
          disabled={exporting}
          className="px-8 py-3 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 disabled:bg-ink-400 transition-colors"
        >
          {exporting ? '打包中...' : '下载 JSON →'}
        </button>
      </section>

      {/* 删除 */}
      <section className="max-w-prose-lg mx-auto px-6 py-10 border-t border-paper-300">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ember mb-4">
          · 永久删除账户 ·
        </p>
        <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-4">
          KEY 会忘掉你.
        </h2>
        <div className="space-y-4 font-serif text-reading text-ink-700 editorial-leading mb-6">
          <p>
            点了之后, KEY 会立刻删除你所有数据 (brain, 决策, 简报, Pulse, 信件, 未交付的信,
            outcome, insight) — 不能撤销, 也找不回.
          </p>
          <p className="text-[14px] text-ink-500 italic">
            建议先 "下载 JSON" 留一份 backup.
          </p>
        </div>
        <div className="border-l-2 border-ember/40 pl-5 space-y-3">
          <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 block">
            输入 <code className="font-mono text-ember">DELETE MY KEY</code> 确认 (大小写敏感):
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE MY KEY"
            className="w-full md:w-2/3 px-4 py-2.5 font-mono text-sm border border-paper-300 bg-paper focus:border-ember focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={deleteAccount}
            disabled={deleting || confirmText !== 'DELETE MY KEY'}
            className="px-8 py-3 font-serif text-base text-paper bg-ember hover:opacity-80 disabled:bg-ink-400 disabled:cursor-not-allowed transition-opacity"
          >
            {deleting ? '删除中...' : '永久删除 KEY 账户'}
          </button>
        </div>
        {error && <p className="font-serif text-sm text-ember italic mt-4">{error}</p>}
      </section>
    </div>
  );
}
