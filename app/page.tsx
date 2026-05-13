/**
 * / — LifeOS landing page (publication-grade)
 *
 * 设计原则:
 *   - 跟 /methodology + /sample-brief 同一调性
 *   - 没有 SaaS pattern (没 "Sign Up Free" / 没三档定价网格 / 没 testimonial 滚轮)
 *   - 像一本严肃刊物的封面 + 卷首语 + 内容预告
 *   - 三条入口: 看样品 / 看方法论 / 开始第一次咨询
 *
 * 不做:
 *   - 不在首页直接问 Pulse (那是已 onboard 用户的事, /pulse)
 *   - 不要求邮箱 (没建立信任前不要)
 *   - 不放 product screenshot (产品本身就是阅读体验)
 */

import Link from 'next/link';
import { getSampleBriefs } from '@/lib/db';
import type { DecisionBrief } from '@/lib/decision/brief-schema';
import KeyWordmark from '@/components/KeyWordmark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FRAMEWORK_LABEL: Record<string, string> = {
  'parent-care': '父母养老',
  marriage: '婚姻',
  'child-education': '子女教育',
};

// 五类决策 (首页"为谁而做"小节)
const FIVE_DOMAINS = [
  { ch: '父母养老', en: 'Aging Parents', note: '代际责任 · 兄弟姐妹分担 · 失能加速 · 走丢事件' },
  { ch: '子女出路', en: "A Child's Path", note: '升学路径 · 体制内外 · 鸡娃边界 · 配偶分歧' },
  { ch: '婚姻去留', en: 'A Marriage', note: '修复 · 分居 · 离婚 · 沉默累积' },
  { ch: '职业转身', en: 'A Career Turn', note: '跳槽 · 创业 · 降薪 · 早退休' },
  { ch: '迁移决策', en: 'Whether to Move', note: '城市 · 国家 · 阶层 · 时间窗口' },
];

