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

function TopNav() {
  return (
    <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
      <Link href="/" className="font-serif text-xl font-semibold tracking-tightish text-ink-900 hover:text-seal-500 transition-colors">
        KEY
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

export default function InvitePage() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ recipientName: string | null; invitedBy: string } | null>(
    null
  );

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
      } else if (data.alreadyInvited) {
        setSuccess({ recipientName: null, invitedBy: '(你已经是 invited 状态)' });
        setTimeout(() => router.push('/onboarding'), 1500);
      } else {
        setSuccess({
          recipientName: data.invitedToUser?.recipientName || null,
          invitedBy: data.invitedToUser?.invitedBy || 'founder',
        });
        setTimeout(() => router.push('/onboarding'), 2000);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <TopNav />

      {/* HERO */}
      <header className="max-w-prose-lg mx-auto px-6 pt-20 pb-16 border-b border-paper-300">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
          · KEY Editorial Office · 加入 ·
        </p>
        <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter mb-10 leading-[1.1]">
          邀请制内测中.
        </h1>
        <div className="space-y-5">
          <p className="font-serif text-reading text-ink-700 editorial-leading">
            KEY 不公开注册. 不是稀缺性营销 — 真理由是: 我们希望前 100 名会员
            认真选, 让产品体验的密度跟年付预期匹配.
          </p>
          <p className="font-serif text-reading text-ink-500 italic editorial-leading">
            如果你已经收到一份邀请, 输入下面的码. 没有, 看 II 怎么申请.
          </p>
        </div>
      </header>

      {/* I. 已有邀请码 */}
      <section className="max-w-prose-lg mx-auto px-6 py-20 border-b border-paper-300">
        <div className="mb-10">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
            I. 已有邀请码
          </p>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight">
            输入邀请码激活账户.
          </h2>
        </div>

        {success ? (
          <div className="border border-sage/40 bg-sage/5 p-8">
            <p className="font-serif text-lg text-ink-900 mb-2">✓ 邀请码已激活</p>
            {success.recipientName && (
              <p className="font-serif text-reading text-ink-700 mb-1">
                欢迎, {success.recipientName}.
              </p>
            )}
            <p className="font-serif text-sm text-ink-500 italic">
              邀请人: {success.invitedBy} · 正在跳转到建档...
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="KE-XXXX-XXXX"
              spellCheck={false}
              autoComplete="off"
              className="w-full max-w-md px-5 py-4 font-mono text-lg tracking-widest uppercase border border-paper-300 bg-paper-50 focus:border-seal-500 focus:outline-none transition-colors"
            />
            <div>
              <button
                type="submit"
                disabled={submitting || !code.trim()}
                className="px-8 py-3 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 disabled:bg-ink-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '验证中...' : '激活'}
              </button>
            </div>
            {error && (
              <p className="font-serif text-sm text-ember italic mt-3">{error}</p>
            )}
          </form>
        )}
      </section>

      {/* II. 还没邀请码 */}
      <section className="bg-paper-50 border-b border-paper-300">
        <div className="max-w-prose-lg mx-auto px-6 py-20">
          <div className="mb-10">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
              II. 还没邀请码
            </p>
            <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight">
              申请加入.
            </h2>
          </div>
          <div className="space-y-5 font-serif text-reading text-ink-700 editorial-leading mb-10">
            <p>发邮件到 <strong className="text-ink-900">hello@lifeos.cn</strong>, 一段话告诉我们:</p>
          </div>
          <ol className="space-y-2 pl-6 border-l-2 border-seal-500/40 mb-10">
            <li className="font-serif text-[15px] text-ink-700 editorial-leading flex gap-3">
              <span className="font-serif italic text-seal-500 text-sm w-5 shrink-0">01</span>
              <span>你最近卡在什么决定上 (3 句话内, 不需要详细)</span>
            </li>
            <li className="font-serif text-[15px] text-ink-700 editorial-leading flex gap-3">
              <span className="font-serif italic text-seal-500 text-sm w-5 shrink-0">02</span>
              <span>你的大致背景 (年龄段 / 行业 / 城市, 不需要简历)</span>
            </li>
            <li className="font-serif text-[15px] text-ink-700 editorial-leading flex gap-3">
              <span className="font-serif italic text-seal-500 text-sm w-5 shrink-0">03</span>
              <span>怎么收到邀请码 — 我们 48 小时内回复</span>
            </li>
          </ol>
          <a
            href="mailto:hello@lifeos.cn?subject=申请加入 KEY&body=我最近卡在的决定是:%0A%0A我的大致背景:%0A%0A"
            className="font-serif text-lg text-ink-900 border-b-2 border-seal-500 pb-1 hover:text-seal-500 transition-colors"
          >
            写邮件申请 →
          </a>
        </div>
      </section>

      {/* III. 为什么邀请制 */}
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
            如果你认同这条路径, 邮件来. 如果不认同 — 也好, 你不是我们的人.
          </p>
        </div>
      </section>

      {/* IV. 当前邀请的人 (匿名化) */}
      <section className="bg-paper-50">
        <div className="max-w-prose-lg mx-auto px-6 py-20">
          <div className="mb-10">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
              IV. 当前已邀请
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

      {/* FOOTER */}
      <footer className="border-t border-paper-300 bg-paper">
        <div className="max-w-prose-xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-6">
            <p className="font-serif text-base text-ink-900">KEY Editorial Office · Invite</p>
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
