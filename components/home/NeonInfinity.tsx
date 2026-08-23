"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLiteMotion } from "../../lib/useMediaQuery";

const CX = 400;
const CY = 200;
const A = 320;

// Math.sin/Math.cos can differ in their last bit between Node's libm (SSR) and
// a browser's V8 build (client), which produces a hydration mismatch for any
// numeric SVG attribute derived from them. Rounding here keeps server and
// client output byte-identical.
const round = (n: number, p = 4) => Math.round(n * 10 ** p) / 10 ** p;

function point(t: number, a: number, yScale: number) {
  const denom = 1 + Math.sin(t) ** 2;
  return {
    x: round(CX + (a * Math.cos(t)) / denom),
    y: round(CY + (a * Math.sin(t) * Math.cos(t) * yScale) / denom),
  };
}

function lemniscate(a: number, yScale: number, steps = 240): string {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const { x, y } = point((i / steps) * Math.PI * 2, a, yScale);
    d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1) + " ";
  }
  return d + "Z";
}

function pathLength(a: number, yScale: number, steps = 600) {
  let len = 0;
  let prev = point(0, a, yScale);
  for (let i = 1; i <= steps; i++) {
    const p = point((i / steps) * Math.PI * 2, a, yScale);
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return round(len);
}

// Theme-aware palettes. Dark = luminous whites/light greens (glows on black).
// Light = deeper saturated greens so the figure reads on a bright background.
type Palette = {
  strands: string[];
  strandDark: string[];
  crisp: string;
  particles: string[];
  lines: string[];
  flare: string[];
  halo: string;
};

const PALETTES: Record<"dark" | "light", Palette> = {
  dark: {
    strands: ["#0caf20", "#16c92e", "#2ee36b", "#5bf2a0", "#9af7c8", "#d8fff0", "#ffffff", "#5ce0d0"],
    strandDark: ["#1f7a38", "#0a3d1a"],
    crisp: "#eafff4",
    particles: ["#ffffff", "#d8fff0", "#9af7c8", "#5bf2a0", "#2ee36b", "#16c92e"],
    lines: ["#eafff4", "#9af7c8", "#5bf2a0"],
    flare: ["#3dff87", "#65ffab", "#dffff2", "#ffffff"],
    halo: "#0caf20",
  },
  light: {
    strands: ["#0caf20", "#0a9c1c", "#16a34a", "#15803d", "#22c55e", "#047857", "#10b981", "#0e7a2a"],
    strandDark: ["#064e3b", "#08351f"],
    crisp: "#0c8f22",
    particles: ["#0a8f1e", "#0caf20", "#16a34a", "#15803d", "#22c55e", "#047857"],
    lines: ["#0a8f1e", "#16a34a", "#15803d"],
    flare: ["#34d058", "#22c55e", "#16a34a", "#0a8f1e"],
    halo: "#0a9c1c",
  },
};

function useThemeId(): "dark" | "light" {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

const seeded = (n: number) => Math.abs(Math.sin(n * 43.7587)) % 1;

/* ---------------------------------------------------------------------------
   Geometry, colour ROLES and TIMING, all resolved once at module scope.

   Timing rides out as `--nf-*` custom properties consumed by the keyframes in
   globals.css. Nothing below re-renders: after the first paint React never
   touches these nodes again and the browser samples every loop natively, where
   the previous version recomputed and rewrote 124 attributes per frame from a
   rAF callback on the main thread.
--------------------------------------------------------------------------- */

const timing = (dur: number, delay = 0) =>
  ({ "--nf-dur": `${round(dur, 3)}s`, "--nf-delay": `${round(delay, 3)}s` }) as CSSProperties;

const STRANDS = Array.from({ length: 26 }).map((_, i) => {
  const a = A + Math.sin(i * 1.7) * 26;
  const yScale = 0.8 + Math.cos(i * 0.9) * 0.2;
  const isDark = i % 9 === 4 || i % 9 === 8;
  const isCrisp = i % 7 === 3;
  return {
    d: lemniscate(a, yScale),
    rotate: Math.sin(i * 2.3) * 4,
    width: isDark ? 1.4 : isCrisp ? 0.9 : 0.7 + (i % 5) * 0.42,
    kind: isDark ? "dark" : isCrisp ? "crisp" : "normal",
    ci: i % 8,
    di: i % 2,
    opacity: isDark ? 0.5 : 0.4 + (i % 4) * 0.16,
    dash: `${2 + (i % 3) * 2} ${28 + (i % 6) * 16}`,
    // Odd strands travelled to +320 rather than -320; that sign is the only
    // thing separating the two strand keyframes.
    reverse: i % 2 !== 0,
    style: timing(7 + (i % 7) * 1.5, (i % 5) * 0.4),
  };
});

const PARTICLES = (() => {
  const arr: { x: number; y: number; r: number; ci: number; style: CSSProperties }[] = [];
  const make = (t: number, seed: number) => {
    const { x, y } = point(t, A, 0.92);
    const r1 = seeded(seed);
    arr.push({
      x,
      y,
      r: round(0.8 + r1 * 1.9),
      ci: seed % 6,
      style: {
        ...timing(2 + r1 * 2.6, seeded(seed * 1.7) * 2.5),
        transformOrigin: `${x}px ${y}px`,
      },
    });
  };
  const N = 56;
  for (let i = 0; i < N; i++) make((i / N) * Math.PI * 2, i + 1);
  const M = 26;
  for (let i = 0; i < M; i++) {
    const base = i % 2 === 0 ? Math.PI / 2 : (3 * Math.PI) / 2;
    make(base + (seeded(i * 9.3) - 0.5) * 0.7, 200 + i);
  }
  return arr;
})();

const HALO = lemniscate(A + 5, 0.92);

const LINES = [
  { id: "infGuide", d: lemniscate(A, 0.92), rotate: 0, ci: 0, width: 1.1, opacity: 0.85 },
  { id: "infLine2", d: lemniscate(A - 12, 1.0), rotate: 2.5, ci: 1, width: 0.9, opacity: 0.6 },
  { id: "infLine3", d: lemniscate(A + 10, 0.84), rotate: -2.5, ci: 2, width: 0.9, opacity: 0.55 },
];

const ROTATE = -45;
const GUIDE_LEN = pathLength(A, 0.92);

const PATH_FLARE = [
  { ci: 0, width: 5.1, seg: 42, opacity: 0.1 },
  { ci: 1, width: 3.5, seg: 24, opacity: 0.22 },
  { ci: 2, width: 2.1, seg: 12, opacity: 0.72 },
  { ci: 3, width: 1.2, seg: 5.5, opacity: 1 },
];

const PULSE_PATHS = [
  { d: LINES[0].d, phase: 0, dur: 5.4 },
  { d: LINES[1].d, phase: -GUIDE_LEN * 0.33, dur: 6.7 },
  { d: LINES[2].d, phase: -GUIDE_LEN * 0.66, dur: 8.1 },
];

// One flat list of comet strokes: three pulses x four flare layers. Every layer
// starts at its own dash offset and travels exactly GUIDE_LEN, so from/to ride
// along as custom properties instead of forcing twelve keyframe blocks.
const COMETS = PULSE_PATHS.flatMap((pulse, pi) =>
  PATH_FLARE.map((f, fi) => {
    const from = round(f.seg * 0.5 + pulse.phase, 2);
    return {
      key: `${pi}-${fi}`,
      pulse: pi,
      d: pulse.d,
      ci: f.ci,
      width: f.width,
      opacity: f.opacity,
      dash: `${f.seg} ${GUIDE_LEN}`,
      style: {
        "--nf-dur": `${pulse.dur}s`,
        "--nf-from": `${from}`,
        "--nf-to": `${round(from - GUIDE_LEN, 2)}`,
      } as CSSProperties,
    };
  }),
);

/* ---------------------------------------------------------------------------
   Lite variant (phones + prefers-reduced-motion).

   Desktop renders the full figure. Profiling the homepage put the complete
   124-node version at 0.4ms per frame — the frame budget was going to the
   ambient background's blurs, not to this — so there is nothing to gain by
   thinning it on machines running the desktop layout.

   Phones are a different story: same node count, a quarter of the screen, and a
   GPU that has to draw it anyway. Subsets are sampled at an even stride rather
   than sliced off the front, so the strands stay evenly distributed around the
   lemniscate and the silhouette reads the same. The three LINES always render —
   they're static, cheap, and they're what actually carries the infinity shape.
--------------------------------------------------------------------------- */
const everyNth = <T,>(arr: T[], count: number): T[] =>
  Array.from({ length: count }, (_, i) => arr[Math.round((i * arr.length) / count)]).filter(Boolean);

const STRANDS_LITE = everyNth(STRANDS, 8);
const PARTICLES_LITE = everyNth(PARTICLES, 12);
const COMETS_LITE = COMETS.filter((c) => c.pulse === 0);

/**
 * Off-screen the figure still keeps its filter regions in the compositing tree
 * and goes on re-rasterising for the whole rest of the page. `rootMargin`
 * restarts the loops slightly before the hero scrolls back in, so the resume is
 * never visible.
 */
function useIdleWhenOffscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => el.classList.toggle("neon-idle", !entry.isIntersecting),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function NeonInfinity() {
  const theme = useThemeId();
  const lite = useLiteMotion();
  const root = useIdleWhenOffscreen<HTMLDivElement>();
  const C = PALETTES[theme];
  const haloAlpha = theme === "light" ? 0.12 : 0.14;

  const strands = lite ? STRANDS_LITE : STRANDS;
  const particles = lite ? PARTICLES_LITE : PARTICLES;
  const comets = lite ? COMETS_LITE : COMETS;

  return (
    <div ref={root} className="relative flex w-full items-center justify-center">
      <div
        className="pointer-events-none absolute h-68 w-86 rounded-full blur-[70px] sm:blur-[100px]"
        style={{ background: `rgba(12,175,32,${haloAlpha + 0.04})` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-14 h-16 w-70 rounded-[100%] blur-xl sm:blur-2xl"
        style={{ background: `rgba(12,175,32,${haloAlpha})` }}
        aria-hidden
      />

      {/* Entrance (one-shot) and breathing (infinite) both drive `transform`, so
          they sit on separate elements instead of fighting over one. Tailwind's
          `scale-110` uses the standalone `scale` property and composes with
          both. */}
      <div className="neon-enter w-full max-w-3xl lg:scale-110">
        {/* Keep this class list a plain literal. Tailwind scans source text for
            candidates, so building it with a template literal hid
            `overflow-visible` behind `${`, the utility stopped being generated,
            and the SVG fell back to the UA stylesheet's `svg { overflow:
            hidden }` — which clipped the top and bottom off the figure. The
            breathing is gated in CSS instead of here for the same reason. */}
        <svg viewBox="0 0 800 400" className="w-full overflow-visible neon-breathe" aria-hidden>
          <defs>
            {/* Filter regions are sized to ~3 sigma of their own blur plus slack
                rather than to the round percentages they started as. The region
                is the surface convolved and composited every frame, so a
                500%x500% box around a 1.4 blur was rasterising roughly 24x the
                pixels the effect can physically reach. Group bounding boxes here
                measure about 700x260 user units. */}
            <filter id="neonGlow" x="-3%" y="-6%" width="106%" height="112%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="neonGlowSoft" x="-7%" y="-20%" width="114%" height="140%">
              <feGaussianBlur stdDeviation="10" />
            </filter>

            <filter id="particleGlow" x="-3%" y="-6%" width="106%" height="112%">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
            {/* Three stacked blurs give the comet its layered falloff on desktop.
                On lite that's three full-surface convolutions per frame for an
                effect nobody can resolve on a phone — one blur suffices. */}
            {lite ? (
              <filter id="cometGlow" x="-5%" y="-10%" width="110%" height="120%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ) : (
              <filter id="cometGlow" x="-5%" y="-10%" width="110%" height="120%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4.4" result="shadowOuter" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.1" result="shadowMid" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="coreSoft" />
                <feMerge>
                  <feMergeNode in="shadowOuter" />
                  <feMergeNode in="shadowMid" />
                  <feMergeNode in="coreSoft" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>

          <g transform={`rotate(${ROTATE} ${CX} ${CY})`}>
            <path d={HALO} fill="none" stroke={C.halo} strokeWidth="18" opacity="0.22" filter="url(#neonGlowSoft)" />

            <g filter="url(#neonGlow)">
              {strands.map((s, i) => (
                <path
                  key={i}
                  className={`neon-strand${s.reverse ? " neon-strand-rev" : ""}`}
                  style={s.style}
                  d={s.d}
                  fill="none"
                  stroke={s.kind === "dark" ? C.strandDark[s.di] : s.kind === "crisp" ? C.crisp : C.strands[s.ci]}
                  strokeWidth={s.width}
                  strokeLinecap="round"
                  strokeDasharray={s.dash}
                  opacity={s.opacity}
                  transform={`rotate(${s.rotate} ${CX} ${CY})`}
                />
              ))}
            </g>

            <g filter="url(#particleGlow)">
              {particles.map((p, i) => (
                <circle
                  key={i}
                  className="neon-particle"
                  style={p.style}
                  cx={p.x}
                  cy={p.y}
                  r={p.r}
                  fill={C.particles[p.ci]}
                />
              ))}
            </g>

            <g filter="url(#neonGlow)">
              {LINES.map((l) => (
                <path
                  key={l.id}
                  id={l.id}
                  d={l.d}
                  fill="none"
                  stroke={C.lines[l.ci]}
                  strokeWidth={l.width}
                  strokeLinecap="round"
                  opacity={l.opacity}
                  transform={`rotate(${l.rotate} ${CX} ${CY})`}
                />
              ))}
            </g>

            <g filter="url(#cometGlow)">
              {comets.map((c) => (
                <path
                  key={c.key}
                  className="neon-comet"
                  style={c.style}
                  d={c.d}
                  fill="none"
                  stroke={C.flare[c.ci]}
                  strokeWidth={c.width}
                  strokeLinecap="round"
                  opacity={c.opacity}
                  strokeDasharray={c.dash}
                />
              ))}
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
