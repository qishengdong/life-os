/**
 * /admin/cms/home/hero — Hero 板块编辑器
 *
 * 编辑 home.json 的 hero block:
 *   - brandStatementEn / Cn
 *   - subTag
 *   - explainer (4 段, 支持 <em> <i> tag)
 *   - ctas (primary / secondary / ghost · label + href)
 *   - leadsIntro
 *   - betterCallKey
 *
 * Leads (4 个痛点) 在 /admin/cms/home/leads 单独编辑.
 *
 * 操作:
 *   - 改字段 → 实时改 form state
 *   - "重置" → 撤回未保存的改
 *   - "发布" → POST 到 /api/admin/cms/home (publish=true) → GitHub commit → Vercel deploy
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { HomeContent, HomeHero } from '@/lib/content/home';

export default function HeroCmsPage() {
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
        } else {
          setMsg({ kind: 'err', text: d.error || '加载失败' });
        }
        setLoading(false);
      });
  }, []);

  const isDirty =
    original && content && JSON.stringify(original) !== JSON.stringify(content);

  function updateHero(patch: Partial<HomeHero>) {
    if (!content) return;
    setContent({ ...content, hero: { ...content.hero, ...patch } });
  }

  function updateExplainer(i: number, value: string) {
    if (!content) return;
    const next = [...content.hero.explainer];
    next[i] = value;
    updateHero({ explainer: next });
  }

  function addExplainerPara() {
    if (!content) return;
    updateHero({ explainer: [...content.hero.explainer, ''] });
  }

  function removeExplainerPara(i: number) {
    if (!content) return;
    const next = content.hero.explainer.filter((_, idx) => idx !== i);
    updateHero({ explainer: next });
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
          commitMessage: 'cms(home/hero): 更新 hero 文案 via /admin/cms',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsg({ kind: 'err', text: data.error || '发布失败' });
      } else {
        setMsg({
          kind: 'ok',
          text: `发布成功! commit ${data.publishResult?.commitSha?.slice(0, 7)} · Vercel 大约 2-3 分钟后生效`,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 text-paper-50 p-10">
        <p className="font-mono text-sm text-paper-300/60">加载中...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-ink-900 text-paper-50 p-10">
        <p className="font-mono text-sm text-ember">未能加载内容</p>
        <Link href="/admin/cms" className="text-seal-400 underline">← 返回 CMS</Link>
      </div>
    );
  }

  const { hero } = content;

  return (
    <div className="min-h-screen bg-ink-900 text-paper-50 p-6 md:p-10">
      {/* Header */}
      <header className="flex justify-between items-baseline mb-10 flex-wrap gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-seal-400 mb-1">
            CMS · Home · Hero
          </p>
          <h1 className="font-serif text-2xl text-paper-50">Brand Statement + Explainer</h1>
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

      {/* Form */}
      <div className="space-y-8 max-w-4xl">
        {/* Brand statement */}
        <FormGroup label="Brand Statement (英文)">
          <input
            type="text"
            className="cms-input"
            value={hero.brandStatementEn}
            onChange={(e) => updateHero({ brandStatementEn: e.target.value })}
          />
        </FormGroup>

        <FormGroup label="Brand Statement (中文)">
          <input
            type="text"
            className="cms-input"
            value={hero.brandStatementCn}
            onChange={(e) => updateHero({ brandStatementCn: e.target.value })}
          />
        </FormGroup>

        <FormGroup label="Sub-tag (服务定位 一句话)">
          <textarea
            className="cms-input"
            rows={2}
            value={hero.subTag}
            onChange={(e) => updateHero({ subTag: e.target.value })}
          />
        </FormGroup>

        {/* Explainer paragraphs */}
        <FormGroup
          label={`Explainer (${hero.explainer.length} 段)`}
          hint="支持 <em>burgundy 强调</em> 和 <i>italic 段</i> 内联标签"
        >
          <div className="space-y-2">
            {hero.explainer.map((para, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="font-mono text-[10px] text-paper-300/40 mt-2 w-6">
                  {i + 1}
                </span>
                <textarea
                  className="cms-input flex-1"
                  rows={2}
                  value={para}
                  onChange={(e) => updateExplainer(i, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeExplainerPara(i)}
                  className="font-mono text-[10px] text-ember/70 hover:text-ember px-2 mt-1"
                  disabled={hero.explainer.length <= 1}
                >
                  删
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addExplainerPara}
              className="font-mono text-[10px] text-seal-400 hover:text-paper-50 mt-1"
            >
              + 加一段
            </button>
          </div>
        </FormGroup>

        {/* CTAs */}
        <FormGroup label="CTAs (主 / 次 / 弱)">
          <div className="space-y-3">
            {(['primary', 'secondary', 'ghost'] as const).map((kind) => (
              <div key={kind} className="grid grid-cols-[80px_1fr_200px] gap-2 items-center">
                <span className="font-mono text-[10px] uppercase tracking-wider text-paper-300/60">
                  {kind}
                </span>
                <input
                  type="text"
                  className="cms-input"
                  value={hero.ctas[kind].label}
                  onChange={(e) =>
                    updateHero({
                      ctas: {
                        ...hero.ctas,
                        [kind]: { ...hero.ctas[kind], label: e.target.value },
                      },
                    })
                  }
                  placeholder="label"
                />
                <input
                  type="text"
                  className="cms-input font-mono text-[12px]"
                  value={hero.ctas[kind].href}
                  onChange={(e) =>
                    updateHero({
                      ctas: {
                        ...hero.ctas,
                        [kind]: { ...hero.ctas[kind], href: e.target.value },
                      },
                    })
                  }
                  placeholder="/letters/new"
                />
              </div>
            ))}
          </div>
        </FormGroup>

        {/* Leads intro */}
        <FormGroup
          label="Lead 引言 (4 个 lead 上方一句话)"
          hint="例: 如果下面任何一条, 你认出了自己"
        >
          <input
            type="text"
            className="cms-input"
            value={hero.leadsIntro}
            onChange={(e) => updateHero({ leadsIntro: e.target.value })}
          />
        </FormGroup>

        {/* Better Call KEY */}
        <FormGroup label="Better Call KEY (收尾 punch)">
          <div className="space-y-2">
            <input
              type="text"
              className="cms-input"
              value={hero.betterCallKey.en1}
              onChange={(e) =>
                updateHero({
                  betterCallKey: { ...hero.betterCallKey, en1: e.target.value },
                })
              }
              placeholder="Got a key call?"
            />
            <input
              type="text"
              className="cms-input"
              value={hero.betterCallKey.en2}
              onChange={(e) =>
                updateHero({
                  betterCallKey: { ...hero.betterCallKey, en2: e.target.value },
                })
              }
              placeholder="Better call KEY."
            />
            <input
              type="text"
              className="cms-input"
              value={hero.betterCallKey.cnSubtitle}
              onChange={(e) =>
                updateHero({
                  betterCallKey: { ...hero.betterCallKey, cnSubtitle: e.target.value },
                })
              }
              placeholder="重大抉择面前 · 来找 KEY"
            />
          </div>
        </FormGroup>

        {/* Link to leads editor */}
        <div className="border border-paper-300/10 p-4 rounded-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper-300/60 mb-2">
            4 个 LEAD (·自我·子女·父母·转身) 在独立编辑器编辑
          </p>
          <Link
            href="/admin/cms/home/leads"
            className="font-mono text-xs text-seal-400 hover:text-paper-50"
          >
            → 去编辑 leads
          </Link>
        </div>
      </div>

      {/* Footer actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-ink-900 border-t border-paper-300/20 p-4 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <p className="font-mono text-[10px] text-paper-300/60">
              {isDirty ? '✏ 未保存的改动' : '✓ 跟生产一致'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              disabled={!isDirty || publishing}
              className="font-mono text-xs uppercase tracking-widest px-4 py-2 border border-paper-300/20 text-paper-300 hover:text-paper-50 hover:border-paper-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              重置
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={!isDirty || publishing}
              className="font-mono text-xs uppercase tracking-widest px-6 py-2 bg-seal-500 hover:bg-seal-700 text-paper-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {publishing ? '发布中 ...' : '发布到 keypoint.life'}
            </button>
          </div>
        </div>
      </div>

      <div className="h-20" /> {/* spacer for fixed footer */}

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
          transition: border-color 0.15s ease;
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

function FormGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-seal-400">
          {label}
        </span>
        {hint && (
          <span className="block font-mono text-[10px] text-paper-300/50 mt-0.5">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
