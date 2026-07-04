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
import { fileRepository } from "./fileRepository";
import { dbRepository } from "./dbRepository";
import { payloadRepository } from "./payloadRepository";

// The single seam between the app and its content source.
// Phase 1 returns the file-backed repository. To move content into a database
// or an admin panel later, swap the implementation here — pages stay untouched.
export interface ContentRepository {
  getSiteSettings(): Promise<SiteSettings>;
  getPage(slug: string): Promise<PageContent | null>;
  listServices(): Promise<Service[]>;
  getService(slug: string): Promise<Service | null>;
  listPortfolio(): Promise<PortfolioItem[]>;

  // Blog
  listPosts(opts?: BlogListOptions): Promise<BlogListResult>;
  getPost(slug: string): Promise<BlogPost | null>;
  listCategories(): Promise<BlogCategory[]>;
  getCategory(slug: string): Promise<BlogCategory | null>;
  listTags(): Promise<{ tag: string; count: number }[]>;
  getRelatedPosts(slug: string, limit?: number): Promise<BlogPost[]>;
}

// Switch content sources via CONTENT_SOURCE:
//   "payload" — blog from the shared Payload CMS (tenant-scoped), rest from file
//   "db"      — content from the Express backend
//   otherwise — bundled file data (works with no backend)
export function getContentRepository(): ContentRepository {
  const source = process.env.CONTENT_SOURCE || "file";
  if (source === "payload") return payloadRepository;
  return source === "db" ? dbRepository : fileRepository;
}
