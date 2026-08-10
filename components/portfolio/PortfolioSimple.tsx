import { ArrowUpLeft } from "lucide-react";
import type { PortfolioItem } from "../../content/types";
import { ButtonLink } from "../ui/Button";

export function PortfolioSimple({ item }: { item: PortfolioItem }) {
  return (
    <div className="relative pb-14 pt-28 sm:pt-32">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <a
          href="/portfolio"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-bold text-text-muted transition-colors hover:text-accent"
        >
          <ArrowUpLeft className="h-4 w-4" />
          بازگشت به نمونه‌کارها
        </a>
        <span className="rounded-full border border-accent/35 bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
          {item.category}
        </span>
        <h1 className="mt-5 text-3xl font-black leading-snug text-text sm:text-5xl">{item.title}</h1>
        {item.client && <p className="mt-3 text-sm text-text-muted">{item.client}</p>}
        <p className="mt-6 text-base leading-8 text-text-muted">{item.summary}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-3 py-1 text-xs text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-10">
          <ButtonLink href="/contact" size="lg">
            گفتگو درباره پروژه مشابه
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
