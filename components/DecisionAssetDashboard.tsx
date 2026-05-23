/**
 * DecisionAssetDashboard · 决策资产仪表盘 · 5/22 ship · P2.4
 *
 * 4 维成长可见度 (来自 /api/decision-asset):
 *   L1 · 事实量 (Fact Volume)
 *   L2 · 模式深度 (Pattern Depth)
 *   L3 · 预测准确度 (Prediction Calibration)
 *   L4 · 元认知成熟度 (Metacognitive Maturity)
 *
 * 设计铁律:
 *   - 静默优雅 · 不 gamification (没 streak/badge/排名)
 *   - 数据 100% 来自真档案 (没编造)
 *   - 没数据 → 老实说"还没累积" (不假装)
 *   - 高知用户审美 · 像私人图书馆目录, 不像 fitness app
 *
 * 嵌入 /your-pattern 顶部 (画像之上, 让用户先看资产增长)
 */
'use client';

import { useEffect, useState } from 'react';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';

interface RecurringTag {
  tag: string;
  count: number;
  firstSeenAt: number;
  lastSeenAt: number;
}

interface AssetData {
  layer1: {
    totalPulses: number;
    totalBriefs: number;
    totalOutcomesAnswered: number;
    accountAgeDays: number;
    firstPulseAt: number | null;
  };
  layer2: {
    recurringPatterns: RecurringTag[];
    distinctTagsCount: number;
  };
  layer3: {
    completedReviews: number;
    pendingReviews: number;
    earliestPredictionAt: number | null;
  };
  layer4: {
    mirrorsResponded: number;
    patternsResponded: number;
    totalEngagement: number;
  };
}

const TAG_DISPLAY: Record<string, string> = {
  worry: '担忧',
  boundary: '边界',
  desire: '渴望',
  recurring: '反复',
  breakthrough: '突破',
  fact_about_me: '关于我',
  fact_about_other: '关于他人',
  decision_signal: '决策信号',
  emotion: '情绪',
  body: '身体',
  value: '价值',
  resistance: '抵抗',
  reframe: '重看',
};

function formatTagLabel(tag: string): string {
  return TAG_DISPLAY[tag] || tag;
}

