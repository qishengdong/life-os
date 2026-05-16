/**
 * /invite — 公开邀请码兑换页
 *
 * 4 节:
 *   I.   已有邀请码 → 输入框 + 验证按钮
 *   II.  还没邀请码 → mailto 申请
 *   III. 为什么邀请制 (essay 段, 不是营销 scarcity)
 *   IV.  当前邀请的人 (匿名化, 给可信度)
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import KeyWordmark from '@/components/KeyWordmark';
import PageMasthead from '@/components/PageMasthead';

function TopNav() {
  return (
    <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
      <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
      <div className="flex gap-6 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
        <Link href="/methodology" className="hover:text-seal-500 transition-colors">方法论</Link>
        <Link href="/sample-brief" className="hover:text-seal-500 transition-colors">样品</Link>
        <Link href="/membership" className="hover:text-seal-500 transition-colors">会员</Link>
        <Link href="/" className="hover:text-seal-500 transition-colors">← Home</Link>
      </div>
    </nav>
  );
}

interface SuccessState {
  recipientName: string | null;
  invitedBy: string;
  recoveryCode: string;
  alreadyInvited: boolean;
}

export default function InvitePage() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    setUserUid(getOrCreateClientUid());
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userUid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/invites/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '兑换失败');
      } else {
        setSuccess({
          recipientName: data.invitedToUser?.recipientName || null,
          invitedBy: data.invitedToUser?.invitedBy || 'founder',
          recoveryCode: data.recoveryCode || '',
          alreadyInvited: !!data.alreadyInvited,
        });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function acknowledgeAndContinue() {
    if (!userUid) return;
    setAcknowledging(true);
    try {
      await fetch('/api/auth/acknowledge-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
      });
      router.push('/onboarding');
    } catch (e: any) {
      setError(e.message);
      setAcknowledging(false);
    }
  }

  async function copyRecoveryCode() {
    if (!success?.recoveryCode) return;
    try {
      await navigator.clipboard.writeText(success.recoveryCode);
    } catch {
      // clipboard 失败不阻塞 — 用户能手动选中复制
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <TopNav />
      <PageMasthead eyebrow="JOIN" volume="邀请制 · 内测" right="MMXXVI · 春" />

      {/* HERO · forked 2-column (B12) */}
      <header className="max-w-prose-xl mx-auto px-6 pt-16 pb-10">
        <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter mb-10 leading-[1.1] max-w-prose-lg">
          邀请制内测中.
        </h1>

        {success ? (
          <div className="border-2 border-seal-500 bg-paper-50 p-8 max-w-prose-md">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
              ✓ 邀请码已激活
            </p>
            {success.recipientName && (
              <p className="font-serif text-reading text-ink-900 mb-2">
                欢迎, {success.recipientName}.
              </p>
            )}
            <p className="font-serif text-sm text-ink-500 italic mb-8">
              邀请人: {success.invitedBy}
            </p>

            {/* 恢复码 · 必须截图 · 不再显示 */}
            <div className="border-t-2 border-seal-500/40 pt-6 mb-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ember mb-2">
                ⚠ 这是你的恢复码 · 只显示这一次
              </p>
              <h3 className="font-serif text-2xl text-ink-900 mb-4 tracking-tightish leading-tight">
                换设备 / 清数据后, 用它找回你的 brain.
              </h3>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <code
                  className="inline-block px-5 py-3 font-mono text-2xl tracking-widest text-ink-900 bg-paper border border-ink-900/20 select-all"
                  onClick={copyRecoveryCode}
                >
                  {success.recoveryCode}
                </code>
                <button
                  type="button"
                  onClick={copyRecoveryCode}
                  className="font-serif text-sm text-seal-500 hover:text-seal-700 transition-colors border-b border-seal-500/40 pb-0.5"
                >
                  复制
                </button>
              </div>
              <ul className="font-serif text-[14px] text-ink-700 editorial-leading space-y-1.5 list-none">
                <li>· 截图保存到相册, 或抄到密码管理器.</li>
                <li>· 没截图就关页面 = 永久找不回. 没法补发.</li>
                <li>· 丢了可以加管理员微信兜底, 但不要靠这条.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={acknowledgeAndContinue}
              disabled={acknowledging}
              className="px-8 py-3 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 disabled:bg-ink-400 disabled:cursor-not-allowed transition-colors"
            >
              {acknowledging ? '继续...' : '我已截图. 进入 KEY →'}
            </button>
            {error && (
              <p className="font-serif text-sm text-ember italic mt-3">{error}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-0 items-stretch">
            {/* 左卡 · 已有邀请码 */}
            <div className="md:pr-10">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
                已有邀请码
              </p>
              <h2 className="font-serif text-2xl text-ink-900 tracking-tightish leading-tight mb-6">
                输入邀请码激活.
              </h2>
              <form onSubmit={submit} className="space-y-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="KE-XXXX-XXXX"
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full px-5 py-3.5 font-mono text-base tracking-widest uppercase border border-paper-300 bg-paper-50 focus:border-seal-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting || !code.trim()}
                  className="px-8 py-3 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 disabled:bg-ink-400 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? '验证中...' : '激活 →'}
                </button>
                {error && (
                  <p className="font-serif text-sm text-ember italic mt-3">{error}</p>
                )}
              </form>
            </div>

            {/* 中间 · hairline burgundy 与 "或" */}
            <div className="hidden md:flex flex-col items-center justify-center px-2">
              <div className="flex-1 w-px bg-seal-500/40" />
              <span className="my-3 font-serif italic text-seal-500 text-sm">或</span>
              <div className="flex-1 w-px bg-seal-500/40" />
            </div>
            <div className="md:hidden flex items-center justify-center my-2">
              <div className="flex-1 h-px bg-seal-500/40" />
              <span className="mx-3 font-serif italic text-seal-500 text-sm">或</span>
              <div className="flex-1 h-px bg-seal-500/40" />
            </div>

            {/* 右卡 · 还没邀请码 */}
            <div className="md:pl-10">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
                还没邀请码
              </p>
              <h2 className="font-serif text-2xl text-ink-900 tracking-tightish leading-tight mb-6">
                申请加入.
              </h2>
              <p className="font-serif text-[15px] text-ink-700 editorial-leading mb-6">
                发邮件到 <strong className="text-ink-900">hello@lifeos.cn</strong>, 一段话告诉我们: 你卡在什么决定上 / 大致背景. 48 小时内回复.
              </p>
              <a
                href="mailto:hello@lifeos.cn?subject=申请加入 KEY&body=我最近卡在的决定是:%0A%0A我的大致背景:%0A%0A"
                className="inline-block px-8 py-3 font-serif text-base border-2 border-seal-500 text-seal-500 hover:bg-seal-500 hover:text-paper transition-colors"
              >
                发邮件申请 →
              </a>
            </div>
          </div>
        )}
      </header>

      {/* II. 我们邀请的是这些人 (B13 · 移到 philosophy 前) */}
      <section className="bg-paper-50 border-y border-paper-300">
        <div className="max-w-prose-lg mx-auto px-6 py-20">
          <div className="mb-10">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
              II. 当前已邀请
            </p>
            <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight">
              我们邀请的是这些人.
            </h2>
          </div>
          <p className="font-serif text-reading text-ink-700 editorial-leading mb-10 max-w-prose-lg">
            匿名化展示 — 不公开姓名, 只公开身份段, 让你判断我们是不是在认真选人.
          </p>
          <ul className="space-y-4 font-serif text-[15px] text-ink-700 editorial-leading">
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span>前国内一线媒体集团 全媒体总经理</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span>顶级时尚刊物前主编 (3 位, 不同刊)</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span>投资行业 MD / 副总裁 (4 位)</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span>独立创业者 / 已 exit 的连续创业者 (3 位)</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="font-serif italic text-seal-500 w-8 shrink-0">—</span>
              <span>临床心理学博士 / 资深咨询师 (2 位, 帮我们做盲评)</span>
            </li>
          </ul>
          <p className="mt-10 font-serif italic text-sm text-ink-500">
            * 内测期 (~3-6 个月) 滚动邀请, 总量限 100. 名单非公开, 隐私优先.
          </p>
        </div>
      </section>

      {/* III. 为什么邀请制 (B13 · 移到 invitee list 后) */}
      <section className="max-w-prose-lg mx-auto px-6 py-20 border-b border-paper-300">
        <div className="mb-10">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
            III. 为什么邀请制
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight">
            不是稀缺性营销.
          </h2>
        </div>
        <div className="space-y-5 font-serif text-reading text-ink-700 editorial-leading">
          <p>
            永久免费版的用户心智跟年付会员不同. 一个想"试试 ChatGPT 的另一个 wrap", 另一个想"找一份长期记得他的决策伙伴".
            这两批人对同一个产品的预期完全不同. 我们设计体验时只能优先一边.
          </p>
          <p>
            邀请制是我们对体验密度的承诺 — 前 100 名认真选, 让每一份简报的质量都对得起 ¥1988 的年费.
            等内测期跑通 (~3-6 个月), 我们会开放申请通道, 但仍然保持人工审核.
          </p>
          <p className="text-ink-500 italic">
            如果你认同这条路径, 邮件来. 如果你只是想试一个新的 AI 工具, KEY 可能不适合你.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-paper-300 bg-paper">
        <div className="max-w-prose-xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-6">
            <p className="font-serif text-base text-ink-900">KEY · Invite</p>
            <div className="flex gap-6 text-[10px] font-sans uppercase tracking-[0.25em] text-ink-400">
              <Link href="/methodology" className="hover:text-seal-500 transition-colors">方法论</Link>
              <Link href="/sample-brief" className="hover:text-seal-500 transition-colors">样品</Link>
              <Link href="/membership" className="hover:text-seal-500 transition-colors">会员</Link>
              <Link href="/transparency" className="hover:text-seal-500 transition-colors">透明度</Link>
              <Link href="/" className="hover:text-seal-500 transition-colors">封面</Link>
            </div>
          </div>
          <p className="mt-6 text-[10px] font-sans uppercase tracking-[0.25em] text-ink-400">
            邀请制内测中 · 前 100 名认真选
          </p>
        </div>
      </footer>
    </div>
  );
}
