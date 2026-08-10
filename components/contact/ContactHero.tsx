"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ContactHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-28 pb-10 sm:pt-32 sm:pb-14">
      <div
        className="pointer-events-none absolute -top-32 start-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-accent/12 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-24 end-[-8%] h-64 w-64 rounded-full bg-accent/[0.07] blur-[100px]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl lg:max-w-3xl">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="text-4xl font-black leading-[1.15] tracking-tight text-text sm:text-5xl lg:text-6xl"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
              className="mt-5 max-w-xl text-base leading-8 text-text-muted sm:text-lg"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
