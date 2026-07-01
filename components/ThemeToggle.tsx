"use client";

import { useEffect, useState } from "react";
import { applyTheme, getStoredTheme, setStoredTheme, type ThemeId } from "../lib/theme";
import { Icon } from "./ui/Icon";

export function ThemeToggle() {
  // `mounted` avoids a hydration mismatch: the server can't know the stored theme.
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeId>("dark");

  useEffect(() => {
    setTheme(getStoredTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: ThemeId = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    setStoredTheme(next);
  }

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "روشن کردن تم" : "تاریک کردن تم"}
      title={isDark ? "تم روشن" : "تم تاریک"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-panel text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
    >
      <Icon
        name={mounted && !isDark ? "moon" : "sun"}
        className="text-lg"
      />
    </button>
  );
}