"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, MessageSquare, ShieldCheck, Star, X } from "lucide-react";
import { CURRENT_TENANT } from "../../content/tenant";
import { formatJalaliDate, toPersianDigits } from "../../lib/format";
import { formatRatingAverage, type RatingSummary } from "../../lib/ratings";
import { CaptchaBox, type CaptchaHandle, type CaptchaProvider } from "./CaptchaBox";
import { StarRow } from "./StarRow";

const PAYLOAD = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3601";

type ApiComment = {
  id: number;
  authorName: string;
  authorWebsite: string | null;
  body: string;
  adminReply: string | null;
  parent: number | null;
  rating: number | null;
  createdAt: string;
};

type Thread = ApiComment & { replies: ApiComment[] };

type FormState = {
  authorEmail: string;
  authorName: string;
  authorWebsite: string;
  body: string;
};

const EMPTY_FORM: FormState = { authorEmail: "", authorName: "", authorWebsite: "", body: "" };

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-accent/60 focus:outline-none focus-visible:outline-none focus-visible:ring-0";

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-sm font-bold text-accent"
    >
      {name.trim().charAt(0) || "؟"}
    </span>
  );
}

function CommentCard({
  comment,
  onReply,
  isReply = false,
}: {
  comment: ApiComment;
  onReply: (comment: ApiComment) => void;
  isReply?: boolean;
}) {
  return (
    <article
      className={`flex gap-3 rounded-2xl border border-border p-4 sm:p-5 ${
        isReply ? "bg-surface/60" : "bg-panel"
      }`}
    >
      <Avatar name={comment.authorName} />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {comment.authorWebsite ? (
            <a
              href={comment.authorWebsite}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-bold text-text transition-colors hover:text-accent"
            >
              {comment.authorName}
            </a>
          ) : (
            <span className="font-bold text-text">{comment.authorName}</span>
          )}
          <time className="text-xs text-text-muted" dateTime={comment.createdAt}>
            {formatJalaliDate(comment.createdAt)}
          </time>
          {!isReply && comment.rating != null && comment.rating >= 1 && (
            <StarRow rating={comment.rating} />
          )}
        </header>

        <p className="whitespace-pre-line text-sm leading-8 text-text-muted">{comment.body}</p>

        {comment.adminReply && (
          <div className="mt-1 rounded-xl border-e-2 border-accent bg-accent-soft/50 p-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-accent">
              <ShieldCheck className="h-3.5 w-3.5" />
              پاسخ پاراگ
            </span>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-7 text-text-muted">
              {comment.adminReply}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => onReply(comment)}
          className="flex w-fit items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-accent"
        >
          <CornerDownLeft className="h-3.5 w-3.5" />
          پاسخ
        </button>
      </div>
    </article>
  );
}

function FormStars({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text">امتیاز شما به این مطلب (اختیاری)</span>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
        role="radiogroup"
        aria-label="امتیاز اختیاری"
      >
        {Array.from({ length: 5 }, (_, i) => {
          const n = i + 1;
          const active = n <= display;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              disabled={disabled}
              aria-label={`${toPersianDigits(n)} ستاره`}
              onMouseEnter={() => setHover(n)}
              onClick={() => onChange(value === n ? 0 : n)}
              className="rounded-lg p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <Star
                className={`h-6 w-6 ${active ? "fill-accent text-accent" : "text-border"}`}
              />
            </button>
          );
        })}
        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="ms-2 text-xs text-text-muted hover:text-accent"
          >
            حذف
          </button>
        )}
      </div>
    </div>
  );
}

