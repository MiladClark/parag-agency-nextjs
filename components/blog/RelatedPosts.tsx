import type { BlogPost } from "../../content/types";
import { BlogCard } from "../cards/BlogCard";
import { Reveal } from "../Reveal";

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <h2 className="relative ps-4 text-2xl font-bold text-text before:absolute before:inset-y-1 before:start-0 before:w-1 before:rounded-full before:bg-accent sm:text-3xl">
            مقالات مرتبط
          </h2>
          <a
            href="/blog"
            className="shrink-0 text-sm text-text-muted transition-colors hover:text-accent"
          >
            همه مقالات
          </a>
        </div>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={(i % 3) * 80}>
            <BlogCard post={post} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
