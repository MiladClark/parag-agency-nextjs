"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { CURRENT_TENANT } from "../../content/tenant";
import { formatRatingAverage, type RatingSummary } from "../../lib/ratings";
import { toPersianDigits } from "../../lib/format";
import { CaptchaBox, type CaptchaHandle, type CaptchaProvider } from "./CaptchaBox";

const PAYLOAD = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3601";
const storageKey = (slug: string) => `parag-post-rating:${slug}`;

type Props = {
  postSlug: string;
  initial?: RatingSummary | null;
};

export function PostRatingWidget({ postSlug, initial }: Props) {
  const [summary, setSummary] = useState<RatingSummary | null>(initial ?? null);
  const [hover, setHover] = useState(0);
  const [mine, setMine] = useState(0);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<{ provider: CaptchaProvider; siteKey: string | null }>({
    provider: "none",
    siteKey: null,
  });
  const captchaRef = useRef<CaptchaHandle>(null);

  const allow = summary?.allowRatings !== false;

  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(storageKey(postSlug)));
      if (stored >= 1 && stored <= 5) setMine(stored);
    } catch {
      /* private mode */
    }
  }, [postSlug]);

  useEffect(() => {
    if (initial) return;
    void (async () => {
      try {
        const res = await fetch(
          `${PAYLOAD}/api/site/ratings?post=${encodeURIComponent(postSlug)}&tenant=${encodeURIComponent(CURRENT_TENANT)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        setSummary((await res.json()) as RatingSummary);
      } catch {
        /* CMS offline */
      }
    })();
  }, [postSlug, initial]);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const res = await fetch(
          `${PAYLOAD}/api/site/settings?tenant=${encodeURIComponent(CURRENT_TENANT)}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          captcha?: { provider?: CaptchaProvider; siteKey?: string | null };
        };
        if (data.captcha?.provider && data.captcha.provider !== "none") {
          setCaptcha({ provider: data.captcha.provider, siteKey: data.captcha.siteKey ?? null });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => controller.abort();
  }, []);

  const submit = useCallback(
    async (score: number) => {
      if (!allow || sending) return;
      setSending(true);
      setError(null);
      setMessage(null);
      try {
        const captchaToken = await captchaRef.current?.getToken();
        const res = await fetch(`${PAYLOAD}/api/site/ratings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-tenant": CURRENT_TENANT },
          body: JSON.stringify({
            tenant: CURRENT_TENANT,
            post: postSlug,
            score,
            captchaToken,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as RatingSummary & {
          ok?: boolean;
          score?: number;
          errors?: { message: string }[];
          message?: string;
        };
        if (!res.ok) {
          captchaRef.current?.reset();
          setError(data.errors?.[0]?.message || data.message || "ثبت امتیاز ناموفق بود.");
          return;
        }
        setMine(score);
        try {
          localStorage.setItem(storageKey(postSlug), String(score));
        } catch {
          /* private mode */
        }
        setSummary({
          average: data.average,
          count: data.count,
          distribution: data.distribution,
          allowRatings: data.allowRatings !== false,
        });
        setMessage(mine ? "امتیاز شما به‌روز شد." : "امتیاز شما ثبت شد. متشکریم.");
        captchaRef.current?.reset();
      } catch {
        setError("ثبت امتیاز ناموفق بود. اتصال خود را بررسی کنید.");
      } finally {
        setSending(false);
      }
    },
    [allow, sending, postSlug, mine],
  );

  const display = hover || mine;
  const avg = summary?.average ?? 0;
  const count = summary?.count ?? 0;

  return (
    <section
      id="rating"
      className="flex flex-col gap-4 rounded-3xl border border-border bg-panel p-5 sm:p-6"
      aria-label="امتیازدهی به مقاله"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-text sm:text-xl">امتیاز این مطلب</h2>
          <p className="text-sm text-text-muted">
            {count > 0 ? (
              <>
                میانگین {formatRatingAverage(avg)} از ۵ · {toPersianDigits(count)} رأی
              </>
            ) : (
              "هنوز رأیی ثبت نشده. اولین نفر باشید."
            )}
          </p>
        </div>

        {count > 0 && (
          <div className="flex items-center gap-1" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => {
              const filled = i + 1 <= Math.round(avg);
              return (
                <Star
                  key={i}
                  className={`h-4 w-4 ${filled ? "fill-accent text-accent" : "text-border"}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {count > 0 && summary && (
        <ul className="flex flex-col gap-1.5" aria-label="توزیع امتیازها">
          {[5, 4, 3, 2, 1].map((star) => {
            const n = summary.distribution[star - 1] ?? 0;
            const pct = count ? Math.round((n / count) * 100) : 0;
            return (
              <li key={star} className="grid grid-cols-[2rem_1fr_2.5rem] items-center gap-2 text-xs">
                <span className="text-text-muted">{toPersianDigits(star)}</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-end text-text-muted">{toPersianDigits(n)}</span>
              </li>
            );
          })}
        </ul>
      )}

      {allow ? (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <span className="text-sm font-medium text-text">
            {mine ? "امتیاز شما (می‌توانید تغییر دهید)" : "امتیاز شما به این مطلب"}
          </span>
          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHover(0)}
            role="radiogroup"
            aria-label="انتخاب امتیاز از ۱ تا ۵"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const value = i + 1;
              const active = value <= display;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={mine === value}
                  aria-label={`${toPersianDigits(value)} ستاره`}
                  disabled={sending}
                  onMouseEnter={() => setHover(value)}
                  onFocus={() => setHover(value)}
                  onClick={() => void submit(value)}
                  className="rounded-lg p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-60"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      active ? "fill-accent text-accent" : "text-border"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <CaptchaBox ref={captchaRef} provider={captcha.provider} siteKey={captcha.siteKey} />
          {message && (
            <p className="rounded-xl border border-accent/40 bg-accent-soft/60 px-3 py-2 text-sm text-text">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-text-muted">امتیازدهی برای این مقاله بسته است.</p>
      )}
    </section>
  );
}
