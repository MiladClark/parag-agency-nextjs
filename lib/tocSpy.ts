"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Table-of-contents scroll spy + anchor navigation.
//
// Replaces the IntersectionObserver this used to run on. An observer only
// reports headings inside its band, so after clicking a TOC entry — or on a
// short last section — no heading intersected and the active pill stayed on the
// previous item. Resolving from scroll position instead always yields exactly
// one active entry.

const MIN_HEADER = 56;
const MAX_HEADER = 120;
const GAP = 24;

/**
 * Where a heading should land below the site's sticky header. Measured from the
 * real header so it is correct on all three sites, and clamped because a header
 * with an open mega-menu reports its expanded height.
 */
function anchorOffset(): number {
  const header = document.querySelector("header");
  if (!header) return MIN_HEADER + GAP;

  const { position } = getComputedStyle(header);
  if (position !== "fixed" && position !== "sticky") return GAP;

  const height = header.getBoundingClientRect().height;
  return Math.round(Math.min(Math.max(height, MIN_HEADER), MAX_HEADER)) + GAP;
}

/** Anything with an element id — post headings or page section anchors. */
export type SpyItem = { id: string };

export function useTocSpy(toc: readonly SpyItem[], smooth = true) {
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);
  // A click-driven smooth scroll passes over every heading on the way; the spy
  // must stay quiet until it settles or the pill flickers through the list.
  const lockedUntil = useRef(0);

  // scrollIntoView (not a computed window.scrollTo) because it honours the
  // heading's own `scroll-margin-top` and finds whichever ancestor actually
  // scrolls. That is also what the browser uses for a native #hash landing, so
  // a click and a shared link can't disagree about where the heading stops.
  const scrollTo = useCallback((el: HTMLElement, behavior: ScrollBehavior) => {
    el.scrollIntoView({ block: "start", behavior });
  }, []);

  // Publish the measured offset; PostBody's headings read it as their
  // `scroll-margin-top`, which is what the scroll above lands against.
  useEffect(() => {
    const apply = () =>
      document.documentElement.style.setProperty("--anchor-offset", `${anchorOffset()}px`);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  // The browser resolves an incoming #hash before the header has settled (fonts,
  // the sticky bar's own layout), so re-run the jump once with the real offset.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;

    const frame = requestAnimationFrame(() => {
      setActiveId(id);
      lockedUntil.current = Date.now() + 200;
      scrollTo(el, "auto");
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollTo]);

  useEffect(() => {
    if (toc.length === 0) return;

    let frame = 0;

    const resolve = () => {
      frame = 0;
      if (Date.now() < lockedUntil.current) return;

      // The active heading is the last one whose top has passed the anchor line.
      const line = anchorOffset() + 8;
      let current = toc[0].id;
      for (const item of toc) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top > line) break;
        current = item.id;
      }

      // A final short section may never reach the line; at the page bottom it is
      // unambiguously what the reader is looking at.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = toc[toc.length - 1].id;
      }

      setActiveId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(resolve);
    };

    resolve();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [toc]);

  const goTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;

      // Move the pill first — the click should register even while the scroll is
      // still animating, and even if the target can never reach the anchor line.
      setActiveId(id);
      lockedUntil.current = Date.now() + (smooth ? 700 : 0);
      scrollTo(el, smooth ? "smooth" : "auto");
      history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    },
    [scrollTo, smooth],
  );

  return { activeId, goTo };
}
