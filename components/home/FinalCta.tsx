"use client";

import { motion } from "motion/react";
import { Section } from "../ui/Section";
import { ButtonLink } from "../ui/Button";
import { Icon } from "../ui/Icon";

export function FinalCta() {
  return (
    <Section>
      <div style={{ perspective: 1400 }}>
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: -10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            animate={{ rotateX: [2, -2, 2], rotateY: [-3, 3, -3] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
            className="glass shadow-depth bg-noise relative overflow-hidden rounded-[2.5rem] border-accent/30 p-12 text-center sm:p-20"
          >
            {/* depth orbs */}
            <motion.div
              className="pointer-events-none absolute -top-32 right-1/2 h-80 w-80 translate-x-1/2 rounded-full bg-accent/30 blur-3xl"
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transform: "translateZ(-40px)" }}
              aria-hidden
            />
            <motion.div
              className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              style={{ transform: "translateZ(-20px)" }}
              aria-hidden
            />

            <div className="relative flex flex-col items-center gap-6" style={{ transformStyle: "preserve-3d" }}>
              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-accent to-accent-hover text-4xl text-white shadow-2xl shadow-accent/40"
                style={{ transform: "translateZ(80px)" }}
              >
                <Icon name="rocket" />
              </motion.span>
              <h2
                className="text-3xl font-extrabold leading-tight text-text sm:text-5xl"
                style={{ transform: "translateZ(50px)" }}
              >
                داستان برند شما، از همین‌جا شروع می‌شود
              </h2>
              <p
                className="max-w-xl text-base leading-8 text-text-muted sm:text-lg"
                style={{ transform: "translateZ(30px)" }}
              >
                بیایید دربارهٔ اهداف کسب‌وکارتان صحبت کنیم و مسیر رشد دیجیتال شما را با هم ترسیم کنیم.
              </p>
              <div
                className="mt-2 flex flex-wrap items-center justify-center gap-3"
                style={{ transform: "translateZ(60px)" }}
              >
                <ButtonLink href="/contact" size="lg">
                  شروع همکاری
                  <Icon name="arrow-left" />
                </ButtonLink>
                <ButtonLink href="/services" variant="secondary" size="lg">
                  مشاهده خدمات
                </ButtonLink>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}