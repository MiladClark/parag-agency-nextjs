import { CURRENT_TENANT } from "../content/tenant";

const PAYLOAD = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3601";

export type RatingSummary = {
  average: number;
  count: number;
  distribution: [number, number, number, number, number];
  allowRatings: boolean;
};

export async function fetchRatingSummary(postSlug: string): Promise<RatingSummary | null> {
  try {
    const res = await fetch(
      `${PAYLOAD}/api/site/ratings?post=${encodeURIComponent(postSlug)}&tenant=${encodeURIComponent(CURRENT_TENANT)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as RatingSummary;
  } catch {
    return null;
  }
}

export function formatRatingAverage(avg: number): string {
  const rounded = Math.round(avg * 10) / 10;
  const fa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return rounded
    .toFixed(1)
    .replace(".", "٫")
    .replace(/\d/g, (d) => fa[Number(d)]);
}
