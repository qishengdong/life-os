/**
 * /transparency — 内部审计数据公开页
 *
 * 哲学: "Fail visibly, not silently."
 *
 * 内容:
 *   I.   12 维 Real Grader 评分 (含最弱的几条不藏)
 *   II.  7 项 Inspector check 定义 + 命中数
 *   III. Brief 总览 (生成数 / 字数 / 编辑通过率)
 *   IV.  我们暂时没法量化的
 *   V.   怎么质疑我们
 *   VI.  月度错误公示
 *
 * 数据动态拉自 lib/grader/aggregations.ts.
 * 内测期数据小, 不藏, 也不放大.
 */

import Link from 'next/link';
import { loadTransparencyContent } from '@/lib/content/transparency';
import {
  getDimensionScores,
  getDimensionLabel,
  getDimensionDesc,
  getGraderOverallStats,
  getCheckStats,
  getBriefStats,
  getBriefLatencyTrend,
  getBriefCharCountTrend,
  getGraderScoreTrend,
} from '@/lib/grader/aggregations';
import KeyWordmark from '@/components/KeyWordmark';
import PageMasthead from '@/components/PageMasthead';
import Sparkline, { Gauge } from '@/components/Sparkline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

function SectionHeader({
  numeral,
  title,
  englishTitle,
}: {
  numeral: string;
  title: string;
  englishTitle: string;
}) {
  return (
    <div className="mb-12">
      <div className="flex items-baseline gap-6 mb-4">
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
      <div className="h-px w-16 bg-seal-500/60" />
    </div>
  );
}

// ============================================================================
// 12 维评分块 - 像一份成绩单
// ============================================================================
// B9 阈值: 累计满 20 份 brief 才发布有信号的 grader 评分.
const GRADER_PUBLISH_MIN_N = 20;

