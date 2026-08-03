import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { themeInitScript } from "@/lib/theme";
import { getSiteSettings } from "@/lib/siteSettings";

// Async so the indexing switch in the CMS («وب‌سایت‌ها → سئو و تحلیل») can put a
// noindex tag on every page of this site. Page-level metadata merges on top of
// this, and `robots` is inherited unless a page overrides it.
export async function generateMetadata(): Promise<Metadata> {
  const { indexing } = await getSiteSettings();

  return {
    title: {
      default: "پاراگ | آژانس دیجیتال مارکتینگ",
      template: "%s | پاراگ",
    },
    description: "آژانس دیجیتال مارکتینگ پاراگ",
    ...(indexing.noindex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: { index: false, follow: false },
          },
        }
      : {}),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-mark.svg" />
        <meta name="theme-color" content="#0caf20" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
