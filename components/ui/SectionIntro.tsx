"use client";

import { motion, useReducedMotion } from "motion/react";
import { SectionHeading, SectionLabel } from "./Section";

const EASE = [0.16, 1, 0.3, 1] as const;

type Align = "center" | "start";

/** Animated wrapper around the shared SectionHeading language. */
export function SectionIntro({
  label,
  title,
  accent,
  body,
  align = "center",
  className = "",
  children,
}: {
  label?: string;
  title: string;
  accent?: string;
  body?: string;
  align?: Align;
  className?: string;
  children?: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.65, ease: EASE }}
      className={className}
    >
      <SectionHeading eyebrow={label} title={title} accent={accent} body={body} align={align} />
      {children}
    </motion.div>
  );
}

export { SectionLabel };
