import Image from "next/image";
import type { PortfolioItem } from "../../content/types";

export function PortfolioCard({ item, depth = false }: { item: PortfolioItem; depth?: boolean }) {
  const z = (px: number) => (depth ? { transform: `translateZ(${px}px)` } : undefined);

  return (
    <a
      href={`/portfolio/${item.slug}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-panel/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 ${
        depth ? "preserve-3d shadow-depth" : ""
      }`}
    >
      {/* Own top radius rather than relying on the card's `overflow: hidden`:
          any 3D rendering context above (tilt, `preserve-3d`) stops iOS from
          applying the ancestor clip, and the cover then renders square-cornered
          over a rounded card. An explicit radius here holds regardless. */}
      <div
        className={`relative aspect-[16/10] overflow-hidden rounded-t-[1.75rem] bg-linear-to-br ${item.cover}`}
      >
        {item.coverImage ? (
          <Image
            src={item.coverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 400 250" aria-hidden>
            <circle cx="320" cy="50" r="100" fill="var(--accent)" fillOpacity="0.25" />
            <path
              d="M0 180 C 140 80, 260 220, 400 90"
              stroke="var(--accent)"
              strokeOpacity="0.4"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" aria-hidden />
        <div className="absolute inset-0 flex items-end p-5" style={z(40)}>
          <span className="rounded-full bg-bg/70 px-3 py-1 text-xs font-bold text-text backdrop-blur-sm">
            {item.category}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5 sm:p-6" style={z(25)}>
        {item.client && <span className="text-[11px] text-text-muted">{item.client}</span>}
        <h3 className="text-base font-black leading-7 text-text transition-colors group-hover:text-accent">
          {item.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-7 text-text-muted">{item.summary}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/80 px-3 py-1 text-[11px] text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
