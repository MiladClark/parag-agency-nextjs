"use client";

import { useRef } from "react";
import type { BlogPost } from "../../content/types";
import type { TocItem } from "../../lib/toc";
import { BlogReadingRail, type RatingSnippet } from "./BlogReadingRail";

type Props = {
  toc: TocItem[];
  readingMinutes: number;
  shareUrl: string;
  shareTitle: string;
  related: BlogPost[];
  rating?: RatingSnippet | null;
  children: React.ReactNode;
};

export function ArticleReadingLayout({
  toc,
  readingMinutes,
  shareUrl,
  shareTitle,
  related,
  rating,
  children,
}: Props) {
  const articleRef = useRef<HTMLElement>(null);

  return (
    // The rail column must STRETCH to the article's full height (no items-start),
    // otherwise the sticky element inside has no room to travel.
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] xl:grid-cols-[minmax(0,1fr)_19rem]">
      <article ref={articleRef} id="post-article" className="min-w-0">
        {children}
      </article>
      <BlogReadingRail
        articleRef={articleRef}
        toc={toc}
        readingMinutes={readingMinutes}
        shareUrl={shareUrl}
        shareTitle={shareTitle}
        related={related}
        rating={rating}
      />
    </div>
  );
}
