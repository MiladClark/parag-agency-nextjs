import type { Metadata } from "next";
import { getContentRepository } from "@/content/repository";
import { archiveCanonical, buildMetadata, NOINDEX, SITE_URL } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { BlogCard } from "@/components/cards/BlogCard";
import { FeaturedPost } from "@/components/blog/FeaturedPost";
import { CategoryChips } from "@/components/blog/CategoryChips";
import { SearchBar } from "@/components/blog/SearchBar";
import { Pagination } from "@/components/blog/Pagination";

type SearchParams = Promise<{ page?: string; q?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const meta = await buildMetadata({
    title:
      page > 1
        ? `بلاگ پاراگ — صفحهٔ ${page} | مقالات دیجیتال مارکتینگ`
        : "بلاگ پاراگ | مقالات دیجیتال مارکتینگ",
    description:
      "جدیدترین مقالات پاراگ در حوزهٔ سئو، تولید محتوا، تبلیغات دیجیتال، برندینگ و رشد کسب‌وکار.",
    canonical: q ? undefined : archiveCanonical("/blog", page),
  });

  return q ? { ...meta, robots: NOINDEX } : meta;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const repo = getContentRepository();

  const [{ posts, total, totalPages }, categories, all] = await Promise.all([
    repo.listPosts({ page, q }),
    repo.listCategories(),
    repo.listPosts({ perPage: 100 }),
  ]);

  const featured = !q && page === 1 ? all.posts.find((p) => p.featured) : undefined;
  const grid = featured ? posts.filter((p) => p.slug !== featured.slug) : posts;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "بلاگ پاراگ",
    url: `${SITE_URL}/blog`,
    description: "مقالات دیجیتال مارکتینگ آژانس پاراگ",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero
        hero={{
          eyebrow: "بلاگ پاراگ",
          title: "مقالات و بینش‌های دیجیتال مارکتینگ",
          subtitle: "راهنماها، تحلیل‌ها و تجربه‌های عملی برای رشد برند شما در فضای دیجیتال.",
        }}
        compact
      />

      <Section className="!pt-4">
        <div className="flex flex-col gap-10">
          <SearchBar initial={q} />

          {q && (
            <p className="text-center text-sm text-text-muted">
              نتایج جستجو برای «<span className="text-text">{q}</span>» — {total} مقاله
            </p>
          )}

          {featured && (
            <Reveal>
              <FeaturedPost post={featured} />
            </Reveal>
          )}

          <CategoryChips categories={categories} />

          {grid.length === 0 ? (
            <p className="py-16 text-center text-text-muted">مقاله‌ای یافت نشد.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((post, i) => (
                <Reveal key={post.slug} delay={(i % 3) * 80}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} basePath="/blog" query={{ q }} />
        </div>
      </Section>
    </>
  );
}
