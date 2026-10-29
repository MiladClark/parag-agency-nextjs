"use client";

import { useTheme } from "@/lib/useTheme";
import { Icon } from "./ui/Icon";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "روشن کردن تم" : "تاریک کردن تم"}
      title={isDark ? "تم روشن" : "تم تاریک"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-transparent text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
    >
      <Icon
        name={!isDark ? "moon" : "sun"}
        className="text-lg"
      />
    </button>
  );
}