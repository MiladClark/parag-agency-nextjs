"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import type { PortfolioItem } from "../../content/types";
import { Section } from "../ui/Section";
import { SectionIntro } from "../ui/SectionIntro";
import { ButtonLink } from "../ui/Button";
import { TiltCard } from "../ui/TiltCard";
import { PortfolioCard } from "../cards/PortfolioCard";
import { useLiteMotion } from "../../lib/useMediaQuery";

export function PortfolioParallax({ portfolio }: { portfolio: PortfolioItem[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const items = portfolio.slice(0, 3);

  return (
    <Section>
      <SectionIntro
        className="mb-14 sm:mb-16"
        label="نمونه‌کارها"
        title="داستان‌هایی از"
        accent="رشد واقعی"
        body="نگاهی به چند پروژه‌ای که از ایده تا نتیجه جلو بردیم."
      />

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
  const lite = useLiteMotion();
  const y = useTransform(progress, [0, 1], [depth, -depth]);
  // The offsets stagger a three-column grid. Mobile stacks to one column, where
  // the same offsets just push cards out of rhythm with the section's own
  // spacing — uneven gaps for a parallax that reads as a bug.
  return (
    <motion.div style={lite ? undefined : { y }} className="h-full lg:will-change-transform">
      {children}
    </motion.div>
  );
}