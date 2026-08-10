"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "../ui/Button";

const EASE = [0.16, 1, 0.3, 1] as const;

export function AboutHero({
  title,
  subtitle,
  cta,
  secondaryCta,
}: {
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div
        className="pointer-events-none absolute -top-32 start-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-accent/12 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-28 end-[-10%] h-72 w-72 rounded-full bg-accent/[0.08] blur-[110px]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl">
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
          {(cta || secondaryCta) && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.14, ease: EASE }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {cta && (
                <ButtonLink href={cta.href} size="lg">
                  {cta.label}
                  <ArrowLeft className="h-4 w-4" />
                </ButtonLink>
              )}
              {secondaryCta && (
                <ButtonLink href={secondaryCta.href} variant="secondary" size="lg">
                  {secondaryCta.label}
                </ButtonLink>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
