/**
 * Sparkline · KEY publication-grade inline mini-chart
 *
 * 设计:
 *   - 纯 SVG, 0 依赖, server-renderable
 *   - 永远横版 inline, 不撑大段落
 *   - 暗红线 + 浅区域填充, 末点高亮
 *   - 数据 < 2 个点时: 显示 "—" 占位 (Fail visibly)
 *
 * 用在: /transparency 页, brief 详情, methodology 数据点.
 */

interface SparklineProps {
  /** 时间序列数值, 旧→新顺序 */
  data: number[];
  /** SVG 宽度 px, 默认 80 */
  width?: number;
  /** SVG 高度 px, 默认 24 */
  height?: number;
  /** 是否显示末点圆点 */
  showLastDot?: boolean;
  /** 是否显示中位基线 */
  showBaseline?: boolean;
  /** 反转颜色 — 上升 = 坏 (如 latency) 用 ink 灰; 上升 = 好 (如评分) 用 burgundy */
  invertSentiment?: boolean;
  /** aria-label */
  ariaLabel?: string;
}

export default function Sparkline({
  data,
  width = 80,
  height = 24,
  showLastDot = true,
  showBaseline = false,
  invertSentiment = false,
  ariaLabel,
}: SparklineProps) {
  // 不够数据 — 显示"—"占位 (Fail visibly, not silently)
  if (!data || data.length < 2) {
    return (
      <span
        className="inline-block font-mono text-ink-400 text-xs select-none"
        style={{ width, textAlign: 'center' }}
        aria-label={ariaLabel ?? '数据不足'}
      >
        — 数据不足 —
      </span>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // 避免 div by 0

  const pad = 1.5;
  const stepX = (width - pad * 2) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (height - pad * 2) * (1 - (v - min) / range);
    return { x, y };
  });

  // line path
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  // area path (line 加底)
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(2)} ${(height - pad).toFixed(2)}` +
    ` L ${points[0].x.toFixed(2)} ${(height - pad).toFixed(2)} Z`;

  const last = points[points.length - 1];

  // 基线: median
  const sorted = [...data].sort((a, b) => a - b);
  const medianVal = sorted[Math.floor(sorted.length / 2)];
  const baselineY = pad + (height - pad * 2) * (1 - (medianVal - min) / range);

  // sentiment 反转: 给 line 单独 stroke
  const strokeColor = invertSentiment ? 'var(--ink-700)' : 'var(--burgundy-500)';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="sparkline-svg"
      role="img"
      aria-label={ariaLabel ?? `sparkline of ${data.length} values, range ${Math.round(min)}-${Math.round(max)}`}
    >
      {showBaseline && (
        <line
          x1={pad}
          x2={width - pad}
          y1={baselineY}
          y2={baselineY}
          className="sparkline-baseline"
        />
      )}
      <path d={areaPath} className="sparkline-area" />
      <path
        d={linePath}
        className="sparkline-line"
        style={{ stroke: strokeColor }}
      />
      {showLastDot && (
        <circle
          cx={last.x}
          cy={last.y}
          r={2}
          className="sparkline-dot-last"
          style={{ fill: strokeColor }}
        />
      )}
    </svg>
  );
}

/**
 * Inline gauge — 0-N 评分条
 * 给 transparency 12 维评分用.
 */
interface GaugeProps {
  value: number;
  max?: number;
  /** 目标值 (画在 track 上的 tick) */
  target?: number;
  width?: number;
}

export function Gauge({ value, max = 10, target, width = 120 }: GaugeProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  const targetPct = target !== undefined ? Math.max(0, Math.min(1, target / max)) : null;
  return (
    <div className="gauge-track" style={{ width }}>
      <div className="gauge-fill" style={{ width: `${pct * 100}%` }} />
      {targetPct !== null && (
        <div
          className="gauge-tick-target"
          style={{ left: `${targetPct * 100}%` }}
          aria-label={`target ${target}`}
        />
      )}
    </div>
  );
}
