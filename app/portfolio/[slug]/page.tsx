import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentRepository } from "@/content/repository";
import { buildMetadata } from "@/lib/seo";
import { decodeSlugParam } from "@/lib/slug";
import { getPortfolioCase, portfolioCases } from "@/content/data/portfolioCases";
import { CaseHero } from "@/components/portfolio/CaseHero";
import { CaseMeta } from "@/components/portfolio/CaseMeta";
import { CaseOverview } from "@/components/portfolio/CaseOverview";
import { CaseFeatures } from "@/components/portfolio/CaseFeatures";
import { CaseGallery } from "@/components/portfolio/CaseGallery";
import { CaseResults } from "@/components/portfolio/CaseResults";
import { CaseCta } from "@/components/portfolio/CaseCta";
import { CaseVectorRail } from "@/components/portfolio/CaseVectorRail";
import { PortfolioSimple } from "@/components/portfolio/PortfolioSimple";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const repo = getContentRepository();
  const items = await repo.listPortfolio();
  const slugs = new Set([...items.map((i) => i.slug), ...portfolioCases.map((c) => c.slug)]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeSlugParam(raw);
  const caseStudy = getPortfolioCase(slug);
  if (caseStudy) return buildMetadata(caseStudy.seo);

  const items = await getContentRepository().listPortfolio();
  const item = items.find((i) => i.slug === slug);
  if (!item) return {};
  return buildMetadata({
    title: `${item.title} | نمونه‌کار پاراگ`,
    description: item.summary,
    canonical: `https://parag.agency/portfolio/${item.slug}`,
  });
}

export default async function Page({ params }: { params: Params }) {
  const { slug: raw } = await params;
  const slug = decodeSlugParam(raw);
  const caseStudy = getPortfolioCase(slug);

  if (caseStudy) {
    return (
      <div className="relative">
        <CaseHero
          title={caseStudy.title}
          summary={caseStudy.summary}
          category={caseStudy.category}
          client={caseStudy.client}
          heroImage={caseStudy.heroImage}
          devices={caseStudy.gallery.map((g) => g.src).slice(0, 3)}
        />
        <CaseMeta
          year={caseStudy.year}
          role={caseStudy.role}
          timeline={caseStudy.timeline}
          platform={caseStudy.platform}
        />
        <CaseOverview
          paragraphs={caseStudy.overview}
          challenge={caseStudy.challenge}
          solution={caseStudy.solution}
        />
        <CaseVectorRail />
        <CaseFeatures features={caseStudy.features} />
        <CaseGallery images={caseStudy.gallery} />
        <CaseResults results={caseStudy.results} stack={caseStudy.stack} />
        <CaseCta />
      </div>
    );
  }

  const items = await getContentRepository().listPortfolio();
  const item = items.find((i) => i.slug === slug);
  if (!item) notFound();
  return <PortfolioSimple item={item} />;
}
