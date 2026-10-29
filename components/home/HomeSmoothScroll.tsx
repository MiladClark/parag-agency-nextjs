"use client";

import { useEffect } from "react";
import "lenis/dist/lenis.css";

/** Native window scroll keeps sticky positioning and Motion on the same clock. */
export function HomeSmoothScroll() {
  useEffect(() => {
    let destroy = () => {};
    let cancelled = false;
    let generation = 0;
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const mount = () => {
      const token = ++generation;
      destroy();
      destroy = () => {};
      if (!desktop.matches) return;
      import("lenis").then(({ default: Lenis }) => {
        if (cancelled || token !== generation || !desktop.matches) return;
        const lenis = new Lenis({
          autoRaf: true,
          lerp: 0.085,
          smoothWheel: true,
          syncTouch: false,
          anchors: true,
          stopInertiaOnNavigate: true,
          prevent: node => !!node.closest('[role="dialog"], [data-lenis-prevent], .journey-swipe-rail, .overscroll-contain'),
        });
        destroy = () => lenis.destroy();
      }).catch(() => { /* Native scrolling remains available. */ });
    };
    mount();
    desktop.addEventListener("change", mount);
    return () => {
      cancelled = true;
      desktop.removeEventListener("change", mount);
      destroy();
    };
  }, []);

  return null;
}
