/**
 * /sample-brief 编辑器 — 大部分是文案 (briefs 本身从数据库读, 不可改).
 */

'use client';

import type { SampleBriefContent } from '@/lib/content/sample-brief';
import { SectionCard, Field, TextInput, TextArea, LinesEditor, SaveBar } from './shared';
import { useCmsPage } from './useCmsPage';

export default function SampleBriefEditor() {
  const cms = useCmsPage<SampleBriefContent>('/api/admin/cms/sample-brief');

  if (cms.loading)
    return <p className="text-stone-500 text-center py-20">加载中...</p>;
  if (!cms.content)
    return (
      <p className="text-red-700 text-center py-20">
        {cms.status.kind === 'error' ? cms.status.message : '无法加载内容'}
      </p>
    );

  const content = cms.content;

  function patch<K extends keyof SampleBriefContent>(key: K, value: SampleBriefContent[K]) {
    cms.setContent((c) => (c ? { ...c, [key]: value } : c));
  }

  return (
    <>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        /sample-brief 页. 三份 sample brief 本身从数据库读 (不在 CMS 改 — 是真实生成的). 这里改的是<strong>页面框架文案</strong>: 顶部说明 + 底部 CTA.
      </p>

      <SectionCard title="顶部说明 (页面 hero)" hint="进入页面看到的第一段编辑部说明">
        <Field label="顶部 eyebrow (小字)">
          <TextInput
            value={content.header.eyebrow}
            onChange={(v) => patch('header', { ...content.header, eyebrow: v })}
          />
        </Field>
        <Field label="大标题">
          <TextInput
            value={content.header.title}
            onChange={(v) => patch('header', { ...content.header, title: v })}
          />
        </Field>
        <Field label="正文段落 (每行一段)">
          <LinesEditor
            value={content.header.body}
            onChange={(v) => patch('header', { ...content.header, body: v })}
            rows={6}
          />
        </Field>
        <Field label="最后一段斜体? (italic style)">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={!!content.header.lastParagraphItalic}
              onChange={(e) =>
                patch('header', { ...content.header, lastParagraphItalic: e.target.checked })
              }
            />
            最后一段用斜体显示
          </label>
        </Field>
      </SectionCard>

      <SectionCard title="三份简报标题上方" hint="三个 sample brief 卡片上方的小字">
        <Field label="小字">
          <TextInput
            value={content.selector.eyebrow}
            onChange={(v) => patch('selector', { ...content.selector, eyebrow: v })}
          />
        </Field>
      </SectionCard>

      <SectionCard title="底部 CTA 板块" hint="读完 sample brief 之后看到的">
        <Field label="底部 eyebrow">
          <TextInput
            value={content.footer.eyebrow}
            onChange={(v) => patch('footer', { ...content.footer, eyebrow: v })}
          />
        </Field>
        <Field label="标题 (用 \\n 换行)" hint="例: 你的下一个重大决定,\\n也可以被这样认真对待.">
          <TextArea
            value={content.footer.title}
            onChange={(v) => patch('footer', { ...content.footer, title: v })}
            rows={2}
          />
        </Field>
        <Field label="副标题 (价格 / 退款说明)">
          <TextArea
            value={content.footer.subtitle}
            onChange={(v) => patch('footer', { ...content.footer, subtitle: v })}
            rows={2}
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="主 CTA · 文字">
            <TextInput
              value={content.footer.ctaPrimary.label}
              onChange={(v) =>
                patch('footer', {
                  ...content.footer,
                  ctaPrimary: { ...content.footer.ctaPrimary, label: v },
                })
              }
            />
          </Field>
          <Field label="主 CTA · 链接">
            <TextInput
              value={content.footer.ctaPrimary.href}
              onChange={(v) =>
                patch('footer', {
                  ...content.footer,
                  ctaPrimary: { ...content.footer.ctaPrimary, href: v },
                })
              }
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="次 CTA · 文字">
            <TextInput
              value={content.footer.ctaSecondary.label}
              onChange={(v) =>
                patch('footer', {
                  ...content.footer,
                  ctaSecondary: { ...content.footer.ctaSecondary, label: v },
                })
              }
            />
          </Field>
          <Field label="次 CTA · 链接">
            <TextInput
              value={content.footer.ctaSecondary.href}
              onChange={(v) =>
                patch('footer', {
                  ...content.footer,
                  ctaSecondary: { ...content.footer.ctaSecondary, href: v },
                })
              }
            />
          </Field>
        </div>
        <Field label="最底部小字">
          <TextInput
            value={content.footer.smallText}
            onChange={(v) => patch('footer', { ...content.footer, smallText: v })}
          />
        </Field>
      </SectionCard>

      <SectionCard title="决策框架中文名" hint="左上角 父母养老 / 婚姻 那个标签翻译">
        {Object.entries(content.frameworkLabels).map(([key, label]) => (
          <div
            key={key}
            className="grid grid-cols-[200px_1fr] gap-3 items-center pt-2 border-t border-stone-100 first:border-0 first:pt-0"
          >
            <code className="text-xs text-stone-500 font-mono">{key}</code>
            <TextInput
              value={label}
              onChange={(v) =>
                patch('frameworkLabels', { ...content.frameworkLabels, [key]: v })
              }
            />
          </div>
        ))}
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

export { SampleBriefEditor };
