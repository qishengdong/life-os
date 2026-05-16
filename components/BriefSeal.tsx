/**
 * BriefSeal · KEY 编辑部印章
 *
 * 取自: design-handoff/DELIVERABLES/05-visual-density/seals/
 *
 * 4 个 variant:
 *   - round       (主, English KB)
 *   - round-cn    (中文 "編輯部")
 *   - square      (篆体感方印)
 *   - octagon     (八角西式 wax seal)
 *
 * 用途:
 *   - BriefRenderer footer 右上角 (替换原 div 占位)
 *   - 集成时 CSS rotate(-3deg ~ +3deg) 增加"按压"感
 *   - 透明度 0.92 让 paper 纹理透出
 */

import Image from 'next/image';

type SealVariant = 'round' | 'round-cn' | 'square' | 'octagon';

interface BriefSealProps {
  variant?: SealVariant;
  /** 尺寸 px (印章是正方形) */
  size?: number;
  /** CSS 旋转角度 (deg). 默认随机 -3 ~ +3 (基于 brief number 稳定) */
  rotate?: number;
  /** 用于稳定旋转角度的 seed (例如 brief.briefNumber) */
  seed?: string;
  className?: string;
}

const SOURCES: Record<SealVariant, string> = {
  round: '/brand/seals/brief-seal-round.svg',
  'round-cn': '/brand/seals/brief-seal-round-cn.svg',
  square: '/brand/seals/brief-seal-square.svg',
  octagon: '/brand/seals/brief-seal-octagon.svg',
};

/** 简单哈希 → -3 ~ +3 degrees, server-stable */
function hashRotation(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  // -3 ~ +3, 跳过 0 (没旋转看着假)
  const r = ((h % 7) + 7) % 7 - 3; // -3..3
  return r === 0 ? -2 : r;
}

export default function BriefSeal({
  variant = 'round',
  size = 88,
  rotate,
  seed,
  className = '',
}: BriefSealProps) {
  const src = SOURCES[variant];
  const finalRotate = rotate !== undefined ? rotate : seed ? hashRotation(seed) : -2;

  return (
    <Image
      src={src}
      alt="KEY 印章"
      width={size}
      height={size}
      unoptimized
      className={`select-none ${className}`}
      style={{
        transform: `rotate(${finalRotate}deg)`,
        opacity: 0.92,
      }}
    />
  );
}
