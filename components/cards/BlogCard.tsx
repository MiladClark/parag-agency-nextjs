import type { BlogPost } from "../../content/types";
import { categoryTitleOf } from "../../content/data/blog";
import { formatJalaliDate, estimateReadingMinutes, toPersianDigits } from "../../lib/format";
import { Clock } from "lucide-react";
import { BlogCover } from "../blog/BlogCover";

export function BlogCard({ post }: { post: BlogPost }) {
  const minutes = post.readingMinutes ?? estimateReadingMinutes(post.body);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-accent/40">
      <a href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <div className={`relative aspect-[16/10] overflow-hidden ${post.coverGradient ? `bg-gradient-to-br ${post.coverGradient}` : "bg-panel"}`}>
          <BlogCover src={post.coverImage} category={post.category} alt={post.title} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden />
          <div className="absolute inset-0 flex items-start p-5">
            <span className="rounded-full bg-bg/70 px-3 py-1 text-xs font-medium text-text backdrop-blur-sm">
              {categoryTitleOf(post.category)}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="text-lg font-bold leading-8 text-text transition-colors group-hover:text-accent">
            {post.title}
          </h3>
          <p className="line-clamp-3 text-sm leading-7 text-text-muted">{post.excerpt}</p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-xs text-text-muted">
            <span>{formatJalaliDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {toPersianDigits(minutes)} دقیقه
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}
