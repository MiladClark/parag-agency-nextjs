"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { heroStats, type HeroStat } from "../../content/data/home";
import { Section } from "../ui/Section";
import { SectionIntro } from "../ui/SectionIntro";
import { toPersianDigits } from "../../lib/format";

export function StatsBand() {
  return (
    <Section>
      <SectionIntro
        className="mb-14 sm:mb-16"
        title="نتیجه‌ای که"
        accent="قابل اندازه‌گیری است"
        body="اعداد واقعی از مسیرهایی که با برندها ساختیم."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4">
        {heroStats.map((stat, i) => (
          <Figure key={stat.label} stat={stat} index={i} />
        ))}
      </div>
    </Section>
  );
}

function Figure({ stat, index }: { stat: HeroStat; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const [display, setDisplay] = useState(0);
  const delay = index * 0.12;

  useEffect(() => {
    if (!inView) return;
    // Count-up is the point of the section, so reduced motion still lands on
    // the real figure — it just arrives immediately instead of ticking.
    if (reduce) {
      setDisplay(stat.value);
      return;
    }
    const controls = animate(0, stat.value, {
      duration: 1.6,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, stat.value, delay, reduce]);

  return (
    <motion.div
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: reduce ? 0.3 : 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center gap-2 px-2 py-6 text-center sm:gap-3 sm:px-4 sm:py-8"
    >
      <div
        className="pointer-events-none absolute inset-x-6 top-1/2 -z-10 h-24 -translate-y-1/2 rounded-full bg-accent/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <span className="bg-gradient-to-b from-text via-accent to-accent-hover bg-clip-text text-4xl font-extrabold text-transparent sm:text-6xl lg:text-7xl">
        {stat.prefix ?? ""}
        {toPersianDigits(display)}
        {stat.suffix ?? ""}
      </span>
      <span className="text-xs text-text-muted sm:text-sm">{stat.label}</span>
    </motion.div>
  );
}