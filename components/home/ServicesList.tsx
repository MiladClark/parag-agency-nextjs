"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { Service } from "../../content/types";
import { Section } from "../ui/Section";
import { SectionIntro } from "../ui/SectionIntro";
import { Icon } from "../ui/Icon";
import { toPersianDigits } from "../../lib/format";

// Editorial "index" of services — large interactive rows instead of cards.
// Hovering a row washes it with brand green, reveals its description and floats
// a ghost icon, mirroring the look of high-end agency sites.
export function ServicesList({ services }: { services: Service[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <Section>
      <SectionIntro
        className="mb-12"
        align="start"
        label="خدمات"
        title="هرآنچه برای رشد دیجیتال"
        accent="نیاز دارید"
        body="از اولین قدم استراتژی تا اجرای کمپین و تحلیل نتایج، در هر مرحله کنار شما هستیم."
      />

      <div className="border-t border-border/60">
        {services.map((service, i) => {
          const active = hovered === i;
          return (
            <a
              key={service.slug}
              href={`/services/${service.slug}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="group relative block border-b border-border/60"
            >
              {/* hover wash */}
              <motion.div
                className="pointer-events-none absolute inset-0 bg-gradient-to-l from-accent-soft via-accent-soft/30 to-transparent"
                initial={false}
                animate={{ opacity: active ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                aria-hidden
              />
              {/* ghost icon */}
              <motion.span
                className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-text/[0.06]"
                initial={false}
                animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.6, x: active ? 0 : -20 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden
              >
                <Icon name={service.icon} className="text-[7rem] leading-none" />
              </motion.span>

              <div className="relative flex items-center gap-5 px-2 py-8 sm:gap-8 sm:px-6 sm:py-10">
                <span
                  className={`text-lg font-bold tabular-nums transition-colors duration-300 sm:text-xl ${
                    active ? "text-accent" : "text-text-muted/60"
                  }`}
                >
                  {toPersianDigits(String(i + 1).padStart(2, "0"))}
                </span>

                <div className="flex-1">
                  <h3
                    className={`text-2xl font-bold transition-all duration-300 sm:text-4xl ${
                      active ? "text-accent sm:translate-x-[-6px]" : "text-text"
                    }`}
                  >
                    {service.title}
                  </h3>
                  {/* expand-on-hover description */}
                  <div
                    className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      active ? "grid-rows-[1fr] pt-3 opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <p className="overflow-hidden max-w-xl text-sm leading-7 text-text-muted">
                      {service.excerpt}
                    </p>
                  </div>
                </div>

                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    active
                      ? "border-accent bg-accent text-white"
                      : "border-border text-text-muted"
                  }`}
                >
                  <Icon
                    name="arrow-left"
                    className={`text-lg transition-transform duration-300 ${active ? "-translate-x-0.5" : ""}`}
                  />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </Section>
  );
}