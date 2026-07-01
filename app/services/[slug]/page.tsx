import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentRepository } from "@/content/repository";
import { buildMetadata } from "@/lib/seo";
import { Container, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const repo = getContentRepository();
  const service = await repo.getService(slug);
  if (!service) return {};
  return buildMetadata(service.seo);
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const repo = getContentRepository();
  const service = await repo.getService(slug);
  if (!service) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.excerpt,
    provider: { "@type": "Organization", name: "پاراگ", url: "https://parag.agency" },
    areaServed: "IR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute -top-40 right-1/2 h-[32rem] w-[32rem] translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
          aria-hidden
        />
        <Container className="relative py-20 sm:py-24">
          <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
            <a href="/" className="hover:text-accent">خانه</a>
            <Icon name="chevron-left" className="text-xs" />
            <a href="/services" className="hover:text-accent">خدمات</a>
            <Icon name="chevron-left" className="text-xs" />
            <span className="text-text">{service.title}</span>
          </nav>
          <div className="flex max-w-3xl flex-col gap-6">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-3xl text-accent">
              <Icon name={service.icon} />
            </span>
            <h1 className="text-4xl font-extrabold leading-tight text-text sm:text-5xl">
              {service.title}
            </h1>
            <p className="text-lg leading-9 text-text-muted">{service.excerpt}</p>
          </div>
        </Container>
      </section>

      {/* Body */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="flex flex-col gap-6">
            {service.body.map((paragraph, i) => (
              <p key={i} className="text-base leading-9 text-text-muted">
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal as="aside" className="h-fit rounded-3xl border border-border bg-panel p-7">
            <h2 className="text-lg font-bold text-text">این خدمت شامل چیست؟</h2>
            <ul className="mt-5 flex flex-col gap-4">
              {service.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm leading-7 text-text-muted">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs text-accent">
                    <Icon name="check" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
            <ButtonLink href="/contact" className="mt-7 w-full">
              درخواست این خدمت
            </ButtonLink>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
