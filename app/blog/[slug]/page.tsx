import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentRepository } from "@/content/repository";
import { buildMetadata } from "@/lib/seo";
import { decodeSlugParam } from "@/lib/slug";
import { categoryTitleOf } from "@/content/data/blog";
import { estimateReadingMinutes } from "@/lib/format";
import { Container, Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { PostBody } from "@/components/blog/PostBody";
import { PostMeta, AuthorAvatar } from "@/components/blog/PostMeta";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { PostComments } from "@/components/blog/PostComments";

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
  const url = `https://parag.agency/blog/${post.slug}`;

  const jsonLd = {
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute -top-40 right-1/2 h-[32rem] w-[32rem] translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
          aria-hidden
        />
        <Container className="relative py-16 sm:py-20">
          <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
            <a href="/" className="hover:text-accent">خانه</a>
            <Icon name="chevron-left" className="text-xs" />
            <a href="/blog" className="hover:text-accent">بلاگ</a>
            <Icon name="chevron-left" className="text-xs" />
            <span className="line-clamp-1 text-text">{post.title}</span>
          </nav>

          <div className="flex max-w-3xl flex-col gap-6">
            <a
              href={`/blog/category/${post.category}`}
              className="w-fit rounded-full border border-accent/30 bg-accent-soft px-4 py-1.5 text-sm font-medium text-accent"
            >
              {categoryTitleOf(post.category)}
            </a>
            <h1 className="text-3xl font-extrabold leading-tight text-text sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <p className="text-lg leading-9 text-text-muted">{post.excerpt}</p>
            <PostMeta author={post.author} publishedAt={post.publishedAt} readingMinutes={minutes} />
          </div>
        </Container>
      </section>

      {/* Cover */}
      <Container className="relative py-10">
        <div
          className={`aspect-[21/9] w-full overflow-hidden rounded-3xl border border-border ${
            post.coverGradient ? `bg-gradient-to-br ${post.coverGradient}` : "bg-panel"
          }`}
        >
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
          )}
        </div>
      </Container>

      {/* Body */}
      <Section className="!pt-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <article>
            <PostBody blocks={post.body} />
          </article>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <a
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
                >
                  #{tag}
                </a>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
            <ShareButtons url={url} title={post.title} />
          </div>

          {/* Author */}
          <div className="flex items-start gap-4 rounded-3xl border border-border bg-panel p-6">
            <AuthorAvatar author={post.author} size="lg" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-text">{post.author.name}</span>
              {post.author.role && <span className="text-sm text-accent">{post.author.role}</span>}
              {post.author.bio && <p className="mt-1 text-sm leading-7 text-text-muted">{post.author.bio}</p>}
            </div>
          </div>

          {/* Comments — read and written straight against the CMS, moderated there. */}
          <PostComments postSlug={post.slug} />
        </div>
      </Section>

      {/* Related */}
      {related.length > 0 && (
        <Section className="!pt-0">
          <RelatedPosts posts={related} />
        </Section>
      )}
    </>
  );
}
