/**
 * /brain — 用户可见的私人 brain 档案
 *
 * JOB-011 + JOB-012 · "KEY 记得你说过什么", 让用户看见 + 编辑 + 删除
 *
 * 显示:
 *   Layer 3 · 卷首 brain.md narrative
 *   Layer 0 · 硬锚点 (core_state)
 *   Layer 1 · 5 类 RMC (factual / boundary / relational / episodic / psych_signal)
 *   Layer 2 · 待跟进 open_loops
 *
 * 操作:
 *   - 编辑文本
 *   - 软删硬锚点 (deprecate)
 *   - 硬删 RMC 卡
 *   - 确认 (reverify · 更新 last_verified_at)
 *   - 标 open_loop resolved / cancelled
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';
import KeyHeader from '@/components/KeyHeader';
import type { UserMemoryContext, MemoryCard, CoreState, OpenLoop } from '@/lib/memory/types';
import type { Insight, InsightStatus } from '@/lib/insights/types';
import { PATTERN_TYPE_LABEL, PATTERN_TYPE_HINT } from '@/lib/insights/types';

const CARD_TYPE_LABEL: Record<string, string> = {
  factual: '事实',
  boundary: '边界 · 不能接受',
  relational: '关系',
  episodic: '重要事件',
  psych_signal: '心理信号',
};

const CARD_TYPE_HINT: Record<string, string> = {
  factual: '具体软事实 · 职业 / 城市 / 当前状态',
  boundary: '你说过的硬边界 — 越界 KEY 不会请求你忽略',
  relational: '跟父母 / 伴侣 / 孩子 / 同事 / 老板 的关系状态',
  episodic: '你提过的重要时刻',
  psych_signal: '反复出现的心理 pattern (不是诊断)',
};

function fmtRelativeDate(unix: number): string {
  const diff = Date.now() / 1000 - unix;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} 天前`;
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function BrainPage() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [memory, setMemory] = useState<UserMemoryContext | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [lastInsightRun, setLastInsightRun] = useState<{ createdAt: number; insightsPassedC30: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const uid = getOrCreateClientUid();
    setUserUid(uid);
    load(uid);
  }, []);

  async function load(uid: string) {
    setLoading(true);
    try {
      // 并行拉 memory + insights
      const [memRes, insightsRes] = await Promise.all([
        fetch('/api/brain', { headers: { [UID_HEADER]: uid } }),
        fetch('/api/brain/insights', { headers: { [UID_HEADER]: uid } }),
      ]);
      const memData = await memRes.json();
      const insightsData = await insightsRes.json();

      if (!memRes.ok) {
        setError(memData.error || '加载失败');
      } else {
        setMemory(memData.memory as UserMemoryContext);
      }
      if (insightsRes.ok) {
        // Defensive: API 可能返回非 array (历史 bug: 漏 await 导致 insights={})
        const list = insightsData.insights;
        setInsights(Array.isArray(list) ? (list as Insight[]) : []);
        setLastInsightRun(
          insightsData.lastRun
            ? {
                createdAt: insightsData.lastRun.createdAt,
                insightsPassedC30: insightsData.lastRun.insightsPassedC30,
              }
            : null,
        );
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (userUid) await load(userUid);
  }

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <KeyHeader current="brain" />

      <main className="max-w-prose-xl mx-auto px-6 pb-24">
        <header className="pt-12 pb-10 border-b border-paper-300">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-6">
            · KEY · 你的档案 ·
          </p>
          <h1 className="font-serif text-editorial-xl text-ink-900 tracking-tighter mb-4 leading-tight">
            你的档案.
          </h1>
          <p className="font-serif italic text-reading text-ink-700 editorial-leading max-w-prose-lg">
            你说过的, KEY 都记得 — 这里是它的归档. 不准就改, 不该有就删. 删了也不会忘 (有审计).<br />
            <span className="text-[14px] text-ink-500">
              你的档案 = 未来重大决定的证据. 每一份决策简报都会从这里调出相关 fact 引用.
            </span>
          </p>
          {memory && (
            <p className="font-mono text-[11px] text-ink-500 mt-6">
              第 {memory.stats.accountAgeDays} 天 · {memory.stats.totalCards} 张事实 · {memory.stats.totalDecisions} 份决策简报
            </p>
          )}
        </header>

        {loading && (
          <p className="font-serif italic text-ink-400 text-center py-20">加载档案 ...</p>
        )}

        {error && !loading && (
          <div className="my-12 p-6 border-l-2 border-ember bg-paper-100">
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-ember mb-2">错误</p>
            <p className="font-serif text-sm text-ink-700">{error}</p>
          </div>
        )}

        {memory && !loading && (
          <div className="pt-12 space-y-16">
            {memory.brainContent && (
              <SectionWrapper
                eyebrow="· 卷首 · BRAIN NARRATIVE ·"
                title="AI 是怎么理解你的"
                hint="LLM 综合你的全部记忆写的概述. 跟 onboarding 一起生成, 之后 weekly consolidation 更新."
              >
                <div className="font-serif text-reading text-ink-700 editorial-leading whitespace-pre-line border-l-2 border-seal-500/40 pl-6">
                  {memory.brainContent}
                </div>
              </SectionWrapper>
            )}

            {/* JOB-020 · Pattern detection · grounded insights */}
            <SectionWrapper
              eyebrow="· LAYER · PATTERN ·"
              title={`AI 在你身上看见的 (${insights.length})`}
              hint="每条 pattern 都至少 3 条具体证据 — 没的就不在这. Inspector C30 守门."
            >
              {lastInsightRun && (
                <p className="font-mono text-[10px] text-ink-400 mb-4">
                  上次分析: {fmtRelativeDate(lastInsightRun.createdAt)} · 入库 {lastInsightRun.insightsPassedC30} 条
                </p>
              )}
              {insights.length === 0 ? (
                <EmptyState text="还没有 pattern. 每周日 cron 会跑 LLM 检测, 数据足够 (pulses ≥6 或 decisions ≥2) 才生成. 没数据时不会硬凑." />
              ) : (
                <div className="space-y-4">
                  {insights.map((ins) => (
                    <InsightRow key={ins.id} insight={ins} userUid={userUid} onChange={refresh} />
                  ))}
                </div>
              )}
            </SectionWrapper>

            <SectionWrapper
              eyebrow="· LAYER 0 · 硬锚点 ·"
              title={`硬锚点 (${memory.coreState.length})`}
              hint="永远成立的事实 — KEY 每次跟你聊任何事都会优先记得这些."
            >
              {memory.coreState.length === 0 ? (
                <EmptyState text="暂无硬锚点. 跟 KEY 聊更多, 它会自动抽取." />
              ) : (
                <div className="space-y-3">
                  {memory.coreState.map((c) => (
                    <CoreStateRow key={c.id} item={c} userUid={userUid} onChange={refresh} />
                  ))}
                </div>
              )}
            </SectionWrapper>

            {(['factual', 'boundary', 'relational', 'episodic', 'psych_signal'] as const).map(
              (type) => {
                const cards =
                  type === 'factual' ? memory.factual
                  : type === 'boundary' ? memory.boundary
                  : type === 'relational' ? memory.relational
                  : type === 'episodic' ? memory.episodic
                  : memory.psychSignal;
                return (
                  <SectionWrapper
                    key={type}
                    eyebrow={`· LAYER 1 · ${CARD_TYPE_LABEL[type].toUpperCase()} ·`}
                    title={`${CARD_TYPE_LABEL[type]} (${cards.length})`}
                    hint={CARD_TYPE_HINT[type]}
                  >
                    {cards.length === 0 ? (
                      <EmptyState text="暂无内容." />
                    ) : (
                      <div className="space-y-4">
                        {cards.map((c) => (
                          <CardRow key={c.id} card={c} userUid={userUid} onChange={refresh} />
                        ))}
                      </div>
                    )}
                  </SectionWrapper>
                );
              },
            )}

            <SectionWrapper
              eyebrow="· 未完的事 ·"
              title={`未完的事 (${memory.openLoops.length})`}
              hint="跟你之前对话中产生的待办: 跟进 / 回访 / 复盘. 处理完点'已完成'."
            >
              {memory.openLoops.length === 0 ? (
                <EmptyState text="暂无未完的事." />
              ) : (
                <div className="space-y-3">
                  {memory.openLoops.map((l) => (
                    <OpenLoopRow key={l.id} loop={l} userUid={userUid} onChange={refresh} />
                  ))}
                </div>
              )}
            </SectionWrapper>

            <footer className="pt-12 border-t border-paper-300 text-center">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink-400 mb-4">
                · 隐私 ·
              </p>
              <p className="font-serif italic text-[14px] text-ink-500 max-w-prose-md mx-auto leading-relaxed">
                你的档案数据只属于你. 删除是软删 (硬锚点) 或硬删 (卡 / 未完的事), 不进任何训练数据.
                <br />
                改了之后, 下次跟 KEY 聊或写决定, 它会按新版本记得.
              </p>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// UI primitives
