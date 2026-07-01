import type { PostBlock } from "../content/types";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: number | string): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

// Jalali (Shamsi) date in Persian, e.g. "۱۹ خرداد ۱۴۰۴".
export function formatJalaliDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(date);
}

// Estimate reading time from a structured post body (~200 words/min),
// returned as a Persian-digit string. Never below 1 minute.
export function estimateReadingMinutes(body: PostBlock[]): number {
  let words = 0;
  for (const block of body) {
    if (block.type === "paragraph" || block.type === "heading" || block.type === "quote") {
      words += block.text.trim().split(/\s+/).filter(Boolean).length;
    } else if (block.type === "list") {
      words += block.items.join(" ").trim().split(/\s+/).filter(Boolean).length;
    } else if (block.type === "code") {
      words += block.code.trim().split(/\s+/).filter(Boolean).length;
    }
  }
  return Math.max(1, Math.round(words / 200));
}
