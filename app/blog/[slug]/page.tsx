import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getContentRepository } from "@/content/repository";
import { buildMetadata } from "@/lib/seo";
import { decodeSlugParam } from "@/lib/slug";
import { categoryTitleOf } from "@/content/data/blog";
import { estimateReadingMinutes, toPersianDigits } from "@/lib/format";
import { extractToc } from "@/lib/toc";
import { fetchRatingSummary, formatRatingAverage } from "@/lib/ratings";
import { Container, Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/Reveal";
import { PostBody } from "@/components/blog/PostBody";
import { PostMeta, AuthorAvatar } from "@/components/blog/PostMeta";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { PostComments } from "@/components/blog/PostComments";
import { PostRatingWidget } from "@/components/blog/PostRatingWidget";
import { ArticleReadingLayout } from "@/components/blog/ArticleReadingLayout";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const repo = getContentRepository();
  const { posts } = await repo.listPosts({ perPage: 1000 });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeSlugParam(rawSlug);
  const post = await getContentRepository().getPost(slug);
  if (!post) return {};
  return buildMetadata(post.coverImage ? { ...post.seo, ogImage: post.coverImage } : post.seo);
}

export default async function Page({ params }: { params: Params }) {
  const { slug: rawSlug } = await params;
  const slug = decodeSlugParam(rawSlug);
  const repo = getContentRepository();
  const post = await repo.getPost(slug);
  if (!post) notFound();

  const related = await repo.getRelatedPosts(slug, 3);
  const minutes = post.readingMinutes ?? estimateReadingMinutes(post.body);
  const toc = extractToc(post.body);
  const rating = await fetchRatingSummary(post.slug);
  const url = `https://parag.agency/blog/${post.slug}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Organization", name: "پاراگ", url: "https://parag.agency" },
    mainEntityOfPage: url,
    image: post.coverImage ? [post.coverImage] : undefined,
  };

  if (rating && rating.count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.average,
      ratingCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden">
        {/* Layered depth: two brand glows + a faint dotted texture. */}
        <div
          className="pointer-events-none absolute -top-40 right-1/2 h-[28rem] w-[28rem] translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-[12%] h-72 w-72 rounded-full bg-accent/5 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
          aria-hidden
        />

        <Container className="relative pb-8 pt-12 sm:pb-10 sm:pt-16">
          <nav className="mb-6 flex min-w-0 items-center gap-2 text-sm text-text-muted sm:mb-7">
            <a href="/" className="shrink-0 transition-colors hover:text-accent">
              خانه
            </a>
            <Icon name="chevron-left" className="shrink-0 text-xs opacity-60" />
            <a href="/blog" className="shrink-0 transition-colors hover:text-accent">
              بلاگ
            </a>
            <Icon name="chevron-left" className="shrink-0 text-xs opacity-60" />
            <span className="min-w-0 truncate text-text">{post.title}</span>
          </nav>

          <div className="flex max-w-3xl flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`/blog/category/${post.category}`}
                className="w-fit rounded-full border border-accent/30 bg-accent-soft px-4 py-1.5 text-sm font-medium text-accent transition-all hover:border-accent/60 hover:shadow-[0_0_24px_-8px_var(--accent)]"
              >
                {categoryTitleOf(post.category)}
              </a>
              {rating && rating.count > 0 && (
                <a
                  href="#rating"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-panel/80 px-3 py-1.5 text-sm text-text-muted backdrop-blur-sm transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  {formatRatingAverage(rating.average)} · {toPersianDigits(rating.count)} رأی
                </a>
              )}
            </div>

            <h1 className="text-balance text-3xl font-extrabold leading-[1.25] tracking-tight text-text sm:text-4xl lg:text-5xl lg:leading-[1.2]">
              {post.title}
            </h1>
            <p className="max-w-[62ch] text-base leading-8 text-text-muted sm:text-lg sm:leading-9">
              {post.excerpt}
            </p>

            <div className="mt-1 flex items-start gap-3 sm:items-center sm:gap-4">
              <span className="mt-3 h-px w-6 shrink-0 bg-accent/60 sm:mt-0 sm:w-10" aria-hidden />
              <PostMeta author={post.author} publishedAt={post.publishedAt} readingMinutes={minutes} />
            </div>
          </div>
        </Container>

        {/* Cover sits inside the hero so the glow bleeds behind it. */}
        <Container className="relative pb-12 sm:pb-16">
          <Reveal>
            <div className="group relative">
              <div
                className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-accent/10 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
                aria-hidden
              />
              <div
                className={`relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border shadow-[0_30px_80px_-32px_rgba(0,0,0,0.55)] ring-1 ring-white/5 sm:aspect-[21/9] sm:rounded-3xl ${
                  post.coverGradient ? `bg-gradient-to-br ${post.coverGradient}` : "bg-panel"
                }`}
              >
                {post.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                )}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
                  aria-hidden
                />
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <Section className="!pt-2 !pb-16 sm:!pb-20">
        <ArticleReadingLayout
          toc={toc}
          readingMinutes={minutes}
          shareUrl={url}
          shareTitle={post.title}
          related={related}
          rating={rating && rating.count > 0 ? { average: rating.average, count: rating.count } : null}
        >
          <div className="flex flex-col gap-10">
            <PostBody blocks={post.body} />

            {post.tags.length > 0 && (
              <Reveal>
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-6">
                  {post.tags.map((tag) => (
                    <a
                      key={tag}
                      href={`/blog/tag/${encodeURIComponent(tag)}`}
                      className="group rounded-full border border-border bg-panel/60 px-3.5 py-1.5 text-xs text-text-muted transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                    >
                      <span className="text-accent/60 transition-colors group-hover:text-accent">#</span>
                      {tag}
                    </a>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-border bg-panel p-6">
                <div
                  className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl"
                  aria-hidden
                />
                <div className="relative flex items-start gap-4">
                  <AuthorAvatar author={post.author} size="lg" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                      نویسنده
                    </span>
                    <span className="font-bold text-text">{post.author.name}</span>
                    {post.author.role && (
                      <span className="text-sm text-accent">{post.author.role}</span>
                    )}
                    {post.author.bio && (
                      <p className="mt-1 text-sm leading-7 text-text-muted">{post.author.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>

            <PostRatingWidget postSlug={post.slug} initial={rating} />
            <PostComments postSlug={post.slug} initialRating={rating} />
          </div>
        </ArticleReadingLayout>
      </Section>

      {related.length > 0 && (
        <Section className="!pt-0">
          <RelatedPosts posts={related} />
        </Section>
      )}
    </>
  );
}
