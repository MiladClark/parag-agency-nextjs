import { blogPlaceholder, type BlogCoverFormat } from "../../lib/blogPlaceholder";

type Props = {
  src?: string;
  category: string;
  alt?: string;
  format?: BlogCoverFormat;
  sizes?: string;
  eager?: boolean;
  className?: string;
};

/** Responsive category artwork fills empty covers without downloading oversized assets. */
export function BlogCover({ src, category, alt = "", format = "card", sizes = "100vw", eager = false, className = "" }: Props) {
  const image = src?.trim();
  const fallback = blogPlaceholder(category, format === "hero" ? "card" : format);
  const wide = blogPlaceholder(category, "hero");

  return (
    <span className="absolute inset-0 block" data-blog-cover={image ? "original" : "placeholder"}>
      <picture>
        {!image && format === "hero" && <source media="(min-width: 640px)" srcSet={wide.srcSet} sizes={sizes} />}
        {/* Pre-encoded crops deliberately use picture/srcset for art direction. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image || fallback.src}
          srcSet={image ? undefined : fallback.srcSet}
          sizes={image ? undefined : sizes}
          alt={image ? alt : ""}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          decoding="async"
          className={`h-full w-full object-cover ${className}`}
        />
      </picture>
    </span>
  );
}
