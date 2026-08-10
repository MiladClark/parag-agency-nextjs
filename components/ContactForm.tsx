"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "./ui/Button";
import { submitContact } from "../lib/siteApi";

type Field = "name" | "email" | "phone" | "message";

const labels: Record<Field, string> = {
  name: "نام و نام خانوادگی",
  email: "ایمیل",
  phone: "شماره تماس",
  message: "پیام شما",
};

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 280, damping: 22 } as const;

export function ContactForm() {
  const reduce = useReducedMotion();
  const [values, setValues] = useState<Record<Field, string>>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function update(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) next.name = "نام خود را وارد کنید.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "ایمیل معتبر وارد کنید.";
    if (!values.message.trim()) next.message = "متن پیام را وارد کنید.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitContact(values);
      setSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "ارسال پیام ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div
          key="success"
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={SPRING}
          className="relative flex min-h-[22rem] flex-col items-center justify-center gap-4 overflow-hidden rounded-[1.75rem] border border-accent/30 bg-accent-soft/40 px-6 py-12 text-center"
        >
          <div
            className="pointer-events-none absolute -top-16 start-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
            aria-hidden
          />
          <motion.span
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...SPRING, delay: 0.05 }}
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-b from-accent to-accent-hover text-white shadow-[0_12px_28px_-10px_color-mix(in_srgb,var(--accent)_70%,transparent)]"
          >
            <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
          </motion.span>
          <h3 className="relative text-xl font-black text-text">پیام شما ثبت شد</h3>
          <p className="relative max-w-sm text-sm leading-7 text-text-muted">
            به‌زودی همکاران ما با شما تماس می‌گیرند. جلسه اول مشاوره رایگان است.
          </p>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setValues({ name: "", email: "", phone: "", message: "" });
            }}
            className="relative mt-2 text-sm font-bold text-accent transition-colors hover:text-accent-hover"
          >
            ارسال پیام دیگر
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={onSubmit}
          noValidate
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col gap-5"
        >
          <div>
            <h2 className="text-xl font-black text-text sm:text-2xl">پیام بفرستید</h2>
            <p className="mt-1.5 text-sm leading-7 text-text-muted">
              جزئیات پروژه را بنویسید؛ ما مسیر بعدی را با هم مشخص می‌کنیم.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FloatingField
              field="name"
              value={values.name}
              error={errors.name}
              onChange={update}
              autoComplete="name"
              required
            />
            <FloatingField
              field="email"
              value={values.email}
              error={errors.email}
              onChange={update}
              type="email"
              autoComplete="email"
              dir="ltr"
              required
            />
          </div>
          <FloatingField
            field="phone"
            value={values.phone}
            error={errors.phone}
            onChange={update}
            type="tel"
            autoComplete="tel"
            dir="ltr"
          />
          <FloatingField
            field="message"
            value={values.message}
            error={errors.message}
            onChange={update}
            multiline
            required
          />

          {serverError && (
            <p
              role="alert"
              className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {serverError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs leading-6 text-text-muted">
              اطلاعات شما محرمانه می‌ماند و فقط برای پیگیری همین درخواست استفاده می‌شود.
            </p>
            <Button type="submit" size="lg" disabled={submitting} className="shrink-0">
              {submitting ? "در حال ارسال…" : "ارسال پیام"}
              <Send className="h-4 w-4" strokeWidth={2} />
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function FloatingField({
  field,
  value,
  error,
  onChange,
  type = "text",
  autoComplete,
  dir,
  multiline = false,
  required = false,
}: {
  field: Field;
  value: string;
  error?: string;
  onChange: (f: Field, v: string) => void;
  type?: string;
  autoComplete?: string;
  dir?: "ltr" | "rtl";
  multiline?: boolean;
  required?: boolean;
}) {
  const uid = useId();
  const id = `${field}-${uid}`;
  const [focused, setFocused] = useState(false);
  const floated = focused || value.trim().length > 0;
  const hasError = !!error;

  // Parent form card uses solid bg-panel; label mask must match it exactly
  // so the border looks cut, not patched with a different color.
  const shell = [
    "relative rounded-2xl border bg-transparent transition-all duration-300",
    hasError
      ? "border-red-500/55"
      : focused
        ? "border-accent"
        : "border-border/80 hover:border-border",
  ].join(" ");

  const labelClass = [
    "pointer-events-none absolute start-3 z-10 origin-right px-1.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
    floated
      ? [
          "-top-2 translate-y-0 scale-[0.78] bg-panel leading-none",
          hasError ? "text-red-400" : focused ? "text-accent" : "text-text-muted",
        ].join(" ")
      : multiline
        ? "top-5 translate-y-0 scale-100 text-sm text-text-muted"
        : "top-1/2 -translate-y-1/2 scale-100 text-sm text-text-muted",
  ].join(" ");

  const control =
    "w-full bg-transparent text-sm text-text outline-none " +
    (multiline ? "min-h-[8.5rem] resize-none px-4 pb-3 pt-5 leading-7" : "h-14 px-4 pt-1");

  return (
    <div className="flex flex-col gap-1.5">
      <div className={shell}>
        <label htmlFor={id} className={labelClass}>
          {labels[field]}
          {required && <span className="text-accent">{" *"}</span>}
        </label>
        {multiline ? (
          <textarea
            id={id}
            rows={5}
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
            className={control}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            autoComplete={autoComplete}
            dir={dir}
            onChange={(e) => onChange(field, e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
            className={control}
          />
        )}
      </div>
      {hasError && (
        <span id={`${id}-error`} className="px-1 text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
