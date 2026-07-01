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
