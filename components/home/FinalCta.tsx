"use client";

import { motion } from "motion/react";
import { Section } from "../ui/Section";
import { ButtonGroup, ButtonLink, groupItem } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { useLiteMotion } from "../../lib/useMediaQuery";

export function FinalCta() {
  const lite = useLiteMotion();

  return (
    <Section>
      <div style={{ perspective: 1400 }}>
        <motion.div
          initial={lite ? { opacity: 0, y: 30 } : { opacity: 0, y: 60, rotateX: -10 }}
          whileInView={lite ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: lite ? 0.5 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={lite ? undefined : { transformStyle: "preserve-3d" }}
        >
          {/* The perpetual wobble sits on a `.glass` panel, so every frame
              re-samples an 18px backdrop blur across the whole card. Static on
              lite — which also lets iOS clip the 2.5rem radius correctly, since
              no 3D context remains above it. */}
          <motion.div
            animate={lite ? undefined : { rotateX: [2, -2, 2], rotateY: [-3, 3, -3] }}
            transition={lite ? undefined : { duration: 14, repeat: Infinity, ease: "easeInOut" }}
            style={lite ? undefined : { transformStyle: "preserve-3d" }}
            className="glass shadow-depth bg-noise relative overflow-hidden rounded-[2rem] border-accent/30 px-6 py-12 text-center sm:rounded-[2.5rem] sm:p-20"
          >
            {/* depth orbs */}
            <motion.div
              className="pointer-events-none absolute -top-32 right-1/2 h-80 w-80 translate-x-1/2 rounded-full bg-accent/30 blur-3xl"
              animate={lite ? undefined : { scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
              transition={lite ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={lite ? undefined : { transform: "translateZ(-40px)" }}
              aria-hidden
            />
            <motion.div
              className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
              animate={lite ? undefined : { scale: [1, 1.2, 1] }}
              transition={lite ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
              style={lite ? undefined : { transform: "translateZ(-20px)" }}
              aria-hidden
            />

            <div
              className="relative flex flex-col items-center gap-5 sm:gap-6"
              style={lite ? undefined : { transformStyle: "preserve-3d" }}
            >
              <motion.span
                animate={lite ? undefined : { y: [0, -10, 0] }}
                transition={lite ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-accent to-accent-hover text-3xl text-white shadow-2xl shadow-accent/40 sm:h-20 sm:w-20 sm:rounded-[1.5rem] sm:text-4xl"
                style={lite ? undefined : { transform: "translateZ(80px)" }}
              >
                <Icon name="rocket" />
              </motion.span>
              <h2
                className="text-2xl font-extrabold leading-snug text-text sm:text-5xl sm:leading-tight"
                style={lite ? undefined : { transform: "translateZ(50px)" }}
              >
                داستان برند شما، از همین‌جا شروع می‌شود
              </h2>
              <p
                className="max-w-xl text-sm leading-7 text-text-muted sm:text-lg sm:leading-8"
                style={lite ? undefined : { transform: "translateZ(30px)" }}
              >
                بیایید دربارهٔ اهداف کسب‌وکارتان صحبت کنیم و مسیر رشد دیجیتال شما را با هم ترسیم کنیم.
              </p>
              <div
                className="mt-2 flex w-full items-center justify-center"
                style={lite ? undefined : { transform: "translateZ(60px)" }}
              >
                <ButtonGroup>
                  <ButtonLink href="/contact" size="lg" className={groupItem}>
                    همکاری با ما
                    <Icon name="arrow-left" />
                  </ButtonLink>
                  <ButtonLink href="/services" variant="ghost" size="lg" className={groupItem}>
                    خدمات ما
                  </ButtonLink>
                </ButtonGroup>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}