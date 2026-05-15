'use client';

import type { PricingContent, PricingTier } from '@/lib/content/pricing';
import { SectionCard, Field, TextInput, TextArea, SaveBar } from './shared';
import { useCmsPage } from './useCmsPage';

export default function PricingEditor() {
  const cms = useCmsPage<PricingContent>('/api/admin/cms/pricing');

  if (cms.loading) return <p className="text-stone-500 text-center py-20">加载中...</p>;
  if (!cms.content) return <p className="text-red-700 text-center py-20">{cms.status.kind === 'error' ? cms.status.message : '无法加载'}</p>;

  const c = cms.content;
  function p<K extends keyof PricingContent>(k: K, v: PricingContent[K]) {
    cms.setContent((x) => (x ? { ...x, [k]: v } : x));
  }
  function patchTier(idx: number, patch: Partial<PricingTier>) {
    cms.setContent((x) => {
      if (!x) return x;
      return { ...x, tiers: x.tiers.map((t, i) => (i === idx ? { ...t, ...patch } : t)) };
    });
  }
  function patchBullet(tierIdx: number, bulletIdx: number, patch: Partial<PricingTier['bullets'][0]>) {
    cms.setContent((x) => {
      if (!x) return x;
      return {
        ...x,
        tiers: x.tiers.map((t, i) =>
          i === tierIdx
            ? { ...t, bullets: t.bullets.map((b, j) => (j === bulletIdx ? { ...b, ...patch } : b)) }
            : t,
        ),
      };
    });
  }

  return (
    <>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        /pricing 页. Hero + 3 档定价 + 价格说明 + FAQ.
      </p>

      <SectionCard title="Hero" hint="页面顶部">
        <Field label="eyebrow"><TextInput value={c.hero.eyebrow} onChange={(v) => p('hero', { ...c.hero, eyebrow: v })} /></Field>
        <Field label="副引言 (大字上面那行 seal 色)"><TextInput value={c.hero.kicker} onChange={(v) => p('hero', { ...c.hero, kicker: v })} /></Field>
        <Field label="大标题 (用 \\n 换行)">
          <TextArea value={c.hero.title} onChange={(v) => p('hero', { ...c.hero, title: v })} rows={2} />
        </Field>
        <Field label="正文"><TextArea value={c.hero.body} onChange={(v) => p('hero', { ...c.hero, body: v })} rows={3} /></Field>
      </SectionCard>

      <SectionCard title="3 档定价" hint="Free / Pro / Premium">
        {c.tiers.map((tier, i) => (
          <div key={i} className="border-t border-stone-200 pt-5 first:border-0 first:pt-0 mb-5">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">档位 {i + 1}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="档位名"><TextInput value={tier.name} onChange={(v) => patchTier(i, { name: v })} /></Field>
              <Field label="价格"><TextInput value={tier.price} onChange={(v) => patchTier(i, { price: v })} /></Field>
              <Field label="周期 (/ 月 / 一年)"><TextInput value={tier.pricePeriod} onChange={(v) => patchTier(i, { pricePeriod: v })} /></Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="年付说明"><TextInput value={tier.yearly} onChange={(v) => patchTier(i, { yearly: v })} /></Field>
              <Field label="badge (顶部小标签, 可空)"><TextInput value={tier.badge || ''} onChange={(v) => patchTier(i, { badge: v || undefined })} /></Field>
            </div>
            <Field label="定位说明"><TextArea value={tier.position} onChange={(v) => patchTier(i, { position: v })} rows={2} /></Field>

            <label className="block text-sm font-medium text-stone-700 mt-3 mb-2">
              Bullets ({tier.bullets.length}) — ✓ 包含 / ✗ 不含 · 加粗
            </label>
            {tier.bullets.map((b, j) => (
              <div key={j} className="grid grid-cols-[1fr_70px_70px] gap-2 items-center mb-2">
                <TextInput value={b.feature} onChange={(v) => patchBullet(i, j, { feature: v })} />
                <label className="text-xs text-stone-600 flex items-center gap-1">
                  <input type="checkbox" checked={b.included} onChange={(e) => patchBullet(i, j, { included: e.target.checked })} />
                  包含
                </label>
                <label className="text-xs text-stone-600 flex items-center gap-1">
                  <input type="checkbox" checked={!!b.emphasis} onChange={(e) => patchBullet(i, j, { emphasis: e.target.checked })} />
                  加粗
                </label>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <Field label="CTA 文字"><TextInput value={tier.cta} onChange={(v) => patchTier(i, { cta: v })} /></Field>
              <Field label="CTA 链接"><TextInput value={tier.href} onChange={(v) => patchTier(i, { href: v })} /></Field>
              <Field label="样式">
                <select
                  value={tier.ctaStyle}
                  onChange={(e) => patchTier(i, { ctaStyle: e.target.value as 'seal' | 'ghost' })}
                  className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded text-stone-900 text-base"
                >
                  <option value="seal">seal (深色实心)</option>
                  <option value="ghost">ghost (描边)</option>
                </select>
              </Field>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="为什么这个价格?" hint="对照其他产品">
        <Field label="标题"><TextInput value={c.whyThisPrice.title} onChange={(v) => p('whyThisPrice', { ...c.whyThisPrice, title: v })} /></Field>
        <Field label="开头 (用 \\n 换行)"><TextArea value={c.whyThisPrice.intro} onChange={(v) => p('whyThisPrice', { ...c.whyThisPrice, intro: v })} rows={2} /></Field>
        <label className="block text-sm font-medium text-stone-700 mb-2">对照表 ({c.whyThisPrice.comparisons.length})</label>
        {c.whyThisPrice.comparisons.map((comp, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 mb-2">
            <TextInput
              value={comp.name}
              onChange={(v) =>
                p('whyThisPrice', {
                  ...c.whyThisPrice,
                  comparisons: c.whyThisPrice.comparisons.map((cc, j) => (j === i ? { ...cc, name: v } : cc)),
                })
              }
              placeholder="名字"
            />
            <TextInput
              value={comp.price}
              onChange={(v) =>
                p('whyThisPrice', {
                  ...c.whyThisPrice,
                  comparisons: c.whyThisPrice.comparisons.map((cc, j) => (j === i ? { ...cc, price: v } : cc)),
                })
              }
              placeholder="价格"
            />
            <TextInput
              value={comp.note}
              onChange={(v) =>
                p('whyThisPrice', {
                  ...c.whyThisPrice,
                  comparisons: c.whyThisPrice.comparisons.map((cc, j) => (j === i ? { ...cc, note: v } : cc)),
                })
              }
              placeholder="说明"
            />
          </div>
        ))}
        <Field label="总结 (大字)"><TextArea value={c.whyThisPrice.summary} onChange={(v) => p('whyThisPrice', { ...c.whyThisPrice, summary: v })} rows={2} /></Field>
        <Field label="收尾 italic"><TextInput value={c.whyThisPrice.tagline} onChange={(v) => p('whyThisPrice', { ...c.whyThisPrice, tagline: v })} /></Field>
      </SectionCard>

      <SectionCard title="FAQ 常见问题">
        <Field label="标题"><TextInput value={c.faq.title} onChange={(v) => p('faq', { ...c.faq, title: v })} /></Field>
        {c.faq.items.map((item, i) => (
          <div key={i} className="border-t border-stone-100 pt-3 first:border-0 first:pt-0">
            <Field label={`问题 ${i + 1}`}>
              <TextInput
                value={item.q}
                onChange={(v) =>
                  p('faq', { ...c.faq, items: c.faq.items.map((q, j) => (j === i ? { ...q, q: v } : q)) })
                }
              />
            </Field>
            <Field label="答">
              <TextArea
                value={item.a}
                onChange={(v) =>
                  p('faq', { ...c.faq, items: c.faq.items.map((q, j) => (j === i ? { ...q, a: v } : q)) })
                }
                rows={2}
              />
            </Field>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Footer">
        <Field label="小字 (V1 dev 那行)"><TextInput value={c.footer.smallText} onChange={(v) => p('footer', { ...c.footer, smallText: v })} /></Field>
        <Field label="italic 收尾"><TextInput value={c.footer.italic} onChange={(v) => p('footer', { ...c.footer, italic: v })} /></Field>
      </SectionCard>

      <SaveBar isDirty={cms.isDirty} saving={cms.saving} onSave={cms.save} onDiscard={cms.discard} />
    </>
  );
}

export { PricingEditor };
