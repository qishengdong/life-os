/**
 * Home page editor — refactored from inline.
 */

'use client';

import type {
  HomeContent,
  HomeLead,
  HomeFiveDomain,
  HomeFooterNavLink,
  HomeWhatYouGetItem,
} from '@/lib/content/home';
import {
  SectionCard,
  Field,
  TextInput,
  TextArea,
  LinesEditor,
  SaveBar,
} from './shared';
import { useCmsPage } from './useCmsPage';

export default function HomeEditor() {
  const cms = useCmsPage<HomeContent>('/api/admin/cms/home');

  if (cms.loading)
    return <p className="text-stone-500 text-center py-20">加载中...</p>;
  if (!cms.content)
    return (
      <p className="text-red-700 text-center py-20">
        {cms.status.kind === 'error' ? cms.status.message : '无法加载首页内容'}
      </p>
    );

  const content = cms.content;

  function updateHero<K extends keyof HomeContent['hero']>(
    key: K,
    value: HomeContent['hero'][K],
  ) {
    cms.setContent((c) => (c ? { ...c, hero: { ...c.hero, [key]: value } } : c));
  }

  function updateLead(idx: number, patch: Partial<HomeLead>) {
    cms.setContent((c) => {
      if (!c) return c;
      const leads = c.hero.leads.map((l, i) => (i === idx ? { ...l, ...patch } : l));
      return { ...c, hero: { ...c.hero, leads } };
    });
  }

  function updateLeadSetup(leadIdx: number, setupIdx: number, value: string) {
    cms.setContent((c) => {
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
    cms.setContent((c) => {
      if (!c) return c;
      const items = c.fiveDomains.items.map((d, i) =>
        i === idx ? { ...d, ...patch } : d,
      );
      return { ...c, fiveDomains: { ...c.fiveDomains, items } };
    });
  }

  function updateFooterNav(idx: number, patch: Partial<HomeFooterNavLink>) {
    cms.setContent((c) => {
      if (!c) return c;
      const navLinks = c.footer.navLinks.map((n, i) =>
        i === idx ? { ...n, ...patch } : n,
      );
      return { ...c, footer: { ...c.footer, navLinks } };
    });
  }

  function updateFooter<K extends keyof HomeContent['footer']>(
    key: K,
    value: HomeContent['footer'][K],
  ) {
    cms.setContent((c) => (c ? { ...c, footer: { ...c.footer, [key]: value } } : c));
  }

  function updateEditorial<K extends keyof HomeContent['editorial']>(
    key: K,
    value: HomeContent['editorial'][K],
  ) {
    cms.setContent((c) => (c ? { ...c, editorial: { ...c.editorial, [key]: value } } : c));
  }

  function updateWhatYouGet<K extends keyof HomeContent['whatYouGet']>(
    key: K,
    value: HomeContent['whatYouGet'][K],
  ) {
    cms.setContent((c) =>
      c ? { ...c, whatYouGet: { ...c.whatYouGet, [key]: value } } : c,
    );
  }

  function updateWhatYouGetItem(idx: number, patch: Partial<HomeWhatYouGetItem>) {
    cms.setContent((c) => {
      if (!c) return c;
      const items = c.whatYouGet.items.map((it, i) =>
        i === idx ? { ...it, ...patch } : it,
      );
      return { ...c, whatYouGet: { ...c.whatYouGet, items } };
    });
  }

  return (
    <>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        keypoint.life 首页全部文字. 看哪段不顺眼就改哪段, 点底部的{' '}
        <strong className="text-stone-900">"保存并更新网站"</strong>. 2-3 分钟生效.
      </p>

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

      <SectionCard title="② 解释 KEY 是什么" hint="紧跟大标题, 5 段文字">
        <Field
          label="解释段落 (每行一段, 空行会被忽略)"
          hint="例: KEY 是 AI 原生的私人决策顾问 ... 30/90/365 天后回来复盘."
        >
          <LinesEditor
            value={content.hero.explainer}
            onChange={(v) => updateHero('explainer', v)}
            rows={8}
          />
        </Field>
      </SectionCard>

      <SectionCard title="③ 三个按钮" hint="首页大标题下方的 CTAs">
        {(['primary', 'secondary', 'ghost'] as const).map((kind) => (
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
              <div className="mt-3">
                <Field
                  label='"读 →" 链接目标 (可空)'
                  hint='例: /sample-brief?id=15 (父母) · /methodology#vi-six-domains (转身)'
                >
                  <TextInput
                    value={lead.href || ''}
                    onChange={(v) => updateLead(i, { href: v || undefined })}
                    placeholder="留空 = 不显示链接"
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

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

      <SectionCard
        title="⑥ 服务总声明"
        hint="首页第二屏 · '重大决定，不是找答案，是看清代价' 这块"
      >
        <Field label="眉头 (uppercase 小字)">
          <TextInput
            value={content.editorial.eyebrow}
            onChange={(v) => updateEditorial('eyebrow', v)}
          />
        </Field>
        <Field label="主标题 (大字)">
          <TextArea
            value={content.editorial.title}
            onChange={(v) => updateEditorial('title', v)}
            rows={2}
          />
        </Field>
        <Field
          label="正文 (每行一段, 空行忽略)"
          hint="例: KEY 不替你决定。 / 它帮你找到真正的问题..."
        >
          <LinesEditor
            value={content.editorial.paragraphs}
            onChange={(v) => updateEditorial('paragraphs', v)}
            rows={5}
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="CTA 文字">
            <TextInput
              value={content.editorial.ctaLabel}
              onChange={(v) => updateEditorial('ctaLabel', v)}
              placeholder="读完整方法论 →"
            />
          </Field>
          <Field label="CTA 链接">
            <TextInput
              value={content.editorial.ctaHref}
              onChange={(v) => updateEditorial('ctaHref', v)}
              placeholder="/methodology"
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="⑦ 你会拿到什么 (9 件事)"
        hint="一份 KEY Brief 拆成的 9 个 section · 跟 brief schema 对齐"
      >
        <Field label="眉头 (uppercase 小字)">
          <TextInput
            value={content.whatYouGet.eyebrow}
            onChange={(v) => updateWhatYouGet('eyebrow', v)}
          />
        </Field>
        <Field label="主标题">
          <TextInput
            value={content.whatYouGet.title}
            onChange={(v) => updateWhatYouGet('title', v)}
          />
        </Field>
        <div className="border-t border-stone-200 pt-4">
          <label className="block text-sm font-medium text-stone-700 mb-3">
            9 件事 ({content.whatYouGet.items.length} 项 · 建议保持 9 个)
          </label>
          {content.whatYouGet.items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-[60px_1fr] gap-3 items-center mb-2"
            >
              <TextInput
                value={item.num}
                onChange={(v) => updateWhatYouGetItem(i, { num: v })}
                placeholder="I"
              />
              <TextInput
                value={item.title}
                onChange={(v) => updateWhatYouGetItem(i, { title: v })}
                placeholder="你表面在问什么"
              />
            </div>
          ))}
        </div>
        <Field label="附注 (列表下方的小字)">
          <TextInput
            value={content.whatYouGet.afterNote}
            onChange={(v) => updateWhatYouGet('afterNote', v)}
            placeholder="+ 30 / 90 / 365 天后, 我们一起回来复盘."
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="CTA 文字">
            <TextInput
              value={content.whatYouGet.ctaLabel}
              onChange={(v) => updateWhatYouGet('ctaLabel', v)}
              placeholder="读完整样品简报 →"
            />
          </Field>
          <Field label="CTA 链接">
            <TextInput
              value={content.whatYouGet.ctaHref}
              onChange={(v) => updateWhatYouGet('ctaHref', v)}
              placeholder="/sample-brief"
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="⑧ 五类决策" hint="父母 / 子女 / 婚姻 / 职业 / 迁移">
        <Field label="板块标题">
          <TextInput
            value={content.fiveDomains.title}
            onChange={(v) =>
              cms.setContent((c) =>
                c ? { ...c, fiveDomains: { ...c.fiveDomains, title: v } } : c,
              )
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

      <SectionCard title="⑨ 落款 + 导航" hint="首页底部">
        <Field label="主签名">
          <TextInput
            value={content.footer.tagline}
            onChange={(v) => updateFooter('tagline', v)}
          />
        </Field>
        <Field label="副签名">
          <TextInput
            value={content.footer.subtagline}
            onChange={(v) => updateFooter('subtagline', v)}
          />
        </Field>
        <Field label="AIGC 备注">
          <TextArea
            value={content.footer.aigcDisclaimer}
            onChange={(v) => updateFooter('aigcDisclaimer', v)}
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

      <SaveBar
        isDirty={cms.isDirty}
        saving={cms.saving}
        onSave={cms.save}
        onDiscard={cms.discard}
      />
    </>
  );
}

// re-export for parent to use
export { HomeEditor };
