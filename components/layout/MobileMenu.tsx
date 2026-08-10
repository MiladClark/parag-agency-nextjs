"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, X } from "lucide-react";
import { services } from "../../content/data/services";
import { siteSettings } from "../../content/data/site";
import { Icon } from "../ui/Icon";

const SPRING = { type: "spring", stiffness: 300, damping: 32, mass: 0.9 } as const;

const links = [
  { label: "خانه", href: "/" },
  { label: "خدمات", href: "/services" },
  { label: "نمونه کارها", href: "/portfolio" },
  { label: "بلاگ", href: "/blog" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

export function MobileMenu({
  open,
  onClose,
  path,
}: {
  open: boolean;
  onClose: () => void;
  path: string;
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[65] flex flex-col bg-bg/95 backdrop-blur-xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="منوی اصلی"
        >
          {/* ambient glow */}
          <div
            className="pointer-events-none absolute -top-32 end-0 h-72 w-72 rounded-full bg-accent/15 blur-[100px]"
            aria-hidden
          />

          <div className="flex h-[4.5rem] shrink-0 items-center justify-between px-5">
            <img src="/logo-mark.svg" alt="پاراگ" className="h-9 w-9" width={36} height={36} />
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن منو"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-panel text-text transition-colors hover:border-accent/40 hover:text-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-2">
            <ul className="flex flex-col">
              {links.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={reduce ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={
                    reduce ? { duration: 0 } : { ...SPRING, delay: 0.04 + i * 0.05 }
                  }
                >
                  <a
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center justify-between border-b border-border/50 py-4 text-2xl font-black transition-colors ${
                      isActive(item.href) ? "text-accent" : "text-text hover:text-accent"
                    }`}
                  >
                    {item.label}
                    <ArrowLeft className="h-5 w-5 -translate-x-2 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </a>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { ...SPRING, delay: 0.36 }}
              className="mt-7"
            >
              <p className="pb-3 text-xs font-bold text-text-muted">خدمات پاراگ</p>
              <div className="grid grid-cols-2 gap-2">
                {services.map((s) => (
                  <a
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-2xl border border-border/70 bg-panel/60 px-3 py-3 text-xs font-bold text-text transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <Icon name={s.icon} />
                    </span>
                    <span className="min-w-0 truncate">{s.title}</span>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { ...SPRING, delay: 0.44 }}
              className="mt-8 flex items-center justify-between border-t border-border/50 pt-6"
            >
              <div className="flex items-center gap-2">
                {siteSettings.social.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    <Icon name={s.icon} className="text-base" />
                  </a>
                ))}
              </div>
              {siteSettings.contact.phone && (
                <span className="text-sm font-bold text-text-muted">
                  {siteSettings.contact.phone}
                </span>
              )}
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
