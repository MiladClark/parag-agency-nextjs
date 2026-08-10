import type { PostBlock } from "../content/types";

export type TocItem = {
  id: string;
  level: 2 | 3;
  text: string;
};

/** Stable slug for Persian/Latin headings; keeps letters, digits, and hyphens. */
export function slugifyHeading(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[\u200c\u200f\u202a-\u202e]/g, "")
    .replace(/[^\p{L}\p{N}\s-]+/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "section";
}

/** Unique ids for every heading block in a post body (same order as PostBody). */
export function buildHeadingIds(blocks: PostBlock[]): string[] {
  const seen = new Map<string, number>();
  const ids: string[] = [];

  for (const block of blocks) {
    if (block.type !== "heading") {
      ids.push("");
      continue;
    }
    const base = slugifyHeading(block.text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    ids.push(count === 0 ? base : `${base}-${count + 1}`);
  }

  return ids;
}

export function extractToc(blocks: PostBlock[]): TocItem[] {
  const ids = buildHeadingIds(blocks);
  const items: TocItem[] = [];

  blocks.forEach((block, i) => {
    if (block.type !== "heading") return;
    const id = ids[i];
    if (!id) return;
    items.push({ id, level: block.level, text: block.text });
  });

  return items;
}
