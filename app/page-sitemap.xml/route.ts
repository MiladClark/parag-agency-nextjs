import { indexingDisabled, urlsetXml, xmlResponse, type SitemapEntry } from "@/lib/sitemap";

// Static, hand-built routes. Detail pages (services, portfolio, posts) live in
// their own section files.
export const revalidate = 3600;

const PAGES: SitemapEntry[] = [
  { path: "/", priority: 1, changefreq: "weekly" },
  { path: "/services", priority: 0.8, changefreq: "weekly" },
  { path: "/portfolio", priority: 0.8, changefreq: "weekly" },
  { path: "/blog", priority: 0.9, changefreq: "daily" },
  { path: "/about", priority: 0.7, changefreq: "monthly" },
  { path: "/contact", priority: 0.6, changefreq: "monthly" },
];

export async function GET() {
  if (await indexingDisabled()) return xmlResponse(urlsetXml([]));

  const now = new Date();
  return xmlResponse(urlsetXml(PAGES.map((page) => ({ ...page, lastmod: now }))));
}