export function PostComments({
  postSlug,
  initialRating,
}: {
  postSlug: string;
  initialRating?: RatingSummary | null;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [total, setTotal] = useState(0);
  const [allowComments, setAllowComments] = useState(true);
  const [allowRatings, setAllowRatings] = useState(true);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(initialRating ?? null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formRating, setFormRating] = useState(0);
  const [replyTo, setReplyTo] = useState<ApiComment | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [captcha, setCaptcha] = useState<{ provider: CaptchaProvider; siteKey: string | null }>({
    provider: "none",
    siteKey: null,
  });
  const captchaRef = useRef<CaptchaHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `${PAYLOAD}/api/site/comments?post=${encodeURIComponent(postSlug)}&tenant=${encodeURIComponent(CURRENT_TENANT)}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as {
        allowComments: boolean;
        allowRatings?: boolean;
        total: number;
        comments: ApiComment[];
        ratingSummary?: RatingSummary;
      };
      setAllowComments(data.allowComments !== false);
      setAllowRatings(data.allowRatings !== false);
      setTotal(data.total ?? data.comments.length);
      if (data.ratingSummary) setRatingSummary(data.ratingSummary);

      const byId = new Map(data.comments.map((c) => [c.id, c]));
      const roots: Thread[] = [];
      const index = new Map<number, Thread>();

      for (const c of data.comments) {
        if (c.parent === null) {
          const thread: Thread = { ...c, replies: [] };
          index.set(c.id, thread);
          roots.push(thread);
        }
      }
      for (const c of data.comments) {
        if (c.parent === null) continue;
        let anchor: number | null = c.parent;
        const seen = new Set<number>();
        while (anchor !== null && !index.has(anchor) && !seen.has(anchor)) {
          seen.add(anchor);
          anchor = byId.get(anchor)?.parent ?? null;
        }
        if (anchor !== null && index.has(anchor)) index.get(anchor)!.replies.push(c);
      }

      setThreads(roots);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [postSlug]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const startReply = useCallback((comment: ApiComment) => {
    setReplyTo(comment);
    setFormRating(0);
    setDone(false);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;

    setError(null);

    if (!form.authorName.trim()) return setError("نام را وارد کنید.");
    if (!/^\S+@\S+\.\S+$/.test(form.authorEmail)) return setError("ایمیل معتبر وارد کنید.");
    if (!form.body.trim()) return setError("متن دیدگاه خالی است.");

    setSending(true);
    try {
      const captchaToken = await captchaRef.current?.getToken();
      const res = await fetch(`${PAYLOAD}/api/site/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant": CURRENT_TENANT },
        body: JSON.stringify({
          tenant: CURRENT_TENANT,
          post: postSlug,
          parent: replyTo?.id,
          authorName: form.authorName.trim(),
          authorEmail: form.authorEmail.trim(),
          authorWebsite: form.authorWebsite.trim() || undefined,
          body: form.body.trim(),
          rating: !replyTo && formRating > 0 ? formRating : undefined,
          captchaToken,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        errors?: { message: string }[];
        message?: string;
      };

      if (!res.ok) {
        captchaRef.current?.reset();
        setError(data.errors?.[0]?.message || data.message || "ارسال دیدگاه ناموفق بود.");
        return;
      }

      captchaRef.current?.reset();
      setForm(EMPTY_FORM);
      setFormRating(0);
      setReplyTo(null);
      setDone(true);
    } catch {
      setError("ارسال دیدگاه ناموفق بود. اتصال خود را بررسی کنید.");
    } finally {
      setSending(false);
    }
  };

  const heading = useMemo(
    () => (total > 0 ? `${toPersianDigits(total)} دیدگاه` : "دیدگاه‌ها"),
    [total],
  );

  return (
    <section id="comments" className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-text sm:text-2xl">
          <MessageSquare className="h-5 w-5 text-accent" />
          {heading}
        </h2>
        {ratingSummary && ratingSummary.count > 0 && (
          <a
            href="#rating"
            className="flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent"
          >
            <Star className="h-4 w-4 fill-accent text-accent" />
            {formatRatingAverage(ratingSummary.average)} · {toPersianDigits(ratingSummary.count)} رأی
          </a>
        )}
      </header>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-border bg-panel"
              aria-hidden
            />
          ))}
          <p className="sr-only">در حال بارگذاری دیدگاه‌ها</p>
        </div>
      ) : threads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-panel/50 px-6 py-10 text-center">
          <MessageSquare className="mx-auto mb-3 h-8 w-8 text-accent/60" />
          <p className="text-sm font-medium text-text">هنوز دیدگاهی ثبت نشده</p>
          <p className="mt-1 text-sm text-text-muted">اولین نفر باشید و نظرتان را بنویسید.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {threads.map((thread) => (
            <div key={thread.id} className="flex flex-col gap-3">
              <CommentCard comment={thread} onReply={startReply} />
              {thread.replies.length > 0 && (
                <div className="flex flex-col gap-3 ps-6 sm:ps-12">
                  {thread.replies.map((reply) => (
                    <CommentCard key={reply.id} comment={reply} onReply={startReply} isReply />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!allowComments ? (
        <p className="rounded-2xl border border-border bg-panel p-5 text-center text-sm text-text-muted">
          ارسال دیدگاه برای این مقاله بسته است.
        </p>
      ) : (
        <form
          ref={formRef}
          onSubmit={submit}
          className="flex flex-col gap-4 rounded-3xl border border-border bg-panel p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-text">
              {replyTo ? `پاسخ به ${replyTo.authorName}` : "دیدگاه خود را بنویسید"}
            </h3>
            {replyTo && (
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-accent"
              >
                <X className="h-3.5 w-3.5" />
                انصراف از پاسخ
              </button>
            )}
          </div>

          {done && (
            <p className="rounded-xl border border-accent/40 bg-accent-soft/60 p-3 text-sm text-text">
              دیدگاه شما ثبت شد و پس از تأیید نمایش داده می‌شود.
            </p>
          )}
          {error && (
            <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-muted">نام *</span>
              <input
                className={inputClass}
                placeholder="نام شما"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                maxLength={80}
                autoComplete="name"
                required
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-muted">ایمیل *</span>
              <input
                className={inputClass}
                placeholder="email@example.com"
                type="email"
                dir="ltr"
                value={form.authorEmail}
                onChange={(e) => setForm({ ...form, authorEmail: e.target.value })}
                autoComplete="email"
                required
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-muted">وب‌سایت (اختیاری)</span>
            <input
              className={inputClass}
              placeholder="https://"
              type="url"
              dir="ltr"
              value={form.authorWebsite}
              onChange={(e) => setForm({ ...form, authorWebsite: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-muted">متن دیدگاه *</span>
            <textarea
              className={`${inputClass} min-h-32 resize-y leading-8`}
              placeholder="نظر خود را بنویسید…"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              maxLength={4000}
              required
            />
          </label>

          {!replyTo && allowRatings && (
            <FormStars value={formRating} onChange={setFormRating} disabled={sending} />
          )}

          <CaptchaBox ref={captchaRef} provider={captcha.provider} siteKey={captcha.siteKey} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-text-muted">
              ایمیل شما منتشر نمی‌شود. دیدگاه‌ها پس از تأیید نمایش داده می‌شوند.
            </span>
            <button
              type="submit"
              disabled={sending}
              className="relative isolate overflow-hidden rounded-full bg-linear-to-b from-accent to-accent-hover px-6 py-2.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_28px_-10px_color-mix(in_srgb,var(--accent)_60%,transparent)] transition-all duration-300 after:absolute after:inset-0 after:-z-10 after:-translate-x-[150%] after:bg-linear-to-r after:from-transparent after:via-white/25 after:to-transparent after:transition-transform after:duration-700 after:ease-out hover:brightness-110 hover:after:translate-x-[150%] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "در حال ارسال…" : replyTo ? "ارسال پاسخ" : "ارسال دیدگاه"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
