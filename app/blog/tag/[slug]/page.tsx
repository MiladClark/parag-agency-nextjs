import type { Metadata } from "next";
import { getContentRepository } from "@/content/repository";
import { archiveCanonical, buildMetadata } from "@/lib/seo";
import { decodeSlugParam } from "@/lib/slug";
import { Hero } from "@/components/sections/Hero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { BlogCard } from "@/components/cards/BlogCard";
import { Pagination } from "@/components/blog/Pagination";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ page?: string }>;

export async function generateStaticParams() {
  const tags = await getContentRepository().listTags();
  return tags.map((t) => ({ slug: encodeURIComponent(t.tag) }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const tag = decodeSlugParam(rawSlug);
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  return buildMetadata({
    title: page > 1 ? `#${tag} — صفحهٔ ${page} | بلاگ پاراگ` : `#${tag} | بلاگ پاراگ`,
    description: `مقالات با برچسب «${tag}» در بلاگ پاراگ.`,
    canonical: archiveCanonical(`/blog/tag/${encodeURIComponent(tag)}`, page),
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeSlugParam(rawSlug);
  const { page: pageParam } = await searchParams;
  const tag = decodeURIComponent(slug);
  const page = Math.max(1, Number(pageParam) || 1);

  const { posts, totalPages } = await getContentRepository().listPosts({ tag, page });

  return (
    <>
      <Hero
        hero={{ eyebrow: "برچسب", title: `#${tag}`, subtitle: `همهٔ مقالات مرتبط با «${tag}».` }}
        compact
      />
      <Section className="!pt-4">
        <div className="flex flex-col gap-10">
          {posts.length === 0 ? (
            <p className="py-16 text-center text-text-muted">مقاله‌ای با این برچسب یافت نشد.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.slug} delay={(i % 3) * 80}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} basePath={`/blog/tag/${slug}`} />
        </div>
      </Section>
    </>
  );
}
