"use client";

import { siteSettings } from "../../content/data/site";
import { services } from "../../content/data/services";
const logoMark = "/logo-mark.svg";
import { Icon } from "../ui/Icon";

export function Footer() {
  const { contact, social } = siteSettings;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <a href="/" className="flex items-center gap-2.5">
            <img src={logoMark} alt="پاراگ" className="h-9 w-9" width={36} height={36} />
            <span className="text-xl font-bold text-text">پاراگ</span>
          </a>
          <p className="max-w-sm text-sm leading-7 text-text-muted">{siteSettings.description}</p>
          <div className="flex items-center gap-2">
            {social.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                <Icon name={s.icon} className="text-lg" />
              </a>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-text">خدمات</h3>
          {services.map((s) => (
            <a
              key={s.slug}
              href={`/services/${s.slug}`}
              className="text-sm text-text-muted transition-colors hover:text-accent"
            >
              {s.title}
            </a>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-text">تماس</h3>
          {contact.phone && (
            <span className="flex items-center gap-2 text-sm text-text-muted">
              <Icon name="phone" className="text-accent" />
              {contact.phone}
            </span>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent"
            >
              <Icon name="mail" className="text-accent" />
              {contact.email}
            </a>
          )}
          {contact.address && (
            <span className="flex items-center gap-2 text-sm text-text-muted">
              <Icon name="map" className="text-accent" />
              {contact.address}
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-text-muted sm:flex-row sm:px-8">
          <span>© {year} آژانس دیجیتال مارکتینگ پاراگ. تمامی حقوق محفوظ است.</span>
          <span>ساخته‌شده با ❤ برای رشد برند شما</span>
        </div>
      </div>
    </footer>
  );
}