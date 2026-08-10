import type { Metadata } from "next";
import { getContentRepository } from "@/content/repository";
import { buildMetadata } from "@/lib/seo";
import { PortfolioStageHero } from "@/components/portfolio/PortfolioStageHero";
import { PortfolioShowcase } from "@/components/portfolio/PortfolioShowcase";
import { PortfolioOrbitCta } from "@/components/portfolio/PortfolioOrbitCta";

export async function generateMetadata(): Promise<Metadata> {
  const repo = getContentRepository();
  const page = await repo.getPage("portfolio");
  return page ? buildMetadata(page.seo) : {};
}

export default async function Page() {
  const repo = getContentRepository();
  const [page, portfolio] = await Promise.all([repo.getPage("portfolio"), repo.listPortfolio()]);
  if (!page) return null;

  return (
    <div className="relative">
      <PortfolioStageHero
        title={page.hero.title}
        subtitle={page.hero.subtitle}
        items={portfolio}
      />
      <PortfolioShowcase items={portfolio} />
      <PortfolioOrbitCta />
    </div>
  );
}
