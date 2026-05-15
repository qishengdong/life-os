/**
 * /methodology sticky TOC · 桌面 ≥1024px 显示, 移动端隐藏.
 *
 * 左侧固定罗马数字 I-VII, 当前章节在 viewport 时高亮 burgundy.
 * 数字本身是 anchor 链接, 点击平滑滚到对应 section.
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  /** 锚点 id 列表, 按章节顺序 */
  anchors: Array<{ id: string; numeral: string; title?: string }>;
}

export default function MethodologyStickyToc({ anchors }: Props) {
  const [activeId, setActiveId] = useState<string | null>(anchors[0]?.id || null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // 选 viewport top 1/3 内的最后一个进入的 section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    );
    anchors.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [anchors]);

  return (
    <aside
      ref={containerRef}
      className="hidden lg:block fixed left-8 xl:left-12 top-1/2 -translate-y-1/2 z-20 select-none"
      aria-label="目录"
    >
      <ol className="space-y-3">
        {anchors.map(({ id, numeral, title }) => {
          const isActive = id === activeId;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`flex items-baseline gap-2.5 group transition-colors ${
                  isActive ? 'text-seal-500' : 'text-ink-300 hover:text-ink-700'
                }`}
              >
                <span
                  className={`font-serif italic text-base leading-none w-7 text-right ${
                    isActive ? 'text-seal-500' : 'text-inherit'
                  }`}
                >
                  {numeral}
                </span>
                {title && (
                  <span
                    className={`font-sans text-[10px] uppercase tracking-[0.25em] transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {title}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
