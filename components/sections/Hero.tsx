import type { PageHero } from "../../content/types";
import { Container, Eyebrow } from "../ui/Section";
import { ButtonLink } from "../ui/Button";
import { Icon } from "../ui/Icon";

export function Hero({ hero, compact = false }: { hero: PageHero; compact?: boolean }) {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient brand glow */}
      <div
        className="pointer-events-none absolute -top-40 right-1/2 h-[36rem] w-[36rem] translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />
      <Container className={compact ? "relative py-20 sm:py-24" : "relative py-24 sm:py-32"}>
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {hero.eyebrow && (
            <div style={{ animation: "float-up 0.6s ease both" }}>
              <Eyebrow>{hero.eyebrow}</Eyebrow>
            </div>
          )}
          <h1
            className="mt-6 text-4xl font-extrabold leading-[1.15] text-text sm:text-5xl lg:text-6xl"
            style={{ animation: "float-up 0.6s ease 0.08s both" }}
          >
            {hero.title}
          </h1>
          {hero.subtitle && (
            <p
              className="mt-6 max-w-2xl text-lg leading-9 text-text-muted"
              style={{ animation: "float-up 0.6s ease 0.16s both" }}
            >
              {hero.subtitle}
            </p>
          )}
          {(hero.cta || hero.secondaryCta) && (
            <div
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
              style={{ animation: "float-up 0.6s ease 0.24s both" }}
            >
              {hero.cta && (
                <ButtonLink href={hero.cta.href} size="lg">
                  {hero.cta.label}
                  <Icon name="arrow-left" />
                </ButtonLink>
              )}
              {hero.secondaryCta && (
                <ButtonLink href={hero.secondaryCta.href} variant="secondary" size="lg">
                  {hero.secondaryCta.label}
                </ButtonLink>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
