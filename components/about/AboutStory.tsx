"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function AboutStory({
  title,
  paragraphs,
  highlights,
}: {
  title: string;
  paragraphs: string[];
  highlights: { label: string; value: string }[];
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-3 pb-10 sm:px-5 sm:pb-14">
      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[2.5rem] border border-border/70 bg-surface/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_30px_80px_-30px_rgba(0,0,0,0.55)] lg:grid-cols-[1.05fr_1fr]">
        <div className="relative min-h-[18rem] overflow-hidden lg:min-h-[28rem]">
          <Image
            src="/about-story-visual.png"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority={false}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-surface via-surface/20 to-transparent lg:bg-linear-to-l"
            aria-hidden
          />
        </div>

        <div className="relative flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-10">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-2xl font-black leading-snug text-text sm:text-3xl"
          >
            {title}
          </motion.h2>
          <div className="flex flex-col gap-4">
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.06 * (i + 1), ease: EASE }}
                className="text-sm leading-8 text-text-muted sm:text-base"
              >
                {p}
              </motion.p>
            ))}
          </div>

          <ul className="mt-2 grid gap-3 sm:grid-cols-3">
            {highlights.map((h, i) => (
              <motion.li
                key={h.label}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease: EASE }}
                className="rounded-2xl border border-border/70 bg-panel/70 px-3.5 py-3"
              >
                <p className="text-[11px] text-text-muted">{h.label}</p>
                <p className="mt-1 text-sm font-bold text-text">{h.value}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
