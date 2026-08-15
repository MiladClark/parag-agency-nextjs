import { getSiteSettings } from "./siteSettings";
import { SITE_URL } from "./seo";

// XML sitemap plumbing shared by every sitemap route.
//
// Layout follows the convention search consoles (and Rank Math / Yoast) expect:
// /sitemap.xml is an *index* that points at one file per content type —
// /page-sitemap.xml, /post-sitemap.xml, /category-sitemap.xml, … — instead of a
// single flat file. Every document carries an <?xml-stylesheet?> pointing at
// /sitemap.xsl, which crawlers ignore and browsers render as a table.

// Single source of truth stays lib/seo.ts; re-exported so sitemap routes only
// ever need this module.
export { SITE_URL };

export type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapImage = { loc: string; title?: string | null };

export type SitemapEntry = {
  /** Site-relative path, e.g. "/blog/سلام". Encoded and absolutised here. */
  path: string;
  lastmod?: Date | string | null;
  changefreq?: ChangeFreq;
  priority?: number;
  images?: SitemapImage[];
};

export type SitemapSection = {
  /** File name without the `.xml`, e.g. "post" → /post-sitemap.xml */
  name: string;
  lastmod?: Date | string | null;
};

/* ------------------------------- formatting ------------------------------- */

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Absolute, percent-encoded URL. Slugs are Persian, so encoding is required. */
export function abs(path: string): string {
  if (/^https?:\/\//i.test(path)) return encodeURI(path);
  const clean = path.startsWith("/") ? path : `/${path}`;
  return encodeURI(`${SITE_URL}${clean}`);
}

/** W3C datetime, seconds precision — "2026-07-03T23:01:00+00:00". */
function stamp(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

/** Newest of a set of dates — used as a section's <lastmod> in the index. */
export function newest(values: (Date | string | null | undefined)[]): Date | null {
  let best: number | null = null;
  for (const value of values) {
    if (!value) continue;
    const time = (value instanceof Date ? value : new Date(value)).getTime();
    if (Number.isNaN(time)) continue;
    if (best === null || time > best) best = time;
  }
  return best === null ? null : new Date(best);
}

const HEADER = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${"/sitemap.xsl"}"?>`;

/* -------------------------------- documents ------------------------------- */

export function urlsetXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const lastmod = stamp(entry.lastmod);
      const lines = [`    <loc>${esc(abs(entry.path))}</loc>`];
      if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
      if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority !== undefined) {
        lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
      }
      for (const image of entry.images ?? []) {
        lines.push("    <image:image>");
        lines.push(`      <image:loc>${esc(abs(image.loc))}</image:loc>`);
        if (image.title) lines.push(`      <image:title>${esc(image.title)}</image:title>`);
        lines.push("    </image:image>");
      }
      return `  <url>\n${lines.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `${HEADER}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
}

export function indexXml(sections: SitemapSection[]): string {
  const items = sections
    .map((section) => {
      const lastmod = stamp(section.lastmod);
      const lines = [`    <loc>${esc(abs(`/${section.name}-sitemap.xml`))}</loc>`];
      if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
      return `  <sitemap>\n${lines.join("\n")}\n  </sitemap>`;
    })
    .join("\n");

  return `${HEADER}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>
`;
}

/* -------------------------------- responses ------------------------------- */

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "X-Robots-Tag": "noindex, follow",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

/**
 * The CMS indexing switch. When a site is flagged noindex, robots.txt already
 * disallows everything — serving an empty (but well-formed) sitemap keeps the
 * two consistent instead of advertising URLs nobody may crawl.
 */
export async function indexingDisabled(): Promise<boolean> {
  const { indexing } = await getSiteSettings();
  return indexing.noindex === true;
}
