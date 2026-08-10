import type { MetadataRoute } from "next";
import { getContentRepository } from "@/content/repository";
import { getSiteSettings } from "@/lib/siteSettings";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://parag.agency").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Respect the CMS indexing switch — an empty sitemap is safer than listing
  // URLs while robots.txt (and meta) already say "do not index".
  const { indexing } = await getSiteSettings();
  if (indexing.noindex) return [];

  const repo = getContentRepository();
  const [services, { posts }, categories, tags] = await Promise.all([
    repo.listServices(),
    repo.listPosts({ page: 1, perPage: 1000 }),
    repo.listCategories(),
    repo.listTags(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, priority: 1, changeFrequency: "weekly", lastModified: now },
    { url: `${SITE_URL}/about`, priority: 0.7, changeFrequency: "monthly", lastModified: now },
    { url: `${SITE_URL}/contact`, priority: 0.6, changeFrequency: "monthly", lastModified: now },
    { url: `${SITE_URL}/services`, priority: 0.8, changeFrequency: "weekly", lastModified: now },
    { url: `${SITE_URL}/portfolio`, priority: 0.8, changeFrequency: "weekly", lastModified: now },
    { url: `${SITE_URL}/blog`, priority: 0.9, changeFrequency: "daily", lastModified: now },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${SITE_URL}/services/${encodeURIComponent(s.slug)}`,
    priority: 0.7,
    changeFrequency: "monthly",
    lastModified: now,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${encodeURIComponent(p.slug)}`,
    priority: p.featured ? 0.85 : 0.7,
    changeFrequency: "weekly",
    lastModified: new Date(p.updatedAt ?? p.publishedAt),
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/blog/category/${encodeURIComponent(c.slug)}`,
    priority: 0.55,
    changeFrequency: "weekly",
    lastModified: now,
  }));

  const tagRoutes: MetadataRoute.Sitemap = tags.map((t) => ({
    url: `${SITE_URL}/blog/tag/${encodeURIComponent(t.tag)}`,
    priority: 0.4,
    changeFrequency: "weekly",
    lastModified: now,
  }));

  return [...staticRoutes, ...serviceRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes];
}
