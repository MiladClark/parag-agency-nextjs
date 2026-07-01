// Theme handling for Parag Agency.
// Two themes built around the brand green: "dark" (default) and "light".
// The theme is applied to <html data-theme> before first paint via an inline
// script (see themeInitScript) to avoid a flash of the wrong theme on SSR.

export type ThemeId = "dark" | "light";

export const THEME_IDS: ThemeId[] = ["dark", "light"];
export const DEFAULT_THEME: ThemeId = "dark";
export const THEME_STORAGE_KEY = "parag-theme";

export function applyTheme(theme: ThemeId): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function getStoredTheme(): ThemeId {
  if (typeof localStorage === "undefined") return DEFAULT_THEME;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

export function setStoredTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

// Runs synchronously in <head> before paint. Keep it tiny and dependency-free.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="dark"&&t!=="light"){t="${DEFAULT_THEME}";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","${DEFAULT_THEME}");}})();`;
