"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import { ButtonLink } from "../ui/Button";
import { DeviceStage } from "./DeviceStage";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CaseHero({
  title,
  summary,
  category,
  client,
  heroImage,
  devices = [],
}: {
  title: string;
  summary: string;
  category: string;
  client?: string;
  heroImage: string;
  devices?: string[];
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-28 pb-10 sm:pt-32 sm:pb-14">
      <div
        className="pointer-events-none absolute -top-40 start-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-accent/14 blur-[130px]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <motion.a
          href="/portfolio"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-bold text-text-muted transition-colors hover:text-accent"
        >
          <ArrowUpLeft className="h-4 w-4" />
          بازگشت به نمونه‌کارها
        </motion.a>

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
          <div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="rounded-full border border-accent/35 bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
                {category}
              </span>
              {client && (
                <span className="rounded-full border border-border px-3 py-1 text-xs text-text-muted">
                  {client}
                </span>
              )}
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
              className="mt-5 text-3xl font-black leading-[1.2] tracking-tight text-text sm:text-5xl"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
              className="mt-5 max-w-xl text-base leading-8 text-text-muted"
            >
              {summary}
            </motion.p>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
              className="mt-8"
            >
              <ButtonLink href="/contact" size="lg">
                پروژه مشابه دارید؟
                <ArrowLeft className="h-4 w-4" />
              </ButtonLink>
            </motion.div>
          </div>

          <DeviceStage heroImage={heroImage} devices={devices} />
        </div>
      </div>
    </section>
  );
}
