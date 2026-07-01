import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentRepository } from "@/content/repository";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { BlogCard } from "@/components/cards/BlogCard";
import { CategoryChips } from "@/components/blog/CategoryChips";
import { Pagination } from "@/components/blog/Pagination";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ page?: string }>;

export async function generateStaticParams() {
  const categories = await getContentRepository().listCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getContentRepository().getCategory(slug);
  if (!category) return {};
  return buildMetadata({
    title: `${category.title} | بلاگ پاراگ`,
    description: category.description ?? `مقالات دستهٔ ${category.title} در بلاگ پاراگ.`,
    canonical: `https://parag.agency/blog/category/${slug}`,
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const repo = getContentRepository();

  const category = await repo.getCategory(slug);
  if (!category) notFound();

  const [{ posts, totalPages }, categories] = await Promise.all([
    repo.listPosts({ category: slug, page }),
    repo.listCategories(),
  ]);

  return (
    <>
      <Hero
        hero={{ eyebrow: "دستهٔ مقالات", title: category.title, subtitle: category.description }}
        compact
      />
      <Section className="!pt-4">
        <div className="flex flex-col gap-10">
          <CategoryChips categories={categories} active={slug} />
          {posts.length === 0 ? (
            <p className="py-16 text-center text-text-muted">مقاله‌ای در این دسته یافت نشد.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.slug} delay={(i % 3) * 80}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} basePath={`/blog/category/${slug}`} />
        </div>
      </Section>
    </>
  );
}
