import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CURRENT_TENANT } from '../../../content/tenant';

export const runtime = 'nodejs';

const digest = (value: string) => createHash('sha256').update(value).digest();
const response = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// Only the CMS server knows this secret. No key is included in URLs or browser code.
export async function POST(request: Request) {
  const secret = process.env.CACHE_REVALIDATION_SECRET;
  if (!secret || secret.length < 32) return response({ error: 'Cache control is not configured' }, 503);
  const authorization = request.headers.get('authorization') || '';
  if (!timingSafeEqual(digest(authorization), digest(`Bearer ${secret}`))) return response({ error: 'Unauthorized' }, 401);
  let body: { tenant?: unknown };
  try { body = await request.json(); } catch { return response({ error: 'Invalid JSON' }, 400); }
  if (!body || body.tenant !== CURRENT_TENANT) return response({ error: 'Wrong tenant' }, 400);

  revalidateTag(`cms:${CURRENT_TENANT}`, { expire: 0 });
  revalidatePath('/', 'layout');
  // Route handlers are independent of the root layout cache.
  for (const path of ['/sitemap.xml', '/post-sitemap.xml', '/category-sitemap.xml', '/tag-sitemap.xml', '/page-sitemap.xml', '/service-sitemap.xml', '/portfolio-sitemap.xml', '/blog/rss.xml', '/robots.txt']) {
    revalidatePath(path);
  }
  return response({ tenant: CURRENT_TENANT, invalidated: true, completedAt: new Date().toISOString() });
}
