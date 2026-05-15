/**
 * Shared hook for CMS page editors — handles fetch, save, dirty-tracking.
 */

import { useEffect, useState } from 'react';
import type { SaveStatus } from './shared';

export function useCmsPage<T>(apiPath: string) {
  const [content, setContentRaw] = useState<T | null>(null);
  const [original, setOriginal] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>({ kind: 'idle' });

  useEffect(() => {
    fetch(apiPath)
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = '/admin/login?from=/admin/cms';
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.content) {
          setContentRaw(d.content);
          setOriginal(JSON.stringify(d.content));
        }
        setLoading(false);
      })
      .catch((e) => {
        setStatus({ kind: 'error', message: e.message || '加载失败' });
        setLoading(false);
      });
  }, [apiPath]);

  function setContent(c: T | null | ((prev: T | null) => T | null)) {
    setContentRaw(c);
  }

  const isDirty = content !== null && JSON.stringify(content) !== original;

  async function save() {
    if (!content) return;
    setSaving(true);
    setStatus({ kind: 'idle' });
    try {
      const res = await fetch(apiPath, {
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
    setContentRaw(JSON.parse(original) as T);
    setStatus({ kind: 'idle' });
  }

  return { content, setContent, save, discard, isDirty, saving, loading, status };
}
