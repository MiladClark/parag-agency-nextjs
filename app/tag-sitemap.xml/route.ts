import { getContentRepository } from "@/content/repository";
import { indexingDisabled, newest, urlsetXml, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET() {
  if (await indexingDisabled()) return xmlResponse(urlsetXml([]));

  const repo = getContentRepository();
  const [tags, { posts }] = await Promise.all([
    repo.listTags(),
    repo.listPosts({ page: 1, perPage: 1000 }),
  ]);

  return xmlResponse(
    urlsetXml(
      tags.map(({ tag }) => ({
        path: `/blog/tag/${tag}`,
        lastmod: newest(
          posts.filter((p) => p.tags.includes(tag)).map((p) => p.updatedAt ?? p.publishedAt),
        ),
        changefreq: "weekly" as const,
        priority: 0.4,
      })),
    ),
  );
}
