/**
 * /admin/cms — 一页式文案编辑器
 *
 * 设计原则 (5/15 重写):
 *   - 白底深色字, 大字号, 字号不再"工具风"
 *   - 全部首页文案在 ONE PAGE, 不再分 hero/leads/footer 分页
 *   - 顶部 + 底部各一个大按钮 "保存并更新网站"
 *   - 保存即发布 (no draft state), 改完 2-3 分钟线上生效
 *   - 用户视角: 看到原文案 → 改 → 点按钮 → 看到结果
 */

'use client';

import { useEffect, useState } from 'react';
import type {
  HomeContent,
  HomeLead,
  HomeFiveDomain,
  HomeFooterNavLink,
} from '@/lib/content/home';

// ============================================================================
// UI primitives — light theme, 大字, 易读
// ============================================================================

function SectionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-md border border-stone-200 p-6 md:p-8 mb-6 shadow-sm">
      <h2 className="text-2xl font-serif text-stone-900 mb-1">{title}</h2>
      {hint && <p className="text-sm text-stone-500 mb-5">{hint}</p>}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
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
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded text-stone-900 text-base focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded text-stone-900 text-base leading-relaxed focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 font-serif"
    />
  );
}

// ============================================================================
// Page
// ============================================================================

export default function CmsHomePage() {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [original, setOriginal] = useState<string>(''); // JSON snapshot for dirty check
  const [me, setMe] = useState<{ displayName: string; username: string; role: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<
    | { kind: 'idle' }
    | { kind: 'success'; message: string }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });

  // Load
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/cms/home').then(async (r) => {
        if (r.status === 401) {
          window.location.href = '/admin/login?from=/admin/cms';
          return null;
        }
        return r.json();
      }),
      fetch('/api/admin/me').then((r) => r.json()),
    ])
      .then(([cmsData, meData]) => {
        if (cmsData?.content) {
          setContent(cmsData.content);
          setOriginal(JSON.stringify(cmsData.content));
        }
        if (meData?.authed) setMe(meData.user);
        setLoading(false);
      })
      .catch((e) => {
        setStatus({ kind: 'error', message: e.message || '加载失败' });
        setLoading(false);
      });
  }, []);

  const isDirty = content && JSON.stringify(content) !== original;

  // Save
  async function save() {
    if (!content) return;
    setSaving(true);
    setStatus({ kind: 'idle' });
    try {
      const res = await fetch('/api/admin/cms/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, publish: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ kind: 'error', message: data.error || '保存失败' });
      } else {
        setOriginal(JSON.stringify(content));
        setStatus({
          kind: 'success',
          message: '保存成功. 网站会在 2-3 分钟后看到改动.',
        });
      }
    } catch (e: any) {
      setStatus({ kind: 'error', message: e.message });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!confirm('放弃这次修改? 改过的字会还原.')) return;
    setContent(JSON.parse(original) as HomeContent);
    setStatus({ kind: 'idle' });
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-stone-500 text-lg">加载内容中...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-xl text-stone-900 mb-3">加载失败</h1>
          <p className="text-stone-500">
            {status.kind === 'error' ? status.message : '无法读取首页内容'}
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Mutate helpers (immutable updates)
  // ============================================================================

  function update<K extends keyof HomeContent>(key: K, value: HomeContent[K]) {
    setContent((c) => (c ? { ...c, [key]: value } : c));
  }

  function updateHero<K extends keyof HomeContent['hero']>(
    key: K,
    value: HomeContent['hero'][K],
  ) {
    setContent((c) => (c ? { ...c, hero: { ...c.hero, [key]: value } } : c));
  }

  function updateLead(idx: number, patch: Partial<HomeLead>) {
    setContent((c) => {
      if (!c) return c;
      const leads = c.hero.leads.map((l, i) => (i === idx ? { ...l, ...patch } : l));
      return { ...c, hero: { ...c.hero, leads } };
    });
  }

  function updateLeadSetup(leadIdx: number, setupIdx: number, value: string) {
    setContent((c) => {
      if (!c) return c;
      const leads = c.hero.leads.map((l, i) =>
        i === leadIdx
          ? { ...l, setup: l.setup.map((s, j) => (j === setupIdx ? value : s)) }
          : l,
      );
      return { ...c, hero: { ...c.hero, leads } };
    });
  }

  function updateFiveDomain(idx: number, patch: Partial<HomeFiveDomain>) {
    setContent((c) => {
      if (!c) return c;
      const items = c.fiveDomains.items.map((d, i) => (i === idx ? { ...d, ...patch } : d));
      return { ...c, fiveDomains: { ...c.fiveDomains, items } };
    });
  }

  function updateFooterNav(idx: number, patch: Partial<HomeFooterNavLink>) {
    setContent((c) => {
      if (!c) return c;
      const navLinks = c.footer.navLinks.map((n, i) => (i === idx ? { ...n, ...patch } : n));
      return { ...c, footer: { ...c.footer, navLinks } };
    });
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      {/* Top sticky bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-serif text-stone-900">
              改 KEY 首页文案
            </h1>
            {me && (
              <p className="text-xs text-stone-500">
                {me.displayName} ({me.role})
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {isDirty && (
              <span className="text-xs text-amber-700 hidden md:inline">
                有未保存的改动
              </span>
            )}
            {isDirty && (
              <button
                onClick={discard}
                disabled={saving}
                className="px-3 py-2 text-sm text-stone-600 hover:text-stone-900 disabled:opacity-40"
              >
                放弃修改
              </button>
            )}
            <button
              onClick={save}
              disabled={!isDirty || saving}
              className="px-4 md:px-5 py-2 bg-stone-900 hover:bg-stone-700 text-white text-sm md:text-base rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '保存中...' : '保存并更新网站'}
            </button>
            <button
              onClick={logout}
              className="text-xs text-stone-400 hover:text-stone-700 ml-1"
              title="退出登录"
            >
              退出
            </button>
          </div>
        </div>
        {/* Status banner */}
        {status.kind !== 'idle' && (
          <div
            className={`max-w-4xl mx-auto px-4 md:px-8 py-2 text-sm ${
              status.kind === 'success'
                ? 'text-green-800 bg-green-50 border-t border-green-200'
                : 'text-red-800 bg-red-50 border-t border-red-200'
            }`}
          >
            {status.message}
          </div>
        )}
      </header>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <p className="text-sm text-stone-500 mb-6 leading-relaxed">
          下面是 keypoint.life 首页全部文字. 你看哪段不顺眼就改哪段, 改完点上面或下面的{' '}
          <strong className="text-stone-900">"保存并更新网站"</strong>. 网站会在 2-3 分钟内更新.
          <br />
          <span className="text-stone-400">
            提示: <code className="text-xs bg-stone-100 px-1 rounded">&lt;em&gt;斜体&lt;/em&gt;</code> 这种标签会保留排版.
          </span>
        </p>

        {/* === 大标题 === */}
        <SectionCard title="① 大标题" hint="首页最大那行字 (英文 + 中文)">
          <Field label="英文 / 标语">
            <TextInput
              value={content.hero.brandStatementEn}
              onChange={(v) => updateHero('brandStatementEn', v)}
            />
          </Field>
          <Field label="中文">
            <TextInput
              value={content.hero.brandStatementCn}
              onChange={(v) => updateHero('brandStatementCn', v)}
            />
          </Field>
          <Field label="副标题 (大标题下面那行)">
            <TextArea
              value={content.hero.subTag}
              onChange={(v) => updateHero('subTag', v)}
              rows={2}
            />
          </Field>
        </SectionCard>

        {/* === 解释段 === */}
        <SectionCard
          title="② 解释 KEY 是什么"
          hint="紧跟大标题, 5 段文字 (每段一行, 可空行分隔)"
        >
          <Field
            label="5 段解释 (每行一段; 空行会被忽略)"
            hint="例: KEY 是 AI 原生的私人决策顾问 ... 30/90/365 天后回来复盘."
          >
            <TextArea
              value={content.hero.explainer.join('\n')}
              onChange={(v) =>
                updateHero(
                  'explainer',
                  v.split('\n').map((s) => s.trim()).filter(Boolean),
                )
              }
              rows={8}
            />
          </Field>
        </SectionCard>

        {/* === 3 个按钮 === */}
        <SectionCard title="③ 三个按钮" hint="首页大标题下方的 CTAs">
          {(['primary', 'secondary', 'ghost'] as const).map((kind, i) => (
            <div
              key={kind}
              className="grid grid-cols-1 md:grid-cols-[120px_1fr_1fr] gap-3 items-center"
            >
              <span className="text-sm text-stone-600">
                {kind === 'primary'
                  ? '主按钮 (深色)'
                  : kind === 'secondary'
                  ? '次按钮'
                  : '幽灵 (轻)'}
              </span>
              <TextInput
                value={content.hero.ctas[kind].label}
                onChange={(v) =>
                  updateHero('ctas', {
                    ...content.hero.ctas,
                    [kind]: { ...content.hero.ctas[kind], label: v },
                  })
                }
                placeholder="按钮文字"
              />
              <TextInput
                value={content.hero.ctas[kind].href}
                onChange={(v) =>
                  updateHero('ctas', {
                    ...content.hero.ctas,
                    [kind]: { ...content.hero.ctas[kind], href: v },
                  })
                }
                placeholder="链接 (/letters/new)"
              />
            </div>
          ))}
        </SectionCard>

        {/* === 4 个 lead === */}
        <SectionCard
          title="④ 4 个痛点入口"
          hint="自我 / 子女 / 父母 / 转身 — 每条 1-2 段铺垫 + 一句 真相"
        >
          <Field label="引言 (4 个 lead 上方那句)">
            <TextInput
              value={content.hero.leadsIntro}
              onChange={(v) => updateHero('leadsIntro', v)}
            />
          </Field>

          <div className="border-t border-stone-200 pt-4">
            {content.hero.leads.map((lead, i) => (
              <div
                key={i}
                className="mb-6 pb-6 border-b border-stone-100 last:border-b-0 last:pb-0 last:mb-0"
              >
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">
                  Lead {i + 1}
                </p>
                <Field label="标签 (自我 / 子女 / 父母 / 转身)">
                  <TextInput
                    value={lead.label}
                    onChange={(v) => updateLead(i, { label: v })}
                  />
                </Field>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    铺垫 ({lead.setup.length} 段)
                  </label>
                  {lead.setup.map((s, j) => (
                    <div key={j} className="mb-2">
                      <TextArea
                        value={s}
                        onChange={(v) => updateLeadSetup(i, j, v)}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Field label='"真相" 那句 (italic, 用 — 起头)'>
                    <TextArea
                      value={lead.truth}
                      onChange={(v) => updateLead(i, { truth: v })}
                      rows={2}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* === Better Call KEY === */}
        <SectionCard title="⑤ Better Call KEY" hint="收尾签名">
          <Field label="英文 1">
            <TextInput
              value={content.hero.betterCallKey.en1}
              onChange={(v) =>
                updateHero('betterCallKey', { ...content.hero.betterCallKey, en1: v })
              }
            />
          </Field>
          <Field label="英文 2">
            <TextInput
              value={content.hero.betterCallKey.en2}
              onChange={(v) =>
                updateHero('betterCallKey', { ...content.hero.betterCallKey, en2: v })
              }
            />
          </Field>
          <Field label="中文副标">
            <TextInput
              value={content.hero.betterCallKey.cnSubtitle}
              onChange={(v) =>
                updateHero('betterCallKey', {
                  ...content.hero.betterCallKey,
                  cnSubtitle: v,
                })
              }
            />
          </Field>
        </SectionCard>

        {/* === 五类决策 === */}
        <SectionCard title="⑥ 五类决策" hint="父母 / 子女 / 婚姻 / 职业 / 迁移">
          <Field label="板块标题">
            <TextInput
              value={content.fiveDomains.title}
              onChange={(v) =>
                update('fiveDomains', { ...content.fiveDomains, title: v })
              }
            />
          </Field>
          {content.fiveDomains.items.map((d, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr] gap-3 items-start pt-3 border-t border-stone-100"
            >
              <TextInput
                value={d.ch}
                onChange={(v) => updateFiveDomain(i, { ch: v })}
                placeholder="中文"
              />
              <TextInput
                value={d.en}
                onChange={(v) => updateFiveDomain(i, { en: v })}
                placeholder="English"
              />
              <TextInput
                value={d.note}
                onChange={(v) => updateFiveDomain(i, { note: v })}
                placeholder="副说明"
              />
            </div>
          ))}
        </SectionCard>

        {/* === Footer === */}
        <SectionCard title="⑦ 落款 + 导航" hint="首页底部">
          <Field label="主签名">
            <TextInput
              value={content.footer.tagline}
              onChange={(v) => update('footer', { ...content.footer, tagline: v })}
            />
          </Field>
          <Field label="副签名">
            <TextInput
              value={content.footer.subtagline}
              onChange={(v) => update('footer', { ...content.footer, subtagline: v })}
            />
          </Field>
          <Field label="AIGC 备注">
            <TextArea
              value={content.footer.aigcDisclaimer}
              onChange={(v) =>
                update('footer', { ...content.footer, aigcDisclaimer: v })
              }
              rows={2}
            />
          </Field>

          <div className="border-t border-stone-200 pt-4">
            <label className="block text-sm font-medium text-stone-700 mb-3">
              导航链接 ({content.footer.navLinks.length})
            </label>
            {content.footer.navLinks.map((n, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 items-center mb-2"
              >
                <TextInput
                  value={n.label}
                  onChange={(v) => updateFooterNav(i, { label: v })}
                  placeholder="文字"
                />
                <TextInput
                  value={n.href}
                  onChange={(v) => updateFooterNav(i, { href: v })}
                  placeholder="链接"
                />
                <label className="flex items-center gap-2 text-sm text-stone-600">
                  <input
                    type="checkbox"
                    checked={!!n.emphasis}
                    onChange={(e) =>
                      updateFooterNav(i, { emphasis: e.target.checked })
                    }
                  />
                  加粗
                </label>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* === Footer action === */}
        <div className="bg-white rounded-md border border-stone-200 p-6 mt-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-sm text-stone-500">
            {isDirty ? (
              <span className="text-amber-700">有未保存的改动</span>
            ) : (
              '没有未保存的改动'
            )}
          </div>
          <div className="flex gap-3">
            {isDirty && (
              <button
                onClick={discard}
                disabled={saving}
                className="px-5 py-3 text-stone-600 hover:text-stone-900 disabled:opacity-40"
              >
                放弃修改
              </button>
            )}
            <button
              onClick={save}
              disabled={!isDirty || saving}
              className="px-6 py-3 bg-stone-900 hover:bg-stone-700 text-white text-base rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '保存中...' : '保存并更新网站'}
            </button>
          </div>
        </div>

        <p className="text-xs text-stone-400 text-center mb-8">
          KEY · Admin · v2 · 改完点保存, Vercel 2-3 分钟部署, 然后刷 keypoint.life 就能看到.
        </p>
      </main>
    </div>
  );
}
