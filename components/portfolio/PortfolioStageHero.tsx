"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { PortfolioItem } from "../../content/types";
import { SectionLabel } from "../ui/Section";
import { ButtonLink } from "../ui/Button";
import { ArrowLeft } from "lucide-react";
import { PortfolioVectorField } from "./PortfolioVectorField";

const EASE = [0.16, 1, 0.3, 1] as const;

export function PortfolioStageHero({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: PortfolioItem[];
}) {
  const reduce = useReducedMotion();
  const floating = pickFloating(items);

  return (
    <section className="relative overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div
        className="pointer-events-none absolute -top-40 start-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-accent/12 blur-[130px]"
        aria-hidden
      />
      <PortfolioVectorField className="opacity-80" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <SectionLabel align="start">نمونه‌کارها</SectionLabel>
          </motion.div>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
            className="mt-5 text-4xl font-black leading-[1.15] tracking-tight text-text sm:text-5xl lg:text-6xl"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
              className="mt-5 max-w-xl text-base leading-8 text-text-muted"
            >
              {subtitle}
            </motion.p>
          )}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <ButtonLink href="#portfolio-grid" size="lg">
              مشاهده پروژه‌ها
              <ArrowLeft className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg">
              پروژه مشابه
            </ButtonLink>
          </motion.div>
        </div>

        {/* CSS 3D floating cover cluster */}
        <div className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[26rem]" style={{ perspective: 1400 }}>
          {floating.map((item, i) => (
            <FloatingCover key={item.slug} item={item} index={i} reduce={!!reduce} />
          ))}
          <div
            className="pointer-events-none absolute inset-x-10 bottom-6 h-16 rounded-full bg-accent/20 blur-3xl"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}

function pickFloating(items: PortfolioItem[]) {
  const pulse = items.find((i) => i.slug === "pulse-fitness");
  const rest = items.filter((i) => i.slug !== "pulse-fitness");
  const picks = [pulse, ...rest].filter(Boolean).slice(0, 3) as PortfolioItem[];
  while (picks.length < 3 && items[picks.length]) picks.push(items[picks.length]);
  return picks;
}

function FloatingCover({
  item,
  index,
  reduce,
}: {
  item: PortfolioItem;
  index: number;
  reduce: boolean;
}) {
  const poses = [
    { x: "12%", y: "8%", rot: -14, z: 80, scale: 1.02 },
    { x: "38%", y: "22%", rot: 4, z: 140, scale: 1.12 },
    { x: "58%", y: "10%", rot: 16, z: 60, scale: 0.96 },
  ][index] ?? { x: "30%", y: "20%", rot: 0, z: 40, scale: 1 };

  return (
    <motion.a
      href={`/portfolio/${item.slug}`}
      initial={reduce ? false : { opacity: 0, y: 40, rotateY: poses.rot - 10, scale: poses.scale * 0.92 }}
      animate={
        reduce
          ? { opacity: 1, y: 0, rotateY: poses.rot, scale: poses.scale }
          : {
              opacity: 1,
              y: [0, -12, 0],
              rotateY: poses.rot,
              scale: poses.scale,
            }
      }
      transition={
        reduce
          ? { duration: 0.5, delay: index * 0.08 }
          : {
              opacity: { duration: 0.6, delay: 0.15 + index * 0.1, ease: EASE },
              scale: { duration: 0.6, delay: 0.15 + index * 0.1, ease: EASE },
              rotateY: { duration: 0.7, delay: 0.15 + index * 0.1, ease: EASE },
              y: { duration: 5 + index, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
            }
      }
      whileHover={reduce ? undefined : { scale: poses.scale * 1.06, y: -16 }}
      className="absolute block aspect-[4/5] w-[42%] overflow-hidden rounded-2xl border border-border/80 bg-panel shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]"
      style={{
        left: poses.x,
        top: poses.y,
        transformStyle: "preserve-3d",
        zIndex: index === 1 ? 3 : 2,
      }}
    >
      <div className={`absolute inset-0 bg-linear-to-br ${item.cover}`} />
      {item.coverImage && (
        <Image src={item.coverImage} alt="" fill sizes="200px" className="object-cover" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="line-clamp-2 text-xs font-bold text-white">{item.title}</p>
      </div>
    </motion.a>
  );
}
