"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useInView } from "motion/react";
import { ArrowUpLeft } from "lucide-react";
import { businessPartners as copy } from "@/content/data/businessPartners";
import { useMediaQuery } from "@/lib/useMediaQuery";
import "./business-partners.css";

const DURATION = 5200;
const TOTAL = copy.items.length;

/**
 * React Bits Bounce Cards: fan slots, spring entrance, straighten + push on hover.
 * https://reactbits.dev/components/bounce-cards
 * Adapted to semantic brand links and Motion's existing spring runtime. On phones,
 * the fan folds into a deck; all brand copy travels with its own card.
 */
export function BusinessPartners() {
  const deck = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(960);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const mobile = useMediaQuery("(max-width: 767px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const nearby = useInView(deck, { amount: 0.3 });
  const entered = useInView(deck, { once: true, amount: 0.2 });
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const highlighted = focused ?? hovered;
  const staticDeck = mobile && reduced;
  const cardWidth = mobile ? Math.min(width - 44, 340) : Math.min(320, (width - 72) / 3);
  const spread = cardWidth * 0.88;

  useEffect(() => {
    const node = deck.current;
    if (!node) return;
    const resize = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    resize.observe(node);
    const readVisibility = () => setPageVisible(document.visibilityState === "visible");
    readVisibility();
    document.addEventListener("visibilitychange", readVisibility);
    return () => { resize.disconnect(); document.removeEventListener("visibilitychange", readVisibility); };
  }, []);

  useEffect(() => {
    if (!mobile || reduced || !nearby || !pageVisible || focused !== null) return;
    const timer = setTimeout(() => setActive(index => (index + 1) % TOTAL), DURATION);
    return () => clearTimeout(timer);
  }, [active, mobile, reduced, nearby, pageVisible, focused]);

  return <section className="pn-section pn-partners" aria-labelledby="pn-partners-title" id="business-partners">
    <div className="pn-container">
      <motion.h2 id="pn-partners-title" initial={reduced ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .5 }}
        transition={{ duration: .65, ease: [.22, 1, .36, 1] }}>
        {copy.heading}{" "}<span className="text-gradient">{copy.accent}</span>
      </motion.h2>
      <div ref={deck} className="pn-partner-deck" role="region" aria-label={copy.carouselLabel}
        data-static={staticDeck} data-text-motion="off" data-reactbits="bounce-cards"
        onPointerMove={event => {
          if (mobile || reduced || event.pointerType !== "mouse") return;
          const box = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - box.left - box.width / 2;
          const y = event.clientY - box.top - box.height / 2;
          if (Math.abs(y) > 194) { setHovered(null); return; }
          const index = Math.max(0, Math.min(TOTAL - 1, Math.round(x / spread + (TOTAL - 1) / 2)));
          if (Math.abs(x - (index - (TOTAL - 1) / 2) * spread) > cardWidth / 2 + 24) { setHovered(null); return; }
          setHovered(index);
        }}
        onPointerLeave={() => setHovered(null)}
        onFocusCapture={event => {
          const card = (event.target as HTMLElement).closest<HTMLElement>("[data-card-index]");
          if (card) setFocused(Number(card.dataset.cardIndex));
        }}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(null); }}
        onTouchStart={event => {
          const touch = event.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
          swiped.current = false;
        }}
        onTouchEnd={event => {
          if (!mobile || reduced || !touchStart.current) return;
          const touch = event.changedTouches[0];
          const dx = touch.clientX - touchStart.current.x;
          const dy = touch.clientY - touchStart.current.y;
          touchStart.current = null;
          if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            swiped.current = true;
            setActive(index => (index + (dx < 0 ? 1 : TOTAL - 1)) % TOTAL);
          }
        }}>
        {copy.items.map((partner, index) => {
          const offset = index - (TOTAL - 1) / 2;
          const distance = (index - active + TOTAL) % TOTAL;
          const isFront = distance === 0;
          const isHighlighted = highlighted === index;
          const push = highlighted === null || isHighlighted ? 0 : Math.sign(index - highlighted) * 30;
          const target = mobile ? {
            x: isFront ? 0 : distance === 1 ? 12 : -12,
            y: isFront ? 10 : -14 * distance,
            rotate: isFront ? -2 : distance === 1 ? 5 : -7,
            scale: isFront ? 1 : 1 - distance * 0.045,
          } : {
            x: offset * spread + push,
            y: isHighlighted ? -22 : Math.abs(offset) * 16,
            rotate: isHighlighted ? 0 : offset * 8 + (index === 1 ? -3 : 0),
            scale: isHighlighted ? 1.035 : 1,
          };
          return <div className="pn-partner-card-anchor" key={partner.id} style={{ zIndex: mobile ? TOTAL - distance : isHighlighted ? 5 : index === 1 ? 3 : 2 }}>
            <motion.a className="pn-partner-card" href={partner.href} target="_blank" rel="noopener noreferrer"
              data-partner={partner.id} data-card-index={index} data-highlighted={isHighlighted || (mobile && isFront)}
              aria-label={`${partner.name}؛ ${partner.role}؛ ${copy.linkLabel}`}
              aria-hidden={mobile && !staticDeck && !isFront ? true : undefined}
              tabIndex={mobile && !staticDeck && !isFront ? -1 : 0}
              onClick={event => { if (swiped.current) { event.preventDefault(); swiped.current = false; } }}
              initial={false}
              animate={staticDeck ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 } : entered || reduced ? { ...target, opacity: 1 } : { x: 0, y: 28, rotate: 0, scale: .9, opacity: 0 }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 175, damping: 22, mass: 0.9 }}
              style={{ width: cardWidth, "--partner-card-width": `${cardWidth}px`, "--partner-mark": `url("${partner.darkLogo}")` } as CSSProperties}>
              <div className="pn-partner-card-top"><span dir="ltr">{new URL(partner.href).hostname}</span><span className="pn-partner-card-arrow" aria-hidden><ArrowUpLeft size={19}/></span></div>
              <div className="pn-partner-card-brand">
                {/* Local, original brand artwork; the cards themselves are always dark. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={partner.darkLogo} alt="" width={200} height={100} draggable={false} loading="lazy" />
              </div>
              <div className="pn-partner-card-copy"><h3>{partner.name}</h3><p>{partner.role}</p></div>
            </motion.a>
          </div>;
        })}
      </div>
      {mobile && !reduced && <div className="pn-partner-deck-tabs" aria-label="انتخاب همکار تجاری" data-text-motion="off">
        {copy.items.map((partner, index) => <button key={partner.id} type="button" onClick={() => { setActive(index); setFocused(null); }} aria-label={partner.name} aria-current={active === index ? "true" : undefined}><span /></button>)}
      </div>}
    </div>
  </section>;
}
