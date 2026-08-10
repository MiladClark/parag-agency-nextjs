import type { BlogPost } from "../../content/types";
import { estimateReadingMinutes, toPersianDigits } from "../../lib/format";
import { Clock } from "lucide-react";

export function RelatedMiniCards({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-text">مطالب مرتبط</h3>
      <ul className="flex flex-col gap-2.5">
        {posts.map((post) => {
          const minutes = post.readingMinutes ?? estimateReadingMinutes(post.body);
          return (
            <li key={post.slug}>
              <a
                href={`/blog/${post.slug}`}
                className="group flex gap-3 rounded-2xl border border-border bg-panel p-2.5 transition-colors hover:border-accent/40"
              >
                <div
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border ${
                    post.coverGradient ? `bg-gradient-to-br ${post.coverGradient}` : "bg-surface"
                  }`}
                >
                  {post.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                  <span className="line-clamp-2 text-xs font-semibold leading-5 text-text transition-colors group-hover:text-accent">
                    {post.title}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-text-muted">
                    <Clock className="h-3 w-3" />
                    {toPersianDigits(minutes)} دقیقه
                  </span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
