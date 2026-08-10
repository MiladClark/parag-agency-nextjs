"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "../ui/Button";

const EASE = [0.16, 1, 0.3, 1] as const;

export function AboutCta({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { label: string; href: string };
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-3 pb-10 pt-8 sm:px-5 sm:pb-14 sm:pt-12">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-accent/30 bg-panel px-6 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_30px_80px_-30px_rgba(0,0,0,0.55)] sm:px-10 sm:py-16"
      >
        <div
          className="pointer-events-none absolute -top-32 start-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-20 top-0 h-px bg-linear-to-l from-transparent via-accent/50 to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h2 className="text-3xl font-black leading-snug text-text sm:text-4xl">{title}</h2>
          <p className="text-sm leading-8 text-text-muted sm:text-base">{body}</p>
          <ButtonLink href={cta.href} size="lg" className="mt-2">
            {cta.label}
            <ArrowLeft className="h-4 w-4" />
          </ButtonLink>
        </div>
      </motion.div>
    </section>
  );
}
