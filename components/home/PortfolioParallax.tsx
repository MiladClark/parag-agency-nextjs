"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import type { PortfolioItem } from "../../content/types";
import { Section, Eyebrow } from "../ui/Section";
import { ButtonLink } from "../ui/Button";
import { TiltCard } from "../ui/TiltCard";
import { PortfolioCard } from "../cards/PortfolioCard";

export function PortfolioParallax({ portfolio }: { portfolio: PortfolioItem[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const items = portfolio.slice(0, 3);

  return (
    <Section>
      <div className="mb-16 flex flex-col items-center gap-4 text-center">
        <Eyebrow>نمونه کارها</Eyebrow>
        <h2 className="text-3xl font-bold text-text sm:text-4xl lg:text-5xl">داستان‌هایی از رشد</h2>
        <p className="max-w-xl text-base leading-8 text-text-muted">
          نگاهی به چند پروژه‌ای که با هم به نتیجه رساندیم.
        </p>
      </div>

      <div ref={ref} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <ParallaxCard key={item.slug} progress={scrollYProgress} depth={i === 1 ? -70 : 50}>
            <TiltCard className="h-full rounded-3xl" max={10}>
              <PortfolioCard item={item} depth />
            </TiltCard>
          </ParallaxCard>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <ButtonLink href="/portfolio" variant="secondary">
          مشاهده همه نمونه‌کارها
        </ButtonLink>
      </div>
    </Section>
  );
}

function ParallaxCard({
  progress,
  depth,
  children,
}: {
  progress: MotionValue<number>;
  depth: number;
  children: React.ReactNode;
}) {
  const y = useTransform(progress, [0, 1], [depth, -depth]);
  return (
    <motion.div style={{ y }} className="h-full lg:will-change-transform">
      {children}
    </motion.div>
  );
}