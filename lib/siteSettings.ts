import { CURRENT_TENANT } from "@/content/tenant";

// Per-site settings owned by the shared Payload panel (websites → «سئو و تحلیل»).
// Server-side only: values drive <head>, robots.txt, analytics and script slots.
const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3601";

const REVALIDATE_SECONDS = 30;

export type CmsSiteSettings = {
  tenant: { slug: string; name: string | null; domain: string | null };
  seo: { primaryKeyword: string | null };
  indexing: { noindex: boolean };
  analytics: {
    gtmId: string | null;
    ga4Id: string | null;
    clarityId: string | null;
  };
  verification: {
    google: string | null;
    bing: string | null;
    yandex: string | null;
  };
  scripts: {
    head: string | null;
    bodyStart: string | null;
    footer: string | null;
  };
};

const DEFAULTS: CmsSiteSettings = {
  tenant: { slug: CURRENT_TENANT, name: null, domain: null },
  seo: { primaryKeyword: null },
  indexing: { noindex: false },
  analytics: { gtmId: null, ga4Id: null, clarityId: null },
  verification: { google: null, bing: null, yandex: null },
  scripts: { head: null, bodyStart: null, footer: null },
};

function asTrimmed(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}

export async function getSiteSettings(): Promise<CmsSiteSettings> {
  try {
    const res = await fetch(
      `${PAYLOAD_URL}/api/site/settings?tenant=${encodeURIComponent(CURRENT_TENANT)}`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!res.ok) throw new Error(`settings ${res.status}`);
    const data = (await res.json()) as Partial<{
      tenant: { slug?: string; name?: string | null; domain?: string | null };
      seo: { primaryKeyword?: string | null };
      indexing: { noindex?: boolean };
      analytics: { gtmId?: string | null; ga4Id?: string | null; clarityId?: string | null };
      verification: { google?: string | null; bing?: string | null; yandex?: string | null };
      scripts: { head?: string | null; bodyStart?: string | null; footer?: string | null };
    }>;

    return {
      tenant: {
        slug: data.tenant?.slug || CURRENT_TENANT,
        name: asTrimmed(data.tenant?.name),
        domain: asTrimmed(data.tenant?.domain),
      },
      seo: { primaryKeyword: asTrimmed(data.seo?.primaryKeyword) },
      indexing: { noindex: data.indexing?.noindex === true },
      analytics: {
        gtmId: asTrimmed(data.analytics?.gtmId),
        ga4Id: asTrimmed(data.analytics?.ga4Id),
        clarityId: asTrimmed(data.analytics?.clarityId),
      },
      verification: {
        google: asTrimmed(data.verification?.google),
        bing: asTrimmed(data.verification?.bing),
        yandex: asTrimmed(data.verification?.yandex),
      },
      scripts: {
        head: asTrimmed(data.scripts?.head),
        bodyStart: asTrimmed(data.scripts?.bodyStart),
        footer: asTrimmed(data.scripts?.footer),
      },
    };
  } catch {
    // CMS unreachable → stay indexable; never invent analytics IDs.
    return DEFAULTS;
  }
}
