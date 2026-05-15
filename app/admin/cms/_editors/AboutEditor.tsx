'use client';

import type { AboutContent } from '@/lib/content/about';
import { SectionCard, Field, TextInput, TextArea, LinesEditor, SaveBar } from './shared';
import { useCmsPage } from './useCmsPage';

export default function AboutEditor() {
  const cms = useCmsPage<AboutContent>('/api/admin/cms/about');

  if (cms.loading) return <p className="text-stone-500 text-center py-20">加载中...</p>;
  if (!cms.content) return <p className="text-red-700 text-center py-20">{cms.status.kind === 'error' ? cms.status.message : '无法加载'}</p>;

  const c = cms.content;
  function p<K extends keyof AboutContent>(k: K, v: AboutContent[K]) {
    cms.setContent((x) => (x ? { ...x, [k]: v } : x));
  }

  return (
    <>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        /about 页面. 服务说明 + 边界 + 隐私 + 紧急资源.
      </p>

      <SectionCard title="顶部 hero">
        <Field label="eyebrow"><TextInput value={c.hero.eyebrow} onChange={(v) => p('hero', { ...c.hero, eyebrow: v })} /></Field>
        <Field label="标题"><TextInput value={c.hero.title} onChange={(v) => p('hero', { ...c.hero, title: v })} /></Field>
        <Field label="副标题"><TextInput value={c.hero.subtitle} onChange={(v) => p('hero', { ...c.hero, subtitle: v })} /></Field>
      </SectionCard>

      <SectionCard title="介绍 (主体说明)" hint="支持 &lt;strong&gt; &lt;em&gt; 标签">
        <Field label="kicker (seal 色一行)"><TextInput value={c.intro.kicker} onChange={(v) => p('intro', { ...c.intro, kicker: v })} /></Field>
        <Field label="大标题"><TextInput value={c.intro.title} onChange={(v) => p('intro', { ...c.intro, title: v })} /></Field>
        <Field label="正文 (每行一段, 可含 HTML)">
          <LinesEditor value={c.intro.body} onChange={(v) => p('intro', { ...c.intro, body: v })} rows={6} hint="例: <strong>加粗</strong> / <em>斜体</em>" />
        </Field>
        <Field label="收尾名言 (引用线那行)"><TextInput value={c.intro.tagline} onChange={(v) => p('intro', { ...c.intro, tagline: v })} /></Field>
      </SectionCard>

      <SectionCard title="这不是什么" hint="边界声明">
        <Field label="标题"><TextInput value={c.notWhat.title} onChange={(v) => p('notWhat', { ...c.notWhat, title: v })} /></Field>
        <Field label="条目 (每行一条, 用方括号 [电话号码] 标识 mono 显示)">
          <LinesEditor value={c.notWhat.items} onChange={(v) => p('notWhat', { ...c.notWhat, items: v })} rows={6} />
        </Field>
      </SectionCard>

      <SectionCard title="隐私底线" hint="01-05 编号">
        <Field label="标题"><TextInput value={c.privacy.title} onChange={(v) => p('privacy', { ...c.privacy, title: v })} /></Field>
        <Field label="条目 (每行一条, 链接用 [文字](href) 写)">
          <LinesEditor value={c.privacy.items} onChange={(v) => p('privacy', { ...c.privacy, items: v })} rows={6} hint="例: 完整隐私政策见 [privacy](/privacy)" />
        </Field>
      </SectionCard>

      <SectionCard title="紧急资源" hint="心理危机热线">
        <Field label="标题"><TextInput value={c.emergency.title} onChange={(v) => p('emergency', { ...c.emergency, title: v })} /></Field>
        <Field label="引言"><TextInput value={c.emergency.intro} onChange={(v) => p('emergency', { ...c.emergency, intro: v })} /></Field>
        {c.emergency.contacts.map((contact, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <TextInput
              value={contact.label}
              onChange={(v) =>
                p('emergency', {
                  ...c.emergency,
                  contacts: c.emergency.contacts.map((cc, j) => (j === i ? { ...cc, label: v } : cc)),
                })
              }
              placeholder="名称"
            />
            <TextInput
              value={contact.phone}
              onChange={(v) =>
                p('emergency', {
                  ...c.emergency,
                  contacts: c.emergency.contacts.map((cc, j) => (j === i ? { ...cc, phone: v } : cc)),
                })
              }
              placeholder="电话"
            />
          </div>
        ))}
      </SectionCard>

      <SectionCard title="底部链接卡片">
        {c.links.map((link, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-stone-100 first:border-0 first:pt-0">
            <TextInput
              value={link.label}
              onChange={(v) =>
                p('links', c.links.map((l, j) => (j === i ? { ...l, label: v } : l)))
              }
              placeholder="标题"
            />
            <TextInput
              value={link.desc}
              onChange={(v) =>
                p('links', c.links.map((l, j) => (j === i ? { ...l, desc: v } : l)))
              }
              placeholder="说明"
            />
            <TextInput
              value={link.href}
              onChange={(v) =>
                p('links', c.links.map((l, j) => (j === i ? { ...l, href: v } : l)))
              }
              placeholder="链接"
            />
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Footer">
        <Field label="小字"><TextInput value={c.footer.smallText} onChange={(v) => p('footer', { ...c.footer, smallText: v })} /></Field>
        <Field label="italic 收尾"><TextInput value={c.footer.italic} onChange={(v) => p('footer', { ...c.footer, italic: v })} /></Field>
      </SectionCard>

      <SaveBar isDirty={cms.isDirty} saving={cms.saving} onSave={cms.save} onDiscard={cms.discard} />
    </>
  );
}

export { AboutEditor };
