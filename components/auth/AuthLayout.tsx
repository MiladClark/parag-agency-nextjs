"use client";

import { usePathname } from "next/navigation";
const logoMark = "/logo-mark.svg";
import { Icon } from "../ui/Icon";
import { AuthSlider } from "./AuthSlider";

function AuthTabs() {
  const urlPathname = usePathname();
  const tabs = [
    { href: "/login", label: "ورود" },
    { href: "/register", label: "ثبت‌نام" },
  ];
  return (
    <div className="mb-8 grid grid-cols-2 gap-1 rounded-lg border border-border bg-panel p-1">
      {tabs.map((t) => {
        const active = urlPathname.startsWith(t.href);
        return (
          <a
            key={t.href}
            href={t.href}
            className={`rounded-md py-2 text-center text-sm font-medium transition-colors ${
              active ? "bg-accent text-white shadow-sm" : "text-text-muted hover:text-text"
            }`}
          >
            {t.label}
          </a>
        );
      })}
    </div>
  );
}

// Full-page split auth layout: form column (start/right) + special slider
// column (end/left, wider). No header/footer — see +Layout.
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Form column */}
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-[44%] lg:px-14">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
        >
          <Icon name="arrow-left" className="rotate-180" />
          بازگشت به سایت
        </a>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <a href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src={logoMark} alt="پاراگ" className="h-9 w-9" />
            <span className="text-xl font-bold text-text">پاراگ</span>
          </a>

          <AuthTabs />

          <h1 className="text-2xl font-extrabold text-text sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-center text-sm text-text-muted">{footer}</p>
        </div>
      </div>

      {/* Slider column */}
      <div className="relative hidden lg:block lg:w-[56%]">
        <AuthSlider />
      </div>
    </div>
  );
}
