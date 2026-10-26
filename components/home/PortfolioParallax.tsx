"use client";

import type { PortfolioItem } from "../../content/types";
import { Section } from "../ui/Section";
import { ButtonLink } from "../ui/Button";
import { PortfolioCarousel } from "./PortfolioCarousel";
import "./home-portfolio.css";

export function PortfolioParallax({ portfolio }: { portfolio: PortfolioItem[] }) {
  if (!portfolio.length) return null;

  return (
    <Section>
      <PortfolioCarousel items={portfolio} />

      <div className="mt-12 flex justify-center lg:hidden">
        <ButtonLink href="/portfolio" variant="secondary">
          مشاهده همه نمونه‌کارها
        </ButtonLink>
      </div>
    </Section>
  );
}
