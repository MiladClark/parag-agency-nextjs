"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, MessageSquare, ShieldCheck, X } from "lucide-react";
import { CURRENT_TENANT } from "../../content/tenant";
import { formatJalaliDate, toPersianDigits } from "../../lib/format";
import { CaptchaBox, type CaptchaHandle, type CaptchaProvider } from "./CaptchaBox";

// Comments for one article, synced with the Payload CMS.
//
// Reads and writes go to the CMS's public site endpoints, so a submission lands
// in the panel's «دیدگاه‌ها» queue as `pending` and only appears here once a
// moderator approves it. Nothing is stored on this site.
//
// Threading is one level deep on purpose: the API only accepts a `parent` that
// is itself an approved top-level-or-not comment on the same post, and a flat
// reply list stays readable on a phone. A reply to a reply is attached to the
// same thread rather than nesting further.

const PAYLOAD = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3004";

type ApiComment = {
  id: number;
  authorName: string;
  authorWebsite: string | null;
  body: string;
  adminReply: string | null;
  parent: number | null;
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
  "w-full rounded-xl border border-border bg-panel px-4 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/30";

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
      className={`flex gap-3 rounded-2xl border border-border bg-panel p-4 sm:p-5 ${
        isReply ? "bg-surface/60" : ""
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

export function PostComments({ postSlug }: { postSlug: string }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [total, setTotal] = useState(0);
  const [allowComments, setAllowComments] = useState(true);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
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

  // ── Load the approved comments ────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `${PAYLOAD}/api/site/comments?post=${encodeURIComponent(postSlug)}&tenant=${encodeURIComponent(CURRENT_TENANT)}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { allowComments: boolean; total: number; comments: ApiComment[] };
      setAllowComments(data.allowComments !== false);
      setTotal(data.total ?? data.comments.length);

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
        // Walk up to the thread root so a reply-to-a-reply still lands somewhere.
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

  // ── Whether this site requires a captcha on the form ──────────────────────
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
        // No captcha configured, or the CMS is unreachable — the server is the
        // authority either way and will reject a missing token if it needs one.
      }
    })();
    return () => controller.abort();
  }, []);

  const startReply = useCallback((comment: ApiComment) => {
    setReplyTo(comment);
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
      <h2 className="flex items-center gap-2 text-xl font-bold text-text sm:text-2xl">
        <MessageSquare className="h-5 w-5 text-accent" />
        {heading}
      </h2>

      {/* ── List ── */}
      {loading ? (
        <p className="text-sm text-text-muted">در حال بارگذاری دیدگاه‌ها…</p>
      ) : threads.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
          هنوز دیدگاهی ثبت نشده. اولین نفر باشید.
        </p>
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

      {/* ── Form ── */}
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
            <input
              className={inputClass}
              placeholder="نام شما *"
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
              maxLength={80}
              autoComplete="name"
            />
            <input
              className={inputClass}
              placeholder="ایمیل *"
              type="email"
              dir="ltr"
              value={form.authorEmail}
              onChange={(e) => setForm({ ...form, authorEmail: e.target.value })}
              autoComplete="email"
            />
          </div>

          <input
            className={inputClass}
            placeholder="وب‌سایت (اختیاری)"
            type="url"
            dir="ltr"
            value={form.authorWebsite}
            onChange={(e) => setForm({ ...form, authorWebsite: e.target.value })}
          />

          <textarea
            className={`${inputClass} min-h-32 resize-y leading-8`}
            placeholder="متن دیدگاه *"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            maxLength={4000}
          />

          <CaptchaBox ref={captchaRef} provider={captcha.provider} siteKey={captcha.siteKey} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-text-muted">
              ایمیل شما منتشر نمی‌شود. دیدگاه‌ها پس از تأیید نمایش داده می‌شوند.
            </span>
            <button
              type="submit"
              disabled={sending}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "در حال ارسال…" : replyTo ? "ارسال پاسخ" : "ارسال دیدگاه"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
