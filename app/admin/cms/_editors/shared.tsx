/**
 * 共享 CMS 编辑器 UI primitives — 白底, 大字, 易读.
 * Home / Methodology / Membership / ... 都用同一套.
 */

'use client';

import { ReactNode } from 'react';

export function SectionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-md border border-stone-200 p-6 md:p-8 mb-6 shadow-sm">
      <h2 className="text-2xl font-serif text-stone-900 mb-1">{title}</h2>
      {hint && <p className="text-sm text-stone-500 mb-5">{hint}</p>}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}

export function TextInput({
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
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded text-stone-900 text-base focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
    />
  );
}

export function TextArea({
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
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded text-stone-900 text-base leading-relaxed focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 font-serif"
    />
  );
}

/**
 * Multi-line textarea where each line = one item in a string[] array.
 * 空行被过滤.
 */
export function LinesEditor({
  value,
  onChange,
  rows = 6,
  hint,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <>
      <TextArea
        value={(value || []).join('\n')}
        onChange={(v) =>
          onChange(
            v
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        rows={rows}
      />
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
    </>
  );
}

/**
 * Save status banner.
 */
export type SaveStatus =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export function StatusBanner({ status }: { status: SaveStatus }) {
  if (status.kind === 'idle') return null;
  return (
    <div
      className={`max-w-4xl mx-auto px-4 md:px-8 py-2 text-sm ${
        status.kind === 'success'
          ? 'text-green-800 bg-green-50 border-t border-green-200'
          : 'text-red-800 bg-red-50 border-t border-red-200'
      }`}
    >
      {status.message}
    </div>
  );
}

/**
 * Bottom save bar — sticky, always reminds user to save.
 */
export function SaveBar({
  isDirty,
  saving,
  onSave,
  onDiscard,
}: {
  isDirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
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
            onClick={onDiscard}
            disabled={saving}
            className="px-5 py-3 text-stone-600 hover:text-stone-900 disabled:opacity-40"
          >
            放弃修改
          </button>
        )}
        <button
          onClick={onSave}
          disabled={!isDirty || saving}
          className="px-6 py-3 bg-stone-900 hover:bg-stone-700 text-white text-base rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? '保存中...' : '保存并更新网站'}
        </button>
      </div>
    </div>
  );
}
