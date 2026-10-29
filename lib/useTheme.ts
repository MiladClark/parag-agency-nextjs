"use client";

import { useSyncExternalStore } from "react";
import { applyTheme, setStoredTheme, DEFAULT_THEME, type ThemeId } from "./theme";

function snapshot(): ThemeId {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}
function subscribe(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const serverSnapshot = () => DEFAULT_THEME;

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const toggle = () => {
    const next = snapshot() === "dark" ? "light" : "dark";
    setStoredTheme(next);
    applyTheme(next);
  };
  return { theme, toggle };
}
