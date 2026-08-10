"use client";

import { motion, useReducedMotion } from "motion/react";
import { Icon } from "../ui/Icon";

const EASE = [0.16, 1, 0.3, 1] as const;

type Value = { icon: string; title: string; body: string };

export function AboutValues({ title, items }: { title: string; items: Value[] }) {
  const reduce = useReducedMotion();
  const [featured, ...rest] = items;

  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="max-w-xl text-3xl font-black text-text sm:text-4xl"
        >
          {title}
        </motion.h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          {featured && (
            <motion.article
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-panel p-7 sm:p-9"
            >
              <div
                className="pointer-events-none absolute -top-24 end-0 h-56 w-56 rounded-full bg-accent/15 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden
              />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-2xl text-accent">
                <Icon name={featured.icon} />
              </span>
              <h3 className="relative mt-6 text-2xl font-black text-text">{featured.title}</h3>
              <p className="relative mt-3 max-w-md text-sm leading-8 text-text-muted sm:text-base">
                {featured.body}
              </p>
            </motion.article>
          )}

          <div className="flex flex-col gap-4">
            {rest.map((item, i) => (
              <motion.article
                key={item.title}
                initial={reduce ? false : { opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                className="group flex items-start gap-4 rounded-[1.5rem] border border-border/70 bg-panel/60 px-5 py-5 transition-colors duration-300 hover:border-accent/30 hover:bg-panel"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-lg text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                  <Icon name={item.icon} />
                </span>
                <div>
                  <h3 className="text-base font-black text-text">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-7 text-text-muted">{item.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
