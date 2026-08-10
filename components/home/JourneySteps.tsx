"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { journeySteps } from "../../content/data/home";
import { Section } from "../ui/Section";
import { SectionIntro } from "../ui/SectionIntro";
import { Icon } from "../ui/Icon";

// Pinned scrollytelling: a sticky 3D visual reacts to the active step as the
// steps scroll past on the other side, connected by a live timeline rail.
export function JourneySteps() {
  const [active, setActive] = useState(0);
  const current = journeySteps[active];

  return (
    <Section>
      <SectionIntro
        className="mb-16 sm:mb-20"
        title="چطور برند شما را"
        accent="رشد می‌دهیم"
        body="از کشف تا بهینه‌سازی، یک مسیر روشن و مشترک برای رسیدن به نتیجه."
      />

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Steps with timeline rail (right in RTL) */}
        <div className="relative flex flex-col">
          {/* Static track — scroll line draws through the nodes */}
          <div className="absolute bottom-[30vh] right-[1.15rem] top-[30vh] w-px bg-border/60" aria-hidden />

          {journeySteps.map((step, i) => (
            <motion.div
              key={step.index}
              onViewportEnter={() => setActive(i)}
              viewport={{ margin: "-50% 0px -50% 0px" }}
              className="relative flex min-h-[60vh] items-center gap-6 pr-12"
            >
              {/* node */}
              <span
                data-journey-node
                className={`absolute right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  active === i
                    ? "scale-110 border-accent bg-accent shadow-lg shadow-accent/40"
                    : "border-border bg-surface"
                }`}
                aria-hidden
              >
                <span className={`h-1.5 w-1.5 rounded-full ${active === i ? "bg-white" : "bg-border"}`} />
              </span>

              <div className="flex flex-col gap-4">
                <span className="text-sm font-bold text-accent">{step.index}</span>
                <h3
                  className={`text-2xl font-bold transition-colors duration-300 sm:text-3xl ${
                    active === i ? "text-text" : "text-text-muted/40"
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`max-w-md text-base leading-8 transition-colors duration-300 ${
                    active === i ? "text-text-muted" : "text-text-muted/30"
                  }`}
                >
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sticky 3D visual (left in RTL) — centered in the viewport while sticky */}
        <div className="hidden lg:block">
          <div className="sticky top-0 flex h-screen items-center justify-center" style={{ perspective: 1200 }}>
            <motion.div
              animate={{ rotateY: [-6, 6, -6], rotateX: [3, -3, 3] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
              className="glass shadow-depth relative flex h-[30rem] w-full flex-col items-center justify-center overflow-hidden rounded-[2.25rem]"
            >
              {/* ambient glow reacting to step */}
              <motion.div
                key={`glow-${current.index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pointer-events-none absolute -top-24 right-1/2 h-80 w-80 translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
                aria-hidden
              />

              {/* rotating ring */}
              <motion.div
                className="pointer-events-none absolute h-72 w-72 rounded-full border border-dashed border-accent/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                style={{ transform: "translateZ(-30px)" }}
                aria-hidden
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.index}
                  initial={{ opacity: 0, rotateY: 90, z: -60 }}
                  animate={{ opacity: 1, rotateY: 0, z: 0 }}
                  exit={{ opacity: 0, rotateY: -90, z: -60 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative flex flex-col items-center gap-6"
                >
                  <span
                    className="absolute text-[10rem] font-extrabold leading-none text-text/[0.05]"
                    style={{ transform: "translateZ(-40px)" }}
                  >
                    {current.index}
                  </span>
                  <span
                    className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-gradient-to-br from-accent to-accent-hover text-7xl text-white shadow-2xl shadow-accent/40"
                    style={{ transform: "translateZ(70px)" }}
                  >
                    <Icon name={current.icon} />
                  </span>
                  <span
                    className="rounded-full bg-panel px-5 py-2 text-base font-bold text-text shadow-lg"
                    style={{ transform: "translateZ(40px)" }}
                  >
                    {current.title}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* progress rail */}
              <div className="absolute bottom-8 flex items-center gap-2" style={{ transform: "translateZ(30px)" }}>
                {journeySteps.map((s, i) => (
                  <span
                    key={s.index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      active === i ? "w-8 bg-accent" : "w-1.5 bg-border"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}