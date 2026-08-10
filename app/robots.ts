import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/siteSettings";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://parag.agency").replace(/\/$/, "");

// The other half of the CMS indexing switch: the meta tag tells a crawler not to
// index a page it has already fetched, this tells it not to fetch at all.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { indexing } = await getSiteSettings();

  if (indexing.noindex) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL.replace(/^https?:\/\//, ""),
  };
}
