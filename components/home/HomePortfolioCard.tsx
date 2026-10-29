"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import type { PortfolioItem } from "../../content/types";
import { blogPlaceholder } from "../../lib/blogPlaceholder";

function projectCover(item: PortfolioItem) {
  if (item.coverImage) return item.coverImage;
  const category = /سئو/.test(item.category) ? "seo" : /برند/.test(item.category) ? "branding" : /تبلیغ/.test(item.category) ? "ads" : /مشاوره|استراتژی|مارکتینگ/.test(item.category) ? "growth" : "content";
  return blogPlaceholder(category, "card").src;
}

export function HomePortfolioCard({ item, index }: { item: PortfolioItem; index: number }) {
  return (
    <Link href={`/portfolio/${item.slug}`} className="home-work-card" aria-labelledby={`home-work-${item.slug}`} draggable={false} data-project-index={index}>
      <div className="home-work-cover">
        <Image src={projectCover(item)} alt="" fill sizes="(min-width: 1024px) 430px, (min-width: 640px) 58vw, 86vw" className="home-work-image" draggable={false} />
        <span className="home-work-category">{item.category}</span>
      </div>
      <div className="home-work-info">
        <div className="home-work-copy">
          <h3 id={`home-work-${item.slug}`}>{item.title}</h3>
          <p>{item.client || item.tags.slice(0, 2).join(" · ")}</p>
        </div>
        <span className="home-work-open" aria-hidden="true"><ArrowUpLeft size={18} strokeWidth={1.5} /></span>
      </div>
    </Link>
  );
}
