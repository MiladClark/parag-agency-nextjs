import type { Metadata } from "next";

import type { SeoMeta } from "../content/types";
import { getSiteSettings } from "./siteSettings";

function mergeKeywords(
  pageKeywords: string[] | undefined,
  primaryKeyword: string | null,
): string[] | undefined {
  const merged: string[] = [];
  const seen = new Set<string>();

  const push = (value: string | null | undefined) => {
    const t = value?.trim();
    if (!t) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(t);
  };

  // Site-wide primary keyword first — strongest signal from the CMS.
  push(primaryKeyword);
  for (const k of pageKeywords ?? []) push(k);

  return merged.length > 0 ? merged : undefined;
}

export function buildVerification(settings: {
  verification: { google: string | null; bing: string | null; yandex: string | null };
}): Metadata["verification"] {
  const { google, bing, yandex } = settings.verification;
  const other: Record<string, string | number | (string | number)[]> = {};
  if (bing) other["msvalidate.01"] = bing;

  if (!google && !yandex && Object.keys(other).length === 0) return undefined;

  return {
    ...(google ? { google } : {}),
    ...(yandex ? { yandex } : {}),
    ...(Object.keys(other).length > 0 ? { other } : {}),
  };
}

// Drives a page's metadata from the content layer + CMS site SEO.
// JSON-LD is NOT included here — render it in page JSX via
// `<script type="application/ld+json" />` wherever `meta.jsonLd` is set.
export async function buildMetadata(seo: SeoMeta): Promise<Metadata> {
  const settings = await getSiteSettings();
  const keywords = mergeKeywords(seo.keywords, settings.seo.primaryKeyword);

  return {
    title: seo.title,
    description: seo.description,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    keywords,
    openGraph: {
      type: (seo.ogType ?? "website") as "website",
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
      url: seo.canonical,
    },
    twitter: {
      card: seo.ogImage ? "summary_large_image" : "summary",
      title: seo.title,
      description: seo.description,
    },
  };
}
