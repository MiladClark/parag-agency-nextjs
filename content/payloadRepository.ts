import type { ContentRepository } from "./repository";
import type {
  BlogAuthor,
  BlogCategory,
  BlogListOptions,
  BlogListResult,
  BlogPost,
  PostBlock,
} from "./types";
import { fileRepository } from "./fileRepository";
import { dbRepository } from "./dbRepository";
import { CURRENT_TENANT } from "./tenant";

// Payload-backed blog content, scoped to this site's tenant. Non-blog content
// (pages/services/portfolio) stays on the existing file/db sources; blog reads
// hit the shared Payload CMS REST API and fall back to file data on failure so
// the site never breaks when the CMS is down.
const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3004";
const DEFAULT_PER_PAGE = 9;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${PAYLOAD_URL}/api${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Payload API ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

/* ---------- Payload document shapes (depth=1) ---------- */

interface PayloadMedia {
  url?: string | null;
  alt?: string | null;
}
interface PayloadCategory {
  slug: string;
  title: string;
  description?: string | null;
}
interface PayloadAuthor {
  name: string;
  role?: string | null;
  bio?: string | null;
  avatar?: PayloadMedia | string | null;
}
interface LexicalNode {
  type?: string;
  tag?: string;
  listType?: string;
  text?: string;
  children?: LexicalNode[];
  fields?: Record<string, unknown>;
  value?: unknown;
}
interface PayloadPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: PayloadMedia | string | null;
  coverGradient?: string | null;
  category?: PayloadCategory | string | null;
  author?: PayloadAuthor | string | null;
  tags?: { tag: string }[] | null;
  publishedAt: string;
  updatedAt?: string;
  featured?: boolean | null;
  body?: { root?: LexicalNode } | null;
  seo?: { title?: string | null; description?: string | null; canonical?: string | null } | null;
}
interface PayloadList<T> {
  docs: T[];
  totalDocs: number;
  page: number;
  totalPages: number;
  limit: number;
}

/* ---------- Lexical → PostBlock mapping ---------- */

function nodeText(node: LexicalNode): string {
  if (typeof node.text === "string") return node.text;
  return (node.children ?? []).map(nodeText).join("");
}

function mediaUrl(m: PayloadMedia | string | null | undefined): string | undefined {
  if (!m || typeof m === "string") return undefined;
  if (!m.url) return undefined;
  return m.url.startsWith("http") ? m.url : `${PAYLOAD_URL}${m.url}`;
}

export function lexicalToBlocks(root: LexicalNode | undefined): PostBlock[] {
  const blocks: PostBlock[] = [];
  for (const node of root?.children ?? []) {
    switch (node.type) {
      case "paragraph": {
        const text = nodeText(node).trim();
        if (text) blocks.push({ type: "paragraph", text });
        break;
      }
      case "heading": {
        const text = nodeText(node).trim();
        if (!text) break;
        const level = node.tag === "h3" ? 3 : 2;
        blocks.push({ type: "heading", level, text });
        break;
      }
      case "quote": {
        const text = nodeText(node).trim();
        if (text) blocks.push({ type: "quote", text });
        break;
      }
      case "list": {
        const items = (node.children ?? [])
          .map((li) => nodeText(li).trim())
          .filter(Boolean);
        if (items.length) blocks.push({ type: "list", ordered: node.listType === "number", items });
        break;
      }
      case "horizontalrule":
        blocks.push({ type: "divider" });
        break;
      case "upload": {
        const media = (node.value ?? null) as PayloadMedia | null;
        const src = mediaUrl(media);
        if (src) blocks.push({ type: "image", src, alt: media?.alt ?? "" });
        break;
      }
      default: {
        // Unknown block-level node: keep its text so content is never lost.
        const text = nodeText(node).trim();
        if (text) blocks.push({ type: "paragraph", text });
      }
    }
  }
  return blocks;
}

/* ---------- Document mapping ---------- */

function mapAuthor(a: PayloadAuthor | string | null | undefined): BlogAuthor {
  if (!a || typeof a === "string") return { name: "پاراگ" };
  return {
    name: a.name,
    role: a.role ?? undefined,
    bio: a.bio ?? undefined,
    avatar: mediaUrl(a.avatar),
  };
}

function mapPost(doc: PayloadPost): BlogPost {
  const category = doc.category && typeof doc.category === "object" ? doc.category.slug : "";
  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    coverImage: mediaUrl(doc.coverImage),
    coverGradient: doc.coverGradient ?? undefined,
    category,
    tags: (doc.tags ?? []).map((t) => t.tag),
    author: mapAuthor(doc.author),
    publishedAt: doc.publishedAt,
    updatedAt: doc.updatedAt,
    body: lexicalToBlocks(doc.body?.root),
    seo: {
      title: doc.seo?.title || `${doc.title} | بلاگ پاراگ`,
      description: doc.seo?.description || doc.excerpt,
      canonical: doc.seo?.canonical || undefined,
      ogType: "article",
    },
    featured: doc.featured ?? false,
    tenant: CURRENT_TENANT,
  };
}

