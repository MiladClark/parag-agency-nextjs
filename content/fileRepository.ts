import type { ContentRepository } from "./repository";
import type { PageContent, PortfolioItem, Service, SiteSettings } from "./types";
import { siteSettings } from "./data/site";
import { pages } from "./data/pages";
import { services } from "./data/services";
import { portfolio } from "./data/portfolio";

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
};
