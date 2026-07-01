import type { MetadataRoute } from "next";
import { getContentRepository } from "@/content/repository";

const SITE_URL = "https://parag.agency";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = getContentRepository();
  const [services, portfolio] = await Promise.all([repo.listServices(), repo.listPortfolio()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, priority: 1 },
    { url: `${SITE_URL}/about` },
    { url: `${SITE_URL}/contact` },
    { url: `${SITE_URL}/portfolio` },
    { url: `${SITE_URL}/services` },
  ].map((r) => ({ ...r, lastModified: new Date() }));

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: new Date(),
  }));

  const portfolioRoutes: MetadataRoute.Sitemap = portfolio.map((p) => ({
    url: `${SITE_URL}/portfolio#${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...serviceRoutes, ...portfolioRoutes];
}
