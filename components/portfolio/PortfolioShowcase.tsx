"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import type { PortfolioItem } from "../../content/types";
import { TiltCard } from "../ui/TiltCard";
import { SectionIntro } from "../ui/SectionIntro";
import { PortfolioCategoryFilter } from "./PortfolioCategoryFilter";

const EASE = [0.16, 1, 0.3, 1] as const;

export function PortfolioShowcase({ items }: { items: PortfolioItem[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category).filter(Boolean))],
    [items],
  );

  const filtered = useMemo(
    () => (active ? items.filter((i) => i.category === active) : items),
    [items, active],
  );

  const featured =
    filtered.find((i) => i.slug === "pulse-fitness") ?? filtered[0] ?? null;
  const rest = filtered.filter((i) => i.slug !== featured?.slug);

  return (
    <section id="portfolio-grid" className="relative scroll-mt-28 px-3 pb-6 sm:px-5 sm:pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <SectionIntro
            align="start"
            label="پروژه‌ها"
            title="انتخاب کنید و"
            accent="کاوش کنید"
            body="از اپلیکیشن تا کمپین و برندینگ؛ هر کارت یک داستان کامل است."
          />
          <PortfolioCategoryFilter
            categories={categories}
            active={active}
            onChange={setActive}
          />
        </div>

        <AnimatePresence mode="popLayout">
          {featured && (
            <motion.div
              key={`featured-${featured.slug}-${active ?? "all"}`}
              layout
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="mb-5"
            >
              <FeaturedCard item={featured} reduce={!!reduce} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {rest.map((item, i) => (
              <motion.div
                key={item.slug}
                layout
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.04, ease: EASE }}
                className={i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-1" : ""}
              >
                <SpotlightCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {!filtered.length && (
          <p className="py-16 text-center text-sm text-text-muted">پروژه‌ای در این دسته نیست.</p>
        )}
      </div>
    </section>
  );
}

function FeaturedCard({ item, reduce }: { item: PortfolioItem; reduce: boolean }) {
  return (
    <TiltCard className="rounded-[2rem]" max={8}>
      <a
        href={`/portfolio/${item.slug}`}
        className="group relative grid overflow-hidden rounded-[2rem] border border-border/70 bg-panel/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_30px_70px_-36px_rgba(0,0,0,0.65)] lg:grid-cols-[1.35fr_1fr]"
      >
        <div className={`relative min-h-[16rem] overflow-hidden bg-linear-to-br ${item.cover} lg:min-h-[22rem]`}>
          {item.coverImage && (
            <Image
              src={item.coverImage}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-panel via-transparent to-transparent lg:bg-linear-to-l" />
          {!item.coverImage && <CardVectorMotif />}
        </div>
        <div className="relative flex flex-col justify-center gap-4 p-6 sm:p-8">
          <span className="w-fit rounded-full border border-accent/35 bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
            {item.category}
          </span>
          <h3 className="text-2xl font-black leading-snug text-text sm:text-3xl">{item.title}</h3>
          {item.client && <p className="text-xs text-text-muted">{item.client}</p>}
          <p className="text-sm leading-8 text-text-muted">{item.summary}</p>
          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/80 px-3 py-1 text-[11px] text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-accent">
            مشاهده کیس‌استادی
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </span>
          {!reduce && (
            <span
              className="pointer-events-none absolute -bottom-20 end-0 h-40 w-40 rounded-full bg-accent/15 blur-3xl"
              aria-hidden
            />
          )}
        </div>
      </a>
    </TiltCard>
  );
}

function SpotlightCard({ item }: { item: PortfolioItem }) {
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const spot = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 55%)`;

  return (
    <TiltCard className="h-full rounded-[1.75rem]" max={10}>
      <a
        href={`/portfolio/${item.slug}`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(((e.clientX - r.left) / r.width) * 100);
          my.set(((e.clientY - r.top) / r.height) * 100);
        }}
        className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-panel/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spot }}
          aria-hidden
        />
        <div className={`relative aspect-[16/10] overflow-hidden bg-linear-to-br ${item.cover}`}>
          {item.coverImage ? (
            <Image
              src={item.coverImage}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
          ) : (
            <CardVectorMotif />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute bottom-3 start-3 rounded-full bg-bg/70 px-3 py-1 text-[11px] font-bold text-text backdrop-blur-sm">
            {item.category}
          </span>
        </div>
        <div className="relative z-20 flex flex-1 flex-col gap-2 p-5">
          {item.client && <p className="text-[11px] text-text-muted">{item.client}</p>}
          <h3 className="text-base font-black leading-7 text-text transition-colors group-hover:text-accent">
            {item.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-7 text-text-muted">{item.summary}</p>
        </div>
      </a>
    </TiltCard>
  );
}

function CardVectorMotif() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 400 250" aria-hidden>
      <defs>
        <linearGradient id="card-vec" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <circle cx="320" cy="60" r="90" fill="url(#card-vec)" />
      <path
        d="M20 200 C 120 120, 220 220, 380 80"
        stroke="var(--accent)"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M40 40 L 40 210 M40 210 L 200 210"
        stroke="var(--accent)"
        strokeOpacity="0.2"
        strokeWidth="1"
      />
    </svg>
  );
}
