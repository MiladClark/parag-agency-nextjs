"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { manifestoLines } from "../../content/data/home";

// Scrollytelling centerpiece: the manifesto lights up word-by-word as the user
// scrolls through a tall pinned section — the classic "scroll-tell" reveal.
export function ManifestoReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Flatten to words to compute a per-word reveal window across the scroll.
  const words = manifestoLines.flatMap((line, li) =>
    line.split(" ").map((w) => ({ w, li })),
  );
  const total = words.length;

  // Group word indices back into their lines for layout.
  let cursor = 0;
  const lines = manifestoLines.map((line, li) => {
    const arr = line.split(" ").map((w) => ({ w, i: cursor++, li }));
    return { li, arr };
  });

  return (
    // 260vh of scroll for three lines is a long hold on a stacked layout, where
    // the same reveal reads fine over a shorter run. Desktop keeps the original
    // pacing.
    <section ref={ref} className="relative h-[150vh] lg:h-[260vh]">
      <div className="sticky top-0 flex h-screen items-center">
        <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
          <div className="flex flex-col gap-3 text-center sm:gap-4">
            {lines.map(({ li, arr }) => (
              <p
                key={li}
                className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-2xl font-bold leading-[1.5] sm:gap-x-3 sm:gap-y-2 sm:text-5xl sm:leading-[1.4]"
              >
                {arr.map(({ w, i }) => (
                  <Word
                    key={i}
                    progress={scrollYProgress}
                    index={i}
                    total={total}
                    accent={li === manifestoLines.length - 1}
                    reduce={!!reduce}
                  >
                    {w}
                  </Word>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Word({
  progress,
  index,
  total,
  accent,
  reduce,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  accent?: boolean;
  reduce: boolean;
  children: React.ReactNode;
}) {
  // Reveal happens over the first 85% of the scroll so the full line lingers.
  const start = (index / total) * 0.85;
  const end = start + 0.85 / total;
  const opacity = useTransform(progress, [start, end], [0.12, 1]);

  return (
    <motion.span
      style={reduce ? undefined : { opacity }}
      className={accent ? "text-accent" : "text-text"}
    >
      {children}
    </motion.span>
  );
}