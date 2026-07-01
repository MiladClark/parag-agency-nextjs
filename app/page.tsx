import type { Metadata } from "next";
import { getContentRepository } from "@/content/repository";
import { buildMetadata } from "@/lib/seo";
import { AmbientBackground } from "@/components/home/AmbientBackground";
import { ScrollProgress } from "@/components/home/ScrollProgress";
import { ScrollJourneyLine } from "@/components/home/ScrollJourneyLine";
import { CinematicHero } from "@/components/home/CinematicHero";
import { ManifestoReveal } from "@/components/home/ManifestoReveal";
import { JourneySteps } from "@/components/home/JourneySteps";
import { ServicesList } from "@/components/home/ServicesList";
import { StatsBand } from "@/components/home/StatsBand";
import { PortfolioParallax } from "@/components/home/PortfolioParallax";
import { FinalCta } from "@/components/home/FinalCta";

export async function generateMetadata(): Promise<Metadata> {
  const repo = getContentRepository();
  const page = await repo.getPage("home");
  return page ? buildMetadata(page.seo) : {};
}

export default async function Page() {
  const repo = getContentRepository();
  const [page, services, portfolio] = await Promise.all([
    repo.getPage("home"),
    repo.listServices(),
    repo.listPortfolio(),
  ]);

  return (
    <>
      {page?.seo.jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(page.seo.jsonLd) }}
        />
      )}
      <AmbientBackground />
      <ScrollProgress />
      <div className="relative">
        <ScrollJourneyLine />
        <CinematicHero hero={page!.hero} />
        <ManifestoReveal />
        <JourneySteps />
        <ServicesList services={services} />
        <StatsBand />
        <PortfolioParallax portfolio={portfolio} />
        <FinalCta />
      </div>
    </>
  );
}
