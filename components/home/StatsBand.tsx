"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { heroStats, type HeroStat } from "../../content/data/home";
import { Section, Eyebrow } from "../ui/Section";
import { toPersianDigits } from "../../lib/format";

export function StatsBand() {
  return (
    <Section>
      <div className="mb-16 flex flex-col items-center gap-4 text-center">
        <Eyebrow>چرا پاراگ</Eyebrow>
        <h2 className="text-3xl font-bold text-text sm:text-4xl lg:text-5xl">
          نتیجه‌ای که قابل اندازه‌گیری است
        </h2>
      </div>

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
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const [display, setDisplay] = useState(0);
  const delay = index * 0.12;

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, stat.value, {
      duration: 1.6,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, stat.value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center gap-3 px-4 py-8 text-center"
    >
      <div
        className="pointer-events-none absolute inset-x-6 top-1/2 -z-10 h-24 -translate-y-1/2 rounded-full bg-accent/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <span className="bg-gradient-to-b from-text via-accent to-accent-hover bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl lg:text-7xl">
        {stat.prefix ?? ""}
        {toPersianDigits(display)}
        {stat.suffix ?? ""}
      </span>
      <span className="text-sm text-text-muted">{stat.label}</span>
    </motion.div>
  );
}