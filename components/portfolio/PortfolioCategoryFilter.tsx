"use client";

import { motion } from "motion/react";

export function PortfolioCategoryFilter({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string | null;
  onChange: (category: string | null) => void;
}) {
  const chips: { id: string | null; label: string }[] = [
    { id: null, label: "همه" },
    ...categories.map((c) => ({ id: c, label: c })),
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="فیلتر دسته‌بندی نمونه‌کارها"
    >
      {chips.map((chip) => {
        const selected = active === chip.id;
        return (
          <button
            key={chip.label}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(chip.id)}
            className={`relative rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              selected ? "text-white" : "text-text-muted hover:text-text"
            }`}
          >
            {selected && (
              <motion.span
                layoutId="portfolio-filter-pill"
                className="absolute inset-0 rounded-full bg-linear-to-b from-accent to-accent-hover shadow-[0_10px_24px_-12px_color-mix(in_srgb,var(--accent)_70%,transparent)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {!selected && (
              <span className="absolute inset-0 rounded-full border border-border/80 bg-panel/40" />
            )}
            <span className="relative z-10">{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}
