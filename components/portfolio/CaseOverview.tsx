"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CaseOverview({
  paragraphs,
  challenge,
  solution,
}: {
  paragraphs: string[];
  challenge: { title: string; body: string };
  solution: { title: string; body: string };
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div>
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE }}
            className="text-3xl font-black text-text sm:text-4xl"
          >
            خلاصه پروژه
          </motion.h2>
          <div className="mt-6 flex flex-col gap-4">
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                className="text-sm leading-8 text-text-muted sm:text-base"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {[challenge, solution].map((block, i) => (
            <motion.article
              key={block.title}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.08 + i * 0.08, ease: EASE }}
              className={`rounded-[1.75rem] border p-6 sm:p-7 ${
                i === 0
                  ? "border-border/70 bg-panel/50"
                  : "border-accent/30 bg-accent-soft/30"
              }`}
            >
              <h3 className="text-lg font-black text-text">{block.title}</h3>
              <p className="mt-3 text-sm leading-8 text-text-muted">{block.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
