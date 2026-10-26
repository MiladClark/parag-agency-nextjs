export type BlogCoverFormat = "thumbnail" | "card" | "hero";

const categories = new Set(["seo", "content", "ads", "branding", "growth"]);

/** Public, pre-sized WebP assets: no image optimizer request needed for fallbacks. */
export function blogPlaceholder(category: string, format: BlogCoverFormat = "card") {
  const name = categories.has(category) ? category : "growth";
  const widths = format === "thumbnail" ? [160, 320] : format === "hero" ? [960, 1440] : [640, 960, 1440];
  const url = (width: number) => `/images/blog-placeholders/${name}-${format}-${width}.webp`;
  return {
    src: url(widths[widths.length - 1]),
    srcSet: widths.map(width => `${url(width)} ${width}w`).join(", "),
  };
}
