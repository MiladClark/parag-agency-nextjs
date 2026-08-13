"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { PageHero } from "../../content/types";
import { Container, SectionLabel } from "../ui/Section";
import { ButtonGroup, ButtonLink, groupItem } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { NeonInfinity } from "./NeonInfinity";

const headlineContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const wordVariant = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};
// Animating `filter: blur()` runs a convolution per word per frame. Reduced
// motion drops to a plain fade.
const wordVariantReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

export function CinematicHero({ hero }: { hero: PageHero }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const words = hero.title.split(" ");
  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, delay } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay },
        };

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-12 sm:pt-32 lg:pb-0 lg:pt-0"
    >
      <Container className="relative z-10">
        <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
          {/* Text column (right in RTL) */}
          <motion.div
            style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
            className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-start"
          >
            {hero.eyebrow && (
              <motion.div {...rise(0)}>
                <SectionLabel align="start">{hero.eyebrow}</SectionLabel>
              </motion.div>
            )}

            <motion.h1
              variants={headlineContainer}
              initial="hidden"
              animate="show"
              className="mt-5 text-3xl font-black leading-[1.2] tracking-tight text-text sm:mt-7 sm:text-5xl sm:leading-[1.15] lg:text-7xl lg:leading-[1.12]"
            >
              {words.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  variants={reduce ? wordVariantReduced : wordVariant}
                  className={`inline-block ${i === words.length - 1 ? "text-gradient" : ""}`}
                >
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </motion.span>
              ))}
            </motion.h1>

            {hero.subtitle && (
              <motion.p
                {...rise(0.55)}
                className="mt-4 max-w-xl text-sm leading-7 text-text-muted sm:mt-7 sm:text-lg sm:leading-9"
              >
                {hero.subtitle}
              </motion.p>
            )}

            <motion.div
              {...rise(0.75)}
              className="mt-8 flex w-full items-center justify-center sm:mt-10 lg:justify-start"
            >
              <ButtonGroup>
                {hero.cta && (
                  <ButtonLink href={hero.cta.href} size="lg" className={groupItem}>
                    {hero.cta.label}
                    <Icon name="arrow-left" />
                  </ButtonLink>
                )}
                {hero.secondaryCta && (
                  <ButtonLink
                    href={hero.secondaryCta.href}
                    variant="ghost"
                    size="lg"
                    className={groupItem}
                  >
                    {hero.secondaryCta.label}
                  </ButtonLink>
                )}
              </ButtonGroup>
            </motion.div>

            {/* social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="mt-8 flex items-center gap-3 sm:mt-10"
            >
              <div className="flex -space-x-2 [direction:ltr]">
                {["from-emerald-400 to-green-600", "from-teal-400 to-emerald-600", "from-lime-400 to-green-600", "from-green-400 to-teal-600"].map(
                  (g, i) => (
                    <span
                      key={i}
                      className={`h-8 w-8 rounded-full border-2 border-bg bg-gradient-to-br ${g}`}
                    />
                  ),
                )}
              </div>
              <span className="text-sm text-text-muted">
                اعتماد <span className="font-bold text-text">+۱۲۰</span> کسب‌وکار
              </span>
            </motion.div>
          </motion.div>

          {/* Neon infinity (left in RTL) */}
          <motion.div
            style={reduce ? undefined : { y: visualY }}
            className="relative order-1 lg:order-2"
          >
            <NeonInfinity />
          </motion.div>
        </div>
      </Container>

      {/* scroll cue */}
      <motion.div
        style={reduce ? undefined : { opacity: contentOpacity }}
        className="absolute inset-x-0 bottom-5 flex flex-col items-center gap-2 text-text-muted sm:bottom-8"
        aria-hidden
      >
        <span className="text-xs">برای روایت، اسکرول کنید</span>
        <motion.span
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-9 w-6 items-start justify-center rounded-full border border-border p-1.5"
        >
          <span className="h-1.5 w-1 rounded-full bg-accent" />
        </motion.span>
      </motion.div>
    </section>
  );
}