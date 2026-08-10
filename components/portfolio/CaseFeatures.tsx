"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { toPersianDigits } from "../../lib/format";

const EASE = [0.16, 1, 0.3, 1] as const;

type Feature = { title: string; body: string; image: string };

export function CaseFeatures({ features }: { features: Feature[] }) {
  const reduce = useReducedMotion();
  const [first, second, ...rest] = features;

  return (
    <section className="relative px-3 py-6 sm:px-5 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mb-10 text-3xl font-black text-text sm:text-4xl"
        >
          بخش‌های اصلی اپ
        </motion.h2>

        <div className="flex flex-col gap-8 lg:gap-12">
          {first && <FeatureRow feature={first} index={0} flip={false} reduce={!!reduce} />}
          {second && <FeatureRow feature={second} index={1} flip reduce={!!reduce} />}

          {rest.length > 0 && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, ease: EASE }}
              className="rounded-[2.25rem] border border-border/70 bg-panel/40 p-5 sm:p-8"
            >
              <p className="text-sm text-text-muted">ادامه جریان محصول</p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {rest.map((feature, i) => (
                  <div key={feature.title} className="flex flex-col items-center gap-4">
                    <div className="relative aspect-[9/16] w-full max-w-[15rem] overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface shadow-[0_20px_50px_-22px_rgba(0,0,0,0.7)]">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        sizes="240px"
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="max-w-sm text-center">
                      <p className="text-xs font-bold text-accent">
                        {toPersianDigits(i + 3)}
                      </p>
                      <h3 className="mt-1 text-lg font-black text-text">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-text-muted">{feature.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  feature,
  index,
  flip,
  reduce,
}: {
  feature: Feature;
  index: number;
  flip: boolean;
  reduce: boolean;
}) {
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: EASE }}
      className="grid items-center gap-6 overflow-hidden rounded-[2.25rem] border border-border/70 bg-panel/40 p-4 sm:p-6 lg:grid-cols-2 lg:gap-10 lg:p-8"
    >
      <div className={flip ? "lg:order-2" : ""}>
        <p className="text-xs font-bold text-accent">{toPersianDigits(index + 1)}</p>
        <h3 className="mt-2 text-2xl font-black text-text">{feature.title}</h3>
        <p className="mt-3 max-w-md text-sm leading-8 text-text-muted">{feature.body}</p>
      </div>
      <div
        className={`relative mx-auto aspect-[9/16] w-full max-w-[17rem] overflow-hidden rounded-[2rem] border border-border/80 bg-surface shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)] ${
          flip ? "lg:order-1" : ""
        }`}
      >
        <Image
          src={feature.image}
          alt={feature.title}
          fill
          sizes="280px"
          className="object-cover object-top"
        />
      </div>
    </motion.article>
  );
}
