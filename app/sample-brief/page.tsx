/**
 * /sample-brief — 3 份匿名 sample brief 公开页
 *
 * 用途:
 *   - 这是 LifeOS 对外最重要的 marketing 资产: "看我们交付的东西长这样"
 *   - 比任何 banner / feature page 都重要
 *   - 用真实的 publication-grade 输出说话
 *
 * 结构:
 *   - 顶部: 编辑部说明 (一段话告诉读者这是什么)
 *   - 主体: 3 份 brief, 可切换查看
 *   - 底部: 加入说明
 */

import { getSampleBriefs } from '@/lib/db';
import BriefRenderer from '@/components/BriefRenderer';
import BriefSeal from '@/components/BriefSeal';
import Link from 'next/link';
import type { DecisionBrief } from '@/lib/decision/brief-schema';
import KeyWordmark from '@/components/KeyWordmark';
import PageMasthead from '@/components/PageMasthead';
import { loadSampleBriefContent } from '@/lib/content/sample-brief';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function SampleBriefPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  return <SampleBriefContent searchParams={searchParams} />;
}

async function SampleBriefContent({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const sp = await searchParams;
  const rows = getSampleBriefs();
  const copy = loadSampleBriefContent();
  const FRAMEWORK_LABEL = copy.frameworkLabels;

  /** 估算 brief 字数 (cn): 走 sections 树形结构, 累加所有 string. */
  function countBriefChars(brief: DecisionBrief): number {
    let total = 0;
    const collect = (val: any): void => {
      if (typeof val === 'string') total += val.length;
      else if (Array.isArray(val)) val.forEach(collect);
      else if (val && typeof val === 'object') Object.values(val).forEach(collect);
    };
    if (brief?.sections) collect(brief.sections);
    return total;
  }
  /** 中文阅读速度 ~300 字 / 分钟. */
  function readingMinutes(chars: number): number {
    return Math.max(1, Math.round(chars / 300));
  }
  /** framework key → 英文 caps · "parent-care" → "PARENT CARE". */
  function frameworkEnCaps(framework: string): string {
    return framework.replace(/-/g, ' ').toUpperCase();
  }

  const briefs: Array<{
    id: number;
    framework: string;
    topic: string;
    brief: DecisionBrief;
    chars: number;
    minutes: number;
  }> = rows.map((r, idx) => {
    const brief = JSON.parse(r.brief_json) as DecisionBrief;
    const chars = countBriefChars(brief);
    return {
      id: r.id,
      framework: r.framework,
      topic: r.topic,
      brief,
      chars,
      minutes: readingMinutes(chars),
    };
  });

  // 默认显示第一个 (parent-care), 或按 query 参数
  const selectedId = sp.id ? parseInt(sp.id, 10) : briefs[0]?.id;
  const selected = briefs.find((b) => b.id === selectedId) || briefs[0];

  if (!selected) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-serif text-ink-500">尚未生成 sample brief.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      {/* ============================================ */}
      {/* 顶部导航 — 极简                                  */}
      {/* ============================================ */}
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

      <PageMasthead eyebrow="SAMPLE BRIEFS" volume="MMXXVI" right="春" />

      {/* ============================================ */}
      {/* 编辑部说明                                       */}
      {/* ============================================ */}
      <header className="max-w-prose-xl mx-auto px-6 pt-16 pb-16 border-b border-paper-300">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_0.85fr] gap-10 md:gap-14 items-center">
          <div className="order-2 md:order-1">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
              {copy.header.eyebrow}
            </p>
            <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter mb-8">
              {copy.header.title}
            </h1>
            <div className="font-serif text-reading text-ink-700 editorial-leading space-y-4">
              {copy.header.body.map((p, i) => {
                const isLast = i === copy.header.body.length - 1;
                const italic = isLast && copy.header.lastParagraphItalic;
                return (
                  <p key={i} className={italic ? 'text-ink-500 italic' : undefined}>
                    {p}
                  </p>
                );
              })}
            </div>
          </div>
          {/* channel-works · 作家工作台 + 手稿 · "经过两轮撰稿" 的视觉 */}
          <div className="order-1 md:order-2 relative aspect-[4/5] bg-ink-900/5 overflow-hidden">
            <img
              src="/illustrations/channel-works.png"
              alt="作家工作台 · 手稿与墨水瓶"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-seal-500" />
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* Brief 切换器                                     */}
      {/* ============================================ */}
      <section className="max-w-prose-xl mx-auto px-6 mt-12">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-500 mb-6">
          {copy.selector.eyebrow}
        </p>

        {/* B3 · 杂志 TOC 5 列 (desktop) / stack (mobile) */}
        <ol className="border-t border-paper-300 mb-12">
          {briefs.map((b, i) => {
            const isActive = b.id === selected.id;
            const roman = ['I', 'II', 'III', 'IV', 'V'][i] || String(i + 1);
            return (
              <li key={b.id} className="border-b border-paper-300">
                <Link
                  href={`/sample-brief?id=${b.id}`}
                  className="group block py-5 md:py-6 md:grid md:grid-cols-[40px_140px_1fr_120px_70px] md:gap-6 md:items-baseline transition-colors"
                >
                  {/* col 1 · 罗马 */}
                  <span className="hidden md:inline-block font-serif italic text-seal-500 text-lg leading-none">
                    {roman}
                  </span>

                  {/* col 2 · domain en caps */}
                  <span className="block md:inline font-sans text-[10px] uppercase tracking-[0.28em] text-seal-500 mb-1 md:mb-0">
                    {frameworkEnCaps(b.framework)}
                  </span>

                  {/* col 3 · 标题 (+ now reading indicator) */}
                  <span
                    className={`block md:inline font-serif text-[18px] leading-snug ${
                      isActive ? 'text-ink-900' : 'text-ink-700 group-hover:text-ink-900'
                    } transition-colors`}
                  >
                    {isActive && (
                      <span className="inline-flex items-baseline gap-1.5 mr-2 align-baseline">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-seal-500" />
                        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-seal-500">
                          now reading
                        </span>
                      </span>
                    )}
                    {b.topic}
                  </span>

                  {/* col 4 · 字数 + 阅读时间 */}
                  <span className="block md:inline font-mono text-[11px] text-ink-500 mt-1 md:mt-0">
                    {b.chars.toLocaleString()} 字 · {b.minutes} 分钟
                  </span>

                  {/* col 5 · 读 → */}
                  <span
                    className={`hidden md:inline-block text-right font-serif italic text-[14px] transition-colors ${
                      isActive ? 'text-ink-400' : 'text-seal-500 group-hover:text-seal-700'
                    }`}
                  >
                    {isActive ? '在读' : '读 →'}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ============================================ */}
      {/* Hero: 满版 editorial illustration + 标题 + 印章 */}
      {/* ============================================ */}
      <section className="relative w-full bg-ink-900 overflow-hidden">
        <div className="relative w-full aspect-[16/9] md:aspect-[16/7] lg:aspect-[16/6] max-h-[72vh]">
          {/* illustration 撑满 — 黑白 engraving */}
          <img
            src={`/illustrations/editorial-${selected.framework}.png`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
          {/* 顶部 burgundy hairline — 像出版物书脊金线 */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-seal-500" />
          {/* 下半渐变 — paper bg 轻染, 让标题压得住但不糊掉画面 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-900/10 to-ink-900/75" />
          {/* 右上印章 */}
          <div className="absolute top-6 right-6 md:top-10 md:right-10">
            <BriefSeal variant="round" size={88} seed={selected.brief.briefNumber} />
          </div>
          {/* 标题 + framework 标 + 编号 — 压底 */}
          <div className="absolute inset-x-0 bottom-0 px-6 pb-10 md:pb-16">
            <div className="max-w-prose-xl mx-auto">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="inline-flex items-baseline gap-2 px-2.5 py-0.5 bg-paper-100/95 border border-paper-100">
                  <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-seal-500">
                    ISSUE
                  </span>
                  <span className="font-serif text-xl text-seal-500 tracking-tighter leading-none">
                    N°{selected.brief.briefNumber.split('-').pop()}
                  </span>
                </span>
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-paper-200/90">
                  {FRAMEWORK_LABEL[selected.framework] || selected.framework}
                </span>
              </div>
              <h1 className="font-serif text-editorial-xl text-paper-100 tracking-tighter leading-[1.05] max-w-prose-lg">
                {selected.brief.topic}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Brief 主体 (compact header, hero 已占了标题 + 印章) */}
      {/* ============================================ */}
      <main className="max-w-prose-xl mx-auto px-6 pb-32 pt-16">
        <BriefRenderer brief={selected.brief} showSeal={true} compactHeader={true} />

        {/* C6 · End-of-brief transitional line (immediately above membership CTA) */}
        <div className="mt-16 max-w-[26em] mx-auto text-center">
          <p className="font-serif italic text-[17px] text-ink-500 leading-snug">
            读完这份简报的人, 平均坐在屏幕前 {selected.minutes + 3} 分钟.
            <br />
            我们也是花了那么久写它的.
          </p>
        </div>
      </main>

      {/* ============================================ */}
      {/* 底部 CTA — 不是 SaaS 风格                         */}
      {/* ============================================ */}
      <footer className="border-t border-paper-300 bg-paper-50">
        <div className="max-w-prose-lg mx-auto px-6 py-20 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            {copy.footer.eyebrow}
          </p>
          <h2 className="font-serif text-editorial text-ink-900 mb-6 tracking-tightish whitespace-pre-line">
            {copy.footer.title}
          </h2>
          <p className="font-serif text-reading text-ink-500 editorial-leading mb-10 max-w-prose-lg mx-auto">
            {copy.footer.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={copy.footer.ctaPrimary.href}
              className="font-serif text-base text-ink-900 border-b-2 border-seal-500 pb-1 hover:text-seal-500 transition-colors"
            >
              {copy.footer.ctaPrimary.label}
            </Link>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline">
              ·
            </span>
            <Link
              href={copy.footer.ctaSecondary.href}
              className="font-serif text-base text-ink-700 hover:text-seal-500 transition-colors"
            >
              {copy.footer.ctaSecondary.label}
            </Link>
          </div>
        </div>

        <div className="border-t border-paper-300">
          <div className="max-w-prose-xl mx-auto px-6 py-8 flex flex-col items-center gap-3 text-center">
            <KeyWordmark variant="mark-only" height={18} ariaLabel="KEY mark" />
            <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-ink-400">
              {copy.footer.smallText}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
