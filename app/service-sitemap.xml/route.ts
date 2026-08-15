import { getContentRepository } from "@/content/repository";
import { indexingDisabled, urlsetXml, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET() {
  if (await indexingDisabled()) return xmlResponse(urlsetXml([]));

  const services = await getContentRepository().listServices();
  const now = new Date();

  return xmlResponse(
    urlsetXml(
      services.map((service) => ({
        path: `/services/${service.slug}`,
        lastmod: now,
        changefreq: "monthly" as const,
        priority: 0.7,
      })),
    ),
  );
}
