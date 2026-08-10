"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CaseResults({
  results,
  stack,
}: {
  results: { value: string; label: string }[];
  stack: string[];
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-3 py-6 sm:px-5 sm:py-10">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-border/70 bg-surface/90 px-5 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_30px_80px_-30px_rgba(0,0,0,0.55)] sm:px-8 sm:py-14">
        <div
          className="pointer-events-none absolute -top-32 start-1/3 h-72 w-72 rounded-full bg-accent/12 blur-[110px]"
          aria-hidden
        />

        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
          className="relative text-3xl font-black text-text sm:text-4xl"
        >
          نتیجه و تکنولوژی
        </motion.h2>

        <div className="relative mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {results.map((r, i) => (
            <motion.div
              key={r.label}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              className="rounded-[1.5rem] border border-border/70 bg-panel/70 px-4 py-7 text-center"
            >
              <p className="bg-linear-to-b from-text via-accent to-accent-hover bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                {r.value}
              </p>
              <p className="mt-2 text-xs text-text-muted sm:text-sm">{r.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="relative mt-10">
          <p className="text-sm font-bold text-text-muted">استک فنی</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {stack.map((item) => (
              <li
                key={item}
                className="rounded-full border border-border/80 bg-panel/80 px-3.5 py-1.5 text-xs font-bold text-text"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
