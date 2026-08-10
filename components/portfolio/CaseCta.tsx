"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "../ui/Button";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CaseCta() {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-3 pb-10 pt-6 sm:px-5 sm:pb-14 sm:pt-10">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65, ease: EASE }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-accent/30 bg-panel px-6 py-12 text-center sm:px-10 sm:py-16"
      >
        <div
          className="pointer-events-none absolute -top-28 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h2 className="text-3xl font-black text-text sm:text-4xl">
            اپ بعدی می‌تواند مال شما باشد
          </h2>
          <p className="text-sm leading-8 text-text-muted sm:text-base">
            از ایده تا انتشار کنار شما هستیم؛ محصول، طراحی و توسعه در یک مسیر.
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/contact" size="lg">
              شروع همکاری
              <ArrowLeft className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/portfolio" variant="secondary" size="lg">
              همه نمونه‌کارها
            </ButtonLink>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
