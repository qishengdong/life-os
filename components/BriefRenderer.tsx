/**
 * BriefRenderer — publication-grade 决策简报渲染组件
 *
 * 设计哲学:
 *   - 像一份私人简报, 不像 web app 输出
 *   - 出版物式排版: 罗马数字小节 / drop cap / 印章 / 暖白纸感
 *   - 思源宋体 + 大留白 + 暗红 accent
 *   - 一切克制, 没有装饰, 没有 SaaS pattern
 *
 * 用在:
 *   - /sample-brief 公开页 (3 份样品)
 *   - /decision/[number] 用户私人简报详情
 *   - 未来打印 / 导出 PDF
 */

'use client';

import type { DecisionBrief } from '@/lib/decision/brief-schema';

interface BriefRendererProps {
  brief: DecisionBrief;
  /** 是否显示 LifeOS 印章 (公开 sample 显示, 用户私人不显示) */
  showSeal?: boolean;
  /** 极简模式: 隐藏 footer 等元数据, 适合打印 */
  printMode?: boolean;
}

// 中文罗马数字 — 用于章节标记 (出版物传统)
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

function formatDate(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

// ============================================================================
// 章节头 — 罗马数字 + 标题, 出版物式
// ============================================================================
function SectionHeader({ index, title }: { index: number; title: string }) {
  return (
    <div className="mb-8 mt-16 first:mt-0">
      <div className="flex items-baseline gap-5">
        <span className="font-serif italic text-seal-500 text-2xl tracking-widest select-none">
          {ROMAN[index]}.
        </span>
        <h2 className="font-serif text-editorial text-ink-900 tracking-tightish">
          {title}
        </h2>
      </div>
      <div className="mt-3 h-px w-16 bg-seal-500/60" />
    </div>
  );
}

// ============================================================================
// 正文段落 — 阅读体, 第一段可选 drop cap
// ============================================================================
function Paragraph({ text, dropCap = false }: { text: string; dropCap?: boolean }) {
  if (!text) return null;

  if (dropCap && text.length > 0) {
    const first = text.charAt(0);
    const rest = text.slice(1);
    return (
      <p className="font-serif text-reading text-ink-700 mb-5 editorial-leading">
        <span className="float-left text-7xl font-serif text-ink-900 leading-[0.85] mr-3 mt-1 select-none">
          {first}
        </span>
        {rest}
      </p>
    );
  }

  return (
    <p className="font-serif text-reading text-ink-700 mb-5 editorial-leading whitespace-pre-line">
      {text}
    </p>
  );
}

// ============================================================================
// 主组件
// ============================================================================
export default function BriefRenderer({
  brief,
  showSeal = false,
  printMode = false,
}: BriefRendererProps) {
  const s = brief.sections;

  return (
    <article className="bg-paper text-ink-900 antialiased relative">
      {/* ============================================ */}
      {/* 页眉: brief 元信息                              */}
      {/* ============================================ */}
      <header className="mb-16 border-b border-paper-300 pb-8">
        <div className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-2">
          {brief.briefNumber}  ·  {formatDate(brief.authoredAt)}
        </div>
        <h1 className="font-serif text-editorial-xl text-ink-900 mt-4 tracking-tighter">
          {brief.topic}
        </h1>
        <div className="mt-6 flex items-baseline gap-3 text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500">
          <span>撰稿  ·  {brief.authoredBy}</span>
          <span className="text-ink-400">/</span>
          <span>致  ·  {brief.authoredFor}</span>
          {brief.meta.editorPassUsed && (
            <>
              <span className="text-ink-400">/</span>
              <span className="text-seal-500">Editor Pass</span>
            </>
          )}
        </div>
      </header>

      {/* ============================================ */}
      {/* I. 封面摘要 (带 drop cap)                       */}
      {/* ============================================ */}
      <section>
        <SectionHeader index={0} title="封面摘要" />
        <Paragraph text={s.summary} dropCap />
        <div className="clear-both" />
      </section>

      {/* II. 背景 */}
      <section>
        <SectionHeader index={1} title="背景" />
        <Paragraph text={s.background} />
      </section>

      {/* III. 当前张力 */}
      <section>
        <SectionHeader index={2} title="当前张力" />
        <Paragraph text={s.currentTension} />
      </section>

      {/* IV. 关键利益相关者 */}
      <section>
        <SectionHeader index={3} title="关键利益相关者" />
        <Paragraph text={s.stakeholders} />
      </section>

      {/* V. 不可逆风险地图 */}
      <section>
        <SectionHeader index={4} title="不可逆风险地图" />
        <Paragraph text={s.irreversibleRisks} />
      </section>

      {/* ============================================ */}
      {/* VI. 三条路径 — 特殊版式                          */}
      {/* ============================================ */}
      <section>
        <SectionHeader index={5} title="三条路径" />
        <div className="space-y-12">
          {s.threePaths.map((p, i) => (
            <div key={i} className="border-l-2 border-paper-300 pl-6 hover:border-seal-500/60 transition-colors duration-500">
              <div className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-2">
                路径 {['A', 'B', 'C'][i]}
              </div>
              <h3 className="font-serif text-2xl text-ink-900 mb-5 tracking-tightish">
                {p.name}
              </h3>

              <div className="mb-4">
                <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-seal-500 mb-2">
                  五年后图景
                </div>
                <p className="font-serif text-reading text-ink-700 editorial-leading whitespace-pre-line">
                  {p.fiveYearScene}
                </p>
              </div>

              <div className="mb-4">
                <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-seal-500 mb-2">
                  主要代价
                </div>
                <p className="font-serif text-reading text-ink-700 editorial-leading whitespace-pre-line">
                  {p.primaryCost}
                </p>
              </div>

              <div>
                <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-seal-500 mb-2">
                  谁受益, 谁受损
                </div>
                <p className="font-serif text-reading text-ink-700 editorial-leading whitespace-pre-line">
                  {p.whoBenefitsWhoLoses}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VII. 反向尸检 */}
      <section>
        <SectionHeader index={6} title="反向尸检" />
        <Paragraph text={s.preMortem} />
      </section>

      {/* ============================================ */}
      {/* VIII. 核心拷问 — 特殊版式 (有重量感)               */}
      {/* ============================================ */}
      <section>
        <SectionHeader index={7} title="核心拷问" />
        <div className="space-y-8 my-4">
          {s.crackingQuestions.map((q, i) => (
            <blockquote
              key={i}
              className="font-serif text-2xl text-ink-900 leading-relaxed italic border-l-4 border-seal-500 pl-6 py-2"
            >
              {q}
            </blockquote>
          ))}
        </div>
      </section>

      {/* IX. 最小下一步 */}
      <section>
        <SectionHeader index={8} title="最小下一步" />
        <Paragraph text={s.minimumNextStep} />
      </section>

      {/* ============================================ */}
      {/* 附录 A · 引用记忆                                */}
      {/* ============================================ */}
      <section className="mt-24 pt-8 border-t border-paper-300">
        <div className="font-sans text-[11px] uppercase tracking-[0.3em] text-ink-500 mb-2">
          附录 A
        </div>
        <h2 className="font-serif text-2xl text-ink-900 mb-8 tracking-tightish">
          引用记忆
        </h2>
        <ol className="space-y-6">
          {brief.appendix.memoryReferences.map((m, i) => (
            <li key={i} className="font-serif text-[15px] text-ink-700 editorial-leading">
              <span className="font-sans text-[10px] text-ink-400 mr-3">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-seal-500 italic">{m.attribution}</span>
              <span className="text-ink-400"> — </span>
              <span>"{m.excerpt}"</span>
              <div className="mt-1 ml-8 text-[13px] text-ink-500 italic">
                与本简报相关: {m.relevance}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ============================================ */}
      {/* 附录 B · 回访锚点                                */}
      {/* ============================================ */}
      <section className="mt-16">
        <div className="font-sans text-[11px] uppercase tracking-[0.3em] text-ink-500 mb-2">
          附录 B
        </div>
        <h2 className="font-serif text-2xl text-ink-900 mb-8 tracking-tightish">
          回访锚点
        </h2>
        <div className="space-y-8">
          {brief.appendix.outcomeAnchors.map((a) => (
            <div key={a.days} className="grid grid-cols-[80px_1fr] gap-6">
              <div className="font-serif text-3xl text-seal-500 italic select-none">
                {a.days}
                <div className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-400 mt-1">
                  天后
                </div>
              </div>
              <div className="font-serif text-reading text-ink-700 editorial-leading">
                <p className="text-ink-900 mb-3">{a.question}</p>
                <p className="text-[14px] text-sage mb-1">
                  <span className="font-sans uppercase tracking-wider text-[10px] mr-2">应验</span>
                  {a.successSignal}
                </p>
                <p className="text-[14px] text-ember">
                  <span className="font-sans uppercase tracking-wider text-[10px] mr-2">塌方</span>
                  {a.failureSignal}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* 落款 + 印章 + AI 声明                            */}
      {/* ============================================ */}
      {!printMode && (
        <footer className="mt-24 pt-12 border-t border-paper-300 relative">
          {showSeal && (
            <div className="absolute right-0 top-12">
              <div className="w-20 h-20 rounded-full border-2 border-seal-500 flex flex-col items-center justify-center text-seal-500 transform rotate-[-8deg] opacity-90">
                <div className="font-serif text-[10px] uppercase tracking-[0.2em]">LifeOS</div>
                <div className="font-sans text-[9px] mt-0.5">
                  {brief.briefNumber.split('-').pop()}
                </div>
                <div className="font-serif text-[8px] mt-0.5 italic">Editorial</div>
              </div>
            </div>
          )}
          <div className="max-w-xl">
            <p className="font-serif text-[13px] text-ink-500 italic editorial-leading">
              {brief.meta.aiDisclosure}
            </p>
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mt-4">
              LifeOS Editorial Office · {brief.briefNumber}
            </p>
            {brief.meta.totalCharCount > 0 && (
              <p className="font-sans text-[10px] text-ink-400 mt-2">
                {brief.meta.totalCharCount} 字  ·  {brief.meta.framework}  ·  Editor pass:{' '}
                {brief.meta.editorPassUsed ? 'yes' : 'analyst only'}
              </p>
            )}
          </div>
        </footer>
      )}
    </article>
  );
}
