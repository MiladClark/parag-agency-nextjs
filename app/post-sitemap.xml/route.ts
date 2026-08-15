import { getContentRepository } from "@/content/repository";
import { indexingDisabled, urlsetXml, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET() {
  if (await indexingDisabled()) return xmlResponse(urlsetXml([]));

  const { posts } = await getContentRepository().listPosts({ page: 1, perPage: 1000 });

  return xmlResponse(
    urlsetXml(
      posts.map((post) => ({
        path: `/blog/${post.slug}`,
        lastmod: post.updatedAt ?? post.publishedAt,
        changefreq: "weekly" as const,
        priority: post.featured ? 0.9 : 0.7,
        // A cover carries the article's <image:image> so Google Images can pick
        // it up without crawling the page first.
        images: post.coverImage ? [{ loc: post.coverImage, title: post.title }] : undefined,
      })),
    ),
  );
}
