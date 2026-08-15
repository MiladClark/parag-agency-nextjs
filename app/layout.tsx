import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { CmsSiteIntegrations } from "@/components/seo/CmsSiteIntegrations";
import { buildVerification, LOCALE, SITE_NAME, SITE_URL } from "@/lib/seo";
import { getSiteSettings } from "@/lib/siteSettings";
import { themeInitScript } from "@/lib/theme";

// Site-level structured data: who publishes this, and how to search it. Emitted
// once from the root layout so every page inherits it.
const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo-mark.svg`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: "fa-IR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
];

// Root metadata inherits CMS indexing, keywords and ownership verification.
// Page-level metadata merges on top via generateMetadata / buildMetadata.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const keywords = settings.seo.primaryKeyword
    ? [settings.seo.primaryKeyword]
    : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "پاراگ | آژانس دیجیتال مارکتینگ",
      template: "%s | پاراگ",
    },
    description: "آژانس دیجیتال مارکتینگ پاراگ",
    keywords,
    verification: buildVerification(settings),
    openGraph: { siteName: SITE_NAME, locale: LOCALE, type: "website" },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <CmsSiteIntegrations settings={settings} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
