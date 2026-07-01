"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";

// One continuous background field behind the whole page. A scroll-driven
// "spotlight" glides down as you scroll, gently re-tinting each section so the
// ambiance shifts from top to bottom with no hard seams between sections.
export function AmbientBackground() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 24, mass: 0.5 });

  const spotY = useTransform(p, [0, 1], ["-10%", "100%"]);
  const spotColor = useTransform(
    p,
    [0, 0.5, 1],
    [
      "rgba(12,175,32,0.16)",
      "rgba(16,185,129,0.16)",
      "rgba(12,175,32,0.14)",
    ],
  );

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

      {/* ambient breathing glows */}
      <motion.div
        className="absolute left-1/2 top-[-6%] h-[46rem] w-[46rem] -translate-x-1/2 rounded-full bg-accent/12 blur-[170px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[10%] top-[18%] h-[40rem] w-[40rem] rounded-full bg-accent/10 blur-[160px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-[8%] top-[58%] h-[38rem] w-[38rem] rounded-full bg-emerald-500/10 blur-[150px]"
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* scroll-driven spotlight */}
      <motion.div
        style={{ top: spotY, background: spotColor }}
        className="absolute left-1/2 h-[70vh] w-[90vw] -translate-x-1/2 rounded-full blur-[150px]"
      />

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