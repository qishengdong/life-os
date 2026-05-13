/**
 * Fleuron · KEY 章节分隔花纹
 *
 * 5 个 variant × 2 色 = 10 个 SVG, 取自:
 *   design-handoff/DELIVERABLES/05-visual-density/fleurons/
 *
 * 用途: 替代 `<hr>` / `bg-seal-500/60` 一条横线分隔.
 *
 * 用法:
 *   <Fleuron />                              ← 默认 classical-west, ink
 *   <Fleuron variant="key-derived" seal />   ← KEY 衍生纹饰, burgundy
 *   <Fleuron variant="chinese-huiwen" />     ← 中式回纹
 */

import Image from 'next/image';

type FleuronVariant =
  | 'classical-west'
  | 'chinese-huiwen'
  | 'key-derived'
  | 'simple-diamond'
  | 'double-rule';

interface FleuronProps {
  variant?: FleuronVariant;
  /** 切到 burgundy seal 色 (默认 ink 黑) */
  seal?: boolean;
  /** 宽度 px (高度自动 = width / 4) */
  width?: number;
  className?: string;
}

const ASPECT_RATIO = 4; // viewBox 64 × 16

export default function Fleuron({
  variant = 'classical-west',
  seal = false,
  width = 64,
  className = '',
}: FleuronProps) {
  const colorSuffix = seal ? '-seal' : '';
  const src = `/brand/fleurons/fleuron-${variant}${colorSuffix}.svg`;
  const height = Math.round(width / ASPECT_RATIO);

  return (
    <span
      className={`inline-flex items-center justify-center select-none ${className}`}
      role="presentation"
    >
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        unoptimized
        aria-hidden="true"
      />
    </span>
  );
}

/**
 * FleuronDivider — fleuron + 两侧短横线, 用作大章节分隔.
 * 古典报纸传统.
 */
export function FleuronDivider({
  variant = 'simple-diamond',
  seal = false,
  className = '',
}: FleuronProps) {
  return (
    <div
      className={`flex items-center justify-center my-12 ${className}`}
      role="separator"
    >
      <span className="flex-1 h-px bg-ink-900/15 max-w-[100px]" />
      <span className="px-6">
        <Fleuron variant={variant} seal={seal} width={48} />
      </span>
      <span className="flex-1 h-px bg-ink-900/15 max-w-[100px]" />
    </div>
  );
}
