/**
 * MorningMirror · /home 顶部 hero card · 5/20 ship · C1
 *
 * 用户进 /home → 显示一条 "你 X 天前写过 Y · 顺手问你 Z"
 * 2 CTAs:
 *   - "30 秒回应" → /pulse?mirrorFrom=<pulseId> (跳转去续写)
 *   - "晚点再说" → dismiss (本地 + 服务端 log)
 *
 * 静默失败原则:
 *   - API 返回 null → 不显示 (没坑用户)
 *   - 网络错误 → 不显示
 *   - 显示后用户关页 → 服务端记 timeout
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrCreateClientUid, UID_HEADER } from '@/lib/client-uid';

interface MirrorData {
  pulseId: number;
  pulseContent: string;
  pulseDaysAgo: number;
  mirrorQuestion: string;
}

export default function MorningMirror() {
  const [mirror, setMirror] = useState<MirrorData | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getOrCreateClientUid();
    fetch('/api/morning-mirror', {
      headers: { [UID_HEADER]: uid },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.mirror) setMirror(data.mirror);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function dismiss() {
    if (!mirror) return;
    setDismissed(true);
    // 同步告诉服务端用户主动 dismiss (不阻塞 UI)
    const uid = getOrCreateClientUid();
    fetch('/api/morning-mirror', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [UID_HEADER]: uid },
      body: JSON.stringify({ pulseId: mirror.pulseId, action: 'dismiss' }),
    }).catch(() => null);
  }

  // 加载中 / 没 mirror / 已 dismiss → 不显示
  if (loading || !mirror || dismissed) return null;

  // 真正显示
  return (
    <section className="mb-12 pt-8">
      <div className="border-l-2 border-seal-500 pl-6 py-3 bg-paper-50">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-seal-500 mb-3">
          · 早镜面 · {mirror.pulseDaysAgo} 天前的你, 在等今天的你 ·
        </p>

        <p className="font-serif italic text-[14px] text-ink-500 leading-relaxed mb-4">
          你 {mirror.pulseDaysAgo} 天前写过 —
        </p>
        <blockquote className="font-serif text-lg text-ink-900 leading-snug border-l-2 border-ink-900 pl-4 mb-6 italic">
          &ldquo;{mirror.pulseContent.length > 200 ? mirror.pulseContent.slice(0, 200) + '...' : mirror.pulseContent}&rdquo;
        </blockquote>

        <p className="font-serif text-reading text-ink-900 leading-relaxed mb-6">
          {mirror.mirrorQuestion}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/pulse?mirrorFrom=${mirror.pulseId}`}
            onClick={() => {
              // fire-and-forget · 标记 respond
              const uid = getOrCreateClientUid();
              fetch('/api/morning-mirror', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', [UID_HEADER]: uid },
                body: JSON.stringify({ pulseId: mirror.pulseId, action: 'respond' }),
              }).catch(() => null);
            }}
            className="inline-block px-6 py-2.5 font-serif text-[14px] text-paper bg-ink-900 hover:bg-seal-500 transition-colors text-center"
          >
            30 秒回应 →
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="inline-block px-6 py-2.5 font-serif text-[14px] text-ink-500 hover:text-seal-500 transition-colors"
          >
            晚点再说
          </button>
        </div>
      </div>
    </section>
  );
}
