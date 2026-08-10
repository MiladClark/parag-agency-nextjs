"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CaseMeta({
  year,
  role,
  timeline,
  platform,
}: {
  year?: string;
  role?: string;
  timeline?: string;
  platform?: string;
}) {
  const reduce = useReducedMotion();
  const items = [
    year ? { label: "سال", value: year } : null,
    role ? { label: "نقش ما", value: role } : null,
    timeline ? { label: "زمان اجرا", value: timeline } : null,
    platform ? { label: "پلتفرم", value: platform } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  if (!items.length) return null;

  return (
    <section className="relative px-3 sm:px-5">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: EASE }}
        className="mx-auto grid max-w-6xl gap-3 rounded-[1.75rem] border border-border/70 bg-panel/60 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4"
      >
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-surface/50 px-4 py-3.5">
            <p className="text-[11px] text-text-muted">{item.label}</p>
            <p className="mt-1 text-sm font-bold leading-7 text-text">{item.value}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
