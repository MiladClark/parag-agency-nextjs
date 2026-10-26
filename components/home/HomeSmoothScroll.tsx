"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/** Native window scroll keeps sticky positioning and Motion on the same clock. */
export function HomeSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      stopInertiaOnNavigate: true,
      prevent: node => !!node.closest('[role="dialog"], [data-lenis-prevent], .journey-swipe-rail, .overscroll-contain'),
    });
    return () => lenis.destroy();
  }, []);

  return null;
}
