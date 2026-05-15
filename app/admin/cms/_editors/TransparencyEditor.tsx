/**
 * /transparency 编辑器 — 6 个板块, 大部分是文案 essays.
 * 注: 12 维评分数字 / Inspector 命中数 是从数据库动态拉, 不在 CMS 改.
 */

'use client';

import type { TransparencyContent } from '@/lib/content/transparency';
import { SectionCard, Field, TextInput, TextArea, LinesEditor, SaveBar } from './shared';
import { useCmsPage } from './useCmsPage';

export default function TransparencyEditor() {
  const cms = useCmsPage<TransparencyContent>('/api/admin/cms/transparency');

  if (cms.loading) return <p className="text-stone-500 text-center py-20">加载中...</p>;
  if (!cms.content) return <p className="text-red-700 text-center py-20">{cms.status.kind === 'error' ? cms.status.message : '无法加载'}</p>;

  const c = cms.content;
  function p<K extends keyof TransparencyContent>(k: K, v: TransparencyContent[K]) {
    cms.setContent((x) => (x ? { ...x, [k]: v } : x));
  }

  // 4 种 section shape:
  // - intro (3): grader / inspector / brief
  // - body (2): notMeasured / failVisibly
  // - steps (1): howToQuestion

  const introKeys = ['sectionGrader', 'sectionInspector', 'sectionBrief'] as const;
  const bodyKeys = ['sectionNotMeasured', 'sectionFailVisibly'] as const;
  const labelMap: Record<string, string> = {
    sectionGrader: 'I. 十二维评分',
    sectionInspector: 'II. 七项 Inspector 自审',
    sectionBrief: 'III. 我们生成了什么',
    sectionNotMeasured: 'IV. 我们暂时没法量化的',
    sectionHowToQuestion: 'V. 怎么质疑我们',
    sectionFailVisibly: 'VI. 月度错误公示',
  };

  return (
    <>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        /transparency 页. 6 板块文案 + 顶部 hero. 12 维评分数字 / Inspector 命中数 是从数据库动态拉, 不在 CMS 改.
      </p>

      <SectionCard title="Hero" hint="页面顶部">
        <Field label="eyebrow"><TextInput value={c.hero.eyebrow} onChange={(v) => p('hero', { ...c.hero, eyebrow: v })} /></Field>
        <Field label="标题"><TextInput value={c.hero.title} onChange={(v) => p('hero', { ...c.hero, title: v })} /></Field>
        <Field label="正文 (每行一段)">
          <LinesEditor value={c.hero.body} onChange={(v) => p('hero', { ...c.hero, body: v })} rows={5} />
        </Field>
      </SectionCard>

      {introKeys.map((k) => {
        const s = c[k];
        return (
          <SectionCard key={k} title={labelMap[k]} hint={s.englishTitle}>
            <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_1fr] gap-3">
              <Field label="编号"><TextInput value={s.numeral} onChange={(v) => p(k, { ...s, numeral: v })} /></Field>
              <Field label="中文标题"><TextInput value={s.title} onChange={(v) => p(k, { ...s, title: v })} /></Field>
              <Field label="英文副标题"><TextInput value={s.englishTitle} onChange={(v) => p(k, { ...s, englishTitle: v })} /></Field>
            </div>
            <Field label="引言 (每行一段)">
              <LinesEditor value={s.intro} onChange={(v) => p(k, { ...s, intro: v })} rows={4} />
            </Field>
          </SectionCard>
        );
      })}

      {bodyKeys.map((k) => {
        const s = c[k];
        return (
          <SectionCard key={k} title={labelMap[k]} hint={s.englishTitle}>
            <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_1fr] gap-3">
              <Field label="编号"><TextInput value={s.numeral} onChange={(v) => p(k, { ...s, numeral: v })} /></Field>
              <Field label="中文标题"><TextInput value={s.title} onChange={(v) => p(k, { ...s, title: v })} /></Field>
              <Field label="英文副标题"><TextInput value={s.englishTitle} onChange={(v) => p(k, { ...s, englishTitle: v })} /></Field>
            </div>
            <Field label="正文 (每行一段)">
              <LinesEditor value={s.body} onChange={(v) => p(k, { ...s, body: v })} rows={6} />
            </Field>
          </SectionCard>
        );
      })}

      <SectionCard title={labelMap.sectionHowToQuestion} hint={c.sectionHowToQuestion.englishTitle}>
        <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_1fr] gap-3">
          <Field label="编号"><TextInput value={c.sectionHowToQuestion.numeral} onChange={(v) => p('sectionHowToQuestion', { ...c.sectionHowToQuestion, numeral: v })} /></Field>
          <Field label="中文标题"><TextInput value={c.sectionHowToQuestion.title} onChange={(v) => p('sectionHowToQuestion', { ...c.sectionHowToQuestion, title: v })} /></Field>
          <Field label="英文副标题"><TextInput value={c.sectionHowToQuestion.englishTitle} onChange={(v) => p('sectionHowToQuestion', { ...c.sectionHowToQuestion, englishTitle: v })} /></Field>
        </div>
        <Field label="正文 (每行一段)">
          <LinesEditor value={c.sectionHowToQuestion.body} onChange={(v) => p('sectionHowToQuestion', { ...c.sectionHowToQuestion, body: v })} rows={3} />
        </Field>
        <Field label="步骤 (每行一步)">
          <LinesEditor value={c.sectionHowToQuestion.steps} onChange={(v) => p('sectionHowToQuestion', { ...c.sectionHowToQuestion, steps: v })} rows={5} />
        </Field>
      </SectionCard>

      <SaveBar isDirty={cms.isDirty} saving={cms.saving} onSave={cms.save} onDiscard={cms.discard} />
    </>
  );
}

export { TransparencyEditor };
