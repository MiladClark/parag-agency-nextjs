"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "../ui/Icon";

const triggerClass =
  "inline-flex items-center gap-1 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-text-muted transition-all hover:border-accent/20 hover:bg-gradient-to-l hover:from-accent/10 hover:via-transparent hover:to-transparent hover:text-text hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

const SPRING = { type: "spring", stiffness: 340, damping: 28, mass: 0.8 } as const;

// Header dropdown opened on hover. The panel is portaled to <body> so its
// backdrop-blur works — a nested backdrop-filter is suppressed by the header's
// own backdrop-blur, so the panel must live outside that filter context.
// The fixed wrapper owns the translateX(-50%) centering; the inner motion.div
// only animates y/scale/opacity so Motion's transform never fights it.
export function HoverMenu({
  label,
  href,
  width = "w-72",
  active = false,
  children,
}: {
  label: string;
  href?: string;
  width?: string;
  active?: boolean;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  const updatePos = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: r.left + r.width / 2 });
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  };
  const openMenu = () => {
    cancelClose();
    updatePos();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, updatePos]);

  useEffect(() => () => cancelClose(), []);

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="hover-menu-panel"
          ref={panelRef}
          role="menu"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onClick={() => setOpen(false)}
          // Motion owns the transform: constant x centering composes with the
          // animated y/scale, so the panel stays centered while it springs in.
          style={{ position: "fixed", top: pos.top, left: pos.left, x: "-50%" }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            reduce
              ? { opacity: 0, transition: { duration: 0.12 } }
              : { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.15, ease: "easeIn" } }
          }
          transition={reduce ? { duration: 0.12 } : SPRING}
          className={`z-[60] ${width} origin-top overflow-hidden rounded-2xl border border-border/60 bg-surface/55 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl backdrop-saturate-150`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <a
        href={href}
        className={`${triggerClass} ${active ? "text-accent" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
        <Icon
          name="chevron-down"
          className={`text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </a>
      {mounted && createPortal(panel, document.body)}
    </span>
  );
}
