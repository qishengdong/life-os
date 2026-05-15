/**
 * /admin/cms/home/leads — 4 个 Lead 编辑器
 *
 * 操作:
 *   - 改 label / setup (多行) / truth
 *   - 加 lead / 删 lead / 上下移
 *   - 发布 (跟 hero 编辑器共享 same API)
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { HomeContent, HomeLead } from '@/lib/content/home';

export default function LeadsCmsPage() {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [original, setOriginal] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/cms/home')
      .then((r) => r.json())
      .then((d) => {
        if (d.content) {
          setContent(d.content);
          setOriginal(JSON.parse(JSON.stringify(d.content)));
        }
        setLoading(false);
      });
  }, []);

  const isDirty =
    original && content && JSON.stringify(original.hero.leads) !== JSON.stringify(content.hero.leads);

  function updateLeads(leads: HomeLead[]) {
    if (!content) return;
    setContent({ ...content, hero: { ...content.hero, leads } });
  }

  function updateLead(i: number, patch: Partial<HomeLead>) {
    if (!content) return;
    const next = [...content.hero.leads];
    next[i] = { ...next[i], ...patch };
    updateLeads(next);
  }

  function updateLeadSetup(leadIdx: number, paraIdx: number, value: string) {
    if (!content) return;
    const lead = content.hero.leads[leadIdx];
    const newSetup = [...lead.setup];
    newSetup[paraIdx] = value;
    updateLead(leadIdx, { setup: newSetup });
  }

  function addSetupPara(leadIdx: number) {
    if (!content) return;
    const lead = content.hero.leads[leadIdx];
    updateLead(leadIdx, { setup: [...lead.setup, ''] });
  }

  function removeSetupPara(leadIdx: number, paraIdx: number) {
    if (!content) return;
    const lead = content.hero.leads[leadIdx];
    if (lead.setup.length <= 1) return;
    updateLead(leadIdx, { setup: lead.setup.filter((_, i) => i !== paraIdx) });
  }

  function addLead() {
    if (!content) return;
    if (content.hero.leads.length >= 8) {
      setMsg({ kind: 'err', text: '最多 8 个 lead' });
      return;
    }
    updateLeads([
      ...content.hero.leads,
      { label: '新分类', setup: ['…'], truth: '…' },
    ]);
  }

  function removeLead(i: number) {
    if (!content) return;
    if (content.hero.leads.length <= 1) {
      setMsg({ kind: 'err', text: '至少保留 1 个 lead' });
      return;
    }
    updateLeads(content.hero.leads.filter((_, idx) => idx !== i));
  }

  function moveLead(i: number, dir: -1 | 1) {
    if (!content) return;
    const j = i + dir;
    if (j < 0 || j >= content.hero.leads.length) return;
    const next = [...content.hero.leads];
    [next[i], next[j]] = [next[j], next[i]];
    updateLeads(next);
  }

  async function publish() {
    if (!content) return;
    setPublishing(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/cms/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          publish: true,
          commitMessage: 'cms(home/leads): 更新 4 个 lead 痛点入口 via /admin/cms',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsg({ kind: 'err', text: data.error || '发布失败' });
      } else {
        setMsg({
          kind: 'ok',
          text: `发布成功 · commit ${data.publishResult?.commitSha?.slice(0, 7)} · ~2-3 min 生效`,
        });
        setOriginal(JSON.parse(JSON.stringify(content)));
      }
    } catch (e: any) {
      setMsg({ kind: 'err', text: e.message });
    } finally {
      setPublishing(false);
    }
  }

  function reset() {
    if (original) setContent(JSON.parse(JSON.stringify(original)));
    setMsg(null);
  }

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-ink-900 text-paper-50 p-10">
        <p className="font-mono text-sm text-paper-300/60">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 p-6 md:p-10">
      <header className="flex justify-between items-baseline mb-10 flex-wrap gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-1">
            CMS · Home · Leads
          </p>
          <h1 className="font-serif text-2xl text-paper-50">
            4 个 Lead · 痛点入口 ({content.hero.leads.length} 条)
          </h1>
        </div>
        <Link
          href="/admin/cms"
          className="font-mono text-xs uppercase tracking-widest text-seal-400 hover:text-paper-50 transition-colors"
        >
          ← CMS
        </Link>
      </header>

      {msg && (
        <div
          className={`mb-6 p-3 border ${
            msg.kind === 'ok' ? 'border-sage text-sage bg-sage/10' : 'border-ember text-ember bg-ember/10'
          } rounded-sm font-mono text-sm`}
        >
          {msg.text}
        </div>
      )}

      <div className="space-y-6 max-w-4xl">
        {content.hero.leads.map((lead, i) => (
          <div key={i} className="border border-paper-300/20 p-5 rounded-sm">
            <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper-300/60">
                LEAD {i + 1}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moveLead(i, -1)}
                  disabled={i === 0}
                  className="font-mono text-[10px] text-paper-300 hover:text-paper-50 disabled:opacity-20 px-2"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveLead(i, 1)}
                  disabled={i === content.hero.leads.length - 1}
                  className="font-mono text-[10px] text-paper-300 hover:text-paper-50 disabled:opacity-20 px-2"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeLead(i)}
                  className="font-mono text-[10px] text-ember/70 hover:text-ember px-2"
                >
                  删
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-paper-300/60 mb-1">
                  LABEL (· {lead.label} ·)
                </label>
                <input
                  type="text"
                  className="cms-input"
                  value={lead.label}
                  onChange={(e) => updateLead(i, { label: e.target.value })}
                  placeholder="自我 / 子女 / 父母 / 转身"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-paper-300/60 mb-1">
                  SETUP · 1-3 段 setup, 让用户先觉得"是我"
                </label>
                <div className="space-y-2">
                  {lead.setup.map((para, paraIdx) => (
                    <div key={paraIdx} className="flex gap-2 items-start">
                      <span className="font-mono text-[10px] text-paper-300/40 mt-2 w-4">
                        {paraIdx + 1}
                      </span>
                      <input
                        type="text"
                        className="cms-input flex-1"
                        value={para}
                        onChange={(e) => updateLeadSetup(i, paraIdx, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeSetupPara(i, paraIdx)}
                        className="font-mono text-[10px] text-ember/60 hover:text-ember px-1 mt-1"
                        disabled={lead.setup.length <= 1}
                      >
                        删
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSetupPara(i)}
                    className="font-mono text-[10px] text-seal-400 hover:text-paper-50"
                  >
                    + 加一段
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-paper-300/60 mb-1">
                  TRUTH · 锋利的真相, 跟在 "——" 后面 (italic 略灰渲染)
                </label>
                <textarea
                  className="cms-input"
                  rows={2}
                  value={lead.truth}
                  onChange={(e) => updateLead(i, { truth: e.target.value })}
                  placeholder="因为你可能根本就不知道 '自己' 是谁."
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addLead}
          className="w-full border-2 border-dashed border-paper-300/20 hover:border-seal-400 hover:text-seal-400 text-paper-300/60 py-4 font-mono text-xs uppercase tracking-widest transition-colors"
        >
          + 加一个 lead (最多 8 个)
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-ink-900 border-t border-paper-300/20 p-4 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <p className="font-mono text-[10px] text-paper-300/60">
            {isDirty ? '✏ 未保存的改动' : '✓ 跟生产一致'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              disabled={!isDirty || publishing}
              className="font-mono text-xs uppercase tracking-widest px-4 py-2 border border-paper-300/20 text-paper-300 hover:text-paper-50 hover:border-paper-300 disabled:opacity-30 transition-colors"
            >
              重置
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={!isDirty || publishing}
              className="font-mono text-xs uppercase tracking-widest px-6 py-2 bg-seal-500 hover:bg-seal-700 text-paper-50 disabled:opacity-30 transition-colors"
            >
              {publishing ? '发布中 ...' : '发布到 keypoint.life'}
            </button>
          </div>
        </div>
      </div>

      <div className="h-20" />

      <style jsx global>{`
        .cms-input {
          width: 100%;
          background: var(--ink-700, #2a2622);
          color: var(--paper-100);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.5rem 0.75rem;
          font-family: var(--font-source-serif), serif;
          font-size: 14px;
          line-height: 1.6;
          border-radius: 2px;
        }
        .cms-input:focus {
          outline: none;
          border-color: var(--burgundy-500);
        }
        .cms-input[rows] {
          resize: vertical;
          min-height: 60px;
        }
      `}</style>
    </div>
  );
}
