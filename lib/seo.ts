import type { Metadata } from "next";
import type { SeoMeta } from "../content/types";

// Drives a page's metadata from the content layer.
// JSON-LD is NOT included here — render it directly in page JSX via
// `<script type="application/ld+json" />` wherever `meta.jsonLd` is set.
export function buildMetadata(seo: SeoMeta): Metadata {
  return {
    title: seo.title,
    description: seo.description,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    keywords: seo.keywords,
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
