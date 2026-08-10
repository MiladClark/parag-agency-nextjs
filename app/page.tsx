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
import { LatestPosts } from "@/components/home/LatestPosts";
import { FinalCta } from "@/components/home/FinalCta";
import { fileRepository } from "@/content/fileRepository";

export async function generateMetadata(): Promise<Metadata> {
  const repo = getContentRepository();
  const page = await repo.getPage("home");
  return page ? buildMetadata(page.seo) : {};
}

export default async function Page() {
  const repo = getContentRepository();
  const [page, services, portfolio, blog] = await Promise.all([
    repo.getPage("home"),
    repo.listServices(),
    repo.listPortfolio(),
    repo.listPosts({ page: 1, perPage: 4 }),
  ]);

  // Homepage needs four posts (one featured + three sidebar). When the CMS has
  // fewer, top up from bundled file content so the layout never collapses.
  const filePosts = (await fileRepository.listPosts({ page: 1, perPage: 4 })).posts;
  const cmsSlugs = new Set(blog.posts.map((p) => p.slug));
  const latestPosts =
    blog.posts.length >= 4
      ? blog.posts.slice(0, 4)
      : [
          ...blog.posts,
          ...filePosts.filter((p) => !cmsSlugs.has(p.slug)),
        ].slice(0, 4);

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
        <LatestPosts posts={latestPosts} />
        <FinalCta />
      </div>
    </>
  );
}
