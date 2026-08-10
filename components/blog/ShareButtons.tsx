"use client";

import { useState } from "react";
import { Send, MessageCircle, Link2, Check } from "lucide-react";

// Social share row. `url` is the absolute post URL; `title` is the post title.
export function ShareButtons({
  url,
  title,
  variant = "default",
}: {
  url: string;
  title: string;
  variant?: "default" | "compact";
}) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title);
  const compact = variant === "compact";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  const btn = compact
    ? "flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-panel text-text-muted transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
    : "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-panel text-text-muted transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

  return (
    <div className={compact ? "flex flex-col gap-2" : "flex items-center gap-2"}>
      {!compact && <span className="me-1 text-sm text-text-muted">اشتراک‌گذاری:</span>}
      {compact && <span className="text-sm font-bold text-text">اشتراک</span>}
      <div className="flex items-center gap-2">
        <a
          href={`https://t.me/share/url?url=${enc}&text=${encTitle}`}
          target="_blank"
          rel="noreferrer"
          className={btn}
          aria-label="تلگرام"
        >
          <Send className="h-4 w-4" />
        </a>
        <a
          href={`https://wa.me/?text=${encTitle}%20${enc}`}
          target="_blank"
          rel="noreferrer"
          className={btn}
          aria-label="واتساپ"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${enc}&text=${encTitle}`}
          target="_blank"
          rel="noreferrer"
          className={btn}
          aria-label="ایکس"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <button type="button" onClick={copy} className={btn} aria-label="کپی لینک">
          {copied ? <Check className="h-4 w-4 text-accent" /> : <Link2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
