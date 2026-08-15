import { getContentRepository } from "@/content/repository";
import { indexXml, indexingDisabled, newest, xmlResponse, type SitemapSection } from "@/lib/sitemap";

// The sitemap index — one entry per section file. Sections with nothing in them
// are dropped rather than advertised as empty, which is what Search Console
// flags as "couldn't fetch / no URLs".
export const revalidate = 3600;

export async function GET() {
  if (await indexingDisabled()) return xmlResponse(indexXml([]));

  const repo = getContentRepository();
  const [services, { posts }, categories, tags, portfolio] = await Promise.all([
    repo.listServices(),
    repo.listPosts({ page: 1, perPage: 1000 }),
    repo.listCategories(),
    repo.listTags(),
    repo.listPortfolio(),
  ]);

  const postsTouched = newest(posts.map((p) => p.updatedAt ?? p.publishedAt));
  const now = new Date();

  const sections: SitemapSection[] = [
    { name: "page", lastmod: now },
    { name: "service", lastmod: services.length > 0 ? now : null },
    { name: "portfolio", lastmod: portfolio.length > 0 ? now : null },
    { name: "post", lastmod: postsTouched },
    { name: "category", lastmod: postsTouched },
    { name: "tag", lastmod: postsTouched },
  ];

  const counts: Record<string, number> = {
    page: 1,
    service: services.length,
    portfolio: portfolio.length,
    post: posts.length,
    category: categories.length,
    tag: tags.length,
  };

  return xmlResponse(indexXml(sections.filter((s) => (counts[s.name] ?? 0) > 0)));
}