export default async function HomePage() {
  // 拉一份 sample brief 作为首页 pull-quote (优先用 parent-care)
  const sampleRows = getSampleBriefs();
  const teaserRow =
    sampleRows.find((r: any) => r.framework === 'parent-care') || sampleRows[0];
  const teaserBrief: DecisionBrief | null = teaserRow
    ? JSON.parse(teaserRow.brief_json)
    : null;

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      {/* ============================================ */}
      {/* 顶部导航                                       */}
      {/* ============================================ */}
      <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-center">
        <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
        <div className="flex gap-6 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
          <Link href="/methodology" className="hover:text-seal-500 transition-colors">
            方法论
          </Link>
          <Link href="/sample-brief" className="hover:text-seal-500 transition-colors">
            样品
          </Link>
          <Link href="/membership" className="hover:text-seal-500 transition-colors">
            会员
          </Link>
          <Link href="/transparency" className="hover:text-seal-500 transition-colors">
            透明度
          </Link>
          <Link href="/invite" className="hover:text-seal-500 transition-colors">
            加入
          </Link>
        </div>
      </nav>

      {/* ============================================ */}
      {/* HERO — 占满首屏 (editorial illustration 背景)    */}
      {/* ============================================ */}
      <header className="relative min-h-[88vh] overflow-hidden">
        {/* editorial illustration 作底图 — 低 opacity, 让 paper 主导 */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <img
            src="/illustrations/editorial-parent-care.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-[0.16]"
            style={{ filter: 'sepia(0.15)' }}
          />
          {/* paper 渐变, 让中部 + 底部更可读 */}
          <div className="absolute inset-0 bg-gradient-to-b from-paper-200/40 via-paper-200/85 to-paper-200" />
          {/* 顶部书脊金线 */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-seal-500" />
        </div>

        <div className="relative max-w-prose-xl mx-auto px-6 pt-24 pb-20 min-h-[88vh] flex flex-col justify-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-8">
            · KEY Editorial Office · Issue 001 · 2026 ·
          </p>

          <h1 className="font-serif text-[clamp(2.5rem,6vw,5rem)] text-ink-900 tracking-tighter leading-[1.05] mb-12">
            有些决定,
            <br />
            不能一个人想.
          </h1>

          <div className="max-w-prose-lg space-y-5">
            <p className="font-serif text-reading text-ink-700 editorial-leading">
              父母养老. 孩子出路. 婚姻去留. 职业转身. 要不要迁移. 这些决定太重, 不能只靠冲动,
              不能只靠 ChatGPT, 也不能只靠几句安慰.
            </p>
            <p className="font-serif text-reading text-ink-700 editorial-leading">
              KEY 是一项 AI-Native 决策顾问服务. 我们以软件的边际成本,
              交付私人顾问级的人生决策结果 — 装在一份你愿意每天打开的杂志级阅读体验里.
            </p>
            <p className="font-serif text-reading text-ink-500 italic editorial-leading">
              不替你做决定. 不哄你. 不假装记得你 — 真的记得你.
            </p>
          </div>

          <div className="mt-16 flex flex-col sm:flex-row gap-6 items-start sm:items-baseline">
            <Link
              href="/sample-brief"
              className="font-serif text-lg text-ink-900 border-b-2 border-seal-500 pb-1 hover:text-seal-500 transition-colors"
            >
              读三份匿名 sample brief →
            </Link>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline">
              ·
            </span>
            <Link
              href="/methodology"
              className="font-serif text-lg text-ink-700 hover:text-seal-500 transition-colors"
            >
              先看方法论
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* WHAT IS THIS — 卷首语                          */}
      {/* ============================================ */}
      <section className="border-t border-paper-300 bg-paper-50">
        <div className="max-w-prose-lg mx-auto px-6 py-24">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-8">
            · 卷首语 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 mb-10 tracking-tightish leading-tight">
            我们为 AI 写了一份决策契约.
          </h2>
          <div className="space-y-5 font-serif text-reading text-ink-700 editorial-leading">
            <p>
              市面上大多数所谓 "AI 决策工具", 不过是给 ChatGPT 套一层 UI. 它们卖的是 "AI 的便利".
              我们卖的是另一件事 — 我们卖的是 "AI 不能跳过的步骤".
            </p>
            <p>
              在重大人生决策面前, 你不需要再多一个夸你的 AI. 你需要一个被严格约束 / 长期记得你 /
              不替你做决定, 但保证你不跳过你一个人时会跳过的关键问题的伙伴.
            </p>
            <p>
              7 条决策契约. 12 维结构化分析. PreMortem 反向尸检. 30 / 90 / 365 天回访. 长期记忆.
              在代码里, 不在市场话术里.
            </p>
          </div>
          <div className="mt-10">
            <Link
              href="/methodology"
              className="font-serif text-base text-ink-900 border-b border-seal-500 pb-0.5 hover:text-seal-500 transition-colors"
            >
              读完整方法论 →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TEASER — 摘自一份真实 brief                     */}
      {/* ============================================ */}
      {teaserBrief && (
        <section className="border-t border-paper-300">
          <div className="max-w-prose-xl mx-auto px-6 py-24">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-10">
              · 摘自一份真实简报 ·
            </p>

            <blockquote className="max-w-prose-lg">
              <p className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] text-ink-900 leading-snug tracking-tightish italic mb-10">
                "{teaserBrief.sections.summary.split('。')[0]}."
              </p>
              <footer className="font-sans text-[11px] uppercase tracking-[0.25em] text-ink-500">
                — 摘自 {teaserBrief.briefNumber}  ·  {FRAMEWORK_LABEL[teaserBrief.meta.framework] || teaserBrief.meta.framework}类
              </footer>
            </blockquote>

            <div className="mt-12">
              <Link
                href="/sample-brief"
                className="font-serif text-base text-ink-900 border-b border-seal-500 pb-0.5 hover:text-seal-500 transition-colors"
              >
                读完整简报 →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* WHO IS THIS FOR — 5 类决策                     */}
      {/* ============================================ */}
      <section className="border-t border-paper-300 bg-paper-50">
        <div className="max-w-prose-xl mx-auto px-6 py-24">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-10">
            · 为五类决策而做 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 mb-16 tracking-tightish leading-tight max-w-prose-lg">
            如果你正卡在以下任一类决定上 —
            <br />
            这份服务为你而做.
          </h2>

          <ol className="space-y-10">
            {FIVE_DOMAINS.map((d, i) => (
              <li key={d.ch} className="flex items-baseline gap-6 border-b border-paper-300 pb-8 last:border-b-0">
                <span className="font-serif italic text-seal-500 text-2xl tracking-widest select-none w-12">
                  {['I', 'II', 'III', 'IV', 'V'][i]}.
                </span>
                <div className="flex-1">
                  <h3 className="font-serif text-2xl text-ink-900 tracking-tightish mb-1">
                    {d.ch}
                  </h3>
                  <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-3">
                    {d.en}
                  </p>
                  <p className="font-serif text-[15px] text-ink-500 editorial-leading">
                    {d.note}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================================ */}
      {/* MEMBERSHIP TEASER                              */}
      {/* ============================================ */}
      <section className="border-t border-paper-300">
        <div className="max-w-prose-lg mx-auto px-6 py-24">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-8">
            · 加入 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 mb-10 tracking-tightish leading-tight">
            年度顾问会员 · ¥1988.
          </h2>
          <div className="space-y-5 font-serif text-reading text-ink-700 editorial-leading">
            <p>
              请一位资深顾问按小时聊重大决定: ¥1000-3000/小时. 走一遍完整 12 维分析 + 365 天跟踪:
              至少 ¥50,000.
            </p>
            <p>
              KEY 一年: <span className="text-ink-900 font-medium">¥1988</span>. 365 天无限决策简报.
              月度复盘. 30 / 90 / 365 天回访. 第一周不合适, 全退.
            </p>
            <p className="text-ink-500 italic">
              创始会员 (限 100 名) ¥4988 / 三年. 邀请制内测中.
            </p>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row gap-6 items-start sm:items-baseline">
            <Link
              href="/invite"
              className="font-serif text-lg text-ink-900 border-b-2 border-seal-500 pb-1 hover:text-seal-500 transition-colors"
            >
              申请加入 →
            </Link>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline">
              ·
            </span>
            <Link
              href="/sample-brief"
              className="font-serif text-lg text-ink-700 hover:text-seal-500 transition-colors"
            >
              先读样品
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER                                         */}
      {/* ============================================ */}
      <footer className="border-t border-paper-300 bg-paper-50">
        <div className="max-w-prose-xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-6">
            <div className="flex items-center gap-3">
              <KeyWordmark variant="mark-only" height={20} ariaLabel="KEY mark" />
              <p className="font-serif text-base text-ink-900">
                KEY Editorial Office
              </p>
            </div>
            <div className="flex gap-6 text-[10px] font-sans uppercase tracking-[0.25em] text-ink-400">
              <Link href="/methodology" className="hover:text-seal-500 transition-colors">方法论</Link>
              <Link href="/sample-brief" className="hover:text-seal-500 transition-colors">样品</Link>
              <Link href="/membership" className="hover:text-seal-500 transition-colors">会员</Link>
              <Link href="/transparency" className="hover:text-seal-500 transition-colors">透明度</Link>
              <Link href="/pulse" className="hover:text-seal-500 transition-colors">进入</Link>
              <Link href="/terms" className="hover:text-seal-500 transition-colors">服务条款</Link>
              <Link href="/privacy" className="hover:text-seal-500 transition-colors">隐私</Link>
            </div>
          </div>
          <p className="mt-6 text-[10px] font-sans uppercase tracking-[0.25em] text-ink-400">
            陪你想清楚 · 看清代价 · 长期记得你
          </p>
          <p className="mt-2 text-[10px] font-sans text-ink-400">
            AIGC 备案中 · 本服务输出由 AI 生成, 不构成医疗 / 法律 / 财务建议
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Metadata
// ============================================================================
export const metadata = {
  title: 'KEY · AI-Native 决策顾问',
  description:
    '父母养老. 孩子出路. 婚姻去留. 职业转身. 要不要迁移. 这些决定太重, 不能一个人想. KEY 以软件的边际成本, 交付私人顾问级的人生决策结果.',
};