/* ---------- Query helpers ---------- */

function tenantParam(tenant?: string): string {
  return `where[tenant.slug][equals]=${encodeURIComponent(tenant ?? CURRENT_TENANT)}`;
}

async function fetchPosts(params: string[]): Promise<PayloadList<PayloadPost>> {
  return get<PayloadList<PayloadPost>>(`/posts?${params.join("&")}`);
}

/* ---------- Repository ---------- */

export const payloadRepository: ContentRepository = {
  // Non-blog content keeps its existing source (Express backend, which itself
  // falls back to bundled file data when unavailable).
  getSiteSettings: () => dbRepository.getSiteSettings(),
  getPage: (slug) => dbRepository.getPage(slug),
  listServices: () => dbRepository.listServices(),
  getService: (slug) => dbRepository.getService(slug),
  listPortfolio: () => dbRepository.listPortfolio(),

  async listPosts(opts: BlogListOptions = {}): Promise<BlogListResult> {
    const { category, tag, q, page = 1, perPage = DEFAULT_PER_PAGE, tenant } = opts;
    try {
      const params = [
        tenantParam(tenant),
        `limit=${perPage}`,
        `page=${page}`,
        "sort=-publishedAt",
        "depth=1",
      ];
      if (category) params.push(`where[category.slug][equals]=${encodeURIComponent(category)}`);
      if (tag) params.push(`where[tags.tag][equals]=${encodeURIComponent(tag)}`);
      if (q) params.push(`where[or][0][title][contains]=${encodeURIComponent(q)}`, `where[or][1][excerpt][contains]=${encodeURIComponent(q)}`);
      const list = await fetchPosts(params);
      return {
        posts: list.docs.map(mapPost),
        total: list.totalDocs,
        page: list.page,
        perPage: list.limit,
        totalPages: Math.max(1, list.totalPages),
      };
    } catch {
      return fileRepository.listPosts(opts);
    }
  },

  async getPost(slug: string): Promise<BlogPost | null> {
    try {
      const list = await fetchPosts([
        tenantParam(),
        `where[slug][equals]=${encodeURIComponent(slug)}`,
        "limit=1",
        "depth=1",
      ]);
      return list.docs[0] ? mapPost(list.docs[0]) : null;
    } catch {
      return fileRepository.getPost(slug);
    }
  },

  async listCategories(): Promise<BlogCategory[]> {
    try {
      const list = await get<PayloadList<PayloadCategory>>(
        `/categories?${tenantParam()}&limit=100&depth=0`,
      );
      return list.docs.map((c) => ({
        slug: c.slug,
        title: c.title,
        description: c.description ?? undefined,
      }));
    } catch {
      return fileRepository.listCategories();
    }
  },

  async getCategory(slug: string): Promise<BlogCategory | null> {
    const categories = await this.listCategories();
    return categories.find((c) => c.slug === slug) ?? null;
  },

  async listTags(): Promise<{ tag: string; count: number }[]> {
    try {
      const list = await fetchPosts([tenantParam(), "limit=1000", "depth=0"]);
      const counts = new Map<string, number>();
      for (const doc of list.docs) {
        for (const t of doc.tags ?? []) counts.set(t.tag, (counts.get(t.tag) ?? 0) + 1);
      }
      return [...counts.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    } catch {
      return fileRepository.listTags();
    }
  },

  async getRelatedPosts(slug: string, limit = 3): Promise<BlogPost[]> {
    try {
      const current = await this.getPost(slug);
      if (!current) return [];
      const list = await fetchPosts([
        tenantParam(),
        `where[slug][not_equals]=${encodeURIComponent(slug)}`,
        `where[category.slug][equals]=${encodeURIComponent(current.category)}`,
        `limit=${limit}`,
        "sort=-publishedAt",
        "depth=1",
      ]);
      let related = list.docs.map(mapPost);
      if (related.length < limit) {
        const fill = await fetchPosts([
          tenantParam(),
          `where[slug][not_equals]=${encodeURIComponent(slug)}`,
          `where[category.slug][not_equals]=${encodeURIComponent(current.category)}`,
          `limit=${limit - related.length}`,
          "sort=-publishedAt",
          "depth=1",
        ]);
        related = [...related, ...fill.docs.map(mapPost)];
      }
      return related;
    } catch {
      return fileRepository.getRelatedPosts(slug, limit);
    }
  },
};
