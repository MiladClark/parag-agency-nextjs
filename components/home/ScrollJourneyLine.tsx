"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";

// A single thin brand-green thread, drawn as one continuous line that grows
// from a point (right under the hero scroll cue) and snakes all the way down
// the page in smooth S-curves, weaving past the sections.
//
// The path is authored in REAL pixel coordinates (viewBox === the wrapper's
// pixel size, 1:1) so the stroke-dash "draw on scroll" stays perfectly smooth
// and continuous — the earlier preserveAspectRatio="none" stretch was what made
// it look fragmented/dotted and warped the curves into steep diagonals.

// Horizontal weave (fraction of width) at evenly spaced vertical stops.
// Gentle, lazy swings around the centre — kept narrow so the Catmull-Rom
// spline reads as soft curves rather than sharp zig-zags.
const COLS = [0.5, 0.38, 0.6, 0.42, 0.58, 0.44, 0.54, 0.48, 0.5];

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function ScrollJourneyLine() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number; d: string } | null>(null);

  const { scrollYProgress } = useScroll();
  const drawn = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.4 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const parent = wrap?.parentElement;
    if (!wrap || !parent) return;

    const build = () => {
      const w = parent.clientWidth;
      const h = Math.max(parent.offsetHeight, parent.scrollHeight);
      if (!w || !h) return;

      // Begin right under the hero scroll cue (bottom of the first section).
      const hero = parent.querySelector("section");
      const heroH = hero ? (hero as HTMLElement).offsetHeight : window.innerHeight;
      const startY = Math.max(0, heroH - 56);

      // Thread the line through the journey-step nodes (their exact centres),
      // measured relative to the wrapper so it is scroll-invariant.
      const wrapRect = wrap.getBoundingClientRect();
      const nodes = Array.from(parent.querySelectorAll<HTMLElement>("[data-journey-node]"))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.left - wrapRect.left + r.width / 2, y: r.top - wrapRect.top + r.height / 2 };
        })
        .sort((a, b) => a.y - b.y);

      let pts: { x: number; y: number }[];

      if (nodes.length) {
        const first = nodes[0];
        const last = nodes[nodes.length - 1];

        // start → gentle ease-in → each node → ease back & weave to the bottom.
        const lead: { x: number; y: number }[] = [
          { x: w * 0.5, y: startY },
          { x: w * 0.52, y: startY + (first.y - startY) * 0.5 },
        ];
        const tailSpan = h - last.y;
        const tail = [
          { x: w * 0.5, y: last.y + tailSpan * 0.28 },
          { x: w * 0.6, y: last.y + tailSpan * 0.52 },
          { x: w * 0.44, y: last.y + tailSpan * 0.76 },
          { x: w * 0.5, y: h },
        ];
        pts = [...lead, ...nodes, ...tail];
      } else {
        const span = h - startY;
        pts = COLS.map((c, i) => ({ x: c * w, y: startY + (i / (COLS.length - 1)) * span }));
      }

      setBox({ w, h, d: smoothPath(pts) });
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(parent);
    window.addEventListener("resize", build);
    // content/fonts/images can shift height after first paint
    const t = setTimeout(build, 600);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", build);
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 hidden sm:block"
      style={{ zIndex: -1 }}
      aria-hidden
    >
      {box && (
        <svg className="h-full w-full" viewBox={`0 0 ${box.w} ${box.h}`} fill="none">
          <motion.path
            d={box.d}
            stroke="var(--accent)"
            strokeWidth={1}
            strokeOpacity={0.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pathLength: drawn }}
          />
        </svg>
      )}
    </div>
  );
}
