import { CURRENT_TENANT } from "@/content/tenant";

// Per-site settings owned by the shared Payload panel (websites → «سئو و تحلیل»).
// Server-side only: the values decide what goes in <head> and in robots.txt, so
// they must be resolved before the response is rendered.
const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3601";

// How long a change in the panel can take to appear on the site. Short enough
// that flipping the indexing switch feels immediate, long enough that the CMS
// is not hit on every request.
const REVALIDATE_SECONDS = 30;

export type SiteSettings = {
  indexing: { noindex: boolean };
};

const DEFAULTS: SiteSettings = { indexing: { noindex: false } };

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(
      `${PAYLOAD_URL}/api/site/settings?tenant=${encodeURIComponent(CURRENT_TENANT)}`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!res.ok) throw new Error(`settings ${res.status}`);
    const data = (await res.json()) as { indexing?: { noindex?: boolean } };
    return { indexing: { noindex: data?.indexing?.noindex === true } };
  } catch {
    // CMS unreachable → stay indexable. Failing the other way would quietly
    // pull a live site out of search results every time the panel is down.
    return DEFAULTS;
  }
}
