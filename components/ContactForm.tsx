"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Icon } from "./ui/Icon";
import { submitContact } from "../lib/siteApi";

type Field = "name" | "email" | "phone" | "message";

const labels: Record<Field, string> = {
  name: "نام و نام خانوادگی",
  email: "ایمیل",
  phone: "شماره تماس",
  message: "پیام شما",
};

// Phase 1: client-side validation only. Submission is wired to a backend later.
export function ContactForm() {
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

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-accent/30 bg-accent-soft p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-white">
          <Icon name="check" />
        </span>
        <h3 className="text-xl font-bold text-text">پیام شما ثبت شد</h3>
        <p className="text-sm text-text-muted">به‌زودی همکاران ما با شما تماس می‌گیرند.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldInput field="name" value={values.name} error={errors.name} onChange={update} />
        <FieldInput field="email" value={values.email} error={errors.email} onChange={update} type="email" />
      </div>
      <FieldInput field="phone" value={values.phone} error={errors.phone} onChange={update} type="tel" />
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-medium text-text">
          {labels.message}
        </label>
        <textarea
          id="message"
          rows={5}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          className="resize-none rounded-lg border border-border bg-panel px-4 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent"
          placeholder="کمی دربارهٔ پروژه‌تان بنویسید…"
        />
        {errors.message && <span className="text-xs text-red-500">{errors.message}</span>}
      </div>
      {serverError && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </p>
      )}
      <Button type="submit" size="lg" className="self-start" disabled={submitting}>
        {submitting ? "در حال ارسال…" : "ارسال پیام"}
        <Icon name="send" />
      </Button>
    </form>
  );
}

function FieldInput({
  field,
  value,
  error,
  onChange,
  type = "text",
}: {
  field: Field;
  value: string;
  error?: string;
  onChange: (f: Field, v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={field} className="text-sm font-medium text-text">
        {labels[field]}
      </label>
      <input
        id={field}
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="rounded-lg border border-border bg-panel px-4 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent"
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}