function formatDateShort(timestamp: number | null): string {
  if (!timestamp) return '—';
  const d = new Date(timestamp * 1000);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function daysBetween(t1: number, t2: number): number {
  return Math.max(0, Math.floor(Math.abs(t1 - t2) / 86400));
}

export default function DecisionAssetDashboard() {
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getOrCreateClientUid();
    fetch('/api/decision-asset', { headers: { [UID_HEADER]: uid } })
      .then((r) => r.json())
      .then((data) => {
        if (data?.asset) setAsset(data.asset);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mb-12 pt-8">
        <p className="font-serif italic text-[14px] text-ink-400 text-center">加载你的决策资产...</p>
      </section>
    );
  }

  if (!asset) return null;

  const { layer1, layer2, layer3, layer4 } = asset;
  const hasData = layer1.totalPulses > 0;

  // 全 0 用户 · 老实展示"还没累积"
  if (!hasData) {
    return (
      <section className="mb-12 pt-8 border-b border-paper-300 pb-12">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4 text-center">
          · 你的决策资产 ·
        </p>
        <p className="font-serif italic text-reading text-ink-500 leading-relaxed text-center max-w-prose-md mx-auto">
          你还没开始写真信号. 决策资产从 Layer 1 (事实) 开始累积 — 写第 1 条真信号, 这页就开始有内容.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-16 pt-8 border-b border-paper-300 pb-16">
      <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-4 text-center">
        · 你的决策资产 · 4 维成长可见度 ·
      </p>
      <h2 className="font-serif text-editorial text-ink-900 tracking-tightish leading-tight mb-3 text-center">
        累计 {layer1.accountAgeDays} 天 · 3 层资产同步增长.
      </h2>
      <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed text-center max-w-prose-md mx-auto mb-12">
        全部来自你自己的真档案 · KEY 不评判, 不解读, 不下结论. 你看到的是事实的累积形态.
      </p>

      {/* ============================================================ */}
      {/* L1 · 事实量                                                  */}
      {/* ============================================================ */}
      <div className="mb-10">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
          · Layer 1 · 事实量 (Fact Volume) ·
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
          <div>
            <p className="font-serif text-3xl text-ink-900 tracking-tighter mb-1">{layer1.totalPulses}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">真信号</p>
          </div>
          <div>
            <p className="font-serif text-3xl text-ink-900 tracking-tighter mb-1">{layer1.totalBriefs}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">决策简报</p>
          </div>
          <div>
            <p className="font-serif text-3xl text-ink-900 tracking-tighter mb-1">{layer1.totalOutcomesAnswered}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">已复盘</p>
          </div>
          <div>
            <p className="font-serif text-3xl text-ink-900 tracking-tighter mb-1">{layer1.accountAgeDays}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">累计天</p>
          </div>
        </div>
        <p className="font-serif italic text-[12px] text-ink-500">
          {layer1.firstPulseAt
            ? `第 1 条真信号写于 ${formatDateShort(layer1.firstPulseAt)} · 一字未改, 永远是事实.`
            : '事实档案是 verbatim 的, 任何人 (包括你自己) 都不能改写.'}
        </p>
      </div>

      {/* ============================================================ */}
      {/* L2 · 模式深度                                                */}
      {/* ============================================================ */}
      <div className="mb-10 border-t border-paper-300 pt-10">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
          · Layer 2 · 模式深度 (Pattern Depth) ·
        </p>
        {layer2.recurringPatterns.length === 0 ? (
          <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
            还没出现反复模式 (需要同一类信号写 ≥ 3 次才算). 继续写 — 模式会自然显形.
          </p>
        ) : (
          <>
            <p className="font-serif text-[14px] text-ink-700 leading-relaxed mb-4">
              你的真话累积出 <strong>{layer2.recurringPatterns.length}</strong> 类反复模式 ·
              覆盖 <strong>{layer2.distinctTagsCount}</strong> 种信号类型:
            </p>
            <ul className="space-y-3 mb-4">
              {layer2.recurringPatterns.map((p) => (
                <li key={p.tag} className="flex items-baseline gap-4 border-l-2 border-seal-500/30 pl-4">
                  <span className="font-serif text-lg text-ink-900 tracking-tightish min-w-[100px]">
                    {formatTagLabel(p.tag)}
                  </span>
                  <span className="font-mono text-[12px] text-seal-500">
                    × {p.count}
                  </span>
                  <span className="font-serif italic text-[12px] text-ink-500">
                    跨 {daysBetween(p.firstSeenAt, p.lastSeenAt)} 天 ·
                    {formatDateShort(p.firstSeenAt)} → {formatDateShort(p.lastSeenAt)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="font-serif italic text-[12px] text-ink-500">
              KEY 不解读这些模式. 你自己看 — 哪些是你已经知道的, 哪些是你没想到的?
            </p>
          </>
        )}
      </div>

      {/* ============================================================ */}
      {/* L3 · 预测准确度                                              */}
      {/* ============================================================ */}
      <div className="mb-10 border-t border-paper-300 pt-10">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
          · Layer 3 · 预测准确度 (Prediction Calibration) ·
        </p>
        {layer3.completedReviews === 0 && layer3.pendingReviews === 0 ? (
          <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
            还没到 30/90/365 天复盘点. 写过决策简报后, KEY 会自动安排回访 — 那时这一维才有数据.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-serif text-3xl text-ink-900 tracking-tighter mb-1">{layer3.completedReviews}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">已完成复盘</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-seal-500 tracking-tighter mb-1">{layer3.pendingReviews}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">待回访</p>
              </div>
            </div>
            <p className="font-serif italic text-[12px] text-ink-500">
              {layer3.pendingReviews > 0
                ? `你有 ${layer3.pendingReviews} 件回访已到期 · 真复盘是 KEY 跟其他 AI 真正的区别.`
                : '回访结果存进你的"判断力档案" · 随时间累积出你的预测校准曲线.'}
            </p>
          </>
        )}
      </div>

      {/* ============================================================ */}
      {/* L4 · 元认知成熟度                                            */}
      {/* ============================================================ */}
      <div className="mb-2 border-t border-paper-300 pt-10">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
          · Layer 4 · 元认知成熟度 (Metacognitive Maturity) ·
        </p>
        {layer4.totalEngagement === 0 ? (
          <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed">
            KEY 会在 Daily Signal / Pattern Mirror 里把你过去的真话端给你. 每次你回应一次, 元认知就深一层.
            继续用 — 这一维会自然涨.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-serif text-3xl text-ink-900 tracking-tighter mb-1">{layer4.mirrorsResponded}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">Daily Signal 回应</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-ink-900 tracking-tighter mb-1">{layer4.patternsResponded}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">Pattern Mirror 回应</p>
              </div>
            </div>
            <p className="font-serif italic text-[12px] text-ink-500">
              你已经 {layer4.totalEngagement} 次主动回应自己过去的真话.
              元认知不是 KEY 教你的, 是你每次跟过去自己对话长出来的.
            </p>
          </>
        )}
      </div>

      {/* 底部锚 */}
      <div className="mt-12 pt-8 border-t border-paper-300 text-center">
        <p className="font-serif italic text-[13px] text-ink-500 leading-relaxed max-w-prose-md mx-auto">
          "KEY 不假设你会改变行为. KEY 假设你会发展元认知.<br />
          这是真成长 — 即使你下次还做同样选择."
        </p>
      </div>
    </section>
  );
}
