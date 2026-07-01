import { toPersianDigits } from "../../lib/format";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Server pagination. Builds hrefs on `basePath`, preserving any extra query
// params (e.g. search) via `query`. RTL: "next" points to older pages.
export function Pagination({
  page,
  totalPages,
  basePath,
  query = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const base =
    "flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors";
  const inactive = "border-border bg-panel text-text-muted hover:border-accent/40 hover:text-text";
  const disabled = "pointer-events-none border-border/50 bg-panel/50 text-text-muted/40";

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="صفحه‌بندی">
      <a href={href(page - 1)} className={`${base} ${page <= 1 ? disabled : inactive}`} aria-label="صفحهٔ بعد">
        <ChevronRight className="h-4 w-4" />
      </a>
      {pages.map((p) => (
        <a
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={`${base} ${p === page ? "border-accent bg-accent text-white" : inactive}`}
        >
          {toPersianDigits(p)}
        </a>
      ))}
      <a
        href={href(page + 1)}
        className={`${base} ${page >= totalPages ? disabled : inactive}`}
        aria-label="صفحهٔ قبل"
      >
        <ChevronLeft className="h-4 w-4" />
      </a>
    </nav>
  );
}
