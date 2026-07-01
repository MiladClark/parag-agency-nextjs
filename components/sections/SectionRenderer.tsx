import type { ContentSection, PortfolioItem, Service } from "../../content/types";
import { Section, SectionHeading } from "../ui/Section";
import { ButtonLink } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Reveal } from "../Reveal";
import { ServiceCard } from "../cards/ServiceCard";
import { PortfolioCard } from "../cards/PortfolioCard";

export function SectionRenderer({
  section,
  services = [],
  portfolio = [],
}: {
  section: ContentSection;
  services?: Service[];
  portfolio?: PortfolioItem[];
}) {
  switch (section.kind) {
    case "story":
      return (
        <Section id={section.id}>
          <Reveal className="mx-auto max-w-3xl text-center">
            {section.eyebrow && (
              <span className="text-sm font-medium text-accent">{section.eyebrow}</span>
            )}
            {section.title && (
              <h2 className="mt-4 text-3xl font-bold leading-tight text-text sm:text-4xl">
                {section.title}
              </h2>
            )}
            {section.body && (
              <p className="mt-6 text-lg leading-9 text-text-muted">{section.body}</p>
            )}
          </Reveal>
        </Section>
      );

    case "features":
      return (
        <Section id={section.id}>
          <SectionHeading eyebrow={section.eyebrow} title={section.title} body={section.body} />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {section.items?.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="flex h-full flex-col gap-3 rounded-3xl border border-border bg-panel p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-xl text-accent">
                    <Icon name={f.icon} />
                  </span>
                  <h3 className="text-base font-bold text-text">{f.title}</h3>
                  <p className="text-sm leading-7 text-text-muted">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      );

    case "stats":
      return (
        <Section id={section.id} className="border-y border-border bg-surface">
          <SectionHeading eyebrow={section.eyebrow} title={section.title} />
          <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {section.stats?.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-4xl font-extrabold text-accent sm:text-5xl">{s.value}</span>
                  <span className="text-sm text-text-muted">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      );

    case "services":
      return (
        <Section id={section.id}>
          <SectionHeading eyebrow={section.eyebrow} title={section.title} body={section.body} />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={i * 70}>
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </div>
        </Section>
      );

    case "portfolio":
      return (
        <Section id={section.id}>
          <SectionHeading eyebrow={section.eyebrow} title={section.title} body={section.body} />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.slice(0, 3).map((p, i) => (
              <Reveal key={p.slug} delay={i * 70}>
                <PortfolioCard item={p} />
              </Reveal>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <ButtonLink href="/portfolio" variant="secondary">
              مشاهده همه نمونه‌کارها
            </ButtonLink>
          </div>
        </Section>
      );

    case "cta":
      return (
        <Section id={section.id}>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-accent/30 bg-gradient-to-br from-accent-soft to-transparent p-10 text-center sm:p-16">
              <div
                className="pointer-events-none absolute -top-24 right-1/2 h-64 w-64 translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
                aria-hidden
              />
              {section.title && (
                <h2 className="relative text-3xl font-bold text-text sm:text-4xl">{section.title}</h2>
              )}
              {section.body && (
                <p className="relative mx-auto mt-4 max-w-xl text-base leading-8 text-text-muted">
                  {section.body}
                </p>
              )}
              {section.cta && (
                <div className="relative mt-8 flex justify-center">
                  <ButtonLink href={section.cta.href} size="lg">
                    {section.cta.label}
                  </ButtonLink>
                </div>
              )}
            </div>
          </Reveal>
        </Section>
      );

    case "richtext":
      return (
        <Section id={section.id}>
          <Reveal className="mx-auto max-w-3xl">
            {section.title && (
              <h2 className="text-2xl font-bold text-text sm:text-3xl">{section.title}</h2>
            )}
            {section.body && (
              <p className="mt-5 text-base leading-9 text-text-muted">{section.body}</p>
            )}
          </Reveal>
        </Section>
      );

    default:
      return null;
  }
}
