"use client";

import { usePathname } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

const slot =
  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200";

// Combined ورود + ثبت‌نام control — a segmented switch where an accent thumb
// glides between the two icons as the active route changes (RTL-aware).
export function HeaderAuth() {
  const urlPathname = usePathname();
  const active = urlPathname.startsWith("/login") ? 0 : urlPathname.startsWith("/register") ? 1 : -1;

  // Thumb sits over slot 0 by default; in RTL slot 1 is to the left.
  const thumbTransform =
    active === 1 ? "translateX(calc((100% + 0.25rem) * -1))" : "translateX(0px)";

  return (
    <div className="relative flex items-center gap-1 rounded-full border border-border/70 bg-surface/60 p-1 backdrop-blur">
      <span
        aria-hidden
        className="pointer-events-none absolute start-1 top-1 h-8 w-8 rounded-full bg-accent transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ transform: thumbTransform, opacity: active < 0 ? 0 : 1 }}
      />
      <a
        href="/login"
        title="ورود"
        aria-label="ورود"
        aria-current={active === 0 ? "page" : undefined}
        className={`${slot} ${active === 0 ? "text-white" : "text-text-muted hover:text-text"}`}
      >
        <LogIn className="h-4 w-4" aria-hidden />
      </a>
      <a
        href="/register"
        title="ثبت‌نام"
        aria-label="ثبت‌نام"
        aria-current={active === 1 ? "page" : undefined}
        className={`${slot} ${active === 1 ? "text-white" : "text-text-muted hover:text-text"}`}
      >
        <UserPlus className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}