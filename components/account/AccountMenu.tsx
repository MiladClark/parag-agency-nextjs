"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { User, Shield, MessageSquare, LogOut } from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext";

// Header profile dropdown, ported from CoachOps' AccountMenu.
export function AccountMenu() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = profile?.first_name || user?.email?.split("@")[0] || "حساب";
  const initial = displayName.charAt(0).toUpperCase();

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.push("/");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-accent bg-panel text-xs font-bold text-text"
        aria-label="منوی کاربر"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-surface py-2 shadow-xl">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent bg-panel text-xs font-bold text-text">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0">
              <span className="block truncate font-medium text-text">{displayName}</span>
              <span className="block truncate text-xs text-text-muted">{user?.email}</span>
            </div>
          </div>

          <a href="/account" onClick={() => setOpen(false)}>
            <MenuItem icon={User} label="حساب کاربری" />
          </a>
          {isAdmin && (
            <a href="/admin" onClick={() => setOpen(false)}>
              <MenuItem icon={Shield} label="پنل ادمین" />
            </a>
          )}

          <div className="my-1 border-t border-border" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent("parag:open-chat"));
            }}
            className="w-full"
          >
            <MenuItem icon={MessageSquare} label="گفتگوی زنده" />
          </button>

          <div className="my-1 border-t border-border" />
          <button type="button" onClick={() => void handleSignOut()} className="w-full">
            <MenuItem icon={LogOut} label="خروج" />
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  disabled,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
}) {
  return (
    <span
      className={`flex w-full items-center gap-3 px-4 py-2 text-sm text-text-muted transition-colors ${
        disabled ? "opacity-50" : "hover:bg-panel hover:text-text"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}