import { getContentRepository } from "@/content/repository";
import { indexingDisabled, urlsetXml, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET() {
  if (await indexingDisabled()) return xmlResponse(urlsetXml([]));

  const items = await getContentRepository().listPortfolio();
  const now = new Date();

  return xmlResponse(
    urlsetXml(
      items.map((item) => ({
        path: `/portfolio/${item.slug}`,
        lastmod: now,
        changefreq: "monthly" as const,
        priority: 0.7,
        images: item.coverImage ? [{ loc: item.coverImage, title: item.title }] : undefined,
      })),
    ),
  );
}
