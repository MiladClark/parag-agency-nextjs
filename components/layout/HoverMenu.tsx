"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../ui/Icon";

const triggerClass =
  "inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-panel hover:text-text";

// Header dropdown opened on hover. The panel is portaled to <body> so its
// backdrop-blur works — a nested backdrop-filter is suppressed by the header's
// own backdrop-blur, so the panel must live outside that filter context.
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
    <div
      ref={panelRef}
      role="menu"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      onClick={() => setOpen(false)}
      style={{ position: "fixed", top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
      className={`z-[60] ${width} origin-top overflow-hidden rounded-2xl border border-border/60 bg-surface/55 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl backdrop-saturate-150 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
      }`}
    >
      {children}
    </div>
  );

  return (
    <span ref={triggerRef} className="relative inline-flex" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <a href={href} className={`${triggerClass} ${active ? "text-accent" : ""}`} aria-haspopup="menu" aria-expanded={open}>
        {label}
        <Icon name="chevron-down" className={`text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </a>
      {mounted && createPortal(panel, document.body)}
    </span>
  );
}