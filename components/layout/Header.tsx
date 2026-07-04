"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { services } from "../../content/data/services";
import { Icon } from "../ui/Icon";
import { ThemeToggle } from "../ThemeToggle";
import { HoverMenu } from "./HoverMenu";
import { HeaderAuth } from "./HeaderAuth";
import { AccountMenu } from "../account/AccountMenu";
import { useAuth } from "../../features/auth/AuthContext";

const primaryNav = [
  { label: "خانه", href: "/" },
  { label: "درباره ما", href: "/about" },
  { label: "نمونه کارها", href: "/portfolio" },
  { label: "بلاگ", href: "/blog" },
  { label: "تماس با ما", href: "/contact" },
];

const navLink =
  "rounded-full px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-panel hover:text-text";

function isActive(href: string, path: string): boolean {
  return href === "/" ? path === "/" : path.startsWith(href);
}

export function Header() {
  const urlPathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [urlPathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent overlay only over the home hero; solid everywhere else.
  const isHome = urlPathname === "/";
  const solid = scrolled || !isHome;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "border-b border-border/60 bg-bg/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/* top accent sheen (only once the solid bar appears) */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-accent/40 to-transparent transition-opacity duration-300 ${
          solid ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />

      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        {/* Brand */}
        <a href="/" className="flex shrink-0 items-center lg:justify-self-start">
          <img
            src="/logo-mark.svg"
            alt="پاراگ"
            className="h-9 w-9 lg:hidden"
            width={36}
            height={36}
          />
          <span className="hidden lg:block">
            <img
              src="/logo-big-light.svg"
              alt="پاراگ"
              className="theme-light-only h-12 w-auto"
              height={48}
            />
            <img
              src="/logo-big-dark.svg"
              alt="پاراگ"
              className="theme-dark-only h-12 w-auto"
              height={48}
            />
          </span>
        </a>

        {/* Center pill nav */}
        <nav className="hidden items-center gap-0.5 rounded-full border border-border/50 bg-surface/40 px-1.5 py-1 backdrop-blur lg:flex lg:justify-self-center">
          <a href="/" className={`${navLink} ${urlPathname === "/" ? "text-accent" : ""}`}>
            خانه
          </a>
          <HoverMenu label="خدمات" href="/services" width="w-[27rem]" active={isActive("/services", urlPathname)}>
            <ServicesMega />
          </HoverMenu>
          <a href="/portfolio" className={`${navLink} ${isActive("/portfolio", urlPathname) ? "text-accent" : ""}`}>
            نمونه کارها
          </a>
          <a href="/blog" className={`${navLink} ${isActive("/blog", urlPathname) ? "text-accent" : ""}`}>
            بلاگ
          </a>
          <a href="/about" className={`${navLink} ${isActive("/about", urlPathname) ? "text-accent" : ""}`}>
            درباره ما
          </a>
          <a href="/contact" className={`${navLink} ${isActive("/contact", urlPathname) ? "text-accent" : ""}`}>
            تماس
          </a>
        </nav>

        {/* End actions */}
        <div className="flex shrink-0 items-center gap-2 lg:justify-self-end">
          <ThemeToggle />
          {!loading &&
            (isAuthenticated ? (
              <AccountMenu />
            ) : (
              <div className="hidden sm:block">
                <HeaderAuth />
              </div>
            ))}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="منو"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-panel text-text lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} className="text-lg" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="glass flex flex-col gap-1 border-t border-border/70 px-5 py-4 sm:px-8 lg:hidden">
          {[{ label: "خانه", href: "/" }, ...primaryNav.slice(1)].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-xl px-4 py-3 text-sm ${
                isActive(item.href, urlPathname) ? "bg-accent-soft text-accent" : "text-text-muted hover:bg-panel"
              }`}
            >
              {item.label}
            </a>
          ))}

          <p className="px-4 pb-1 pt-3 text-[11px] font-semibold text-text-muted">خدمات</p>
          {services.map((s) => (
            <a
              key={s.slug}
              href={`/services/${s.slug}`}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-text-muted hover:bg-panel hover:text-text"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Icon name={s.icon} />
              </span>
              {s.title}
            </a>
          ))}

          <div className="mt-3 flex items-center justify-center gap-2 border-t border-border/70 pt-4">
            <a
              href="/login"
              title="ورود"
              aria-label="ورود"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-text hover:bg-panel"
            >
              <Icon name="login" />
            </a>
            <a
              href="/register"
              title="ثبت‌نام"
              aria-label="ثبت‌نام"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent-hover"
            >
              <Icon name="register" />
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

function ServicesMega() {
  return (
    <div className="flex flex-col gap-0.5">
      {services.map((s) => (
        <a
          key={s.slug}
          href={`/services/${s.slug}`}
          role="menuitem"
          className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-panel"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-hover text-lg text-white shadow-lg shadow-accent/25">
            <Icon name={s.icon} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 font-semibold text-text">
              {s.title}
              <Icon
                name="arrow-left"
                className="text-xs text-text-muted opacity-0 transition-opacity group-hover:opacity-100"
              />
            </span>
            <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-text-muted">
              {s.excerpt}
            </span>
          </span>
        </a>
      ))}
      <a
        href="/services"
        className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-border/60 px-3 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
      >
        مشاهده همه خدمات
        <Icon name="arrow-left" className="text-xs" />
      </a>
    </div>
  );
}