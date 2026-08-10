"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import type { HeroStat } from "../../content/data/home";
import { toPersianDigits } from "../../lib/format";

const EASE = [0.16, 1, 0.3, 1] as const;

export function AboutStats({ title, items }: { title: string; items: HeroStat[] }) {
  const reduce = useReducedMotion();

  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center text-3xl font-black text-text sm:text-4xl"
        >
          {title}
        </motion.h2>

        <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {items.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} reduce={!!reduce} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  stat,
  index,
  reduce,
}: {
  stat: HeroStat;
  index: number;
  reduce: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState(0);
  const delay = index * 0.1;

  useEffect(() => {
    if (!inView || reduce) {
      if (reduce) setDisplay(stat.value);
      return;
    }
    const controls = animate(0, stat.value, {
      duration: 1.5,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, stat.value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className="group relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-panel/70 px-4 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      <div
        className="pointer-events-none absolute inset-x-6 top-1/2 h-20 -translate-y-1/2 rounded-full bg-accent/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <p className="relative bg-linear-to-b from-text via-accent to-accent-hover bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
        {stat.prefix ?? ""}
        {toPersianDigits(display)}
        {stat.suffix ?? ""}
      </p>
      <p className="relative mt-2 text-xs text-text-muted sm:text-sm">{stat.label}</p>
    </motion.div>
  );
}
