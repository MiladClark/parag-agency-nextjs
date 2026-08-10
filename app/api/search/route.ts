import { NextResponse } from "next/server";
import { getContentRepository } from "../../../content/repository";
import { services } from "../../../content/data/services";
import { portfolio } from "../../../content/data/portfolio";

export type SearchHit = {
  type: "post" | "service" | "portfolio" | "page";
  title: string;
  href: string;
  excerpt?: string;
  meta?: string;
};

const staticPages: SearchHit[] = [
  { type: "page", title: "خانه", href: "/" },
  { type: "page", title: "درباره ما", href: "/about", excerpt: "آشنایی با تیم و مسیر پاراگ" },
  { type: "page", title: "خدمات", href: "/services", excerpt: "همه خدمات دیجیتال مارکتینگ" },
  { type: "page", title: "نمونه کارها", href: "/portfolio", excerpt: "پروژه‌های انجام‌شده" },
  { type: "page", title: "بلاگ", href: "/blog", excerpt: "مقالات و آموزش‌ها" },
  { type: "page", title: "تماس با ما", href: "/contact", excerpt: "شروع همکاری با پاراگ" },
];

/** Normalize Persian/Arabic variants so «ي/ی» and «ك/ک» match. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[يئ]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\u200f\u200e]/g, " ")
    .trim();
}

function matches(q: string, ...fields: (string | undefined)[]): boolean {
  return fields.some((f) => f && norm(f).includes(q));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get("q") ?? "").slice(0, 80);
  const q = norm(raw);

  if (q.length < 2) {
    return NextResponse.json({ hits: [] satisfies SearchHit[] });
  }

  const repo = getContentRepository();
  const hits: SearchHit[] = [];

  try {
    const { posts } = await repo.listPosts({ q: raw, perPage: 5, page: 1 });
    for (const p of posts) {
      hits.push({
        type: "post",
        title: p.title,
        href: `/blog/${encodeURIComponent(p.slug)}`,
        excerpt: p.excerpt,
        meta: "مقاله",
      });
    }
  } catch {
    /* CMS unavailable: fall through to static sources */
  }

  for (const s of services) {
    if (matches(q, s.title, s.excerpt)) {
      hits.push({
        type: "service",
        title: s.title,
        href: `/services/${s.slug}`,
        excerpt: s.excerpt,
        meta: "خدمت",
      });
    }
  }

  for (const item of portfolio) {
    if (matches(q, item.title, item.summary, item.category, ...item.tags)) {
      hits.push({
        type: "portfolio",
        title: item.title,
        href: `/portfolio/${item.slug}`,
        excerpt: item.summary,
        meta: item.category,
      });
    }
  }

  for (const page of staticPages) {
    if (matches(q, page.title, page.excerpt)) {
      hits.push(page);
    }
  }

  return NextResponse.json({ hits: hits.slice(0, 12) });
}
