"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useIsTouch, useLiteMotion } from "../../lib/useMediaQuery";

// Cursor-driven 3D tilt with perspective, a moving glare highlight, and a
// preserve-3d inner surface so children can float on the Z axis via translateZ.
export function TiltCard({
  children,
  className = "",
  max = 12,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Touch *or* the stacked layout. Pointer type alone misses a tablet with a
  // trackpad and any browser in desktop-site mode, both of which would keep the
  // 3D context — and its broken corner clipping — on a phone-shaped page.
  // Both hooks must be called unconditionally: `||` would short-circuit the
  // second one and change the hook order between renders.
  const isTouch = useIsTouch();
  const isLite = useLiteMotion();
  const skipTilt = isTouch || isLite;
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 160, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 160, damping: 18, mass: 0.4 });

  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const glareX = useTransform(sx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(sy, [0, 1], ["0%", "100%"]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 50%)`;

  function onMove(e: React.PointerEvent) {
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

  // Where the tilt can never fire, the springs, the pointer listeners and the
  // glare overlay are all dead weight. `preserve-3d` is worse than dead weight:
  // it makes the subtree a 3D rendering context, and iOS then stops applying
  // the card's `overflow: hidden` + border-radius clip to it — which is why
  // rounded cards render with sharp corners on phones but not on desktop.
  // Dropping it here restores the clip. At rest the tilt is 0deg, so desktop
  // sees no visual change when it upgrades after hydration.
  if (skipTilt) {
    return <div className={`group ${className}`}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group ${className}`}
      style={{ perspective: 1100 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full rounded-[inherit]"
      >
        {children}
        {glare && (
          <motion.div
            style={{ background: glareBg }}
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
        )}
      </motion.div>
    </div>
  );
}