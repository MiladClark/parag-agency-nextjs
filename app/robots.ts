import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/siteSettings";
import { SITE_URL } from "@/lib/seo";

// The other half of the CMS indexing switch: the meta tag tells a crawler not to
// index a page it has already fetched, this tells it not to fetch at all.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { indexing } = await getSiteSettings();

  if (indexing.noindex) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    // `?q=` search results are thin duplicates of the archive they filter.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/blog?q=", "/*?q="] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL.replace(/^https?:\/\//, ""),
  };
}
