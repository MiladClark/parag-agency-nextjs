import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/siteSettings";

const SITE_URL = "https://parag.agency";

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
  };
}
