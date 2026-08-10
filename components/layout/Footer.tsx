"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowUp, ChevronLeft } from "lucide-react";
import { siteSettings } from "../../content/data/site";
import { services } from "../../content/data/services";
import { toPersianDigits } from "../../lib/format";
import { Icon } from "../ui/Icon";

const SPRING = { type: "spring", stiffness: 300, damping: 24 } as const;

const quickLinks = [
  { label: "خانه", href: "/" },
  { label: "درباره ما", href: "/about" },
  { label: "نمونه کارها", href: "/portfolio" },
  { label: "بلاگ", href: "/blog" },
  { label: "تماس با ما", href: "/contact" },
];

export function Footer() {
  const reduce = useReducedMotion();
  const { contact, social } = siteSettings;
  const year = toPersianDigits(new Date().getFullYear());

  return (
    <footer className="px-3 pb-4 pt-10 sm:px-5 sm:pb-6">
      {/* Floating island card, matching the header's detached style */}
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-border/70 bg-surface/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        {/* ambient brand glows */}
        <div
          className="pointer-events-none absolute -top-40 start-1/4 h-80 w-80 rounded-full bg-accent/10 blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-48 end-8 h-72 w-72 rounded-full bg-accent/[0.07] blur-[110px]"
          aria-hidden
        />
        {/* top accent sheen */}
        <div
          className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-l from-transparent via-accent/40 to-transparent"
          aria-hidden
        />

        {/* CTA band */}
        <div className="relative border-b border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-black leading-snug text-text sm:text-3xl">
              پروژه‌ای در ذهن دارید؟
            </h2>
            <p className="mt-2 max-w-md text-sm leading-7 text-text-muted">
              از استراتژی تا اجرا کنار شما هستیم. اولین جلسه مشاوره رایگان است.
            </p>
          </div>
          <motion.a
            href="/contact"
            whileHover={reduce ? undefined : { scale: 1.04 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            transition={SPRING}
            className="group relative isolate flex shrink-0 items-center gap-2.5 overflow-hidden rounded-full bg-linear-to-b from-accent to-accent-hover px-7 py-3.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_28px_-10px_color-mix(in_srgb,var(--accent)_60%,transparent)] transition-all duration-300 after:absolute after:inset-0 after:-z-10 after:-translate-x-[150%] after:bg-linear-to-r after:from-transparent after:via-white/25 after:to-transparent after:transition-transform after:duration-700 after:ease-out hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_18px_38px_-12px_color-mix(in_srgb,var(--accent)_75%,transparent)] hover:after:translate-x-[150%]"
          >
            شروع همکاری
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </motion.a>
        </div>
      </div>

      {/* Main grid */}
      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <a href="/" className="group flex items-center gap-2.5">
            <img
              src="/logo-mark.svg"
              alt="پاراگ"
              className="h-10 w-10 transition-transform duration-500 group-hover:rotate-[360deg]"
              width={40}
              height={40}
            />
            <span className="text-xl font-black text-text">پاراگ</span>
          </a>
          <p className="max-w-sm text-sm leading-7 text-text-muted">{siteSettings.description}</p>
          <div className="mt-1 flex items-center gap-2">
            {social.map((s) => (
              <motion.a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                whileHover={reduce ? undefined : { y: -4, scale: 1.08 }}
                whileTap={reduce ? undefined : { scale: 0.94 }}
                transition={SPRING}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-panel/60 text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
              >
                <Icon name={s.icon} className="text-lg" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Services */}
        <FooterColumn title="خدمات">
          {services.map((s) => (
            <FooterLink key={s.slug} href={`/services/${s.slug}`} label={s.title} />
          ))}
        </FooterColumn>

        {/* Quick links */}
        <FooterColumn title="دسترسی سریع">
          {quickLinks.map((item) => (
            <FooterLink key={item.href} href={item.href} label={item.label} />
          ))}
        </FooterColumn>

        {/* Contact */}
        <FooterColumn title="در تماس باشیم">
          {contact.phone && (
            <span className="flex items-center gap-2.5 text-sm text-text-muted">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon name="phone" />
              </span>
              {contact.phone}
            </span>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2.5 text-sm text-text-muted transition-colors hover:text-accent"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon name="mail" />
              </span>
              {contact.email}
            </a>
          )}
          {contact.address && (
            <span className="flex items-center gap-2.5 text-sm text-text-muted">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon name="map" />
              </span>
              {contact.address}
            </span>
          )}
        </FooterColumn>
      </div>

      {/* Giant watermark wordmark */}
      <div
        className="pointer-events-none relative -mt-16 select-none overflow-hidden sm:-mt-24 md:-mt-32"
        aria-hidden
      >
        <p className="translate-y-[30%] bg-gradient-to-t from-accent/[0.07] to-transparent bg-clip-text text-center text-[clamp(6rem,22vw,17rem)] font-black leading-none text-transparent">
          پاراگ
        </p>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-border/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 text-xs text-text-muted sm:px-8">
          <span>© {year} آژانس دیجیتال مارکتینگ پاراگ. تمامی حقوق محفوظ است.</span>
          <motion.button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
            whileHover={reduce ? undefined : { y: -3 }}
            whileTap={reduce ? undefined : { scale: 0.92 }}
            transition={SPRING}
            aria-label="بازگشت به بالای صفحه"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-panel text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3.5">
      <h3 className="text-sm font-black text-text">{title}</h3>
      {children}
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-accent"
    >
      <ChevronLeft className="h-3.5 w-3.5 -translate-x-1.5 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
      <span className="transition-transform duration-300 group-hover:-translate-x-1">{label}</span>
    </a>
  );
}
