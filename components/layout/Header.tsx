"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Menu, Search } from "lucide-react";
import { services } from "../../content/data/services";
import { Icon } from "../ui/Icon";
import { ThemeToggle } from "../ThemeToggle";
import { HoverMenu } from "./HoverMenu";
import { SearchPalette } from "./SearchPalette";
import { MobileMenu } from "./MobileMenu";

const SPRING = { type: "spring", stiffness: 380, damping: 32, mass: 0.7 } as const;

type NavEntry = { label: string; href: string; mega?: boolean };

const navEntries: NavEntry[] = [
  { label: "خانه", href: "/" },
  { label: "خدمات", href: "/services", mega: true },
  { label: "نمونه کارها", href: "/portfolio" },
  { label: "بلاگ", href: "/blog" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس", href: "/contact" },
];

function isActive(href: string, path: string): boolean {
  return href === "/" ? path === "/" : path.startsWith(href);
}

export function Header() {
  const path = usePathname() ?? "/";
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [floating, setFloating] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  // The glassy island detaches from the top edge after 150px of scroll.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 150;
    setFloating((prev) => (prev === next ? prev : next));
  });

  useEffect(() => setMenuOpen(false), [path]);

  // Global shortcut: Ctrl/Cmd+K opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* Outer wrapper morphs between a full-width transparent bar and a
            floating glass island detached from the top edge. */}
        <div
          className={`mx-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            floating ? "mt-3 max-w-6xl px-3 sm:mt-4 sm:px-4" : "mt-0 max-w-none px-0"
          }`}
        >
          <div
            className={`relative transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              floating
                ? "rounded-full border border-border/60 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.55)]"
                : "rounded-none border border-transparent"
            }`}
          >
            {/* Glass layer fades in; blur stays constant so only opacity animates. */}
            <div
              className={`pointer-events-none absolute inset-0 rounded-[inherit] bg-bg/75 backdrop-blur-2xl backdrop-saturate-150 transition-opacity duration-500 ${
                floating ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden
            />

            <div
              className={`relative mx-auto flex max-w-7xl items-center justify-between gap-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:grid lg:grid-cols-[1fr_auto_1fr] ${
                floating ? "h-16 px-4 sm:px-6" : "h-[4.5rem] px-5 sm:px-8"
              }`}
            >
          {/* Brand */}
          <a href="/" className="group flex shrink-0 items-center lg:justify-self-start">
            <img
              src="/logo-mark.svg"
              alt="پاراگ"
              className="h-9 w-9 transition-transform duration-500 group-hover:rotate-[360deg] lg:hidden"
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

          {/* Center pill nav: hover highlight glides between items. */}
          <nav
            className="relative hidden items-center rounded-full border border-border/60 bg-gradient-to-b from-panel/70 via-panel/40 to-panel/20 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.2),0_10px_30px_-18px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:flex lg:justify-self-center"
            onMouseLeave={() => setHovered(null)}
          >
            {/* faint accent bloom inside the pill */}
            <span
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-accent/40 to-transparent"
              aria-hidden
            />
            {navEntries.map((item) => {
              const active = isActive(item.href, path);
              const inner = (
                <>
                  {hovered === item.href && (
                    <motion.span
                      layoutId="nav-hover-pill"
                      transition={reduce ? { duration: 0 } : SPRING}
                      className="absolute inset-0 rounded-full border border-accent/20 bg-gradient-to-l from-accent/10 via-transparent to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      aria-hidden
                    />
                  )}
                  {active && <span className="nav-active-ring" aria-hidden />}
                  <span
                    className={`relative ${
                      active ? "font-bold text-accent" : "text-text-muted"
                    } transition-colors group-hover:text-text`}
                  >
                    {item.label}
                  </span>
                </>
              );

              if (item.mega) {
                return (
                  <span
                    key={item.href}
                    onMouseEnter={() => setHovered(item.href)}
                    className="relative inline-flex rounded-full"
                  >
                    {active && <span className="nav-active-ring" aria-hidden />}
                    <HoverMenu
                      label={item.label}
                      href={item.href}
                      width="w-[27rem]"
                      active={active}
                    >
                      <ServicesMega />
                    </HoverMenu>
                  </span>
                );
              }

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHovered(item.href)}
                  className="group relative rounded-full px-4 py-2 text-sm font-medium"
                >
                  {inner}
                </a>
              );
            })}
          </nav>

          {/* End actions */}
          <div className="flex shrink-0 items-center gap-2 lg:justify-self-end">
            {/* Desktop search trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group hidden h-10 items-center gap-2.5 rounded-full border border-border/50 bg-transparent ps-3.5 pe-2 text-sm text-text-muted transition-all hover:border-accent/30 hover:bg-gradient-to-l hover:from-accent/10 hover:via-transparent hover:to-transparent hover:text-text lg:flex"
              aria-label="جستجو در سایت"
            >
              <Search className="h-4 w-4 text-accent" />
              <span className="pe-3">جستجو</span>
              <kbd className="rounded-md border border-border/60 px-1.5 py-0.5 font-sans text-[10px] text-text-muted">
                Ctrl K
              </kbd>
            </button>

            {/* Mobile search trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-transparent text-text transition-colors hover:border-accent/40 hover:text-accent lg:hidden"
              aria-label="جستجو"
            >
              <Search className="h-4 w-4" />
            </button>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="منو"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-transparent text-text transition-colors hover:border-accent/40 hover:text-accent lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
            </div>
          </div>
        </div>
      </header>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} path={path} />
    </>
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
          className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-transparent p-3 transition-all duration-300 hover:border-accent/20 hover:bg-gradient-to-l hover:from-accent/10 hover:via-transparent hover:to-transparent hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-white group-hover:shadow-lg group-hover:shadow-accent/30">
            <Icon name={s.icon} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-sm font-bold text-text transition-colors group-hover:text-accent">
              {s.title}
              <Icon
                name="arrow-left"
                className="translate-x-1.5 text-[10px] text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
              />
            </span>
            <span className="mt-0.5 block line-clamp-2 text-xs leading-5 text-text-muted">
              {s.excerpt}
            </span>
          </span>
        </a>
      ))}
      <a
        href="/services"
        className="mt-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border/60 px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent-soft"
      >
        مشاهده همه خدمات
        <Icon name="arrow-left" className="text-xs" />
      </a>
    </div>
  );
}
