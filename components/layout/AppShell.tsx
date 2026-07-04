"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SupportChatWidget } from "@/features/support/SupportChatWidget";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isAuth) return <div className="text-text">{children}</div>;

  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col text-text">
      <Header />
      <main id="page-content" className={`flex-1 ${isHome ? "" : "pt-[4.5rem]"}`}>
        {children}
      </main>
      <Footer />
      <SupportChatWidget />
    </div>
  );
}
