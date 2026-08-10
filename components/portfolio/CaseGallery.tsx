"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { PortfolioGalleryImage } from "../../content/types";
import { TiltCard } from "../ui/TiltCard";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CaseGallery({ images }: { images: PortfolioGalleryImage[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!images.length || !current) return null;

  return (
    <section className="relative py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-3xl font-black text-text sm:text-4xl"
        >
          گالری صفحات
        </motion.h2>

        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <TiltCard className="rounded-[2rem]" max={9}>
            <div className="relative mx-auto aspect-[9/16] w-full max-w-[19rem] overflow-hidden rounded-[2rem] border border-border/80 bg-panel shadow-[0_28px_70px_-24px_rgba(0,0,0,0.75)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.src}
                  initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    sizes="320px"
                    className="object-cover object-top"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              {current.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-4">
                  <p className="text-sm font-bold text-white">{current.caption}</p>
                </div>
              )}
            </div>
          </TiltCard>

          <div>
            <p className="text-sm leading-8 text-text-muted">
              بین صفحات جابه‌جا شوید؛ پیش‌نمایش اصلی با tilt سه‌بعدی واکنش نشان می‌دهد.
            </p>
            <div
              className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2"
              role="listbox"
              aria-label="انتخاب صفحه اپ"
            >
              {images.map((img, i) => {
                const selected = i === active;
                return (
                  <button
                    key={img.src}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => setActive(i)}
                    className={`group relative aspect-[9/16] overflow-hidden rounded-2xl border transition-all ${
                      selected
                        ? "border-accent shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_50%,transparent)]"
                        : "border-border/70 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="140px"
                      className="object-cover object-top"
                    />
                    {img.caption && (
                      <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1.5 text-[10px] font-bold text-white">
                        {img.caption}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
