/**
 * /methodology — 7 条决策契约
 *
 * 设计目标:
 *   - Publication-grade craft: 像一篇严肃的长文, 不是 feature page
 *   - 7 条契约结构化呈现: 罗马数字 + 标题 + hook + essay + 对照 + 血缘 + 看实例
 *   - 没有 SaaS pattern: 没有 feature card / 没有 icon / 没有 testimonial / 没有 FAQ
 *   - 跟 sample brief 互锁: 读完 methodology → 看 sample brief 是必然的下一步
 */

import Link from 'next/link';
import { Fragment } from 'react';
import { loadMethodologyContent, type MethodologyContract } from '@/lib/content/methodology';
import KeyWordmark from '@/components/KeyWordmark';
import { FleuronDivider } from '@/components/Fleuron';

export const runtime = 'nodejs';

// 兼容 alias — page 用 Contract 这个名字
type Contract = MethodologyContract;

// ============================================================================
// 顶部导航 — 极简
// ============================================================================
function TopNav() {
  return (
    <nav className="max-w-prose-xl mx-auto px-6 pt-10 pb-6 flex justify-between items-baseline">
      <Link href="/" aria-label="KEY home" className="block">
          <KeyWordmark variant="nav" height={22} />
        </Link>
      <Link
        href="/"
        className="text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500 hover:text-seal-500 transition-colors"
      >
        ← Home
      </Link>
    </nav>
  );
}

// ============================================================================
// 章节标题块 (罗马数字 + 标题 + 英文副标题 + 暗红分隔细线)
// ============================================================================
function ContractHeader({
  numeral,
  title,
  englishTitle,
  hook,
}: Pick<Contract, 'numeral' | 'title' | 'englishTitle' | 'hook'>) {
  return (
    <div className="mb-12">
      <div className="flex items-baseline gap-6 mb-6">
        <span className="font-serif italic text-seal-500 text-5xl tracking-widest select-none leading-none">
          {numeral}.
        </span>
        <div>
          <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight">
            {title}
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mt-2">
            {englishTitle}
          </p>
        </div>
      </div>
      <div className="mt-3 mb-8 h-px w-16 bg-seal-500/60" />
      <p className="font-serif italic text-2xl text-ink-700 leading-snug tracking-tightish">
        {hook}
      </p>
    </div>
  );
}

