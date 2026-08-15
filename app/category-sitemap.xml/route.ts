import { getContentRepository } from "@/content/repository";
import { indexingDisabled, newest, urlsetXml, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET() {
  if (await indexingDisabled()) return xmlResponse(urlsetXml([]));

  const repo = getContentRepository();
  const [categories, { posts }] = await Promise.all([
    repo.listCategories(),
    repo.listPosts({ page: 1, perPage: 1000 }),
  ]);

  // An archive is only as fresh as its newest post.
  return xmlResponse(
    urlsetXml(
      categories.map((category) => ({
        path: `/blog/category/${category.slug}`,
        lastmod: newest(
          posts
            .filter((p) => p.category === category.slug)
            .map((p) => p.updatedAt ?? p.publishedAt),
        ),
        changefreq: "weekly" as const,
        priority: 0.6,
      })),
    ),
  );
}
