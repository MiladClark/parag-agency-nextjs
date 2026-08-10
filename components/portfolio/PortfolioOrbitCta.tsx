"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "../ui/Button";
import { PortfolioVectorField } from "./PortfolioVectorField";

const EASE = [0.16, 1, 0.3, 1] as const;

export function PortfolioOrbitCta() {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-3 pb-10 pt-4 sm:px-5 sm:pb-14">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65, ease: EASE }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-accent/30 bg-panel px-6 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_30px_80px_-30px_rgba(0,0,0,0.55)] sm:px-10 sm:py-16"
      >
        <PortfolioVectorField className="opacity-40" />
        <div
          className="pointer-events-none absolute -top-28 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h2 className="text-3xl font-black text-text sm:text-4xl">پروژه بعدی شما اینجاست</h2>
          <p className="text-sm leading-8 text-text-muted sm:text-base">
            از ایده اپ تا کمپین و برندینگ؛ مسیر را با هم طراحی می‌کنیم.
          </p>
          <ButtonLink href="/contact" size="lg" className="mt-1">
            شروع همکاری
            <ArrowLeft className="h-4 w-4" />
          </ButtonLink>
        </div>
      </motion.div>
    </section>
  );
}
