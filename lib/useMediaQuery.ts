"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media query as reactive state, without a hydration mismatch.
 *
 * `serverValue` is what SSR *and* the hydration pass render. Every helper below
 * defaults it to the cheap/degraded branch, so the first paint is the light
 * variant and richer devices upgrade on the render right after hydration. That
 * ordering matters: phones are the ones that can't afford the heavy branch, and
 * they'd otherwise pay for it during LCP before any downgrade could apply.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/**
 * Below the desktop layout breakpoint — phones *and* tablets.
 *
 * `lg` rather than `md` on purpose: every multi-column switch on the homepage
 * happens at `lg` (the hero's two columns, the 3D journey panel, the three-up
 * portfolio grid), so anything narrower is running the stacked layout and the
 * mid-range GPU that comes with it. Tablets were getting the full desktop
 * animation load against the mobile layout — the worst of both.
 */
export const DESKTOP_QUERY = "(min-width: 1024px)";

export function useIsMobile(): boolean {
  return !useMediaQuery(DESKTOP_QUERY, false);
}

/**
 * Touch-primary pointer. Used to skip cursor-driven affordances (tilt, glare)
 * that cost springs and pointer listeners but can never fire on a phone.
 */
export function useIsTouch(): boolean {
  return useMediaQuery("(pointer: coarse)", true);
}

/**
 * True when the device should get the cheap animation path: a phone, or anyone
 * who asked for reduced motion. Homepage visuals gate their expensive work on
 * this — see NeonInfinity and AmbientBackground.
 */
export function useLiteMotion(): boolean {
  const desktop = useMediaQuery(DESKTOP_QUERY, false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", false);
  return !desktop || reduced;
}
