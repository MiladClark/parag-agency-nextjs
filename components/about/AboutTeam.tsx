"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 300, damping: 22 } as const;

type Member = {
  name: string;
  role: string;
  focus: string;
  initial: string;
};

export function AboutTeam({
  title,
  body,
  members,
}: {
  title: string;
  body: string;
  members: Member[];
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-3 py-6 sm:px-5 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE }}
            className="text-3xl font-black text-text sm:text-4xl"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
            className="mt-3 text-sm leading-7 text-text-muted sm:text-base"
          >
            {body}
          </motion.p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((m, i) => (
            <motion.li
              key={m.name}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              whileHover={reduce ? undefined : { y: -4 }}
              className="group relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-panel/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <div
                className="pointer-events-none absolute -bottom-16 end-0 h-32 w-32 rounded-full bg-accent/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden
              />
              <motion.span
                transition={SPRING}
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-b from-accent to-accent-hover text-xl font-black text-white shadow-[0_10px_24px_-12px_color-mix(in_srgb,var(--accent)_70%,transparent)]"
              >
                {m.initial}
              </motion.span>
              <h3 className="relative mt-5 text-base font-black text-text">{m.name}</h3>
              <p className="relative mt-1 text-sm font-bold text-accent">{m.role}</p>
              <p className="relative mt-2 text-xs leading-6 text-text-muted">{m.focus}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
