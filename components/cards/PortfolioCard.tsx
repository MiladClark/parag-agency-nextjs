import type { PortfolioItem } from "../../content/types";

export function PortfolioCard({ item, depth = false }: { item: PortfolioItem; depth?: boolean }) {
  const z = (px: number) => (depth ? { transform: `translateZ(${px}px)` } : undefined);

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 ${
        depth ? "preserve-3d shadow-depth" : ""
      }`}
    >
      <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${item.cover}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden />
        <div className="absolute inset-0 flex items-end p-5" style={z(40)}>
          <span className="rounded-full bg-bg/70 px-3 py-1 text-xs font-medium text-text backdrop-blur-sm">
            {item.category}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6" style={z(25)}>
        {item.client && <span className="text-xs text-text-muted">{item.client}</span>}
        <h3 className="text-base font-bold leading-7 text-text transition-colors group-hover:text-accent">
          {item.title}
        </h3>
        <p className="text-sm leading-7 text-text-muted">{item.summary}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-3 py-1 text-xs text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
