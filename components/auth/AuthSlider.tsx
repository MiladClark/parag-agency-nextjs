"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { portfolio } from "../../content/data/portfolio";
import { CURRENT_TENANT } from "../../content/tenant";

const logoMark = "/logo-mark.svg";
const PAYLOAD = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3004";
const DURATION = 5000;

interface AuthSlide {
  id: string;
  title: string;
  category: string;
  summary: string;
  cover: string;
  imageUrl?: string;
}

const FALLBACK_SLIDES: AuthSlide[] = portfolio.slice(0, 4).map((item) => ({
  id: item.slug,
  title: item.title,
  category: item.category,
  summary: item.summary,
  cover: item.cover,
}));

interface PayloadMedia {
  url?: string | null;
}

interface PayloadHeroSlide {
  id: number;
  title: string;
  category?: string | null;
  summary?: string | null;
  image?: PayloadMedia | number | null;
  coverGradient?: string | null;
  order?: number | null;
}

function mediaUrl(media: PayloadMedia | number | null | undefined): string | undefined {
  if (!media || typeof media === "number" || !media.url) return undefined;
  return media.url.startsWith("http") ? media.url : `${PAYLOAD}${media.url}`;
}

function mapSlide(doc: PayloadHeroSlide): AuthSlide {
  return {
    id: String(doc.id),
    title: doc.title,
    category: doc.category ?? "",
    summary: doc.summary ?? "",
    cover: doc.coverGradient ?? "from-emerald-500/30 to-green-700/30",
    imageUrl: mediaUrl(doc.image),
  };
}

async function fetchHeroSlides(): Promise<AuthSlide[]> {
  const tenant = encodeURIComponent(CURRENT_TENANT);
  const res = await fetch(
    `${PAYLOAD}/api/heroSlides?where[tenant.slug][equals]=${tenant}&sort=order&depth=1&limit=20`,
  );
  if (!res.ok) throw new Error(`heroSlides ${res.status}`);
  const data = (await res.json()) as { docs: PayloadHeroSlide[] };
  const slides = data.docs.map(mapSlide);
  if (!slides.length) throw new Error("no slides");
  return slides;
}

// Showcase slider for the auth split-screen: image or gradient scenes with
// floating glass panels, a glass caption, and segmented progress.
export function AuthSlider() {
  const [slides, setSlides] = useState<AuthSlide[]>(FALLBACK_SLIDES);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchHeroSlides()
      .then((docs) => {
        if (!cancelled) setSlides(docs);
      })
      .catch(() => {
        /* keep bundled fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), DURATION);
    return () => window.clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  const slide = slides[index] ?? slides[0];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05080a]">
      <AnimatePresence mode="sync">
        {slide.imageUrl ? (
          <motion.img
            key={`img-${index}`}
            src={slide.imageUrl}
            alt={slide.title}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1 }, scale: { duration: DURATION / 1000, ease: "linear" } }}
          />
        ) : (
          <motion.div
            key={`grad-${index}`}
            className={`absolute inset-0 bg-gradient-to-br ${slide.cover}`}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1 }, scale: { duration: DURATION / 1000, ease: "linear" } }}
          />
        )}
        <div
          key={`overlay-${index}`}
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30"
          aria-hidden
        />
      </AnimatePresence>

      {/* floating glass panels for depth */}
      <motion.div
        className="absolute right-10 top-24 hidden h-28 w-44 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md xl:block"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="absolute left-12 top-1/2 hidden h-36 w-28 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md xl:block"
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      {/* grid texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      {/* brand */}
      <a href="/" className="absolute right-10 top-10 flex items-center gap-2.5">
        <img src={logoMark} alt="پاراگ" className="h-9 w-9" />
        <span className="text-xl font-bold text-white">پاراگ</span>
      </a>

      {/* caption */}
      <div className="absolute inset-x-0 bottom-0 p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md"
          >
            {slide.category ? (
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {slide.category}
              </span>
            ) : null}
            <h2 className="mt-4 text-2xl font-extrabold leading-snug text-white sm:text-3xl">
              {slide.title}
            </h2>
            {slide.summary ? (
              <p className="mt-3 text-sm leading-7 text-white/80">{slide.summary}</p>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* progress */}
        <div className="mt-8 flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`اسلاید ${i + 1}`}
              className="h-1 overflow-hidden rounded-full bg-white/25 transition-all"
              style={{ width: i === index ? "2.5rem" : "1rem" }}
            >
              {i === index && (
                <motion.span
                  className="block h-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: DURATION / 1000, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