function GraderBlock() {
  const scores = getDimensionScores();
  const overall = getGraderOverallStats();
  const scoreTrend = getGraderScoreTrend(20);

  // 累计样本量决定 schema 视图 vs 完整评分
  const totalSamples = scores.reduce((sum, s) => sum + s.sampleSize, 0);
  const showSchemaView = totalSamples < GRADER_PUBLISH_MIN_N;

  return (
    <div>
      {/* 总分 · schema 视图下隐藏数字 metric, 显示 placeholder */}
      {!showSchemaView && (
        <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-paper-300">
          <Metric label="综合均分" value={overall.overallAvg.toFixed(2)} suffix="/ 5" />
          <Metric label="评分批次" value={String(overall.runCount)} suffix="次" />
          <Metric label="最佳批次" value={overall.bestRun.toFixed(2)} suffix="/ 5" />
          <Metric label="最弱批次" value={overall.worstRun.toFixed(2)} suffix="/ 5" />
        </div>
      )}

      {/* 评分趋势 sparkline · 仅 N>=阈值 显示 */}
      {!showSchemaView && scoreTrend.length >= 2 && (
        <div className="mb-12 flex items-baseline gap-4 -mt-6">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink-400">
            最近 {scoreTrend.length} 批 综合均分趋势
          </span>
          <Sparkline
            data={scoreTrend}
            width={160}
            height={28}
            showBaseline
            ariaLabel={`grader 趋势, ${scoreTrend.length} 个数据点`}
          />
          <span className="font-mono text-[11px] text-ink-500">
            {scoreTrend[0].toFixed(2)} → {scoreTrend[scoreTrend.length - 1].toFixed(2)}
          </span>
        </div>
      )}

      {/* 12 维明细 · schema 模式下 "—" 取代数字 */}
      <ol className="space-y-6">
        {scores.map((s, i) => {
          const isWeakest = !showSchemaView && i >= scores.length - 3;
          return (
            <li
              key={s.dimension}
              className="grid grid-cols-[40px_1fr_100px] gap-6 items-baseline border-b border-paper-300 pb-5"
            >
              <span className="font-serif italic text-seal-500 text-lg select-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h4 className="font-serif text-lg text-ink-900 tracking-tightish mb-1">
                  {getDimensionLabel(s.dimension)}
                </h4>
                <p className="font-serif text-[14px] text-ink-500 editorial-leading">
                  {getDimensionDesc(s.dimension)}
                </p>
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 mt-1">
                  {showSchemaView ? s.dimension : `n = ${s.sampleSize}  ·  ${s.dimension}`}
                </p>
              </div>
              <div className="text-right">
                {showSchemaView ? (
                  <span className="font-serif text-3xl text-ink-300 tracking-tighter">—</span>
                ) : (
                  <>
                    <span
                      className={`font-serif text-3xl tracking-tighter ${
                        isWeakest ? 'text-amber' : 'text-ink-900'
                      }`}
                    >
                      {s.avgScore.toFixed(2)}
                    </span>
                    <span className="font-serif text-sm text-ink-400 ml-1">/5</span>
                    <div className="mt-2 flex justify-end">
                      <Gauge value={s.avgScore} max={5} target={4} width={88} />
                    </div>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* B9 · schema 视图下方注释 (hairline + italic 注脚) */}
      {showSchemaView && (
        <div className="mt-10 pt-6 border-t border-paper-300">
          <p className="font-serif italic text-[14px] text-ink-500 editorial-leading max-w-prose-lg">
            首批评分将在累计第 {GRADER_PUBLISH_MIN_N} 份 brief 完成后发布.
            <br />
            当前 N = {totalSamples}, 不足以发布有信号的评分.
          </p>
        </div>
      )}

      {/* 最弱的几条诚实说明 · 仅 schema 视图退场后显示 */}
      {!showSchemaView && scores.length > 0 && (
        <div className="mt-10 pl-6 border-l-2 border-amber/60">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-amber mb-3">
            最弱三条 (橙色标识)
          </p>
          <p className="font-serif text-[15px] text-ink-700 editorial-leading">
            目前我们在 <span className="text-ink-900 font-medium">代价量化</span>、
            <span className="text-ink-900 font-medium">反向尸检具体性</span>、
            <span className="text-ink-900 font-medium">类人语感</span> 三个维度还没做到 5/5.
            意味着我们偶尔会写出 "成本较高" 而不是 "约 ¥80 万 / 年" 这种偏抽象的表达,
            偶尔会让 PreMortem 略显套路化, 偶尔语感会有一点 AI 痕迹. 这三件事在每次模型升级 +
            prompt 调整时优先级最高.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 7 项 Inspector check 块
// ============================================================================
function InspectorBlock() {
  const checks = getCheckStats();
  const totalHits = checks.reduce((s, c) => s + c.hits, 0);
  const activeCount = checks.filter((c) => c.mode === 'active').length;

  return (
    <div>
      <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-paper-300">
        <Metric label="Check 数" value={String(checks.length)} suffix="项" />
        <Metric label="Active" value={String(activeCount)} suffix="项" />
        <Metric label="Shadow" value={String(checks.length - activeCount)} suffix="项" />
        <Metric label="历史命中" value={totalHits > 0 ? String(totalHits) : '—'} suffix={totalHits > 0 ? '次' : ''} />
      </div>

      <ol className="space-y-8">
        {checks.map((c) => (
          <li
            key={c.code}
            className="grid grid-cols-[60px_1fr_80px] gap-6 items-baseline border-b border-paper-300 pb-6"
          >
            <span className="font-serif italic text-seal-500 text-xl select-none">{c.code}</span>
            <div>
              <h4 className="font-serif text-lg text-ink-900 tracking-tightish mb-1">
                {c.label}
              </h4>
              <p className="font-serif text-[14px] text-ink-500 editorial-leading mb-2">
                {c.description}
              </p>
              <div className="flex gap-4 text-[10px] font-sans uppercase tracking-[0.2em] text-ink-400">
                <span>严重度: {c.severity}</span>
                <span className={c.mode === 'active' ? 'text-seal-500' : ''}>
                  模式: {c.mode === 'active' ? 'Active' : 'Shadow'}
                </span>
              </div>
            </div>
            <div className="text-right">
              {c.hits > 0 ? (
                <>
                  <span className="font-serif text-2xl tracking-tighter text-amber">{c.hits}</span>
                  <span className="font-serif text-sm text-ink-400 ml-1">次</span>
                </>
              ) : (
                /* B9 · 0 显示 — */
                <span className="font-serif text-2xl text-ink-300 tracking-tighter">—</span>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* B9 · Inspector 列表下方 shadow mode 公示 */}
      <p className="font-serif italic text-[14px] text-ink-500 editorial-leading mt-10 pt-6 border-t border-paper-300">
        Shadow mode · 累计未命中 / 命中均会在此公示.
      </p>
    </div>
  );
}

// ============================================================================
// Brief 总览
// ============================================================================
// B11 阈值: N >= 10 才显示趋势 sparkline.
const TRANSPARENCY_TREND_MIN_N = 10;

function BriefBlock() {
  const s = getBriefStats();
  const latencyTrend = getBriefLatencyTrend(20);
  const charTrend = getBriefCharCountTrend(20);
  const showTrends = s.total >= TRANSPARENCY_TREND_MIN_N;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-y border-paper-300">
        <Metric label="累计生成" value={String(s.total)} suffix="份" />
        <Metric label="平均字数" value={String(s.avgChars)} suffix="字" />
        <Metric label="Editor pass 通过率" value={String(s.editorPassRate)} suffix="%" />
        <Metric label="Analyst 耗时" value={(s.avgAnalystMs / 1000).toFixed(1)} suffix="秒" />
        <Metric label="Editor 耗时" value={(s.avgEditorMs / 1000).toFixed(1)} suffix="秒" />
        <Metric label="平均 tokens" value={s.avgTokens.toLocaleString()} suffix="" />
      </div>

      {/* B11 · N >= 10 才显示 sparkline; 否则显示最近 3 个 flat list */}
      {showTrends ? (
        <div className="mt-10 grid md:grid-cols-2 gap-10 pb-8 border-b border-paper-300">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-3">
              最近 {charTrend.length} 份 · 篇幅趋势
            </p>
            <div className="flex items-baseline gap-4">
              <Sparkline data={charTrend} width={180} height={32} showBaseline ariaLabel="brief 字数趋势" />
              <span className="font-mono text-[11px] text-ink-500">
                {charTrend.length >= 2
                  ? `${charTrend[0]} → ${charTrend[charTrend.length - 1]} 字`
                  : '—'}
              </span>
            </div>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-3">
              最近 {latencyTrend.length} 份 · Analyst 耗时
            </p>
            <div className="flex items-baseline gap-4">
              <Sparkline
                data={latencyTrend}
                width={180}
                height={32}
                showBaseline
                invertSentiment
                ariaLabel="brief analyst 耗时趋势"
              />
              <span className="font-mono text-[11px] text-ink-500">
                {latencyTrend.length >= 2
                  ? `${(latencyTrend[0] / 1000).toFixed(1)}s → ${(latencyTrend[latencyTrend.length - 1] / 1000).toFixed(1)}s`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* B11 · N < 10 · 最近 3 个值 flat list 替代 trends */
        <div className="mt-10 pb-8 border-b border-paper-300">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-3">
            最近 3 份 · 篇幅与耗时
          </p>
          {charTrend.length > 0 ? (
            <ul className="font-mono text-[12px] text-ink-700 space-y-1">
              {charTrend.slice(-3).map((c, i) => {
                const latencyIdx = Math.max(0, latencyTrend.length - 3 + i);
                const latency = latencyTrend[latencyIdx];
                return (
                  <li key={i}>
                    {c} 字 {latency ? `· Analyst ${(latency / 1000).toFixed(1)}s` : ''}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="font-serif italic text-[14px] text-ink-500">
              N = {s.total}. 趋势图在 N &ge; {TRANSPARENCY_TREND_MIN_N} 时显示.
            </p>
          )}
        </div>
      )}

      <p className="mt-8 font-serif text-[14px] text-ink-500 italic editorial-leading">
        数据范围: 自 KEY 决策 brief pipeline (Day 17, 2026-05-12) 上线以来累计.
        邀请期内测中, 样本量小, 不放大. 数据每次有新 brief 生成时实时刷新.
      </p>
    </div>
  );
}

// ============================================================================
// Metric mini 组件 (大数字 + 小标签)
// ============================================================================
function Metric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div>
      <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-ink-400 mb-2">
        {label}
      </p>
      <div className="font-serif text-3xl text-ink-900 tracking-tighter">
        {value}
        {suffix && (
          <span className="font-serif text-sm text-ink-500 ml-1">{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 主页面
// ============================================================================
export default function TransparencyPage() {
  const {
    hero: HERO,
    sectionGrader: SECTION_GRADER,
    sectionInspector: SECTION_INSPECTOR,
    sectionBrief: SECTION_BRIEF,
    sectionNotMeasured: SECTION_NOT_MEASURED,
    sectionHowToQuestion: SECTION_HOW_TO_QUESTION,
    sectionFailVisibly: SECTION_FAIL_VISIBLY,
  } = loadTransparencyContent();
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <TopNav />
      <PageMasthead eyebrow="TRANSPARENCY" volume="公开 · 第一号" right="MMXXVI" />

      {/* HERO */}
      <header className="max-w-prose-lg mx-auto px-6 pt-20 pb-20 border-b border-paper-300">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
          {HERO.eyebrow}
        </p>
        <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter mb-10 leading-[1.1]">
          {HERO.title}
        </h1>
        <div className="space-y-5">
          {HERO.body.map((p, i) => (
            <p
              key={i}
              className="font-serif text-reading text-ink-700 editorial-leading"
              dangerouslySetInnerHTML={{
                __html: p.replace(/\*\*(.+?)\*\*/g, '<strong class="text-ink-900 font-medium">$1</strong>'),
              }}
            />
          ))}
        </div>
      </header>

      {/* I. Grader */}
      <section className="max-w-prose-xl mx-auto px-6 py-24 border-b border-paper-300">
        <SectionHeader
          numeral={SECTION_GRADER.numeral}
          title={SECTION_GRADER.title}
          englishTitle={SECTION_GRADER.englishTitle}
        />
        <div className="space-y-5 mb-12 max-w-prose-lg">
          {SECTION_GRADER.intro.map((p, i) => (
            <p key={i} className="font-serif text-reading text-ink-700 editorial-leading">
              {p}
            </p>
          ))}
        </div>
        <GraderBlock />
      </section>

      {/* II. Inspector */}
      <section className="bg-paper-50 border-b border-paper-300">
        <div className="max-w-prose-xl mx-auto px-6 py-24">
          <SectionHeader
            numeral={SECTION_INSPECTOR.numeral}
            title={SECTION_INSPECTOR.title}
            englishTitle={SECTION_INSPECTOR.englishTitle}
          />
          <div className="space-y-5 mb-12 max-w-prose-lg">
            {SECTION_INSPECTOR.intro.map((p, i) => (
              <p key={i} className="font-serif text-reading text-ink-700 editorial-leading">
                {p}
              </p>
            ))}
          </div>
          <InspectorBlock />
        </div>
      </section>

      {/* III. Brief stats */}
      <section className="max-w-prose-xl mx-auto px-6 py-24 border-b border-paper-300">
        <SectionHeader
          numeral={SECTION_BRIEF.numeral}
          title={SECTION_BRIEF.title}
          englishTitle={SECTION_BRIEF.englishTitle}
        />
        <div className="space-y-5 mb-8 max-w-prose-lg">
          {SECTION_BRIEF.intro.map((p, i) => (
            <p key={i} className="font-serif text-reading text-ink-700 editorial-leading">
              {p}
            </p>
          ))}
        </div>
        <BriefBlock />
      </section>

      {/* IV. Not measured · B10 · 最后一行变 pulled callout */}
      <section className="bg-paper-50 border-b border-paper-300">
        <div className="max-w-prose-lg mx-auto px-6 py-24">
          <SectionHeader
            numeral={SECTION_NOT_MEASURED.numeral}
            title={SECTION_NOT_MEASURED.title}
            englishTitle={SECTION_NOT_MEASURED.englishTitle}
          />
          <div className="space-y-5">
            {SECTION_NOT_MEASURED.body.slice(0, -1).map((p, i) => (
              <p
                key={i}
                className="font-serif text-reading text-ink-700 editorial-leading"
                dangerouslySetInnerHTML={{
                  __html: p.replace(/\*\*(.+?)\*\*/g, '<strong class="text-ink-900 font-medium">$1</strong>'),
                }}
              />
            ))}
          </div>

          {/* B10 callout · 最后一行拉出 · burgundy hairline 上下 + italic 大字 居中 */}
          {SECTION_NOT_MEASURED.body.length > 0 && (
            <div className="mt-14 mb-2 flex flex-col items-center text-center">
              <div className="w-20 h-px bg-seal-500/60 mb-7" />
              <p className="font-serif italic text-[22px] text-ink-900 leading-snug max-w-[28em] whitespace-pre-line">
                {SECTION_NOT_MEASURED.body[SECTION_NOT_MEASURED.body.length - 1]
                  .replace(/\*\*(.+?)\*\*/g, '$1')}
              </p>
              <div className="w-20 h-px bg-seal-500/60 mt-7" />
            </div>
          )}
        </div>
      </section>

      {/* V. How to question us */}
      <section className="max-w-prose-lg mx-auto px-6 py-24 border-b border-paper-300">
        <SectionHeader
          numeral={SECTION_HOW_TO_QUESTION.numeral}
          title={SECTION_HOW_TO_QUESTION.title}
          englishTitle={SECTION_HOW_TO_QUESTION.englishTitle}
        />
        <div className="space-y-5 mb-10">
          {SECTION_HOW_TO_QUESTION.body.map((p, i) => (
            <p key={i} className="font-serif text-reading text-ink-700 editorial-leading">
              {p}
            </p>
          ))}
        </div>
        <ol className="space-y-2 pl-6 border-l-2 border-seal-500/40">
          {SECTION_HOW_TO_QUESTION.steps.map((s, i) => (
            <li
              key={i}
              className="font-serif text-[15px] text-ink-700 editorial-leading flex gap-3"
            >
              <span className="font-serif italic text-seal-500 text-sm w-5 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* VI. Fail visibly */}
      <section className="bg-paper-50">
        <div className="max-w-prose-lg mx-auto px-6 py-24">
          <SectionHeader
            numeral={SECTION_FAIL_VISIBLY.numeral}
            title={SECTION_FAIL_VISIBLY.title}
            englishTitle={SECTION_FAIL_VISIBLY.englishTitle}
          />
          <div className="space-y-5">
            {SECTION_FAIL_VISIBLY.body.map((p, i) => (
              <p key={i} className="font-serif text-reading text-ink-700 editorial-leading">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-12 py-12 border-y border-paper-300 text-center">
            <p className="font-serif italic text-ink-400 text-sm">
              暂无已公示错误.
            </p>
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink-400 mt-3">
              No entries yet.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-paper-300 bg-paper">
        <div className="max-w-prose-xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-6">
            <p className="font-serif text-base text-ink-900">
              KEY Editorial Office · Transparency
            </p>
            <div className="flex gap-6 text-[10px] font-sans uppercase tracking-[0.25em] text-ink-400">
              <Link href="/methodology" className="hover:text-seal-500 transition-colors">方法论</Link>
              <Link href="/sample-brief" className="hover:text-seal-500 transition-colors">样品</Link>
              <Link href="/membership" className="hover:text-seal-500 transition-colors">会员</Link>
              <Link href="/" className="hover:text-seal-500 transition-colors">封面</Link>
            </div>
          </div>
          <p className="mt-6 text-[10px] font-sans uppercase tracking-[0.25em] text-ink-400">
            Fail visibly, not silently · 数据每份新 brief 生成时实时刷新
          </p>
        </div>
      </footer>
    </div>
  );
}

export const metadata = {
  title: 'Transparency · KEY',
  description:
    '内部审计数据公开. 12 维评分 + 7 项 Inspector check + Brief 总览 + 我们暂时没法量化的事. Fail visibly, not silently.',
};
