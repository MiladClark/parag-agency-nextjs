"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

// One continuous centre-weave thread (original geometry). Draw length is tied to
// the viewport vertical centre so the line grows *with* the reader:
//   hero centre-weave → node 1 → nodes 2–4 (connected) → centre-weave to footer.

const COLS = [0.5, 0.38, 0.6, 0.42, 0.58, 0.44, 0.54, 0.48, 0.5];

type Pt = { x: number; y: number };

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function smoothPath(pts: Pt[]): string {
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

/** Append cubic curves for pts[1…] — current pen position must be pts[0]. */
function appendSmooth(d: string, pts: Pt[]): string {
  if (pts.length < 2) return d;
  const seg = smoothPath(pts);
  const i = seg.indexOf(" C ");
  return i >= 0 ? d + seg.slice(i) : d;
}

/** Centre hook → straight rail through nodes → centre weave to footer. */
function buildRoute(w: number, h: number, startY: number, nodes: Pt[]): string {
  if (!nodes.length) {
    const span = h - startY;
    return smoothPath(COLS.map((c, i) => ({ x: c * w, y: startY + (i / (COLS.length - 1)) * span })));
  }

  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const gap = first.y - startY;
  const tailSpan = h - last.y;

  // Entry — lazy curve from centre, then align vertically before node 1 (no kink).
  const lead: Pt[] = [
    { x: w * 0.5, y: startY },
    { x: w * 0.52, y: startY + gap * 0.42 },
    { x: w * 0.52 + (first.x - w * 0.52) * 0.32, y: startY + gap * 0.76 },
    { x: first.x, y: first.y - 40 },
    first,
  ];

  let d = smoothPath(lead);

  // Node 2 → 4: straight vertical rail.
  for (let i = 1; i < nodes.length; i++) {
    d += ` L ${nodes[i].x.toFixed(1)} ${nodes[i].y.toFixed(1)}`;
  }

  // Exit — drop vertically off node 4, then lazy S back to centre weave.
  const dropY = last.y + Math.min(52, tailSpan * 0.07);
  const easeY = last.y + Math.min(130, tailSpan * 0.16);
  const departure: Pt[] = [
    last,
    { x: last.x, y: dropY },
    { x: last.x + (w * 0.5 - last.x) * 0.16, y: easeY },
    { x: w * 0.5, y: last.y + tailSpan * 0.26 },
    { x: w * 0.6, y: last.y + tailSpan * 0.52 },
    { x: w * 0.44, y: last.y + tailSpan * 0.76 },
    { x: w * 0.5, y: h },
  ];

  return appendSmooth(d, departure);
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<Metrics | null>(null);
  const [box, setBox] = useState<{ w: number; h: number; d: string } | null>(null);

  const { scrollY } = useScroll();
  const smoothY = useSpring(scrollY, { stiffness: 90, damping: 30, mass: 0.4 });

  const drawn = useTransform(smoothY, (sy) => {
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
      setBox({ w, h, d });
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