// ============================================================================

function SectionWrapper({
  eyebrow,
  title,
  hint,
  children,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
        {eyebrow}
      </p>
      <h2 className="font-serif text-2xl text-ink-900 tracking-tightish mb-2">{title}</h2>
      {hint && <p className="font-serif italic text-[13px] text-ink-500 mb-6">{hint}</p>}
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="font-serif italic text-[14px] text-ink-400 py-4">{text}</p>;
}

function CoreStateRow({
  item,
  userUid,
  onChange,
}: {
  item: CoreState;
  userUid: string | null;
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.factText);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!userUid) return;
    setSaving(true);
    await fetch(`/api/brain/core-state/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
      body: JSON.stringify({ factText: text }),
    });
    setSaving(false);
    setEditing(false);
    onChange();
  }

  async function softDelete() {
    if (!userUid) return;
    if (!confirm('这条硬锚点会被标记为 deprecated. 确定?')) return;
    await fetch(`/api/brain/core-state/${item.id}`, {
      method: 'DELETE',
      headers: { [UID_HEADER]: userUid },
    });
    onChange();
  }

  return (
    <div className="border border-paper-300 bg-paper-50 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-seal-500 mb-1.5">
            {item.kind}
          </p>
          {editing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-paper border border-paper-300 focus:border-seal-500 focus:outline-none font-serif text-reading text-ink-900 resize-y"
            />
          ) : (
            <p className="font-serif text-reading text-ink-900 leading-snug">{item.factText}</p>
          )}
          <p className="font-mono text-[10px] text-ink-400 mt-2">
            {item.source === 'user_self' ? '本人确认' : item.source === 'admin' ? 'admin 录入' : 'AI 抽取'} · 创建 {fmtRelativeDate(item.createdAt)}
          </p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="font-mono text-[10px] uppercase tracking-widest text-ink-500 hover:text-seal-500 transition-colors"
              >
                改
              </button>
              <button
                onClick={softDelete}
                className="font-mono text-[10px] uppercase tracking-widest text-ink-400 hover:text-ember"
              >
                删
              </button>
            </>
          )}
          {editing && (
            <>
              <button
                onClick={save}
                disabled={saving}
                className="font-mono text-[10px] uppercase tracking-widest text-seal-500 hover:text-seal-700 disabled:opacity-40"
              >
                {saving ? '...' : '保存'}
              </button>
              <button
                onClick={() => {
                  setText(item.factText);
                  setEditing(false);
                }}
                className="font-mono text-[10px] uppercase tracking-widest text-ink-400 hover:text-ink-700"
              >
                取消
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CardRow({
  card,
  userUid,
  onChange,
}: {
  card: MemoryCard;
  userUid: string | null;
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [content, setContent] = useState(card.content);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!userUid) return;
    setSaving(true);
    await fetch(`/api/brain/card/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
      body: JSON.stringify({ title, content }),
    });
    setSaving(false);
    setEditing(false);
    onChange();
  }

  async function reverify() {
    if (!userUid) return;
    await fetch(`/api/brain/card/${card.id}`, {
      method: 'POST',
      headers: { [UID_HEADER]: userUid },
    });
    onChange();
  }

  async function hardDelete() {
    if (!userUid) return;
    if (!confirm('这条 RMC 卡会被永久删除. 确定?')) return;
    await fetch(`/api/brain/card/${card.id}`, {
      method: 'DELETE',
      headers: { [UID_HEADER]: userUid },
    });
    onChange();
  }

  return (
    <article className="border border-paper-300 bg-paper-50 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 mb-2 bg-paper border border-paper-300 focus:border-seal-500 focus:outline-none font-serif text-lg text-ink-900"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-paper border border-paper-300 focus:border-seal-500 focus:outline-none font-serif text-reading text-ink-700 resize-y"
              />
            </>
          ) : (
            <>
              <h3 className="font-serif text-base text-ink-900 mb-1.5 leading-snug">{card.title}</h3>
              <p className="font-serif text-[14px] text-ink-700 leading-relaxed">{card.content}</p>
            </>
          )}
          <div className="flex items-center gap-3 mt-3 font-mono text-[10px] text-ink-400 flex-wrap">
            <span>置信 {(card.confidence * 100).toFixed(0)}%</span>
            <span>·</span>
            <span>{card.source === 'onboarding' ? '建档时' : card.source.replace(/_/g, ' ')}</span>
            <span>·</span>
            <span>verified {fmtRelativeDate(card.lastVerifiedAt)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="font-mono text-[10px] uppercase tracking-widest text-ink-500 hover:text-seal-500"
              >
                改
              </button>
              <button
                onClick={reverify}
                className="font-mono text-[10px] uppercase tracking-widest text-ink-500 hover:text-sage"
                title="确认这条对"
              >
                ✓ 对
              </button>
              <button
                onClick={hardDelete}
                className="font-mono text-[10px] uppercase tracking-widest text-ink-400 hover:text-ember"
              >
                删
              </button>
            </>
          )}
          {editing && (
            <>
              <button
                onClick={save}
                disabled={saving}
                className="font-mono text-[10px] uppercase tracking-widest text-seal-500 hover:text-seal-700 disabled:opacity-40"
              >
                {saving ? '...' : '保存'}
              </button>
              <button
                onClick={() => {
                  setTitle(card.title);
                  setContent(card.content);
                  setEditing(false);
                }}
                className="font-mono text-[10px] uppercase tracking-widest text-ink-400 hover:text-ink-700"
              >
                取消
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function InsightRow({
  insight,
  userUid,
  onChange,
}: {
  insight: Insight;
  userUid: string | null;
  onChange: () => void;
}) {
  const [correcting, setCorrecting] = useState(false);
  const [correction, setCorrection] = useState(insight.userCorrection || '');
  const [working, setWorking] = useState(false);

  async function act(status: InsightStatus, userCorrection?: string) {
    if (!userUid) return;
    setWorking(true);
    await fetch(`/api/brain/insights/${insight.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
      body: JSON.stringify({ status, userCorrection }),
    });
    setWorking(false);
    setCorrecting(false);
    onChange();
  }

  const isReviewed = insight.status !== 'unreviewed';

  return (
    <article
      className={`border ${
        insight.status === 'unreviewed'
          ? 'border-seal-500/40 bg-paper-50'
          : insight.status === 'confirmed' || insight.status === 'corrected'
          ? 'border-sage/30 bg-sage/5'
          : 'border-paper-300 bg-paper-50 opacity-70'
      } px-5 py-4`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-seal-500 mb-1.5">
            {PATTERN_TYPE_LABEL[insight.patternType] || insight.patternType}
            {insight.status === 'confirmed' && ' · 你确认过'}
            {insight.status === 'corrected' && ' · 你纠正过'}
            {insight.status === 'archived' && ' · 已存档'}
            {insight.status === 'rejected' && ' · 已拒'}
          </p>
          <h3 className="font-serif text-lg text-ink-900 mb-2 leading-snug tracking-tightish">
            {insight.title}
          </h3>
          <p className="font-serif text-[14px] text-ink-700 leading-relaxed whitespace-pre-line">
            {insight.description}
          </p>
          {insight.userCorrection && (
            <div className="mt-3 pl-4 border-l-2 border-sage/40">
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-sage mb-1">
                你的纠正
              </p>
              <p className="font-serif italic text-[13px] text-ink-700">
                {insight.userCorrection}
              </p>
            </div>
          )}
          <p className="font-mono text-[10px] text-ink-400 mt-3">
            {insight.evidenceCount} 条证据 · 置信 {(insight.confidence * 100).toFixed(0)}% · 检测 {fmtRelativeDate(insight.detectedAt)}
          </p>
        </div>
      </div>

      {/* Correcting form */}
      {correcting && (
        <div className="mt-3 pt-3 border-t border-paper-300">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-seal-500 mb-2">
            写下你的纠正版本
          </p>
          <textarea
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-paper border border-paper-300 focus:border-seal-500 focus:outline-none font-serif text-[14px] text-ink-900 resize-y"
            placeholder="例: 不是回避, 是没时间想 — 上个月一直在赶项目"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => act('corrected', correction)}
              disabled={working || !correction.trim()}
              className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 bg-sage text-paper-100 hover:bg-sage/80 disabled:opacity-40"
            >
              保存纠正
            </button>
            <button
              onClick={() => setCorrecting(false)}
              className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 text-ink-500 hover:text-ink-900"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Action buttons (unreviewed only) */}
      {!isReviewed && !correcting && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-paper-300">
          <button
            onClick={() => act('confirmed')}
            disabled={working}
            className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-sage text-sage hover:bg-sage hover:text-paper-100 transition-colors disabled:opacity-40"
          >
            ✓ 看到了, 准
          </button>
          <button
            onClick={() => setCorrecting(true)}
            className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-seal-500 text-seal-500 hover:bg-seal-500 hover:text-paper-100 transition-colors"
          >
            ✎ 我来改
          </button>
          <button
            onClick={() => act('archived')}
            disabled={working}
            className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 text-ink-500 hover:text-ink-900 disabled:opacity-40"
          >
            存档
          </button>
          <button
            onClick={() => act('rejected')}
            disabled={working}
            className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 text-ink-400 hover:text-ember disabled:opacity-40"
          >
            ✕ 不对
          </button>
        </div>
      )}
    </article>
  );
}

function OpenLoopRow({
  loop,
  userUid,
  onChange,
}: {
  loop: OpenLoop;
  userUid: string | null;
  onChange: () => void;
}) {
  const [working, setWorking] = useState(false);

  async function resolve(status: 'resolved' | 'cancelled') {
    if (!userUid) return;
    setWorking(true);
    await fetch(`/api/brain/open-loop/${loop.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', [UID_HEADER]: userUid },
      body: JSON.stringify({ status }),
    });
    setWorking(false);
    onChange();
  }

  const overdue = !!loop.dueAt && loop.dueAt < Date.now() / 1000;
  return (
    <div className={`border ${overdue ? 'border-amber/60' : 'border-paper-300'} bg-paper-50 px-5 py-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-seal-500 mb-1.5">
            {loop.kind || 'follow_up'} {overdue && '· 已过期'}
          </p>
          <h3 className="font-serif text-base text-ink-900 mb-1 leading-snug">{loop.title}</h3>
          {loop.description && (
            <p className="font-serif text-[13px] text-ink-500 leading-relaxed">{loop.description}</p>
          )}
          {loop.dueAt && (
            <p className="font-mono text-[10px] text-ink-400 mt-2">
              due {fmtRelativeDate(loop.dueAt)}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={() => resolve('resolved')}
            disabled={working}
            className="font-mono text-[10px] uppercase tracking-widest text-sage hover:text-sage/80 disabled:opacity-40"
          >
            ✓ 完成
          </button>
          <button
            onClick={() => resolve('cancelled')}
            disabled={working}
            className="font-mono text-[10px] uppercase tracking-widest text-ink-400 hover:text-ember disabled:opacity-40"
          >
            ✕ 取消
          </button>
        </div>
      </div>
    </div>
  );
}
