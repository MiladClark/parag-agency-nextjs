import type { ContentRepository } from "./repository";
import type { PageContent, PortfolioItem, Service, SiteSettings } from "./types";
import { fileRepository } from "./fileRepository";

// DB-backed content (read via the Express content API). Runs during SSR and on
// client-side navigation; the localhost API URL works from both in dev.
// If the API is unavailable, each method falls back to the bundled file data so
// the site never breaks (e.g. before MySQL/the backend is running).
const API = process.env.API_INTERNAL_URL || "http://localhost:3001/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`Content API ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

export const dbRepository: ContentRepository = {
  async getSiteSettings(): Promise<SiteSettings> {
    try {
      const { settings } = await get<{ settings: SiteSettings | null }>("/content/settings");
      return settings ?? (await fileRepository.getSiteSettings());
    } catch {
      return fileRepository.getSiteSettings();
    }
  },
  async getPage(slug: string): Promise<PageContent | null> {
    try {
      const { page } = await get<{ page: PageContent | null }>(`/content/pages/${slug}`);
      return page ?? (await fileRepository.getPage(slug));
    } catch {
      return fileRepository.getPage(slug);
    }
  },
  async listServices(): Promise<Service[]> {
    try {
      const { services } = await get<{ services: Service[] }>("/content/services");
      return services?.length ? services : await fileRepository.listServices();
    } catch {
      return fileRepository.listServices();
    }
  },
  async getService(slug: string): Promise<Service | null> {
    try {
      const { service } = await get<{ service: Service | null }>(`/content/services/${slug}`);
      return service ?? (await fileRepository.getService(slug));
    } catch {
      return fileRepository.getService(slug);
    }
  },
  async listPortfolio(): Promise<PortfolioItem[]> {
    try {
      const { portfolio } = await get<{ portfolio: PortfolioItem[] }>("/content/portfolio");
      return portfolio?.length ? portfolio : await fileRepository.listPortfolio();
    } catch {
      return fileRepository.listPortfolio();
    }
  },
};
