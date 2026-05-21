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
import MorningMirror from '@/components/MorningMirror';
import WeeklyPatternMirror from '@/components/WeeklyPatternMirror';

interface BrainData {
  stats?: { accountAgeDays?: number; totalCards?: number; totalDecisions?: number };
  openLoops?: Array<{ id: number; title: string }>;
  coreState?: Array<{ id: number; createdAt: number }>;
  factual?: Array<{ id: number; createdAt: number }>;
  episodic?: Array<{ id: number; createdAt: number }>;
}
interface OutcomeRow {
  id: number;
  decisionId: number;
  decisionQuestion: string;
  decisionFramework?: string;
  decisionCreatedAt?: number;
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

  // 5/18 P2 · 加 "今天的 KEY" 闭环可见所需数据
  const [todayPulses, setTodayPulses] = useState<number>(0);
  const [recentPulses, setRecentPulses] = useState<Array<{ tags?: string[]; createdAt: number }>>([]);

  useEffect(() => {
    const uid = getOrCreateClientUid();
    setUserUid(uid);
    Promise.all([
      fetch('/api/brain', { headers: { [UID_HEADER]: uid } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/history', { headers: { [UID_HEADER]: uid } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/outcomes', { headers: { [UID_HEADER]: uid } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/personality', { headers: { [UID_HEADER]: uid } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/onboarding/status', { headers: { [UID_HEADER]: uid } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      // P2 · 拿 pulse 历史 + 今日数算"本周反复" + "今天已写没"
      fetch('/api/pulse?history=1', { headers: { [UID_HEADER]: uid } }).then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([bd, hd, od, pd, ostat, pud]) => {
      setBrain(bd?.memory || null);
      setBriefs(Array.isArray(hd?.briefs) ? hd.briefs.slice(0, 1) : []);
      setOutcomes(Array.isArray(od?.due) ? od.due.slice(0, 3) : []);
      setPersonality(pd?.personality || null);
      setOnboardingDone(ostat?.completed ?? null);
      setTodayPulses(pud?.stats?.todayPulses ?? 0);
      setRecentPulses(Array.isArray(pud?.history) ? pud.history : []);
      setLoading(false);
    });
  }, []);

  const stats = brain?.stats || {};
  const accountAge = stats.accountAgeDays ?? 0;
  const totalCards = stats.totalCards ?? 0;
  const totalDecisions = stats.totalDecisions ?? 0;

  // "本周反复" · 算最近 7 天 pulse 里出现≥2 次的 tag
  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 86400;
  const tagFreq: Record<string, number> = {};
  for (const p of recentPulses) {
    if (p.createdAt < sevenDaysAgo) continue;
    for (const t of (p.tags || [])) tagFreq[t] = (tagFreq[t] || 0) + 1;
  }
  const TAG_CN: Record<string, string> = {
    relationship: '关系', children: '孩子', parents: '父母', career: '职业',
    wealth: '财务', health: '健康', emotion: '情绪', avoidance: '回避',
    'repeating-pattern': '反复模式', 'potential-major-decision': '潜在重大决策',
  };
  const repeatingTags = Object.entries(tagFreq).filter(([_, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([tag, n]) => `${TAG_CN[tag] || tag}×${n}`);

  // "未完的事" · openLoops
  const openLoopsCount = brain?.openLoops?.length ?? 0;

  // "档案上次更新" · 最近 core_state 或 card 的 createdAt
  const lastUpdate = brain
    ? Math.max(
        ...(brain.coreState || []).map((c: any) => c.createdAt || 0),
        ...(brain.factual || []).map((c: any) => c.createdAt || 0),
        ...(brain.episodic || []).map((c: any) => c.createdAt || 0),
        0,
      )
    : 0;
  const lastUpdateStr = lastUpdate > 0
    ? (() => {
        const d = new Date(lastUpdate * 1000);
        return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      })()
    : null;

  // 最近 outcome due 中最早一个
  const nextOutcome = outcomes[0];
  const nextOutcomeDays = nextOutcome
    ? Math.max(0, Math.ceil((nextOutcome.dueAt - Date.now() / 1000) / 86400))
    : null;
  // P6 · 5/18 ship · outcome 真到期了 = 大字 hero card
  // 判定: dueAt <= now (已经到期; getDueOutcomes 已经过滤过)
  const hasDueOutcome = outcomes.length > 0;
  const overdueDays = nextOutcome
    ? Math.floor((Date.now() / 1000 - nextOutcome.dueAt) / 86400)
    : 0;

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <KeyHeader current="home" />

      <main className="max-w-prose-xl mx-auto px-6 pb-24">
        {/* Greeting */}
        <header className="pt-10 pb-8">
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

        {/* 早镜面 · 5/20 ship · C1 · "你 X 天前写过 Y · 顺手问你 Z" */}
        {/* 静默失败原则: 没合格 pulse / 已显示过今天 / LLM 失败 → 不显示 */}
        <MorningMirror />

        {/* 周末关联 · 5/20 ship · C2 · 仅周六/周日 · 本周 ≥3 pulse + 真重复 pattern */}
        <WeeklyPatternMirror />

        {/* P6 · 5/18 ship · outcome 该回访了 = 第 1 优先级大字 hero card */}
        {!loading && hasDueOutcome && nextOutcome && (
          <section className="mb-12 border-2 border-seal-500 bg-paper-50 px-8 py-8">
            <div className="flex items-baseline justify-between mb-4">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500">
                · 该回访了 · {nextOutcome.checkpointDays} 天回访 ·
              </p>
              {overdueDays > 0 && (
                <p className="font-mono text-[11px] text-ember">
                  · 已逾期 {overdueDays} 天 ·
                </p>
              )}
            </div>
            <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-4">
              {nextOutcome.checkpointDays} 天前你问过 KEY:
            </h2>
            <p className="font-serif italic text-reading text-ink-700 leading-relaxed mb-6 border-l-2 border-seal-500/40 pl-5">
              &ldquo;{nextOutcome.decisionQuestion?.slice(0, 200)}&rdquo;
              {nextOutcome.decisionQuestion && nextOutcome.decisionQuestion.length > 200 && '…'}
            </p>
            <p className="font-serif text-reading text-ink-700 mb-6 leading-relaxed">
              这就是 KEY 跟其他 AI 真正不同的地方 —
              {nextOutcome.checkpointDays === 30 ? ' 1 个月前你担心的事, 现在真发生了吗?' : nextOutcome.checkpointDays === 90 ? ' 3 个月前的选择, 走到这里你怎么看?' : ' 1 年前的判断, 现在能比对真实结果了.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-baseline">
              <Link
                href="/outcomes"
                className="px-8 py-3 font-serif text-base text-paper bg-ink-900 hover:bg-seal-500 transition-colors inline-block"
              >
                现在回答 →
              </Link>
              {outcomes.length > 1 && (
                <p className="font-serif italic text-[13px] text-ink-500">
                  · 还有 {outcomes.length - 1} 件待回访
                </p>
              )}
            </div>
          </section>
        )}

        {/* 今天的 KEY · 5/18 P2 ship · 闭环可见 · 这是用户进 KEY 第一眼 */}
        {!loading && (
          <section className="mb-12 border-y border-paper-300 py-8">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
              · 今天的 KEY ·
            </p>
            <dl className="space-y-3 font-serif text-reading text-ink-700">
              {/* 1. 未完的事 */}
              {openLoopsCount > 0 ? (
                <div className="flex justify-between items-baseline gap-4">
                  <dt className="text-ink-500 italic">· 未完的事</dt>
                  <dd>
                    <Link href="/brain" className="text-ink-900 hover:text-seal-500 transition-colors">
                      {openLoopsCount} 件 →
                    </Link>
                  </dd>
                </div>
              ) : null}

              {/* 2. 即将回访 · 仅当无 due (那种已是顶部 hero) 时显示 */}
              {/* 注: 当前 /api/outcomes 只返回 due (已到期), 未来 outcomes 暂没 surface */}
              {/*    P6 hero 已覆盖 due 场景 · 这条目前 always 隐藏, 留位等 future outcomes 接入 */}

              {/* 3. 本周反复 */}
              {repeatingTags.length > 0 && (
                <div className="flex justify-between items-baseline gap-4">
                  <dt className="text-ink-500 italic">· 本周反复</dt>
                  <dd className="font-mono text-[13px] text-ink-700">
                    {repeatingTags.join(' · ')}
                  </dd>
                </div>
              )}

              {/* 4. 档案上次更新 */}
              {lastUpdateStr && (
                <div className="flex justify-between items-baseline gap-4">
                  <dt className="text-ink-500 italic">· 档案更新</dt>
                  <dd>
                    <Link href="/brain" className="text-ink-900 hover:text-seal-500 transition-colors font-mono text-[13px]">
                      {lastUpdateStr} →
                    </Link>
                  </dd>
                </div>
              )}

              {/* 5. 今天入口 */}
              <div className="flex justify-between items-baseline gap-4 pt-3 mt-3 border-t border-paper-300">
                <dt className="text-ink-500 italic">· 今天</dt>
                <dd>
                  {todayPulses > 0 ? (
                    <span className="text-ink-700 font-mono text-[13px]">
                      已写 {todayPulses} 条今日一句 · <Link href="/pulse" className="text-seal-500 hover:underline">继续 →</Link>
                    </span>
                  ) : (
                    <Link href="/pulse" className="text-seal-500 font-serif hover:underline">
                      还没写今日一句 → 现在写
                    </Link>
                  )}
                </dd>
              </div>
            </dl>

            {/* 全空状态 · 新用户提示 */}
            {openLoopsCount === 0 && !nextOutcome && repeatingTags.length === 0 && !lastUpdateStr && (
              <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
                你的档案还很新. 跟 KEY 多聊几次 — 它会自动从你的话里抽事实, 这一栏就有内容了.
              </p>
            )}
          </section>
        )}

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
              今日一句 →
            </h2>
            <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
              30 秒写一句今天的状态. 累计成 KEY 越来越懂你的素材.
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
              你的档案 →
            </h2>
            <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed">
              KEY 记得的事实 / 关系 / 反复 pattern. 决策简报的证据来源. 不准就改.
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
