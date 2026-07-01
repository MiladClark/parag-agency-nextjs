import type { BlogPost } from "../../content/types";
import { BlogCard } from "../cards/BlogCard";
import { Reveal } from "../Reveal";

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold text-text">مقالات مرتبط</h2>
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
