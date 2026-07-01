"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Inbox,
  ExternalLink,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext";
import { Loader } from "../Loader";
import { DashboardSection, UsersSection, CommunicationsSection, ContactSection } from "./sections";

const SECTIONS: { id: string; label: string; icon: LucideIcon; Comp: () => React.JSX.Element }[] = [
  { id: "dashboard", label: "داشبورد", icon: LayoutDashboard, Comp: DashboardSection },
  { id: "users", label: "کاربران", icon: Users, Comp: UsersSection },
  { id: "communications", label: "گفتگوها", icon: MessageSquare, Comp: CommunicationsSection },
  { id: "contact", label: "پیام‌های تماس", icon: Inbox, Comp: ContactSection },
];

export function AdminShell() {
  const { isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    if (!loading && !isAdmin) router.push("/login");
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) return <Loader label="در حال بررسی دسترسی…" />;

  const current = SECTIONS.find((s) => s.id === active)!;
  const Section = current.Comp;

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)]">
      <aside className="flex w-56 shrink-0 flex-col border-e border-border bg-surface">
        <div className="border-b border-border px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">پنل مدیریت پاراگ</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                active === id ? "bg-accent/15 text-accent" : "text-text-muted hover:bg-panel hover:text-text"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-right">{label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <a
            href="/"
            className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-panel hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <ExternalLink className="h-4 w-4" /> بازگشت به سایت
          </a>
          <button
            type="button"
            onClick={() => void signOut().then(() => router.push("/"))}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-panel hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <LogOut className="h-4 w-4" /> خروج
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-6 sm:p-8">
        <h1 className="mb-6 text-xl font-bold text-text">{current.label}</h1>
        <Section />
      </main>
    </div>
  );
}