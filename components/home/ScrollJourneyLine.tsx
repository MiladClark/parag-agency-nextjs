"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useLiteMotion } from "../../lib/useMediaQuery";
import { weavePath } from "../../lib/journeyGeometry";

// One continuous centre-weave thread (original geometry). Draw length is tied to
// the viewport vertical centre so the line grows *with* the reader:
//   hero centre-weave → node 1 → nodes 2–4 (connected) → centre-weave to footer.

const COLS = [0.5, 0.38, 0.6, 0.42, 0.58, 0.44, 0.54, 0.48, 0.5];

type Pt = { x: number; y: number };

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Broad continuous curves meet the pinned track with vertical, zero-curvature tangents. */
function buildRoute(w: number, h: number, startY: number, nodes: Pt[]): string {
  if (!nodes.length) {
    const span = h - startY;
    return weavePath(COLS.map((c, i) => ({ x: c * w, y: startY + (i / (COLS.length - 1)) * span })));
  }

  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const tailSpan = h - last.y;

  let d = weavePath([
    { x: w * 0.5, y: startY },
    first,
  ]);
  // This connector is clipped out; the pinned track supplies its visible geometry.
  d += ` L ${last.x.toFixed(3)} ${last.y.toFixed(3)}`;
  const departure: Pt[] = [
    last,
    { x: w * 0.5, y: last.y + tailSpan * 0.26 },
    { x: w * 0.6, y: last.y + tailSpan * 0.52 },
    { x: w * 0.44, y: last.y + tailSpan * 0.76 },
    { x: w * 0.5, y: h },
  ];

  const tail = weavePath(departure);
  return d + tail.slice(tail.indexOf(" C "));
}

function measurePath(d: string): number {
  if (typeof document === "undefined") return 1;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  return path.getTotalLength();
}

function pathLengthAtY(d: string, targetY: number, total: number): number {
  if (typeof document === "undefined") return total;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  let lo = 0;
  let hi = total;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).y < targetY) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

type Metrics = {
  h: number;
  wrapTop: number;
  startY: number;
  journeyStartY: number;
  journeyEndY: number;
  lenTotal: number;
  lenFirst: number;
  lenLast: number;
};

export function ScrollJourneyLine() {
  const clipId = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<Metrics | null>(null);
  const [box, setBox] = useState<{ w: number; h: number; d: string; entry: number; exit: number } | null>(null);
  // The line is `hidden sm:block`, but display:none only stops it painting —
  // the path measurement (getTotalLength plus a 28-step binary search per
  // node), the ResizeObserver and the scroll spring all still ran on phones for
  // something no one could see.
  const lite = useLiteMotion();

  const { scrollY } = useScroll();
  const drawn = useTransform(scrollY, (sy) => {
    const m = metricsRef.current;
    if (!m || m.lenTotal <= 0) return 0;

    const headY = sy + window.innerHeight * 0.5 - m.wrapTop;
    let len = 0;

    if (headY <= m.journeyStartY) {
      const span = m.journeyStartY - m.startY;
      if (span <= 1) len = headY >= m.journeyStartY ? m.lenFirst : 0;
      else len = clamp((headY - m.startY) / span, 0, 1) * m.lenFirst;
    } else if (headY <= m.journeyEndY) {
      const span = m.journeyEndY - m.journeyStartY;
      if (span <= 1) len = m.lenLast;
      else {
        const t = clamp((headY - m.journeyStartY) / span, 0, 1);
        len = m.lenFirst + t * (m.lenLast - m.lenFirst);
      }
    } else {
      const span = m.h - m.journeyEndY;
      if (span <= 1) len = m.lenTotal;
      else {
        const t = clamp((headY - m.journeyEndY) / span, 0, 1);
        len = m.lenLast + t * (m.lenTotal - m.lenLast);
      }
    }

    return clamp(len / m.lenTotal, 0, 1);
  });

  useEffect(() => {
    if (lite) return;
    const wrap = wrapRef.current;
    const parent = wrap?.parentElement;
    if (!wrap || !parent) return;

    const build = () => {
      const w = parent.clientWidth;
      const h = Math.max(parent.offsetHeight, parent.scrollHeight);
      if (!w || !h) return;

      const hero = parent.querySelector("section");
      const heroH = hero ? (hero as HTMLElement).offsetHeight : window.innerHeight;
      const startY = Math.max(0, heroH - 56);

      const wrapRect = wrap.getBoundingClientRect();
      const wrapTop = wrapRect.top + window.scrollY;

      const nodes: Pt[] = Array.from(parent.querySelectorAll<HTMLElement>("[data-journey-node]"))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.left - wrapRect.left + r.width / 2, y: r.top - wrapRect.top + r.height / 2 };
        })
        .sort((a, b) => a.y - b.y);

      const d = buildRoute(w, h, startY, nodes);
      const lenTotal = measurePath(d);
      const journeyStartY = nodes[0]?.y ?? h;
      const journeyEndY = nodes[nodes.length - 1]?.y ?? h;

      metricsRef.current = {
        h,
        wrapTop,
        startY,
        journeyStartY,
        journeyEndY,
        lenTotal,
        lenFirst: nodes.length ? pathLengthAtY(d, journeyStartY, lenTotal) : lenTotal,
        lenLast: nodes.length ? pathLengthAtY(d, journeyEndY, lenTotal) : lenTotal,
      };
      setBox({ w, h, d, entry: journeyStartY, exit: journeyEndY });
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(parent);
    window.addEventListener("resize", build);
    const t = setTimeout(build, 600);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", build);
      clearTimeout(t);
    };
  }, [lite]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 hidden sm:block"
      style={{ zIndex: -1 }}
      aria-hidden
    >
      {box && !lite && (
        <svg className="h-full w-full" viewBox={`0 0 ${box.w} ${box.h}`} fill="none">
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <rect width={box.w} height={box.entry} />
              <rect y={box.exit} width={box.w} height={Math.max(0, box.h - box.exit)} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
          <motion.path
            d={box.d}
            stroke="var(--accent)"
            strokeWidth={1}
            strokeOpacity={0.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pathLength: drawn }}
          />
          </g>
        </svg>
      )}
    </div>
  );
}
