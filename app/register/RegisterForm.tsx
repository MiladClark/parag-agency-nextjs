"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { GoogleButton } from "@/components/auth/OAuthButtons";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuth } from "@/features/auth/AuthContext";
import { getOAuthUrl } from "@/lib/api";

export default function RegisterForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
      setError("ایمیل یا رمز عبور نامعتبر است.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("رمزهای عبور یکسان نیستند.");
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email.trim(), password, passwordConfirm);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت‌نام ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="ساخت حساب کاربری"
      subtitle="در چند ثانیه حساب خود را بسازید."
      footer={
        <>
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <a href="/login" className="font-medium text-accent hover:underline">
            وارد شوید
          </a>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <GoogleButton label="ثبت‌نام با گوگل" onClick={() => (window.location.href = getOAuthUrl("google"))} />

        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="h-px flex-1 bg-border" />
          یا با ایمیل
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-sm text-text-muted">ایمیل</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-muted">رمز عبور</label>
            <PasswordInput
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-muted">تکرار رمز عبور</label>
            <PasswordInput
              required
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "در حال ساخت…" : "ایجاد حساب"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
