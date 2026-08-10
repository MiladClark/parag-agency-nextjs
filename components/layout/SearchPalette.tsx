"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  CornerDownRight,
  FileText,
  Newspaper,
  Search,
  Sparkles,
  X,
} from "lucide-react";

type Hit = {
  type: "post" | "service" | "portfolio" | "page";
  title: string;
  href: string;
  excerpt?: string;
  meta?: string;
};

const RECENT_KEY = "parag-recent-searches";
const SPRING = { type: "spring", stiffness: 320, damping: 30, mass: 0.8 } as const;

const typeIcon: Record<Hit["type"], typeof FileText> = {
  post: Newspaper,
  service: Sparkles,
  portfolio: Briefcase,
  page: FileText,
};

const quickLinks: Hit[] = [
  { type: "page", title: "بلاگ و مقالات", href: "/blog", meta: "صفحه" },
  { type: "page", title: "نمونه کارها", href: "/portfolio", meta: "صفحه" },
  { type: "page", title: "خدمات پاراگ", href: "/services", meta: "صفحه" },
  { type: "page", title: "شروع همکاری", href: "/contact", meta: "صفحه" },
];

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  try {
    const next = [q, ...readRecent().filter((x) => x !== q)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => setMounted(true), []);

  // Reset + focus each time the palette opens.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setHits([]);
    setActive(0);
    setRecent(readRecent());
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [open]);

  // Debounced live search.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = window.setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { hits: Hit[] };
        setHits(data.hits);
        setActive(0);
      } catch {
        /* aborted or offline */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(t);
  }, [query, open]);

  const go = useCallback(
    (href: string) => {
      const q = query.trim();
      if (q.length >= 2) pushRecent(q);
      onClose();
      window.location.assign(href);
    },
    [query, onClose],
  );

  const showingQuick = query.trim().length < 2;
  const items = showingQuick ? quickLinks : hits;

  // Keyboard: arrows + Enter + Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter" && items[active]) {
        e.preventDefault();
        go(items[active].href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, active, go, onClose]);

  // Keep the active row in view.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="search-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]"
          role="dialog"
          aria-modal="true"
          aria-label="جستجو در سایت"
        >
          <button
            type="button"
            aria-label="بستن جستجو"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={reduce ? false : { opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
            transition={reduce ? { duration: 0.14 } : SPRING}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border/70 bg-surface/90 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.65)] backdrop-blur-2xl backdrop-saturate-150"
          >
            {/* input row */}
            <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
              <Search className="h-5 w-5 shrink-0 text-accent" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو در مقالات، خدمات، نمونه‌کارها…"
                className="min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-text-muted"
                aria-label="عبارت جستجو"
              />
              {loading && (
                <span
                  className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-border border-t-accent"
                  aria-label="در حال جستجو"
                />
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
                aria-label="بستن"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* results */}
            <div ref={listRef} className="max-h-[46vh] overflow-y-auto overscroll-contain p-2.5">
              {showingQuick ? (
                <>
                  {recent.length > 0 && (
                    <div className="mb-1 px-2.5">
                      <p className="pb-1.5 pt-1 text-[11px] font-bold text-text-muted">
                        جستجوهای اخیر
                      </p>
                      <div className="flex flex-wrap gap-1.5 pb-2">
                        {recent.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setQuery(r)}
                            className="flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
                          >
                            <Clock className="h-3 w-3" />
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-bold text-text-muted">
                    دسترسی سریع
                  </p>
                  {quickLinks.map((item, i) => (
                    <ResultRow
                      key={item.href}
                      item={item}
                      idx={i}
                      active={active === i}
                      onHover={() => setActive(i)}
                      onSelect={() => go(item.href)}
                      reduce={!!reduce}
                    />
                  ))}
                </>
              ) : hits.length > 0 ? (
                hits.map((item, i) => (
                  <ResultRow
                    key={`${item.type}-${item.href}-${i}`}
                    item={item}
                    idx={i}
                    active={active === i}
                    onHover={() => setActive(i)}
                    onSelect={() => go(item.href)}
                    reduce={!!reduce}
                  />
                ))
              ) : loading ? (
                <div className="flex flex-col gap-2 p-2.5" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-2xl bg-panel"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                  <Search className="h-8 w-8 text-text-muted/50" />
                  <p className="text-sm font-bold text-text">نتیجه‌ای پیدا نشد</p>
                  <p className="text-xs leading-6 text-text-muted">
                    عبارت دیگری امتحان کنید یا در بلاگ جستجو کنید.
                  </p>
                  <a
                    href={`/blog?q=${encodeURIComponent(query.trim())}`}
                    onClick={onClose}
                    className="mt-1 flex items-center gap-1.5 rounded-full bg-linear-to-b from-accent to-accent-hover px-4 py-2 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_22px_-10px_color-mix(in_srgb,var(--accent)_60%,transparent)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
                  >
                    جستجو در بلاگ
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* footer hints */}
            <div className="hidden items-center gap-4 border-t border-border/60 px-5 py-2.5 text-[11px] text-text-muted sm:flex">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-md border border-border bg-panel px-1.5 py-0.5 font-sans">↑↓</kbd>
                جابه‌جایی
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-md border border-border bg-panel px-1.5 py-0.5 font-sans">Enter</kbd>
                انتخاب
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-md border border-border bg-panel px-1.5 py-0.5 font-sans">Esc</kbd>
                بستن
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ResultRow({
  item,
  idx,
  active,
  onHover,
  onSelect,
  reduce,
}: {
  item: Hit;
  idx: number;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
  reduce: boolean;
}) {
  const TypeIcon = typeIcon[item.type];
  return (
    <button
      type="button"
      data-idx={idx}
      onMouseEnter={onHover}
      onClick={onSelect}
      className="relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-start"
    >
      {active && (
        <motion.span
          layoutId="search-active-row"
          transition={reduce ? { duration: 0 } : SPRING}
          className="absolute inset-0 rounded-2xl bg-accent-soft"
          aria-hidden
        />
      )}
      <span
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
          active ? "border-accent/40 text-accent" : "border-border/70 text-text-muted"
        }`}
      >
        <TypeIcon className="h-4 w-4" />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className={`block truncate text-sm font-bold ${active ? "text-accent" : "text-text"}`}>
          {item.title}
        </span>
        {item.excerpt && (
          <span className="mt-0.5 block truncate text-xs text-text-muted">{item.excerpt}</span>
        )}
      </span>
      {item.meta && (
        <span className="relative hidden shrink-0 rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-text-muted sm:block">
          {item.meta}
        </span>
      )}
      <CornerDownRight
        className={`relative h-3.5 w-3.5 shrink-0 transition-opacity ${
          active ? "text-accent opacity-100" : "opacity-0"
        }`}
      />
    </button>
  );
}
