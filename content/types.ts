// Content model for Parag Agency.
// Everything the pages render flows through these types and the ContentRepository.
// In phase 1 the data lives in ./data/* (file-backed); later the same interface
// can be backed by a database / admin panel without touching the pages.

export interface SeoMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string[];
  /** Extra JSON-LD structured data for this page. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface SocialLink {
  label: string;
  href: string;
  /** UIcons class name, e.g. "instagram". */
  icon: string;
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  tagline: string;
  description: string;
  nav: NavItem[];
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    whatsapp?: string;
  };
  social: SocialLink[];
}

export interface CtaButton {
  label: string;
  href: string;
}

export interface FeatureBlock {
  icon: string;
  title: string;
  body: string;
}

export type SectionKind =
  | "story"
  | "features"
  | "stats"
  | "cta"
  | "richtext"
  | "services"
  | "portfolio";

export interface ContentSection {
  id: string;
  kind: SectionKind;
  eyebrow?: string;
  title?: string;
  body?: string;
  items?: FeatureBlock[];
  stats?: { value: string; label: string }[];
  cta?: CtaButton;
}

export interface PageHero {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: CtaButton;
  secondaryCta?: CtaButton;
}

export interface PageContent {
  slug: string;
  seo: SeoMeta;
  hero: PageHero;
  sections?: ContentSection[];
}

export interface Service {
  slug: string;
  title: string;
  excerpt: string;
  /** UIcons class name. */
  icon: string;
  /** Paragraphs of body copy. */
  body: string[];
  highlights: string[];
  seo: SeoMeta;
}

export interface PortfolioItem {
  slug: string;
  title: string;
  category: string;
  client?: string;
  /** Tailwind gradient classes used as a stand-in cover until real images exist. */
  cover: string;
  summary: string;
  tags: string[];
}

/* ---------------- Blog ---------------- */

export interface BlogAuthor {
  name: string;
  role?: string;
  bio?: string;
  /** Image URL; falls back to an initial avatar when absent. */
  avatar?: string;
}

export interface BlogCategory {
  slug: string;
  title: string;
  description?: string;
}

/**
 * Structured post body. Each block renders through a typed renderer
 * (components/blog/PostBody). Later, Payload's Lexical output maps onto this
 * same union so pages never change.
 */
export type PostBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "code"; lang?: string; code: string }
  | { type: "divider" };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** Real image URL. When absent, `coverGradient` is used as a stand-in. */
  coverImage?: string;
  /** Tailwind gradient classes for a placeholder cover (e.g. "from-…/to-…"). */
  coverGradient?: string;
  /** Category slug (see BlogCategory). */
  category: string;
  tags: string[];
  author: BlogAuthor;
  /** ISO date string. */
  publishedAt: string;
  updatedAt?: string;
  /** Optional explicit reading time; otherwise estimated from the body. */
  readingMinutes?: number;
  body: PostBlock[];
  seo: SeoMeta;
  featured?: boolean;
  /** Multi-tenant scope (defaults to the current site's tenant). */
  tenant?: string;
}

export interface BlogListResult {
  posts: BlogPost[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface BlogListOptions {
  category?: string;
  tag?: string;
  q?: string;
  page?: number;
  perPage?: number;
  tenant?: string;
}
