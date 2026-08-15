"use client";

import { useEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { Clock, List, PanelRightClose, Star, X } from "lucide-react";
import type { BlogPost } from "../../content/types";
import type { TocItem } from "../../lib/toc";
import { useTocSpy } from "../../lib/tocSpy";
import { toPersianDigits } from "../../lib/format";
import { ShareButtons } from "./ShareButtons";
import { RelatedMiniCards } from "./RelatedMiniCards";

const STORAGE_KEY = "parag-blog-rail";

// Soft spring shared by the rail's open/close and drawer motion.
const SOFT_SPRING = { type: "spring", stiffness: 260, damping: 28, mass: 0.9 } as const;

export type RatingSnippet = {
  average: number;
  count: number;
};

type Props = {
  articleRef: RefObject<HTMLElement | null>;
  toc: TocItem[];
  readingMinutes: number;
  shareUrl: string;
  shareTitle: string;
  related: BlogPost[];
  rating?: RatingSnippet | null;
};

function formatAverage(avg: number): string {
  const rounded = Math.round(avg * 10) / 10;
  return toPersianDigits(rounded.toFixed(1).replace(".", "٫"));
}

export function BlogReadingRail({
  articleRef,
  toc,
  readingMinutes,
  shareUrl,
  shareTitle,
  related,
  rating,
}: Props) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pct, setPct] = useState(0);
  const { activeId, goTo } = useTocSpy(toc, !reduce);

  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start 0.15", "end 0.85"],
  });

  const springProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });

  const progressValue = reduce ? scrollYProgress : springProgress;
  // Width driven straight by the motion value: the bar glides without a single
  // React re-render per frame.
  const barWidth = useTransform(progressValue, (v) => `${Math.min(100, Math.max(0, v * 100))}%`);
  const railHeight = useTransform(progressValue, (v) => `${Math.min(100, Math.max(0, v * 100))}%`);

  // The percentage label only needs integer precision.
  useMotionValueEvent(progressValue, "change", (v) => {
    const next = Math.round(Math.min(1, Math.max(0, v)) * 100);
    setPct((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "closed") setOpen(false);
    } catch {
      /* private mode */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, open ? "open" : "closed");
    } catch {
      /* private mode */
    }
  }, [open, hydrated]);

  // Close on Escape. Page scroll is NOT locked: the backdrop already blocks
  // interaction, and locking body overflow proved fragile (page stayed frozen).
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const panel = (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-sm font-bold text-text">
            <Clock className="h-4 w-4 text-accent" />
            {toPersianDigits(readingMinutes)} دقیقه
          </span>
          {rating && rating.count > 0 && (
            <a
              href="#comments"
              className="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-accent"
            >
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {formatAverage(rating.average)} · {toPersianDigits(rating.count)} رأی
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setMobileOpen(false);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-accent/40 hover:text-accent active:scale-95 lg:hidden"
          aria-label="بستن فهرست"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition-all hover:border-accent/40 hover:text-accent active:scale-95 lg:flex"
          aria-label="جمع کردن نوار کناری"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>پیشرفت مطالعه</span>
          <span className="tabular-nums">{toPersianDigits(pct)}٪</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="پیشرفت مطالعه مقاله"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-accent via-accent-hover to-accent"
            style={{ width: barWidth }}
          />
        </div>
      </div>

      {toc.length > 0 && (
        <nav aria-label="فهرست مطالب" className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-text">فهرست مطالب</h3>
          <ul className="flex max-h-[40vh] flex-col gap-1 overflow-y-auto pe-1">
            {toc.map((item) => {
              const active = item.id === activeId;
              return (
                <li key={item.id} className="relative">
                  {active && (
                    <motion.span
                      layoutId="toc-active-pill"
                      transition={reduce ? { duration: 0 } : SOFT_SPRING}
                      className="absolute inset-0 rounded-xl bg-accent-soft"
                      aria-hidden
                    />
                  )}
                  <a
                    href={`#${encodeURIComponent(item.id)}`}
                    aria-current={active ? "location" : undefined}
                    onClick={(event) => {
                      // Own the jump so the offset matches the sticky header and
                      // the pill moves on the same tick as the click.
                      event.preventDefault();
                      goTo(item.id);
                      setMobileOpen(false);
                    }}
                    className={`relative block rounded-xl px-2.5 py-1.5 text-xs leading-5 transition-colors duration-300 ${
                      item.level === 3 ? "ps-5" : ""
                    } ${
                      active
                        ? "font-semibold text-accent"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <ShareButtons url={shareUrl} title={shareTitle} variant="compact" />
      <RelatedMiniCards posts={related} />
    </div>
  );

  return (
    <>
      {/* Desktop: sticky rail, springs softly between full panel and slim bar. */}
      <aside className="hidden h-full lg:block" aria-label="نوار مطالعه">
        <div className="sticky top-24">
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div
                key="panel"
                initial={reduce ? false : { opacity: 0, x: 28, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, x: 28, scale: 0.97 }}
                transition={reduce ? { duration: 0 } : SOFT_SPRING}
                className="rounded-3xl border border-border bg-panel/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_50px_-24px_rgba(0,0,0,0.5)] backdrop-blur-md"
              >
                {panel}
              </motion.div>
            ) : (
              <motion.div
                key="mini"
                initial={reduce ? false : { opacity: 0, x: 16, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, x: 16, scale: 0.9 }}
                transition={reduce ? { duration: 0 } : SOFT_SPRING}
                className="flex flex-col items-center gap-3"
              >
                <motion.button
                  type="button"
                  onClick={() => setOpen(true)}
                  whileHover={reduce ? undefined : { scale: 1.08 }}
                  whileTap={reduce ? undefined : { scale: 0.94 }}
                  transition={SOFT_SPRING}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-panel text-accent shadow-[0_10px_30px_-16px_rgba(0,0,0,0.6)] transition-colors hover:border-accent/40"
                  aria-label="باز کردن نوار مطالعه"
                >
                  <List className="h-5 w-5" />
                </motion.button>
                <div
                  className="relative h-28 w-1.5 overflow-hidden rounded-full bg-border"
                  aria-hidden
                >
                  <motion.div
                    className="absolute inset-x-0 bottom-0 rounded-full bg-accent"
                    style={{ height: railHeight }}
                  />
                </div>
                <span className="text-[11px] tabular-nums text-text-muted">
                  {toPersianDigits(readingMinutes)}د
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Mobile: edge handle clinging to the start side + spring drawer.
          Rendered through a portal onto <body> so no ancestor transform can
          hijack the fixed positioning. */}
      {hydrated &&
        createPortal(
          <div className="lg:hidden">
        {/* Wrapper owns the fixed centering so motion's transform (whileTap)
            can't wipe out the translate-y. */}
        <div className="fixed start-0 top-1/2 z-40 -translate-y-1/2">
          <motion.button
            type="button"
            onClick={() => setMobileOpen(true)}
            whileTap={reduce ? undefined : { scale: 0.94 }}
            className="flex flex-col items-center gap-1.5 rounded-e-2xl border border-s-0 border-border bg-panel/95 px-2 py-3.5 text-text shadow-lg shadow-black/25 backdrop-blur-sm"
            aria-label="باز کردن فهرست مطالب"
          >
            <List className="h-5 w-5 text-accent" />
            <span
              className="relative h-10 w-1 overflow-hidden rounded-full bg-border"
              aria-hidden
            >
              <motion.span
                className="absolute inset-x-0 bottom-0 rounded-full bg-accent"
                style={{ height: railHeight }}
              />
            </span>
            <span className="text-[10px] font-bold tabular-nums text-text-muted">
              {toPersianDigits(pct)}٪
            </span>
          </motion.button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="drawer-root"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 flex justify-start"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/50"
                aria-label="بستن"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={reduce ? false : { x: "100%" }}
                animate={{ x: 0 }}
                exit={reduce ? undefined : { x: "100%" }}
                transition={reduce ? { duration: 0.18 } : SOFT_SPRING}
                className="relative z-10 flex h-full w-[min(85vw,22rem)] flex-col overflow-y-auto overscroll-contain border-e border-border bg-bg p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
              >
                {panel}
              </motion.div>
            </motion.div>
          )}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </>
  );
}
