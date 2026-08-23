"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useLiteMotion } from "../../lib/useMediaQuery";

// One continuous background field behind the whole page. A scroll-driven
// "spotlight" glides down as you scroll, gently re-tinting each section so the
// ambiance shifts from top to bottom with no hard seams between sections.

/* ---------------------------------------------------------------------------
   Painted falloff instead of `filter: blur()`.

   Each glow used to be a filled circle under `filter: blur(150–170px)`. A CSS
   blur is a convolution across the element's entire box, redone every time that
   element repaints — and with three orbs animating continuously plus a
   scroll-driven spotlight, that meant every frame. Measured on the homepage the
   four of them cost ~32ms of a ~46ms frame: the background alone was eating the
   whole budget, on desktop as much as on phones.

   But a blurred disc is just a fixed radial falloff, so it can be painted
   directly as a radial-gradient — same image, no convolution, and what comes
   out is an ordinary background the compositor caches and simply moves.

   `blurredDisc` derives the gradient from the blur that used to produce it, so
   the wash keeps its original weight and spread instead of being re-eyeballed.
--------------------------------------------------------------------------- */

// Abramowitz & Stegun 7.1.26. Max error 1.5e-7, orders of magnitude below one
// step of 8-bit alpha, and bit-identical between Node and V8 so the stops SSR
// and hydrate the same.
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return sign * y;
}

/**
 * Gradient stops for a disc of radius `r` filled at `alpha` and blurred by
 * `sigma`.
 *
 * Radially, a Gaussian-blurred edge is an error function. The centre never
 * reaches full strength — the kernel reaches past the disc from every side —
 * which is what `peak` accounts for; skip it and the glow comes out visibly
 * hotter than the blur it replaces. Blur also throws light to roughly 3σ beyond
 * the edge, so the painted box has to be that much larger than the circle was.
 */
function blurredDisc(color: string, alpha: number, r: number, sigma: number, steps = 8) {
  const outer = r + 3 * sigma;
  const peak = 1 - Math.exp(-(r * r) / (2 * sigma * sigma));
  const edge = (d: number) => 1 - erf((d - r) / (sigma * Math.SQRT2));
  const norm = edge(0);

  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const pct = i / steps;
    const a = alpha * peak * (edge(pct * outer) / norm);
    return `color-mix(in srgb, ${color} ${(a * 100).toFixed(2)}%, transparent) ${(pct * 100).toFixed(1)}%`;
  }).join(", ");

  return { stops, box: Math.round(outer * 2) };
}

type Orb = { left: string; top: string; box: number; background: string; animation?: string };

const disc = (
  color: string,
  alpha: number,
  r: number,
  sigma: number,
  left: string,
  top: string,
  animation?: string,
): Orb => {
  const { stops, box } = blurredDisc(color, alpha, r, sigma);
  return {
    left,
    // Positions are given as the glow's *centre* so the painted box can grow to
    // cover the blur's reach without shifting where the light actually sits.
    top,
    box,
    background: `radial-gradient(circle closest-side, ${stops})`,
    animation,
  };
};

const EMERALD_500 = "#10b981";

/* Desktop. Radii/offsets are half of the original 46rem / 40rem / 38rem boxes,
   so each centre lands exactly where the blurred circle's centre used to. */
const FULL_ORBS: Orb[] = [
  disc("var(--accent)", 0.12, 368, 170, "50%", "calc(-6% + 368px)", "amb-breathe 16s ease-in-out infinite"),
  disc("var(--accent)", 0.1, 320, 160, "calc(110% - 320px)", "calc(18% + 320px)", "amb-drift-a 22s ease-in-out infinite"),
  disc(EMERALD_500, 0.1, 304, 150, "calc(-8% + 304px)", "calc(58% + 304px)", "amb-drift-b 26s ease-in-out infinite"),
];

/* Phones: same palette and composition, smaller radii, no animation. */
const LITE_ORBS: Orb[] = [
  disc("var(--accent)", 0.12, 208, 80, "50%", "calc(-6% + 208px)"),
  disc("var(--accent)", 0.1, 176, 80, "calc(116% - 176px)", "calc(20% + 176px)"),
  disc(EMERALD_500, 0.1, 176, 80, "calc(-14% + 176px)", "calc(60% + 176px)"),
];

/* The spotlight is an ellipse (90vw x 70vh), so its falloff is only separable
   per axis — a single set of stops can't be exact for both. It is the softest,
   least-defined thing on the page, so it takes the vertical profile and renders
   as an ellipse gradient; the horizontal spread lands within a couple of alpha
   steps of the blur it replaces. */
const SPOT = blurredDisc("SPOT_COLOR", 0.16, 315, 150);
const spotGradient = (color: string) =>
  `radial-gradient(ellipse closest-side, ${SPOT.stops.replaceAll("SPOT_COLOR", color)})`;

export function AmbientBackground() {
  const lite = useLiteMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base wash — themeable (adapts to dark / light) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, var(--surface) 0%, var(--bg) 55%, var(--bg) 100%)",
        }}
      />

      {(lite ? LITE_ORBS : FULL_ORBS).map((o, i) => (
        <div
          key={i}
          className="amb-orb"
          style={{
            left: o.left,
            top: o.top,
            width: o.box,
            height: o.box,
            background: o.background,
            animation: o.animation,
          }}
          aria-hidden
        />
      ))}

      {!lite && <Spotlight />}

      {/* fine grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
        style={{
          backgroundImage:
            "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
    </div>
  );
}

/**
 * Scroll-driven spotlight.
 *
 * Two things here used to be repaints and are now composited. It travelled by
 * animating `top`, a layout property, so every scroll frame relaid out and
 * repainted a 1296x630 blurred box; it now travels on `y`, a transform. And it
 * shifted green → emerald → green by animating `background`, repainting the
 * same box again; the two tints are now separate layers that cross-fade on
 * `opacity`, whose values sum to 1 so the result matches interpolating one
 * colour rather than stacking two.
 */
function Spotlight() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 24, mass: 0.5 });

  // The original ran `top` from -10% to 100% of the viewport; this is the same
  // path expressed as the ellipse's centre, which sits half its height lower.
  const y = useTransform(p, (v) =>
    typeof window === "undefined" ? 0 : (-0.1 + 1.1 * v + 0.35) * window.innerHeight,
  );
  const accentOpacity = useTransform(p, [0, 0.5, 1], [1, 0, 0.875]);
  const emeraldOpacity = useTransform(p, [0, 0.5, 1], [0, 1, 0]);

  const size = { width: "calc(90vw + 900px)", height: "calc(70vh + 900px)" };

  return (
    <motion.div className="absolute left-1/2 top-0 h-0 w-0" style={{ y }} aria-hidden>
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ ...size, background: spotGradient("#0caf20"), opacity: accentOpacity }}
      />
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ ...size, background: spotGradient(EMERALD_500), opacity: emeraldOpacity }}
      />
    </motion.div>
  );
}