// ============================================================================
// 对照块 (AI-assisted vs AI-native)
// ============================================================================
function ContrastBlock({
  aiAssistedQuote,
  aiNativeQuote,
}: Contract['contrast']) {
  return (
    <div className="my-12 grid md:grid-cols-2 gap-10 border-t border-paper-300 pt-10">
      <div>
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-3">
          一般 AI 通常会这么说
        </p>
        <p className="font-serif italic text-reading text-ink-500 editorial-leading">
          "{aiAssistedQuote}"
        </p>
      </div>
      <div className="md:border-l border-paper-300 md:pl-10 border-t md:border-t-0 pt-10 md:pt-0">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
          KEY 这么做
        </p>
        <p className="font-serif text-reading text-ink-900 editorial-leading">
          "{aiNativeQuote}"
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 方法论血缘块
// ============================================================================
function LineageBlock({
  authority,
  citation,
  insight,
}: Contract['lineage']) {
  return (
    <div className="my-10 pl-6 border-l-2 border-seal-500/40">
      <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-2">
        方法论血缘
      </p>
      <p className="font-serif text-ink-900 text-base mb-1">
        {authority}
      </p>
      <p className="font-serif italic text-[14px] text-ink-500 mb-3">
        {citation}
      </p>
      <p className="font-serif text-[15px] text-ink-700 editorial-leading">
        {insight}
      </p>
    </div>
  );
}

// ============================================================================
// 单条契约的完整渲染
// ============================================================================
function ContractSection({ contract }: { contract: Contract }) {
  return (
    <section className="py-20">
      <ContractHeader
        numeral={contract.numeral}
        title={contract.title}
        englishTitle={contract.englishTitle}
        hook={contract.hook}
      />

      {/* 正文 essay — 首段首字下沉 */}
      <div className="space-y-6 mb-4">
        {contract.body.map((p, i) => {
          if (i === 0 && p.length > 0) {
            const first = p.charAt(0);
            const rest = p.slice(1);
            const isCJK = first.charCodeAt(0) >= 0x2e80;
            return (
              <p
                key={i}
                className="font-serif text-reading text-ink-700 editorial-leading"
              >
                <span
                  className={`drop-cap-char${isCJK ? ' drop-cap-char--cn' : ''}`}
                >
                  {first}
                </span>
                {rest}
              </p>
            );
          }
          return (
            <p
              key={i}
              className="font-serif text-reading text-ink-700 editorial-leading"
            >
              {p}
            </p>
          );
        })}
      </div>

      {/* 对照 */}
      <ContrastBlock {...contract.contrast} />

      {/* 血缘 */}
      <LineageBlock {...contract.lineage} />

      {/* 看实例 */}
      <div className="mt-10">
        <Link
          href={`/sample-brief`}
          className="font-serif text-base text-ink-900 border-b-2 border-seal-500 pb-1 hover:text-seal-500 transition-colors"
        >
          看这一条在 sample brief 里怎么落地 →
        </Link>
      </div>
    </section>
  );
}

// ============================================================================
// 主页面
// ============================================================================
export default function MethodologyPage() {
  const { opening: METHODOLOGY_OPENING, contracts: CONTRACTS, closing: METHODOLOGY_CLOSING } =
    loadMethodologyContent();
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <TopNav />

      {/* ============================================ */}
      {/* HERO                                          */}
      {/* ============================================ */}
      <header className="max-w-prose-lg mx-auto px-6 pt-20 pb-20 border-b border-paper-300">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
          {METHODOLOGY_OPENING.eyebrow}
        </p>
        <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter mb-10 leading-[1.1]">
          {METHODOLOGY_OPENING.title}
        </h1>
        <div className="space-y-5 max-w-prose-lg">
          {METHODOLOGY_OPENING.body.map((p, i) => (
            <p
              key={i}
              className="font-serif text-reading text-ink-700 editorial-leading"
            >
              {p}
            </p>
          ))}
        </div>
      </header>

      {/* ============================================ */}
      {/* 目录 (ToC)                                     */}
      {/* ============================================ */}
      <section className="max-w-prose-xl mx-auto px-6 py-16">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-6">
          · 七条 ·
        </p>
        <ol className="space-y-2">
          {CONTRACTS.map((c) => (
            <li key={c.numeral} className="flex items-baseline gap-4">
              <span className="font-serif italic text-seal-500 text-xl w-10 select-none">
                {c.numeral}.
              </span>
              <span className="font-serif text-lg text-ink-700">{c.title}</span>
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline">
                {c.englishTitle}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ============================================ */}
      {/* 7 条契约                                       */}
      {/* ============================================ */}
      <main className="max-w-prose-xl mx-auto px-6">
        {CONTRACTS.map((c, i) => (
          <Fragment key={c.numeral}>
            {i > 0 && (
              <FleuronDivider
                variant={i % 2 === 0 ? 'simple-diamond' : 'chinese-huiwen'}
                seal
              />
            )}
            <ContractSection contract={c} />
          </Fragment>
        ))}
      </main>

      {/* ============================================ */}
      {/* 结语                                           */}
      {/* ============================================ */}
      <footer className="border-t border-paper-300 bg-paper-50 mt-20">
        <div className="max-w-prose-lg mx-auto px-6 py-24">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-8">
            · 收束 ·
          </p>
          <div className="space-y-6 mb-12">
            {METHODOLOGY_CLOSING.body.map((p, i) => (
              <p
                key={i}
                className="font-serif text-reading text-ink-700 editorial-leading"
              >
                {p}
              </p>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <Link
              href={METHODOLOGY_CLOSING.ctaPrimary.href}
              className="font-serif text-base text-ink-900 border-b-2 border-seal-500 pb-1 hover:text-seal-500 transition-colors"
            >
              {METHODOLOGY_CLOSING.ctaPrimary.label} →
            </Link>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline">
              ·
            </span>
            <Link
              href={METHODOLOGY_CLOSING.ctaSecondary.href}
              className="font-serif text-base text-ink-700 hover:text-seal-500 transition-colors"
            >
              {METHODOLOGY_CLOSING.ctaSecondary.label}
            </Link>
          </div>
        </div>

        <div className="border-t border-paper-300">
          <div className="max-w-prose-xl mx-auto px-6 py-8 flex flex-col items-center gap-3 text-center">
            <KeyWordmark variant="mark-only" height={18} ariaLabel="KEY mark" />
            <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-ink-400">
              KEY Editorial Office · Methodology · 决策科学 40 年最佳实践的工程化
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Metadata
// ============================================================================
export const metadata = {
  title: 'Methodology · KEY',
  description:
    '我们为 AI 写了一份决策契约. 7 条契约 + 学术血缘 + 实例 — KEY 跟通用 AI 的全部不同, 在代码里, 不在市场话术里.',
};
