/**
 * PageMasthead · 共享发刊页头, 用在每个 publication 页 H1 之上.
 *
 * 设计源: KB-DH-06 spec v2 · B1.
 *
 * 3 列: eyebrow (左, 灰 sans uppercase) · volume (中, burgundy uppercase) · right (右, burgundy mono).
 * 下方 0.5px ink hairline. 默认 1024px+ 三列 flex, 移动端居中 stack.
 */

import React from 'react';

interface Props {
  eyebrow?: string;
  volume?: string;
  right?: string;
}

export default function PageMasthead({ eyebrow, volume, right }: Props) {
  if (!eyebrow && !volume && !right) return null;
  return (
    <div className="max-w-prose-xl mx-auto px-6 pt-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 md:gap-6 pb-4 border-b border-ink-900/30 text-center md:text-left">
        {eyebrow && (
          <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-ink-500 order-1">
            {eyebrow}
          </p>
        )}
        {volume && (
          <p className="font-sans text-[11px] uppercase tracking-[0.36em] text-seal-500 order-3 md:order-2">
            {volume}
          </p>
        )}
        {right && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-seal-500 order-2 md:order-3">
            {right}
          </p>
        )}
      </div>
    </div>
  );
}
