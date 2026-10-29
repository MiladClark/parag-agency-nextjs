"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { journeySteps } from "../../content/data/home";
import { DESKTOP_QUERY, useMediaQuery } from "../../lib/useMediaQuery";
import { buildJourneyGeometry, JOURNEY_ENTRY_X, JOURNEY_EXIT_X } from "../../lib/journeyGeometry";
import "./journey-steps.css";

const artwork = ["discovery", "strategy", "creativity", "growth"];
const tilts = [-8, 7, -6, 5];

function JourneyHeading() {
  return <h2 id="journey-title" className="journey-heading">چطور برند شما را <span className="text-gradient">رشد می‌دهیم</span></h2>;
}

export function JourneySteps() {
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  return desktop && !reduced ? <PinnedJourney /> : <SwipeJourney reduced={reduced} />;
}

function PinnedJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState({ w: 1280, h: 800 });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const { scrollYProgress: entryDrawn } = useScroll({ target: sectionRef, offset: ["start center", "start start"] });
  const { scrollYProgress: exitDrawn } = useScroll({ target: sectionRef, offset: ["end end", "end center"] });
  // Direct scroll mapping: no chapter holds, easing plateaus, or snapping.
  const chapter = scrollYProgress;
  const x = useTransform(chapter, value => -value * size.w * 3);

  useMotionValueEvent(chapter, "change", value => {
    const next = Math.min(3, Math.max(0, Math.round(value * 3)));
    if (next !== activeRef.current) {
      activeRef.current = next;
      setActive(next);
    }
  });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => setSize({ w: stage.clientWidth, h: stage.clientHeight }));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const { w, h } = size;
  const { entry, middle, exit } = buildJourneyGeometry(w, h);

  return (
    <section ref={sectionRef} className="journey-sequence journey-sequence-pinned" aria-labelledby="journey-title" data-journey-mode="pinned">
      <span data-journey-node className="journey-boundary journey-boundary-entry" style={{ left: `${JOURNEY_ENTRY_X * 100}%` }} aria-hidden />
      <span data-journey-node className="journey-boundary journey-boundary-exit" style={{ left: `${JOURNEY_EXIT_X * 100}%` }} aria-hidden />
      <div ref={stageRef} className="journey-stage">
        <div className="journey-heading-wrap"><JourneyHeading /></div>
        <motion.div className="journey-track" style={{ x }} dir="ltr">
          <svg className="journey-thread" viewBox={`0 0 ${w * 4} ${h}`} preserveAspectRatio="none" fill="none" aria-hidden>
            <motion.path d={entry} stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" style={{ pathLength: entryDrawn }} />
            <motion.path d={middle} stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" style={{ pathLength: chapter }} />
            <motion.path d={exit} stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" style={{ pathLength: exitDrawn }} />
          </svg>
          {journeySteps.map((step, i) => <JourneyPanel key={step.index} index={i} progress={chapter} active={active === i} />)}
        </motion.div>
        <p className="sr-only" aria-live="polite">{journeySteps[active].title}</p>
      </div>
    </section>
  );
}

function JourneyPanel({ index, progress, active }: { index: number; progress: MotionValue<number>; active: boolean }) {
  const step = journeySteps[index];
  const local = useTransform(progress, value => value * 3 - index);
  const opacity = useTransform(local, [-0.85, -0.4, 0, 0.4, 0.85], [0.1, 0.65, 1, 0.65, 0.1]);
  const textY = useTransform(local, [-1, 0, 1], [40, 0, -40]);
  const textX = useTransform(local, [-1, 0, 1], [30, 0, -30]);
  const artX = useTransform(local, [-1, 0, 1], [-60, 0, 60]);
  const artY = useTransform(local, [-1, 0, 1], [35, 0, -35]);
  const rotateY = useTransform(local, [-1, 0, 1], [12, -6, -16]);
  const rotateZ = useTransform(local, [-1, 0, 1], [tilts[index] - 4, tilts[index], tilts[index] + 4]);
  const scale = useTransform(local, [-1, 0, 1], [0.92, 1.08, 0.94]);
  return (
    <article className="journey-panel" dir="rtl" aria-hidden={!active} style={{ perspective: 1400 }}>
      <motion.div className="journey-copy" style={{ y: textY, x: textX, opacity }}>
        <h3>{step.title}</h3>
        <p className="journey-description">{step.body}</p>
      </motion.div>
      <motion.div className="journey-art" style={{ x: artX, y: artY, rotateY, rotateZ, scale, opacity }} aria-hidden>
        <Image src={`/images/journey/${artwork[index]}.webp`} alt="" width={900} height={900} sizes="(min-width: 1280px) 615px, 48vw" quality={90} draggable={false} />
      </motion.div>
    </article>
  );
}

function SwipeJourney({ reduced }: { reduced: boolean }) {
  return (
    <section className="journey-sequence journey-sequence-swipe" aria-labelledby="journey-title" data-journey-mode="swipe">
      <div className="journey-mobile-heading"><JourneyHeading /></div>
      <div className={`journey-swipe-rail${reduced ? " journey-static" : ""}`} dir="ltr" tabIndex={0} aria-label="مراحل همکاری">
        {journeySteps.map((step, i) => (
          <article className="journey-swipe-panel" key={step.index} dir="rtl">
            <div className="journey-swipe-art" style={{ rotate: `${tilts[i]}deg` }} aria-hidden>
              <Image src={`/images/journey/${artwork[i]}.webp`} alt="" width={900} height={900} sizes="(min-width: 768px) 60vw, 85vw" quality={90} draggable={false} />
            </div>
            <h3>{step.title}</h3>
            <p className="journey-description">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
