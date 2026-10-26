"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PortfolioItem } from "../../content/types";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { HomePortfolioCard } from "./HomePortfolioCard";
import { SectionIntro } from "../ui/SectionIntro";
import { ButtonLink } from "../ui/Button";

/** Original implementation of the supplied visual reference, without Pro source. */
export function PortfolioCarousel({ items }: { items: PortfolioItem[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; active: boolean } | null>(null);
  const suppressClick = useRef(false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [position, setPosition] = useState({ previous: false, next: items.length > 1, fadeLeft: items.length > 1, fadeRight: false });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const distance = Math.min(max, Math.abs(rail.scrollLeft));
      const bounds = rail.getBoundingClientRect();
      const cards = Array.from(rail.children, card => card.getBoundingClientRect());
      const previous = distance > 2;
      const next = max - distance > 2;
      const fadeLeft = cards.some(r => r.left < bounds.left - 1 && r.right > bounds.left + 1);
      const fadeRight = cards.some(r => r.right > bounds.right + 1 && r.left < bounds.right - 1);
      setPosition(old => old.previous === previous && old.next === next && old.fadeLeft === fadeLeft && old.fadeRight === fadeRight ? old : { previous, next, fadeLeft, fadeRight });
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    return () => { rail.removeEventListener("scroll", update); observer.disconnect(); };
  }, [items.length]);

  const move = (direction: number) => {
    const rail = railRef.current;
    const first = rail?.firstElementChild;
    if (!rail || !first) return;
    const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || "0");
    rail.scrollBy({ left: direction * step, behavior: reduced ? "instant" : "smooth" });
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    if (drag.current.active) {
      suppressClick.current = true;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
  };

  return (
    <div className="showcase8" role="region" aria-label="نمونه‌کارهای پاراگ" aria-roledescription="کاروسل">
      <div className="showcase8-heading">
        <SectionIntro
          className="showcase8-intro"
          align="start" label="نمونه‌کارها" title="داستان‌هایی از" accent="رشد واقعی"
          body="نگاهی به چند پروژه‌ای که از ایده تا نتیجه جلو بردیم."
          action={<div className="hidden shrink-0 lg:block"><ButtonLink href="/portfolio" variant="secondary">مشاهده همه نمونه‌کارها</ButtonLink></div>}
        />
        <div className="showcase8-controls">
          <button type="button" onClick={() => move(-1)} disabled={!position.next} aria-label="نمونه‌کار بعدی" aria-controls="home-portfolio-rail"><ArrowLeft size={18} strokeWidth={1.5} /></button>
          <button type="button" onClick={() => move(1)} disabled={!position.previous} aria-label="نمونه‌کار قبلی" aria-controls="home-portfolio-rail"><ArrowRight size={18} strokeWidth={1.5} /></button>
        </div>
      </div>

      <div className="showcase8-window" data-fade-left={position.fadeLeft} data-fade-right={position.fadeRight}>
        <div
          id="home-portfolio-rail"
          ref={railRef}
          className="showcase8-rail"
          dir="rtl"
          tabIndex={0}
          role="group"
          aria-label="برای مرور نمونه‌کارها به چپ یا راست حرکت کنید"
          data-lenis-prevent-horizontal
          onPointerDown={event => {
            if (event.pointerType !== "mouse" || event.button !== 0) return;
            suppressClick.current = false;
            drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, active: false };
          }}
          onPointerMove={event => {
            const start = drag.current;
            if (!start) return;
            const delta = start.x - event.clientX;
            if (!start.active && Math.abs(delta) < 6) return;
            if (!start.active) { start.active = true; event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.dataset.dragging = "true"; }
            event.preventDefault();
            event.currentTarget.scrollLeft = start.left + delta;
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={event => { if (!drag.current?.active) endDrag(event); }}
          onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}
          onKeyDown={event => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
          }}
        >
          {items.map((item, index) => <HomePortfolioCard key={item.slug} item={item} index={index} />)}
        </div>
        <span className="showcase8-edge showcase8-edge-left" aria-hidden="true" />
        <span className="showcase8-edge showcase8-edge-right" aria-hidden="true" />
      </div>
    </div>
  );
}
