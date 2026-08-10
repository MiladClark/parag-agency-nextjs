"use client";

/** Soft green energy mesh behind portfolio stages — decorative SVG only. */
export function PortfolioVectorField({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 1200 800"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="pf-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
          <stop offset="45%" stopColor="var(--accent)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--accent-hover)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="pf-glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="900" cy="220" rx="280" ry="180" fill="url(#pf-glow)" />

      {/* Perspective grid */}
      {Array.from({ length: 8 }).map((_, i) => {
        const y = 420 + i * 42;
        const inset = i * 28;
        return (
          <path
            key={`h-${i}`}
            d={`M ${80 + inset} ${y} L ${1120 - inset} ${y}`}
            stroke="url(#pf-line)"
            strokeWidth="1"
            opacity={0.35 - i * 0.03}
          />
        );
      })}
      {Array.from({ length: 9 }).map((_, i) => {
        const t = i / 8;
        const xTop = 200 + t * 800;
        const xBot = 40 + t * 1120;
        return (
          <path
            key={`v-${i}`}
            d={`M ${xTop} 400 L ${xBot} 760`}
            stroke="var(--accent)"
            strokeOpacity={0.12}
            strokeWidth="1"
          />
        );
      })}

      {/* Orbit arcs */}
      <path
        d="M120 180 C 360 40, 640 40, 980 200"
        stroke="url(#pf-line)"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <path
        d="M160 260 C 400 120, 700 100, 1040 280"
        stroke="var(--accent)"
        strokeOpacity="0.2"
        strokeWidth="1"
        strokeDasharray="6 10"
      />
      <circle cx="980" cy="200" r="4" fill="var(--accent)" opacity="0.8" />
      <circle cx="160" cy="260" r="3" fill="var(--accent-hover)" opacity="0.6" />
    </svg>
  );
}
