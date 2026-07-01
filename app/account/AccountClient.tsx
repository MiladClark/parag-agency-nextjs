"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, User, Lock, ShieldCheck, MessageSquare, Camera, X, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { changePasswordWithApi, deleteAvatarWithApi, updateProfileWithApi, uploadAvatarWithApi } from "@/lib/authApi";
import { Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Field";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Loader } from "@/components/Loader";

const ROLE_LABELS: Record<string, string> = {
  user: "کاربر",
  admin: "ادمین",
  super_admin: "سوپرادمین",
};

export default function AccountClient() {
  const { user, profile, loading, isAuthenticated, isAdmin, refreshProfile } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
    }
  }, [profile]);

  if (loading || !isAuthenticated) return <Loader label="در حال بارگذاری…" />;

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user?.email?.split("@")[0] || "کاربر";
  const initial = displayName.charAt(0).toUpperCase();

  async function handleAvatarFile(file: File | undefined) {
    if (!file) return;
    setAvatarBusy(true);
    try {
      await uploadAvatarWithApi(file);
      await refreshProfile();
    } finally {
      setAvatarBusy(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function removeAvatar() {
    setAvatarBusy(true);
    try {
      await deleteAvatarWithApi();
      await refreshProfile();
    } finally {
      setAvatarBusy(false);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    setSaving(true);
    try {
      await updateProfileWithApi({ first_name: firstName || null, last_name: lastName || null });
      await refreshProfile();
      setNotice("پروفایل ذخیره شد.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container className="flex flex-col gap-8 py-12 sm:py-16">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-depth">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(120% 140% at 15% -10%, var(--accent-soft) 0%, transparent 55%), radial-gradient(80% 120% at 100% 0%, var(--accent-soft) 0%, transparent 45%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col items-center gap-5 px-6 py-10 text-center sm:flex-row sm:items-center sm:gap-6 sm:px-10 sm:text-start">
          <div className="group relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleAvatarFile(e.target.files?.[0])}
            />
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-accent bg-gradient-to-br from-accent to-accent-hover text-2xl font-extrabold text-white shadow-lg shadow-accent/30 sm:text-3xl">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarBusy}
              aria-label="تغییر تصویر پروفایل"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 focus:outline-none disabled:opacity-100"
            >
              {avatarBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </button>

            {profile?.avatar_url && !avatarBusy && (
              <button
                type="button"
                onClick={removeAvatar}
                aria-label="حذف تصویر پروفایل"
                className="absolute -end-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-red-500 text-white shadow-sm transition-transform hover:scale-110"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-extrabold text-text sm:text-3xl">{displayName}</h1>
              {profile?.role && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                    isAdmin ? "bg-accent/15 text-accent" : "bg-panel text-text-muted"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {ROLE_LABELS[profile.role] ?? profile.role}
                </span>
              )}
            </div>
            <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-text-muted sm:justify-start">
              <Mail className="h-4 w-4" />
              {user?.email}
            </p>
          </div>
          {isAdmin && (
            <a href="/admin" className="shrink-0">
              <Button variant="secondary" size="sm">
                <ShieldCheck className="h-4 w-4" />
                پنل ادمین
              </Button>
            </a>
          )}
        </div>
      </div>

      {notice && (
        <p className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-text">{notice}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCard icon={User} title="اطلاعات شخصی">
          <form onSubmit={saveProfile} className="flex flex-col gap-4">
            <div>
              <FieldLabel>ایمیل</FieldLabel>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>نام</FieldLabel>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <FieldLabel>نام خانوادگی</FieldLabel>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={saving} className="self-start">
              {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
            </Button>
          </form>
        </SettingsCard>

        {profile?.auth_provider === "email" ? (
          <SettingsCard icon={Lock} title="تغییر رمز عبور">
            <ChangePassword />
          </SettingsCard>
        ) : (
          <SettingsCard icon={MessageSquare} title="پشتیبانی">
            <p className="text-sm leading-relaxed text-text-muted">
              برای هرگونه سؤال یا مشکل، از طریق آیکون گفتگوی زنده در گوشهٔ صفحه با تیم پشتیبانی پاراگ در ارتباط
              باشید.
            </p>
          </SettingsCard>
        )}
      </div>
    </Container>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-border bg-panel p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h2 className="text-base font-bold text-text">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    try {
      await changePasswordWithApi(current, next, confirm);
      setMsg({ ok: true, text: "رمز عبور تغییر کرد." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "خطا" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {msg && (
        <p
          className={`rounded-xl px-4 py-2.5 text-sm ${
            msg.ok ? "bg-accent-soft text-text" : "border border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {msg.text}
        </p>
      )}
      <div>
        <FieldLabel>رمز فعلی</FieldLabel>
        <PasswordInput value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>
      <div>
        <FieldLabel>رمز جدید</FieldLabel>
        <PasswordInput value={next} onChange={(e) => setNext(e.target.value)} />
      </div>
      <div>
        <FieldLabel>تکرار رمز جدید</FieldLabel>
        <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "در حال ثبت…" : "تغییر رمز"}
      </Button>
    </form>
  );
}
