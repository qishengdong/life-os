/**
 * KEY Wordmark · React component
 *
 * 包装 V2 outlined SVG. 自动选 display vs nav variant:
 *  - 默认 (height >= 48 px equivalent): display variant, tracking +0.16em
 *  - small (height < 48 px equivalent): nav variant, tracking +0.19em
 *
 * Source: design-handoff/DELIVERABLES/KEY/DELIVERABLES/01-key-wordmark/v2/
 */

import Image from 'next/image';

interface KeyWordmarkProps {
  /** 'display' (大尺寸, 海报 / hero) | 'nav' (顶 nav 24px 内) | 'mark-only' (favicon / 印章) */
  variant?: 'display' | 'nav' | 'on-dark' | 'monochrome' | 'with-mark' | 'mark-only';
  /** 高度 px. nav 用 16-24, hero 用 48+ */
  height?: number;
  className?: string;
  /** ARIA label override */
  ariaLabel?: string;
}

const SOURCES: Record<NonNullable<KeyWordmarkProps['variant']>, string> = {
  display:     '/brand/key-wordmark.svg',
  nav:         '/brand/key-wordmark-nav.svg',
  'on-dark':   '/brand/key-wordmark-on-dark.svg',
  monochrome:  '/brand/key-wordmark-monochrome.svg',
  'with-mark': '/brand/key-wordmark-with-mark.svg',
  'mark-only': '/brand/key-mark-only.svg',
};

// viewBox 1024 × 256 = 4:1 (mark-only 是 96×24 = 4:1)
const ASPECT_RATIO = 4;

export default function KeyWordmark({
  variant = 'display',
  height = 32,
  className = '',
  ariaLabel = 'KEY',
}: KeyWordmarkProps) {
  const src = SOURCES[variant];
  const width = Math.round(height * ASPECT_RATIO);
  return (
    <Image
      src={src}
      alt={ariaLabel}
      width={width}
      height={height}
      className={className}
      priority={variant !== 'mark-only'}
      unoptimized // SVG, no need for Next.js image optimization
    />
  );
}
