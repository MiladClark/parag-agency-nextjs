import type { Metadata } from "next";
import { getContentRepository } from "@/content/repository";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

export async function generateMetadata(): Promise<Metadata> {
  const repo = getContentRepository();
  const page = await repo.getPage("about");
  return page ? buildMetadata(page.seo) : {};
}

export default async function Page() {
  const repo = getContentRepository();
  const page = await repo.getPage("about");
  if (!page) return null;
  return (
    <>
      <Hero hero={page.hero} />
      {page.sections?.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}
