import { SIFR_BITS } from '../lib/cipher';

interface SifrMarkProps {
  size?: number;
  className?: string;
  shift?: number;
}

function polar(r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [r * Math.cos(rad), r * Math.sin(rad)];
}

function buildCellPath(r0: number, r1: number, a0: number, a1: number): string {
  const [px, py] = polar(r1, a0);
  const [qx, qy] = polar(r1, a1);
  const [sx, sy] = polar(r0, a1);
  const [tx, ty] = polar(r0, a0);
  return `M${px.toFixed(2)} ${py.toFixed(2)}A${r1} ${r1} 0 0 1 ${qx.toFixed(2)} ${qy.toFixed(2)}L${sx.toFixed(2)} ${sy.toFixed(2)}A${r0} ${r0} 0 0 0 ${tx.toFixed(2)} ${ty.toFixed(2)}Z`;
}

export function SifrMark({ size = 28, className = '', shift = 0 }: SifrMarkProps) {
  const isCompact = size < 64 && size > 24;
  const isMicro = size <= 24;

  if (isMicro) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="-104 -104 208 208"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <circle cx="0" cy="0" r="84" stroke="#f3f7fe" strokeWidth="14" />
        <path d={buildCellPath(72, 100, -98, -82)} fill="#eab444" />
        <circle cx="0" cy="0" r="16" fill="#eab444" />
      </svg>
    );
  }

  const gap = isCompact ? 1.6 : 1.0;
  const thin = isCompact ? 16 : 10;
  const thick = 26;

  return (
    <svg
      width={size}
      height={size}
      viewBox="-104 -104 208 208"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g
        style={{
          transform: `rotate(${-shift * 15}deg)`,
          transformOrigin: '0px 0px',
          transition: 'transform 100ms steps(1, end)',
        }}
      >
        {SIFR_BITS.map((bit, i) => {
          const centerAngle = -90 + i * 15;
          const r1 = 75 + (bit === 1 ? thick : thin);
          const d = buildCellPath(75, r1, centerAngle - 7.5 + gap, centerAngle + 7.5 - gap);
          return (
            <path
              key={i}
              d={d}
              fill={i === 0 ? '#eab444' : '#f3f7fe'}
            />
          );
        })}
      </g>
      <circle cx="0" cy="0" r={isCompact ? 15 : 13} fill="#eab444" />
    </svg>
  );
}
