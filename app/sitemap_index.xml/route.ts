import { abs } from "@/lib/sitemap";

// Yoast/Rank Math sites serve the index at /sitemap_index.xml, so crawlers and
// SEO tools probe it by habit. Point them at the real one instead of a 404.
export const dynamic = "force-static";

export function GET() {
  return Response.redirect(abs("/sitemap.xml"), 301);
}
