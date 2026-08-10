"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/** Single scroll-drawn SVG rail between case sections. */
export function CaseVectorRail() {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="relative mx-auto h-24 w-full max-w-6xl px-5 sm:h-28 sm:px-8" aria-hidden>
      <svg className="h-full w-full" viewBox="0 0 1100 120" fill="none" preserveAspectRatio="none">
        <path
          d="M40 60 C 220 10, 380 110, 560 50 S 900 20, 1060 70"
          stroke="var(--border)"
          strokeWidth="1.5"
          strokeOpacity="0.55"
        />
        <motion.path
          d="M40 60 C 220 10, 380 110, 560 50 S 900 20, 1060 70"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          style={reduce ? { pathLength: 1 } : { pathLength }}
        />
        <circle cx="560" cy="50" r="4" fill="var(--accent)" opacity="0.85" />
      </svg>
    </div>
  );
}
