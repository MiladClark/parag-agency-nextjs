"use client";

import { motion, useReducedMotion } from "motion/react";
import { Icon } from "../ui/Icon";
import type { JourneyStep } from "../../content/data/home";

const EASE = [0.16, 1, 0.3, 1] as const;

export function AboutApproach({
  title,
  body,
  steps,
}: {
  title: string;
  body: string;
  steps: JourneyStep[];
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-3 py-6 sm:px-5 sm:py-10">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-border/70 bg-panel/50 px-5 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:px-8 sm:py-14">
        <div
          className="pointer-events-none absolute -top-32 start-1/4 h-64 w-64 rounded-full bg-accent/10 blur-[100px]"
          aria-hidden
        />

        <div className="relative max-w-2xl">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE }}
            className="text-3xl font-black text-text sm:text-4xl"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
            className="mt-3 text-sm leading-7 text-text-muted sm:text-base"
          >
            {body}
          </motion.p>
        </div>

        <ol className="relative mt-10 grid gap-4 md:grid-cols-2">
          {steps.map((step, i) => (
            <motion.li
              key={step.index}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              className="relative flex gap-4 rounded-[1.5rem] border border-border/60 bg-surface/50 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-xl text-accent">
                <Icon name={step.icon} />
              </span>
              <div>
                <span className="text-xs font-bold text-accent">{step.index}</span>
                <h3 className="mt-1 text-lg font-black text-text">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-text-muted">{step.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
