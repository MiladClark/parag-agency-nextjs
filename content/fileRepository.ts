import type { ContentRepository } from "./repository";
import type {
  BlogCategory,
  BlogListOptions,
  BlogListResult,
  BlogPost,
  PageContent,
  PortfolioItem,
  Service,
  SiteSettings,
} from "./types";
import { siteSettings } from "./data/site";
import { pages } from "./data/pages";
import { services } from "./data/services";
import { portfolio } from "./data/portfolio";
import { blogCategories, blogPosts } from "./data/blog";
import { CURRENT_TENANT } from "./tenant";

const DEFAULT_PER_PAGE = 9;

function byNewest(a: BlogPost, b: BlogPost) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

function forTenant(tenant?: string): BlogPost[] {
  const t = tenant ?? CURRENT_TENANT;
  return blogPosts.filter((p) => (p.tenant ?? "parag") === t).sort(byNewest);
}

// Phase 1 implementation: content is read from the static ./data modules.
// Async signatures match the future DB-backed repository so callers never change.
export const fileRepository: ContentRepository = {
  async getSiteSettings(): Promise<SiteSettings> {
    return siteSettings;
  },

  async getPage(slug: string): Promise<PageContent | null> {
    return pages[slug] ?? null;
  },

  async listServices(): Promise<Service[]> {
    return services;
  },

  async getService(slug: string): Promise<Service | null> {
    return services.find((s) => s.slug === slug) ?? null;
  },

  async listPortfolio(): Promise<PortfolioItem[]> {
    return portfolio;
  },

  async listPosts(opts: BlogListOptions = {}): Promise<BlogListResult> {
    const { category, tag, q, page = 1, perPage = DEFAULT_PER_PAGE, tenant } = opts;
    let posts = forTenant(tenant);

    if (category) posts = posts.filter((p) => p.category === category);
    if (tag) posts = posts.filter((p) => p.tags.includes(tag));
    if (q) {
      const needle = q.trim().toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          p.excerpt.toLowerCase().includes(needle) ||
          p.tags.some((t) => t.toLowerCase().includes(needle)),
      );
    }

    const total = posts.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const current = Math.min(Math.max(1, page), totalPages);
    const start = (current - 1) * perPage;

    return {
      posts: posts.slice(start, start + perPage),
      total,
      page: current,
      perPage,
      totalPages,
    };
  },

  async getPost(slug: string): Promise<BlogPost | null> {
    return forTenant().find((p) => p.slug === slug) ?? null;
  },

  async listCategories(): Promise<BlogCategory[]> {
    return blogCategories;
  },

  async getCategory(slug: string): Promise<BlogCategory | null> {
    return blogCategories.find((c) => c.slug === slug) ?? null;
  },

  async listTags(): Promise<{ tag: string; count: number }[]> {
    const counts = new Map<string, number>();
    for (const post of forTenant()) {
      for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  },

  async getRelatedPosts(slug: string, limit = 3): Promise<BlogPost[]> {
    const posts = forTenant();
    const current = posts.find((p) => p.slug === slug);
    if (!current) return [];
    const sameCategory = posts.filter((p) => p.slug !== slug && p.category === current.category);
    const fill = posts.filter((p) => p.slug !== slug && p.category !== current.category);
    return [...sameCategory, ...fill].slice(0, limit);
  },
};
