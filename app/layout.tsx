import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { themeInitScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: {
    default: "پاراگ | آژانس دیجیتال مارکتینگ",
    template: "%s | پاراگ",
  },
  description: "آژانس دیجیتال مارکتینگ پاراگ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-mark.svg" />
        <meta name="theme-color" content="#0caf20" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
