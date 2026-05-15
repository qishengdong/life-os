/**
 * /methodology 编辑器 — 7 条决策契约.
 *
 * 结构: 开头 + 7 条 (每条 hook + body + 对照 + 血缘) + 收尾.
 */

'use client';

import type { MethodologyContent, MethodologyContract } from '@/lib/content/methodology';
import {
  SectionCard,
  Field,
  TextInput,
  TextArea,
  LinesEditor,
  SaveBar,
} from './shared';
import { useCmsPage } from './useCmsPage';

export default function MethodologyEditor() {
  const cms = useCmsPage<MethodologyContent>('/api/admin/cms/methodology');

  if (cms.loading)
    return <p className="text-stone-500 text-center py-20">加载中...</p>;
  if (!cms.content)
    return (
      <p className="text-red-700 text-center py-20">
        {cms.status.kind === 'error' ? cms.status.message : '无法加载方法论内容'}
      </p>
    );

  const content = cms.content;

  function updateOpening<K extends keyof MethodologyContent['opening']>(
    key: K,
    value: MethodologyContent['opening'][K],
  ) {
    cms.setContent((c) =>
      c ? { ...c, opening: { ...c.opening, [key]: value } } : c,
    );
  }

  function updateClosing<K extends keyof MethodologyContent['closing']>(
    key: K,
    value: MethodologyContent['closing'][K],
  ) {
    cms.setContent((c) =>
      c ? { ...c, closing: { ...c.closing, [key]: value } } : c,
    );
  }

  function updateContract(idx: number, patch: Partial<MethodologyContract>) {
    cms.setContent((c) => {
      if (!c) return c;
      const contracts = c.contracts.map((ct, i) =>
        i === idx ? { ...ct, ...patch } : ct,
      );
      return { ...c, contracts };
    });
  }

  function updateContractContrast(idx: number, patch: Partial<MethodologyContract['contrast']>) {
    cms.setContent((c) => {
      if (!c) return c;
      const contracts = c.contracts.map((ct, i) =>
        i === idx ? { ...ct, contrast: { ...ct.contrast, ...patch } } : ct,
      );
      return { ...c, contracts };
    });
  }

  function updateContractLineage(idx: number, patch: Partial<MethodologyContract['lineage']>) {
    cms.setContent((c) => {
      if (!c) return c;
      const contracts = c.contracts.map((ct, i) =>
        i === idx ? { ...ct, lineage: { ...ct.lineage, ...patch } } : ct,
      );
      return { ...c, contracts };
    });
  }

  return (
    <>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        /methodology 页面: <strong>7 条决策契约</strong> + 开头 + 收尾. 每条契约都有 hook /
        正文 / 对照 / 血缘. 改完点底部"保存并更新网站", 2-3 分钟生效.
      </p>

      {/* === 开头 === */}
      <SectionCard title="开头 (Opening Manifesto)" hint="页面最顶部, 大字 + 3 段引言">
        <Field label="顶部 eyebrow (小字)">
          <TextInput
            value={content.opening.eyebrow}
            onChange={(v) => updateOpening('eyebrow', v)}
          />
        </Field>
        <Field label="大标题">
          <TextArea
            value={content.opening.title}
            onChange={(v) => updateOpening('title', v)}
            rows={2}
          />
        </Field>
        <Field label="正文段落 (每行一段)">
          <LinesEditor
            value={content.opening.body}
            onChange={(v) => updateOpening('body', v)}
            rows={6}
          />
        </Field>
      </SectionCard>

      {/* === 7 条契约 === */}
      {content.contracts.map((contract, i) => (
        <SectionCard
          key={i}
          title={`第 ${contract.numeral} 条 · ${contract.title}`}
          hint={contract.englishTitle}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="罗马数字编号">
              <TextInput
                value={contract.numeral}
                onChange={(v) => updateContract(i, { numeral: v })}
              />
            </Field>
            <Field label="中文标题">
              <TextInput
                value={contract.title}
                onChange={(v) => updateContract(i, { title: v })}
              />
            </Field>
          </div>
          <Field label="英文副标题">
            <TextInput
              value={contract.englishTitle}
              onChange={(v) => updateContract(i, { englishTitle: v })}
            />
          </Field>
          <Field label="Hook (开端一句话)">
            <TextArea
              value={contract.hook}
              onChange={(v) => updateContract(i, { hook: v })}
              rows={2}
            />
          </Field>
          <Field label="正文 (每行一段, 2-3 段)">
            <LinesEditor
              value={contract.body}
              onChange={(v) => updateContract(i, { body: v })}
              rows={6}
            />
          </Field>

          <div className="border-t border-stone-200 pt-4 mt-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">
              对照: 通用 AI vs KEY
            </p>
            <Field label="一般 AI 通常会这么说">
              <TextArea
                value={contract.contrast.aiAssistedQuote}
                onChange={(v) => updateContractContrast(i, { aiAssistedQuote: v })}
                rows={3}
              />
            </Field>
            <Field label="KEY 这么做">
              <TextArea
                value={contract.contrast.aiNativeQuote}
                onChange={(v) => updateContractContrast(i, { aiNativeQuote: v })}
                rows={3}
              />
            </Field>
          </div>

          <div className="border-t border-stone-200 pt-4 mt-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">
              方法论血缘
            </p>
            <Field label="作者 / 权威">
              <TextInput
                value={contract.lineage.authority}
                onChange={(v) => updateContractLineage(i, { authority: v })}
              />
            </Field>
            <Field label="出处 (书名 + 年份)">
              <TextInput
                value={contract.lineage.citation}
                onChange={(v) => updateContractLineage(i, { citation: v })}
              />
            </Field>
            <Field label="关键洞见 (1-2 行)">
              <TextArea
                value={contract.lineage.insight}
                onChange={(v) => updateContractLineage(i, { insight: v })}
                rows={2}
              />
            </Field>
          </div>
        </SectionCard>
      ))}

      {/* === 收尾 === */}
      <SectionCard title="收尾 (Closing)" hint="页面最底部, 2 段 + 2 个 CTA">
        <Field label="收尾正文 (每行一段)">
          <LinesEditor
            value={content.closing.body}
            onChange={(v) => updateClosing('body', v)}
            rows={5}
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="主 CTA · 文字">
            <TextInput
              value={content.closing.ctaPrimary.label}
              onChange={(v) =>
                updateClosing('ctaPrimary', { ...content.closing.ctaPrimary, label: v })
              }
            />
          </Field>
          <Field label="主 CTA · 链接">
            <TextInput
              value={content.closing.ctaPrimary.href}
              onChange={(v) =>
                updateClosing('ctaPrimary', { ...content.closing.ctaPrimary, href: v })
              }
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="次 CTA · 文字">
            <TextInput
              value={content.closing.ctaSecondary.label}
              onChange={(v) =>
                updateClosing('ctaSecondary', { ...content.closing.ctaSecondary, label: v })
              }
            />
          </Field>
          <Field label="次 CTA · 链接">
            <TextInput
              value={content.closing.ctaSecondary.href}
              onChange={(v) =>
                updateClosing('ctaSecondary', { ...content.closing.ctaSecondary, href: v })
              }
            />
          </Field>
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

export { MethodologyEditor };
