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
import Link from 'next/link';
import type { DecisionBrief } from '@/lib/decision/brief-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FRAMEWORK_LABEL: Record<string, string> = {
  'parent-care': '父母养老',
  marriage: '婚姻',
  'child-education': '子女教育',
  'career-transition': '职业转身',
  migration: '迁移',
  'crisis-restart': '危机重启',
  general: '通用决策',
};

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

  const briefs: Array<{ id: number; framework: string; topic: string; brief: DecisionBrief }> =
    rows.map((r) => ({
      id: r.id,
      framework: r.framework,
      topic: r.topic,
      brief: JSON.parse(r.brief_json),
    }));

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
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tightish text-ink-900 hover:text-seal-500 transition-colors"
        >
          LifeOS
        </Link>
        <Link
          href="/"
          className="text-[11px] font-sans uppercase tracking-[0.2em] text-ink-500 hover:text-seal-500 transition-colors"
        >
          ← Home
        </Link>
      </nav>

      {/* ============================================ */}
      {/* 编辑部说明                                       */}
      {/* ============================================ */}
      <header className="max-w-prose-lg mx-auto px-6 pt-16 pb-16 border-b border-paper-300">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
          · LifeOS Editorial Office · Sample Briefs ·
        </p>
        <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter mb-8">
          我们交付的东西, 长这样.
        </h1>
        <div className="font-serif text-reading text-ink-700 editorial-leading max-w-prose-lg space-y-4">
          <p>
            下面是 LifeOS 为三位匿名读者撰写的私人决策简报. 内容经本人同意公开,
            姓名 / 城市 / 关键身份信息已做隐去处理.
          </p>
          <p>
            这不是 chatbot 的回答, 不是 markdown 流, 也不是 AI 工具的常规输出. 这是一份**经过两轮撰稿**
            (分析师 + 资深编辑) 产出的 2000-3500 字结构化简报, 像被写出来的, 不是被生成出来的.
          </p>
          <p className="text-ink-500 italic">
            读完任一份, 你就会知道为什么我们坚持以年订阅, 而不是以工具论分钟收费.
          </p>
        </div>
      </header>

      {/* ============================================ */}
      {/* Brief 切换器                                     */}
      {/* ============================================ */}
      <section className="max-w-prose-xl mx-auto px-6 mt-12">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-500 mb-4">
          · 三份简报 · 三类决策 ·
        </p>
        <div className="flex flex-col md:flex-row gap-3 mb-12">
          {briefs.map((b) => {
            const isActive = b.id === selected.id;
            return (
              <Link
                key={b.id}
                href={`/sample-brief?id=${b.id}`}
                className={`flex-1 border ${
                  isActive
                    ? 'border-seal-500 bg-seal-50/30'
                    : 'border-paper-300 hover:border-ink-400'
                } px-5 py-4 transition-colors group`}
              >
                <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-seal-500 mb-2">
                  {FRAMEWORK_LABEL[b.framework] || b.framework}
                </p>
                <p
                  className={`font-serif text-base ${
                    isActive ? 'text-ink-900' : 'text-ink-700 group-hover:text-ink-900'
                  } leading-snug`}
                >
                  {b.topic}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============================================ */}
      {/* 当前 brief 渲染                                  */}
      {/* ============================================ */}
      <main className="max-w-prose-xl mx-auto px-6 pb-32 pt-8">
        <BriefRenderer brief={selected.brief} showSeal={true} />
      </main>

      {/* ============================================ */}
      {/* 底部 CTA — 不是 SaaS 风格                         */}
      {/* ============================================ */}
      <footer className="border-t border-paper-300 bg-paper-50">
        <div className="max-w-prose-lg mx-auto px-6 py-20 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · 进入 LifeOS 编辑部 ·
          </p>
          <h2 className="font-serif text-editorial text-ink-900 mb-6 tracking-tightish">
            你的下一个重大决定, <br />
            也可以被这样认真对待.
          </h2>
          <p className="font-serif text-reading text-ink-500 editorial-leading mb-10 max-w-prose-lg mx-auto">
            年度会员 ¥1988. 创始会员 (限 100 名) ¥4988/3 年. 第一周不合适, 全退.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/onboarding"
              className="font-serif text-base text-ink-900 border-b-2 border-seal-500 pb-1 hover:text-seal-500 transition-colors"
            >
              开始第一次咨询 →
            </Link>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline">
              ·
            </span>
            <Link
              href="/methodology"
              className="font-serif text-base text-ink-700 hover:text-seal-500 transition-colors"
            >
              先看方法论
            </Link>
          </div>
        </div>

        <div className="border-t border-paper-300">
          <div className="max-w-prose-xl mx-auto px-6 py-8 text-[10px] font-sans uppercase tracking-[0.3em] text-ink-400 text-center">
            LifeOS Editorial Office · 中国第一份 AI-Native 决策顾问刊物
          </div>
        </div>
      </footer>
    </div>
  );
}
