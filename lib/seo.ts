import type { Metadata } from "next";

import type { SeoMeta } from "../content/types";
import { getSiteSettings } from "./siteSettings";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://parag.agency").replace(
  /\/$/,
  "",
);
export const SITE_NAME = "آژانس پاراگ";
export const LOCALE = "fa_IR";

/** Article-only Open Graph fields; ignored unless `seo.ogType === "article"`. */
export type ArticleMeta = {
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
};

/**
 * Self-referencing canonical for a paginated archive. Page 2 pointing at page 1
 * hides its posts from Google, so each page canonicalises to itself; `?q=`
 * search results get no canonical at all (see `NOINDEX`).
 *
 * `path` must already be percent-encoded — slugs here are Persian.
 */
export function archiveCanonical(path: string, page = 1): string {
  return page > 1 ? `${SITE_URL}${path}?page=${page}` : `${SITE_URL}${path}`;
}

/** Thin/duplicate surfaces (search results): crawl the links, index nothing. */
export const NOINDEX = { index: false, follow: true } as const;

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
export async function buildMetadata(seo: SeoMeta, article?: ArticleMeta): Promise<Metadata> {
  const settings = await getSiteSettings();
  const keywords = mergeKeywords(seo.keywords, settings.seo.primaryKeyword);
  const images = seo.ogImage ? [seo.ogImage] : undefined;

  const shared = {
    title: seo.title,
    description: seo.description,
    url: seo.canonical,
    siteName: SITE_NAME,
    locale: LOCALE,
    images,
  };

  return {
    title: seo.title,
    description: seo.description,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    keywords,
    openGraph:
      seo.ogType === "article"
        ? {
            ...shared,
            type: "article",
            publishedTime: article?.publishedTime,
            modifiedTime: article?.modifiedTime ?? article?.publishedTime,
            authors: article?.authors,
            section: article?.section,
            tags: article?.tags,
          }
        : { ...shared, type: "website" },
    twitter: {
      card: seo.ogImage ? "summary_large_image" : "summary",
      title: seo.title,
      description: seo.description,
      images,
    },
  };
}
