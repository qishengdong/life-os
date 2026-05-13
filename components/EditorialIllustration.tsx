/**
 * EditorialIllustration · KEY 长文配图
 *
 * 3 张黑白 engraving 风格 PNG, 跟 framework 一一对应.
 * 取自: design-handoff/DELIVERABLES/05-visual-density/editorial-*.png
 *
 * 嵌入位置:
 *   - sample brief 顶部 (印章下方, 标题上方)
 *   - decision brief 详情页同位置
 *
 * 失败模式 (用户视角): 不要单独显眼, 必须服从 brief 的阅读流.
 */

import Image from 'next/image';

type Framework =
  | 'parent-care'
  | 'marriage'
  | 'child-education'
  | 'career-transition'
  | 'migration'
  | 'crisis-restart'
  | 'general';

interface EditorialIllustrationProps {
  framework: Framework | string;
  /** 显示宽度 (高度自动按 16:10) */
  width?: number;
  /** 是否显示画面标题 (默认隐藏, 走 aria) */
  caption?: string;
  className?: string;
}

// 只有 3 个 framework 有交付图. 其他 fallback 不显示.
const HAS_ILLUSTRATION: Record<string, boolean> = {
  'parent-care': true,
  marriage: true,
  'child-education': true,
};

export default function EditorialIllustration({
  framework,
  width = 720,
  caption,
  className = '',
}: EditorialIllustrationProps) {
  if (!HAS_ILLUSTRATION[framework]) {
    return null;
  }

  const src = `/illustrations/editorial-${framework}.png`;
  // 实际图是 1600 × 1008 (~16:10.08), 用 1600:1000 简化
  const height = Math.round(width * (1000 / 1600));

  return (
    <figure
      className={`my-12 ${className}`}
      role="figure"
      aria-label={caption ?? `editorial illustration · ${framework}`}
    >
      <Image
        src={src}
        alt={caption ?? ''}
        width={width}
        height={height}
        unoptimized
        sizes="(max-width: 720px) 100vw, 720px"
        className="w-full h-auto"
        priority={false}
      />
      {caption && (
        <figcaption className="mt-3 font-serif italic text-[13px] text-ink-500 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
