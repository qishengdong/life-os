/**
 * /home · 老用户客厅 dashboard · 5/18 ship
 *
 * 解决: 现在 nav 6 个链接堆头上 + 老用户登录看不到 "自己的页面"
 *
 * 内容 (按价值 → 频次):
 *   1. greeting (1 行 · 第 N 天 / X 张记忆卡 / Y 份决策)
 *   2. 4 主动作卡 (写决定 / Pulse / Brain / 不寄的信)
 *   3. 最近 1 份决策简报 (link to /decisions/[number])
 *   4. 待回访 outcome (30/90/365d callback)
 *   5. 决策画像 teaser (1 行 · click 进 /your-pattern)
 *   6. 完整建档入口 (如果 onboarding 没完成)
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import KeyHeader from '@/components/KeyHeader';

interface BrainData {
  stats?: { accountAgeDays?: number; totalCards?: number; totalDecisions?: number };
}
interface OutcomeRow {
  id: number;
  decisionId: number;
  decisionQuestion: string;
  checkpointDays: number;
  dueAt: number;
}
interface BriefRow {
  briefNumber: string;
  topic: string;
  framework: string;
  authoredAt: number;
}
interface Personality {
  type: string;
  headline: string;
}

const TYPE_NAME: Record<string, string> = {
  foundation: '奠基者',
  cartographer: '制图者',
  connector: '织网者',
  adaptor: '应变者',
  contrarian: '逆行者',
  integrator: '整合者',
};

export default function HomePage() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [brain, setBrain] = useState<BrainData | null>(null);
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeRow[]>([]);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getOrCreateClientUid();
    setUserUid(uid);
    Promise.all([
      fetch('/api/brain', { headers: { [UID_HEADER]: uid } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/history', { headers: { [UID_HEADER]: uid } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/outcomes', { headers: { [UID_HEADER]: uid } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/personality', { headers: { [UID_HEADER]: uid } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/onboarding/status', { headers: { [UID_HEADER]: uid } }).then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([bd, hd, od, pd, ostat]) => {
      setBrain(bd?.memory || null);
      setBriefs(Array.isArray(hd?.briefs) ? hd.briefs.slice(0, 1) : []);
      setOutcomes(Array.isArray(od?.due) ? od.due.slice(0, 3) : []);
      setPersonality(pd?.personality || null);
      setOnboardingDone(ostat?.completed ?? null);
      setLoading(false);
    });
  }, []);

  const stats = brain?.stats || {};
  const accountAge = stats.accountAgeDays ?? 0;
  const totalCards = stats.totalCards ?? 0;
  const totalDecisions = stats.totalDecisions ?? 0;

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <KeyHeader current="home" />

      <main className="max-w-prose-xl mx-auto px-6 pb-24">
        {/* Greeting */}
        <header className="pt-10 pb-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4">
            · 你的 KEY · 第 {accountAge} 天 ·
          </p>
          <h1 className="font-serif text-editorial-lg text-ink-900 tracking-tightish leading-tight mb-3">
            欢迎回来.
          </h1>
          <p className="font-serif italic text-reading text-ink-500">
            {totalCards > 0 || totalDecisions > 0
              ? `KEY 记得你的 ${totalCards} 张事实 · 帮你完成过 ${totalDecisions} 份决策简报.`
              : '今天开始第一件 — 写下你最近最难的决定.'}
          </p>
        </header>

        {/* 提醒区 · onboarding 未完成 / 待回访 outcome */}
        {(onboardingDone === false || outcomes.length > 0) && (
          <section className="mb-12 space-y-3">
            {onboardingDone === false && (
              <div className="border-l-2 border-ember bg-paper-50 px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ember mb-1">未完成</p>
                  <p className="font-serif text-reading text-ink-700">
                    你的 6 步建档还没完成 · KEY 对你的了解还很浅, 决策质量会受影响.
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="px-5 py-2 font-serif text-sm text-paper bg-ink-900 hover:bg-seal-500 transition-colors whitespace-nowrap"
                >
                  继续建档 →
                </Link>
              </div>
            )}
            {outcomes.map((o) => (
              <div key={o.id} className="border-l-2 border-seal-500 bg-paper-50 px-6 py-4">
                <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-seal-500 mb-1">
                  {o.checkpointDays} 天回访
                </p>
                <p className="font-serif text-reading text-ink-700 mb-2">
                  你之前问过: &ldquo;{o.decisionQuestion?.slice(0, 60)}&hellip;&rdquo;
                </p>
                <Link
                  href={`/outcomes`}
                  className="font-serif text-sm text-seal-500 hover:underline"
                >
                  现在回答 →
                </Link>
              </div>
            ))}
          </section>
        )}

        {/* 4 主动作卡 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Link
            href="/decisions/new"
            className="group block border-2 border-ink-900 hover:bg-ink-900 hover:text-paper transition-colors p-6"
          >
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 group-hover:text-paper mb-3">
              · 1. 主入口 ·
            </p>
            <h2 className="font-serif text-xl text-ink-900 group-hover:text-paper tracking-tightish mb-2">
              写一个决定 →
            </h2>
            <p className="font-serif italic text-[13px] text-ink-500 group-hover:text-paper/70 leading-relaxed">
              25-45 秒, KEY 产出一份 2000-3500 字 publication-grade 简报.
            </p>
          </Link>

          <Link
            href="/pulse"
            className="group block border border-paper-300 hover:border-seal-500 transition-colors p-6"
          >
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-3">
              · 2. 每日 ·
            </p>
            <h2 className="font-serif text-xl text-ink-900 group-hover:text-seal-500 tracking-tightish mb-2">
              今日 Pulse →
            </h2>
            <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
              30 秒一句话写今天的状态. 累计成 brain.
            </p>
          </Link>

          <Link
            href="/brain"
            className="group block border border-paper-300 hover:border-seal-500 transition-colors p-6"
          >
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-3">
              · 3. 你的档案 ·
            </p>
            <h2 className="font-serif text-xl text-ink-900 group-hover:text-seal-500 tracking-tightish mb-2">
              看 KEY 记得我什么 →
            </h2>
            <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
              你的事实卡 / 关系 / 反复 pattern. 不准就改.
            </p>
          </Link>

          <Link
            href="/unsent"
            className="group block border border-paper-300 hover:border-seal-500 transition-colors p-6"
          >
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-3">
              · 4. 不寄的信 ·
            </p>
            <h2 className="font-serif text-xl text-ink-900 group-hover:text-seal-500 tracking-tightish mb-2">
              写一封不寄的信 →
            </h2>
            <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
              给妈妈 / 老板 / 过去的自己. 写出来不发, 7 天后 KEY 回访.
            </p>
          </Link>
        </section>

        {/* 决策画像 teaser */}
        {personality && (
          <section className="border-y border-paper-300 py-8 mb-12">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3 text-center">
              · 你的决策型 ·
            </p>
            <p className="font-serif text-2xl text-ink-900 tracking-tightish text-center mb-3">
              {TYPE_NAME[personality.type] || personality.type}
            </p>
            <p className="font-serif italic text-[14px] text-ink-500 text-center max-w-prose-md mx-auto leading-relaxed mb-4">
              {personality.headline}
            </p>
            <div className="text-center">
              <Link href="/your-pattern" className="font-serif text-[13px] text-seal-500 hover:underline">
                看完整画像 + 进化方向 →
              </Link>
            </div>
          </section>
        )}

        {/* 最近 1 份决策 */}
        {briefs.length > 0 && (
          <section className="mb-12">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-4">
              · 最近 ·
            </p>
            {briefs.map((b) => (
              <Link
                key={b.briefNumber}
                href={`/decisions/${b.briefNumber}`}
                className="block border border-paper-200 hover:border-seal-500 transition-colors p-6"
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-2">
                  {b.framework} · {new Date(b.authoredAt * 1000).toLocaleDateString('zh-CN')}
                </p>
                <p className="font-serif text-lg text-ink-900 leading-tight mb-2">{b.topic}</p>
                <p className="font-serif italic text-[13px] text-seal-500">
                  打开简报 →
                </p>
              </Link>
            ))}
            <p className="font-mono text-[10px] text-ink-400 mt-3 text-right">
              <Link href="/history" className="hover:text-seal-500">全部历史 →</Link>
            </p>
          </section>
        )}

        {/* Footer · meta */}
        <footer className="border-t border-paper-300 pt-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
            keypoint.life · 你的所有数据存在 Turso, 不进任何训练数据 · <Link href="/settings" className="hover:text-seal-500">隐私 / 导出 / 删账户</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
