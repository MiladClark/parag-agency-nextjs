import type { Metadata } from "next";
import { getContentRepository } from "@/content/repository";
import { buildMetadata } from "@/lib/seo";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { ContactForm } from "@/components/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const repo = getContentRepository();
  const page = await repo.getPage("contact");
  return page ? buildMetadata(page.seo) : {};
}

export default async function Page() {
  const repo = getContentRepository();
  const [page, settings] = await Promise.all([repo.getPage("contact"), repo.getSiteSettings()]);
  if (!page) return null;
  const { contact, social } = settings;

  return (
    <div className="relative pb-10 sm:pb-14">
      <ContactHero title={page.hero.title} subtitle={page.hero.subtitle} />

      <section className="relative px-3 sm:px-5">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-border/70 bg-surface/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_30px_80px_-30px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div
            className="pointer-events-none absolute -top-40 start-1/4 h-80 w-80 rounded-full bg-accent/10 blur-[120px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-40 end-0 h-72 w-72 rounded-full bg-accent/[0.07] blur-[110px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-16 top-0 h-px bg-linear-to-l from-transparent via-accent/40 to-transparent"
            aria-hidden
          />

          <div className="relative grid gap-8 p-5 sm:gap-10 sm:p-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12 lg:p-10">
            <div className="rounded-[1.75rem] border border-border/60 bg-panel p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7 lg:p-8">
              <ContactForm />
            </div>
            <ContactChannels contact={contact} social={social} />
          </div>
        </div>
      </section>
    </div>
  );
}
