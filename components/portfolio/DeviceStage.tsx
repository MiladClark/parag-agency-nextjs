"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

const SPRING = { stiffness: 120, damping: 18, mass: 0.4 };

export function DeviceStage({
  heroImage,
  devices = [],
}: {
  heroImage: string;
  devices?: string[];
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const rotateY = useTransform(sx, [0, 1], [-16, 16]);
  const rotateX = useTransform(sy, [0, 1], [10, -10]);

  const left = devices[0] ?? heroImage;
  const right = devices[1] ?? devices[0] ?? heroImage;

  function onMove(e: React.PointerEvent) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }

  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative mx-auto h-[22rem] w-full max-w-lg touch-pan-y sm:h-[26rem]"
      style={{ perspective: 1400 }}
    >
      {/* vector halo */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 500 420"
        aria-hidden
      >
        <defs>
          <radialGradient id="device-glow" cx="50%" cy="45%" r="45%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="250" cy="200" rx="200" ry="140" fill="url(#device-glow)" />
        <circle
          cx="250"
          cy="200"
          r="150"
          stroke="var(--accent)"
          strokeOpacity="0.25"
          strokeDasharray="4 10"
          fill="none"
        />
      </svg>

      <motion.div
        style={
          reduce
            ? undefined
            : { rotateX, rotateY, transformStyle: "preserve-3d" }
        }
        className="relative h-full w-full"
      >
        <PhoneFrame
          src={left}
          className="absolute top-[14%] w-[28%]"
          style={{
            insetInlineStart: "4%",
            transform: "translateZ(20px) rotateY(18deg) scale(0.92)",
          }}
          delay={0.05}
          reduce={!!reduce}
        />
        <PhoneFrame
          src={heroImage}
          className="absolute top-[6%] w-[36%]"
          style={{
            left: "50%",
            transform: "translateX(-50%) translateZ(90px)",
          }}
          delay={0.12}
          reduce={!!reduce}
          primary
        />
        <PhoneFrame
          src={right}
          className="absolute top-[18%] w-[28%]"
          style={{
            insetInlineEnd: "4%",
            transform: "translateZ(30px) rotateY(-18deg) scale(0.92)",
          }}
          delay={0.18}
          reduce={!!reduce}
        />
      </motion.div>

      <div
        className="pointer-events-none absolute inset-x-16 bottom-2 h-10 rounded-full bg-accent/25 blur-2xl"
        aria-hidden
      />
    </div>
  );
}

function PhoneFrame({
  src,
  className,
  style,
  delay,
  reduce,
  primary,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  delay: number;
  reduce: boolean;
  primary?: boolean;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`overflow-hidden rounded-[1.35rem] border border-white/10 bg-black shadow-[0_24px_50px_-18px_rgba(0,0,0,0.85)] ${
        primary ? "ring-1 ring-accent/40" : ""
      } ${className ?? ""}`}
      style={{ ...style, transformStyle: "preserve-3d" }}
    >
      <div className="relative aspect-[9/19] w-full">
        <Image src={src} alt="" fill sizes="180px" className="object-cover object-top" priority={primary} />
        <div className="absolute inset-x-[28%] top-1.5 h-1 rounded-full bg-white/15" aria-hidden />
      </div>
    </motion.div>
  );
}
