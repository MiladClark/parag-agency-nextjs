import type { BlogCategory } from "../../content/types";

// Category filter row. `active` is the current category slug (undefined = "همه").
export function CategoryChips({
  categories,
  active,
}: {
  categories: BlogCategory[];
  active?: string;
}) {
  const chip = (isActive: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
      isActive
        ? "border-accent bg-accent text-white"
        : "border-border bg-panel text-text-muted hover:border-accent/40 hover:text-text"
    }`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <a href="/blog" className={chip(!active)}>
        همه
      </a>
      {categories.map((c) => (
        <a key={c.slug} href={`/blog/category/${c.slug}`} className={chip(active === c.slug)}>
          {c.title}
        </a>
      ))}
    </div>
  );
}
