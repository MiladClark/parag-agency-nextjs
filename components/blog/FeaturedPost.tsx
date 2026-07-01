import type { BlogPost } from "../../content/types";
import { categoryTitleOf } from "../../content/data/blog";
import { estimateReadingMinutes } from "../../lib/format";
import { Eyebrow } from "../ui/Section";
import { PostMeta } from "./PostMeta";
import { ArrowLeft } from "lucide-react";

// Large highlight banner for the newest featured post on the archive.
export function FeaturedPost({ post }: { post: BlogPost }) {
  const minutes = post.readingMinutes ?? estimateReadingMinutes(post.body);

  return (
    <a
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-3xl border border-border bg-panel shadow-depth transition-colors hover:border-accent/40 lg:grid-cols-2"
    >
      <div className={`relative min-h-64 overflow-hidden ${post.coverGradient ? `bg-gradient-to-br ${post.coverGradient}` : "bg-surface"}`}>
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden />
        <span className="absolute start-5 top-5 rounded-full bg-bg/70 px-3 py-1 text-xs font-medium text-text backdrop-blur-sm">
          {categoryTitleOf(post.category)}
        </span>
      </div>

      <div className="flex flex-col gap-5 p-7 sm:p-9">
        <Eyebrow>مقالهٔ ویژه</Eyebrow>
        <h2 className="text-2xl font-extrabold leading-relaxed text-text transition-colors group-hover:text-accent sm:text-3xl">
          {post.title}
        </h2>
        <p className="text-base leading-8 text-text-muted">{post.excerpt}</p>
        <div className="mt-auto flex flex-col gap-5">
          <PostMeta author={post.author} publishedAt={post.publishedAt} readingMinutes={minutes} />
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
            ادامهٔ مطلب
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </span>
        </div>
      </div>
    </a>
  );
}
