/**
 * /terms + /privacy 编辑器 — 大段 HTML, 单 textarea.
 *
 * 法律文本变动少, 且结构复杂 (10 个 numbered section + subsection + lists).
 * 用一个大 textarea 编辑 HTML, 比硬塞结构化表单灵活. 改完之前最好让 Claude review.
 */

'use client';

import type { LegalContent } from '@/lib/content/legal';
import { SectionCard, Field, TextInput, TextArea, SaveBar } from './shared';
import { useCmsPage } from './useCmsPage';

interface Props {
  /** 'terms' | 'privacy' */
  page: 'terms' | 'privacy';
}

const TITLES: Record<Props['page'], { name: string; route: string }> = {
  terms: { name: '服务条款', route: '/terms' },
  privacy: { name: '隐私政策', route: '/privacy' },
};

export default function LegalEditor({ page }: Props) {
  const cms = useCmsPage<LegalContent>(`/api/admin/cms/${page}`);
  const meta = TITLES[page];

  if (cms.loading) return <p className="text-stone-500 text-center py-20">加载中...</p>;
  if (!cms.content) return <p className="text-red-700 text-center py-20">{cms.status.kind === 'error' ? cms.status.message : '无法加载'}</p>;

  const c = cms.content;
  function p<K extends keyof LegalContent>(k: K, v: LegalContent[K]) {
    cms.setContent((x) => (x ? { ...x, [k]: v } : x));
  }

  return (
    <>
      <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6 text-sm text-amber-900 leading-relaxed">
        <strong>提醒</strong>: 这是<strong>法律文本</strong>, 内容用 HTML 标签构成 (
        <code className="bg-amber-100 px-1 rounded text-xs">&lt;h2&gt;</code>{' '}
        <code className="bg-amber-100 px-1 rounded text-xs">&lt;p&gt;</code>{' '}
        <code className="bg-amber-100 px-1 rounded text-xs">&lt;strong&gt;</code>{' '}
        <code className="bg-amber-100 px-1 rounded text-xs">&lt;ul&gt;&lt;li&gt;</code>{' '}
        ). 改之前最好告诉 Claude 你想改什么 — 让他帮你改, 避免破坏结构.
      </div>

      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        {meta.route} 页面. 大段 HTML 正文 + 顶部 header + 底部 footer.
      </p>

      <SectionCard title="顶部 header">
        <Field label="eyebrow"><TextInput value={c.header.eyebrow} onChange={(v) => p('header', { ...c.header, eyebrow: v })} /></Field>
        <Field label="标题"><TextInput value={c.header.title} onChange={(v) => p('header', { ...c.header, title: v })} /></Field>
        <Field label="副标题"><TextInput value={c.header.subtitle} onChange={(v) => p('header', { ...c.header, subtitle: v })} /></Field>
      </SectionCard>

      <SectionCard title="正文 (HTML)" hint="完整页面文本">
        <Field label={`正文 · ${c.bodyHtml.length.toLocaleString()} 字符`}>
          <TextArea
            value={c.bodyHtml}
            onChange={(v) => p('bodyHtml', v)}
            rows={30}
          />
        </Field>
      </SectionCard>

      <SectionCard title="底部 footer">
        <Field label="底部小字"><TextInput value={c.footer} onChange={(v) => p('footer', v)} /></Field>
      </SectionCard>

      <SaveBar isDirty={cms.isDirty} saving={cms.saving} onSave={cms.save} onDiscard={cms.discard} />
    </>
  );
}

export const TermsEditor = () => <LegalEditor page="terms" />;
export const PrivacyEditor = () => <LegalEditor page="privacy" />;
