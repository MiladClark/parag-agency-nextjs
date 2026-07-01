import type { Metadata } from "next";
import { getContentRepository } from "@/content/repository";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { PortfolioCard } from "@/components/cards/PortfolioCard";

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
    <>
      <Hero hero={page.hero} compact />
      <Section className="!pt-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((item, i) => (
            <Reveal key={item.slug} delay={(i % 3) * 80}>
              <PortfolioCard item={item} />
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
