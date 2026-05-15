/**
 * /membership 编辑器 — 6 个板块 + 3 个会员档位.
 */

'use client';

import type {
  MembershipContent,
  MembershipSection,
  MembershipTier,
} from '@/lib/content/membership';
import { SectionCard, Field, TextInput, TextArea, LinesEditor, SaveBar } from './shared';
import { useCmsPage } from './useCmsPage';

export default function MembershipEditor() {
  const cms = useCmsPage<MembershipContent>('/api/admin/cms/membership');

  if (cms.loading)
    return <p className="text-stone-500 text-center py-20">加载中...</p>;
  if (!cms.content)
    return (
      <p className="text-red-700 text-center py-20">
        {cms.status.kind === 'error' ? cms.status.message : '无法加载'}
      </p>
    );

  const content = cms.content;

  function patch<K extends keyof MembershipContent>(key: K, value: MembershipContent[K]) {
    cms.setContent((c) => (c ? { ...c, [key]: value } : c));
  }

  function patchSection(key: 'whyYear' | 'anchor', s: MembershipSection) {
    cms.setContent((c) => (c ? { ...c, [key]: s } : c));
  }

  function patchTier(idx: number, p: Partial<MembershipTier>) {
    cms.setContent((c) => {
      if (!c) return c;
      const tiers = c.tiers.map((t, i) => (i === idx ? { ...t, ...p } : t));
      return { ...c, tiers };
    });
  }

  return (
    <>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        /membership 页. 6 大板块 + 3 档会员价格. 顺序: Hero / 为什么是年 / 价格锚 / 三档 / 退款 / 不做什么 / 怎么加入.
      </p>

      <SectionCard title="Hero (页面顶部)" hint="大标题 + 2 段 subtitle">
        <Field label="顶部 eyebrow"><TextInput value={content.hero.eyebrow} onChange={(v) => patch('hero', { ...content.hero, eyebrow: v })} /></Field>
        <Field label="大标题"><TextInput value={content.hero.title} onChange={(v) => patch('hero', { ...content.hero, title: v })} /></Field>
        <Field label="副标题 (每行一段)">
          <LinesEditor value={content.hero.subtitle} onChange={(v) => patch('hero', { ...content.hero, subtitle: v })} rows={4} />
        </Field>
      </SectionCard>

      {(['whyYear', 'anchor'] as const).map((key) => {
        const sec = content[key];
        const label = key === 'whyYear' ? 'I. 为什么是年, 不是月' : 'II. 价格的锚';
        return (
          <SectionCard key={key} title={label} hint={sec.englishTitle}>
            <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-3">
              <Field label="编号"><TextInput value={sec.numeral} onChange={(v) => patchSection(key, { ...sec, numeral: v })} /></Field>
              <Field label="中文标题"><TextInput value={sec.title} onChange={(v) => patchSection(key, { ...sec, title: v })} /></Field>
            </div>
            <Field label="英文副标题"><TextInput value={sec.englishTitle} onChange={(v) => patchSection(key, { ...sec, englishTitle: v })} /></Field>
            <Field label="正文 (每行一段)">
              <LinesEditor value={sec.body} onChange={(v) => patchSection(key, { ...sec, body: v })} rows={6} />
            </Field>
          </SectionCard>
        );
      })}

      <SectionCard title="III. 三档会员" hint="观察者 / 年度 / 创始">
        {content.tiers.map((tier, i) => (
          <div
            key={i}
            className="border-t border-stone-200 pt-5 first:border-0 first:pt-0 mb-5"
          >
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">
              档位 {i + 1}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="编号"><TextInput value={tier.numeral} onChange={(v) => patchTier(i, { numeral: v })} /></Field>
              <Field label="档位名"><TextInput value={tier.name} onChange={(v) => patchTier(i, { name: v })} /></Field>
              <Field label="英文名"><TextInput value={tier.englishName} onChange={(v) => patchTier(i, { englishName: v })} /></Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="价格 (e.g. ¥1988)"><TextInput value={tier.price} onChange={(v) => patchTier(i, { price: v })} /></Field>
              <Field label="价格说明 (e.g. 一年 · 主推)"><TextInput value={tier.priceNote} onChange={(v) => patchTier(i, { priceNote: v })} /></Field>
            </div>
            <Field label="适合谁"><TextInput value={tier.who} onChange={(v) => patchTier(i, { who: v })} /></Field>
            <Field label="包含权益 (每行一条)">
              <LinesEditor value={tier.includes} onChange={(v) => patchTier(i, { includes: v })} rows={6} />
            </Field>
            <Field label="备注"><TextArea value={tier.notes} onChange={(v) => patchTier(i, { notes: v })} rows={3} /></Field>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="IV. 退款承诺" hint="第一周不合适, 全退">
        <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_1fr] gap-3">
          <Field label="编号"><TextInput value={content.refund.numeral} onChange={(v) => patch('refund', { ...content.refund, numeral: v })} /></Field>
          <Field label="中文标题"><TextInput value={content.refund.title} onChange={(v) => patch('refund', { ...content.refund, title: v })} /></Field>
          <Field label="英文标题"><TextInput value={content.refund.englishTitle} onChange={(v) => patch('refund', { ...content.refund, englishTitle: v })} /></Field>
        </div>
        <Field label="正文 (每行一段)">
          <LinesEditor value={content.refund.body} onChange={(v) => patch('refund', { ...content.refund, body: v })} rows={4} />
        </Field>
        <Field label="退款流程 (每行一步)">
          <LinesEditor value={content.refund.process} onChange={(v) => patch('refund', { ...content.refund, process: v })} rows={4} />
        </Field>
      </SectionCard>

      <SectionCard title="V. 我们不做什么" hint="主动声明边界">
        <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_1fr] gap-3">
          <Field label="编号"><TextInput value={content.weDoNot.numeral} onChange={(v) => patch('weDoNot', { ...content.weDoNot, numeral: v })} /></Field>
          <Field label="中文标题"><TextInput value={content.weDoNot.title} onChange={(v) => patch('weDoNot', { ...content.weDoNot, title: v })} /></Field>
          <Field label="英文标题"><TextInput value={content.weDoNot.englishTitle} onChange={(v) => patch('weDoNot', { ...content.weDoNot, englishTitle: v })} /></Field>
        </div>
        <Field label="引言"><TextArea value={content.weDoNot.intro} onChange={(v) => patch('weDoNot', { ...content.weDoNot, intro: v })} rows={3} /></Field>
        <div className="border-t border-stone-200 pt-4">
          <label className="block text-sm font-medium text-stone-700 mb-3">条目 ({content.weDoNot.items.length})</label>
          {content.weDoNot.items.map((item, i) => (
            <div key={i} className="mb-4 pb-4 border-b border-stone-100 last:border-b-0">
              <Field label={`条目 ${i + 1} · 标题`}>
                <TextInput
                  value={item.title}
                  onChange={(v) =>
                    patch('weDoNot', {
                      ...content.weDoNot,
                      items: content.weDoNot.items.map((it, j) => (j === i ? { ...it, title: v } : it)),
                    })
                  }
                />
              </Field>
              <Field label="说明">
                <TextArea
                  value={item.body}
                  onChange={(v) =>
                    patch('weDoNot', {
                      ...content.weDoNot,
                      items: content.weDoNot.items.map((it, j) => (j === i ? { ...it, body: v } : it)),
                    })
                  }
                  rows={2}
                />
              </Field>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="VI. 怎么加入" hint="申请流程 + 3 个 CTA">
        <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_1fr] gap-3">
          <Field label="编号"><TextInput value={content.join.numeral} onChange={(v) => patch('join', { ...content.join, numeral: v })} /></Field>
          <Field label="中文标题"><TextInput value={content.join.title} onChange={(v) => patch('join', { ...content.join, title: v })} /></Field>
          <Field label="英文标题"><TextInput value={content.join.englishTitle} onChange={(v) => patch('join', { ...content.join, englishTitle: v })} /></Field>
        </div>
        <Field label="正文 (每行一段)">
          <LinesEditor value={content.join.body} onChange={(v) => patch('join', { ...content.join, body: v })} rows={3} />
        </Field>
        <Field label="步骤 (每行一步)">
          <LinesEditor value={content.join.steps} onChange={(v) => patch('join', { ...content.join, steps: v })} rows={4} />
        </Field>
        {(['ctaPrimary', 'ctaSecondary', 'ctaTertiary'] as const).map((k) => (
          <div key={k} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label={`CTA · ${k === 'ctaPrimary' ? '主' : k === 'ctaSecondary' ? '次' : '第三'} · 文字`}>
              <TextInput
                value={content.join[k].label}
                onChange={(v) =>
                  patch('join', { ...content.join, [k]: { ...content.join[k], label: v } })
                }
              />
            </Field>
            <Field label="链接">
              <TextInput
                value={content.join[k].href}
                onChange={(v) =>
                  patch('join', { ...content.join, [k]: { ...content.join[k], href: v } })
                }
              />
            </Field>
          </div>
        ))}
      </SectionCard>

      <SaveBar isDirty={cms.isDirty} saving={cms.saving} onSave={cms.save} onDiscard={cms.discard} />
    </>
  );
}

export { MembershipEditor };
