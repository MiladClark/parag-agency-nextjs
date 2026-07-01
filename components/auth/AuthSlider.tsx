"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { portfolio } from "../../content/data/portfolio";
const logoMark = "/logo-mark.svg";

const slides = portfolio.slice(0, 4);
const DURATION = 5000;

// A bespoke showcase slider for the auth split-screen: Ken-Burns gradient
// scenes with floating glass panels, a glass caption, and segmented progress.
export function AuthSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), DURATION);
    return () => window.clearInterval(id);
  }, []);

  const slide = slides[index];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05080a]">
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          className={`absolute inset-0 bg-gradient-to-br ${slide.cover}`}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1 }, scale: { duration: DURATION / 1000, ease: "linear" } }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" aria-hidden />
        </motion.div>
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
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {slide.category}
            </span>
            <h2 className="mt-4 text-2xl font-extrabold leading-snug text-white sm:text-3xl">
              {slide.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/80">{slide.summary}</p>
          </motion.div>
        </AnimatePresence>

        {/* progress */}
        <div className="mt-8 flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.slug}
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