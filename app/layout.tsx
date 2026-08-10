import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { CmsSiteIntegrations } from "@/components/seo/CmsSiteIntegrations";
import { buildVerification } from "@/lib/seo";
import { getSiteSettings } from "@/lib/siteSettings";
import { themeInitScript } from "@/lib/theme";

// Root metadata inherits CMS indexing, keywords and ownership verification.
// Page-level metadata merges on top via generateMetadata / buildMetadata.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const keywords = settings.seo.primaryKeyword
    ? [settings.seo.primaryKeyword]
    : undefined;

  return {
    title: {
      default: "پاراگ | آژانس دیجیتال مارکتینگ",
      template: "%s | پاراگ",
    },
    description: "آژانس دیجیتال مارکتینگ پاراگ",
    keywords,
    verification: buildVerification(settings),
    ...(settings.indexing.noindex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: { index: false, follow: false },
          },
        }
      : {
          robots: { index: true, follow: true },
        }),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-mark.svg" />
        <meta name="theme-color" content="#0caf20" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <CmsSiteIntegrations settings={settings} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
