"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { BlogPost } from "../../content/types";
import { categoryTitleOf } from "../../content/data/blog";
import { formatJalaliDate, estimateReadingMinutes, toPersianDigits } from "../../lib/format";
import { Section } from "../ui/Section";
import { SectionIntro } from "../ui/SectionIntro";
import { ButtonLink } from "../ui/Button";
import { TiltCard } from "../ui/TiltCard";
import { ArrowLeft, Clock } from "lucide-react";

export function LatestPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;

  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== featured.slug).slice(0, 3);

  return (
    <Section id="blog">
      <div className="mb-14 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
        <SectionIntro
          align="start"
          title="آخرین نوشته‌های"
          accent="بلاگ پاراگ"
          body="ایده‌ها، استراتژی‌ها و درس‌هایی از پروژه‌های واقعی رشد دیجیتال."
        />
        <ButtonLink href="/blog" variant="secondary" className="shrink-0 self-start sm:self-auto">
          همه مقالات
          <ArrowLeft className="h-4 w-4" />
        </ButtonLink>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <FeaturedInsight post={featured} />
        </motion.div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {rest.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 0.65,
                delay: 0.12 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <SideInsight post={post} index={i + 2} />
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function FeaturedInsight({ post }: { post: BlogPost }) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const minutes = post.readingMinutes ?? estimateReadingMinutes(post.body);

  return (
    <TiltCard className="h-full rounded-[2rem]" max={8}>
      <a
        ref={ref}
        href={`/blog/${post.slug}`}
        className="group relative flex h-full min-h-[28rem] flex-col overflow-hidden rounded-[2rem] border border-border bg-panel shadow-depth"
      >
        <div
          className={`relative h-64 overflow-hidden sm:h-80 ${
            post.coverGradient ? `bg-gradient-to-br ${post.coverGradient}` : "bg-surface"
          }`}
        >
          <motion.div style={{ y: mediaY }} className="absolute inset-[-12%]">
            {post.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-accent/25 via-transparent to-emerald-700/20" />
            )}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/20 to-transparent" aria-hidden />
          <span className="absolute start-5 top-5 rounded-full border border-white/10 bg-bg/65 px-3 py-1 text-xs font-medium text-text backdrop-blur-md">
            {categoryTitleOf(post.category)}
          </span>
        </div>

        <div className="relative flex flex-1 flex-col gap-4 p-7 sm:p-9">
          <span className="text-xs font-semibold tracking-wide text-accent">مقالهٔ منتخب</span>
          <h3 className="text-2xl font-extrabold leading-relaxed text-text transition-colors duration-300 group-hover:text-accent sm:text-3xl">
            {post.title}
          </h3>
          <p className="line-clamp-3 text-sm leading-7 text-text-muted sm:text-base sm:leading-8">
            {post.excerpt}
          </p>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-3 text-xs text-text-muted sm:text-sm">
              <span className="font-medium text-text">{post.author.name}</span>
              <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
              <span>{formatJalaliDate(post.publishedAt)}</span>
              <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {toPersianDigits(minutes)} دقیقه
              </span>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
              بخوانید
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </span>
          </div>
        </div>
      </a>
    </TiltCard>
  );
}

function SideInsight({ post, index }: { post: BlogPost; index: number }) {
  const [hovered, setHovered] = useState(false);
  const minutes = post.readingMinutes ?? estimateReadingMinutes(post.body);

  return (
    <a
      href={`/blog/${post.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block overflow-hidden rounded-2xl border border-border/80 bg-panel/60 transition-colors duration-300 hover:border-accent/35"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-l from-accent-soft via-accent-soft/25 to-transparent"
        initial={false}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        aria-hidden
      />

      <div className="relative flex gap-4 p-4 sm:gap-5 sm:p-5">
        <div
          className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28 ${
            post.coverGradient ? `bg-gradient-to-br ${post.coverGradient}` : "bg-surface"
          }`}
        >
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}
          <span className="absolute inset-0 flex items-end justify-start p-2">
            <span className="rounded-md bg-bg/70 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-accent backdrop-blur-sm">
              {toPersianDigits(String(index).padStart(2, "0"))}
            </span>
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <span className="text-[11px] font-medium text-accent">{categoryTitleOf(post.category)}</span>
          <h3 className="line-clamp-2 text-base font-bold leading-7 text-text transition-colors duration-300 group-hover:text-accent sm:text-lg sm:leading-8">
            {post.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
            <span>{formatJalaliDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {toPersianDigits(minutes)} دقیقه
            </span>
          </div>
        </div>

        <span
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full border transition-all duration-300 ${
            hovered ? "border-accent bg-accent text-white" : "border-border text-text-muted"
          }`}
        >
          <ArrowLeft className={`h-4 w-4 transition-transform duration-300 ${hovered ? "-translate-x-0.5" : ""}`} />
        </span>
      </div>
    </a>
  );
}
