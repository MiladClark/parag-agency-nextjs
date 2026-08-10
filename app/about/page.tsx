import type { Metadata } from "next";
import { getContentRepository } from "@/content/repository";
import { buildMetadata } from "@/lib/seo";
import { aboutCopy } from "@/content/data/about";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutStory } from "@/components/about/AboutStory";
import { AboutValues } from "@/components/about/AboutValues";
import { AboutApproach } from "@/components/about/AboutApproach";
import { AboutStats } from "@/components/about/AboutStats";
import { AboutTeam } from "@/components/about/AboutTeam";
import { AboutCta } from "@/components/about/AboutCta";

export async function generateMetadata(): Promise<Metadata> {
  const repo = getContentRepository();
  const page = await repo.getPage("about");
  return page ? buildMetadata(page.seo) : {};
}

export default async function Page() {
  const repo = getContentRepository();
  const page = await repo.getPage("about");
  if (!page) return null;

  const { hero, story, values, approach, stats, team, cta } = aboutCopy;

  return (
    <div className="relative">
      <AboutHero
        title={hero.title}
        subtitle={hero.subtitle}
        cta={hero.cta}
        secondaryCta={hero.secondaryCta}
      />
      <AboutStory
        title={story.title}
        paragraphs={story.paragraphs}
        highlights={story.highlights}
      />
      <AboutValues title={values.title} items={values.items} />
      <AboutApproach title={approach.title} body={approach.body} steps={approach.steps} />
      <AboutStats title={stats.title} items={stats.items} />
      <AboutTeam title={team.title} body={team.body} members={team.members} />
      <AboutCta title={cta.title} body={cta.body} cta={cta.cta} />
    </div>
  );
}
