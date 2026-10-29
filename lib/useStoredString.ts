"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

const eventName = "parag-storage-change";
function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(eventName, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(eventName, notify);
  };
}

/** Persisted strings with a stable SSR snapshot and an in-memory private-mode fallback. */
export function useStoredString(key: string, initial: string) {
  const [memory, setMemory] = useState({ key, value: initial });
  const read = useCallback(() => {
    try { return localStorage.getItem(key) ?? (memory.key === key ? memory.value : initial); }
    catch { return memory.key === key ? memory.value : initial; }
  }, [key, initial, memory]);
  const server = useCallback(() => initial, [initial]);
  const value = useSyncExternalStore(subscribe, read, server);
  const setValue = useCallback((next: string) => {
    setMemory({ key, value: next });
    try { localStorage.setItem(key, next); } catch { /* Private mode keeps the local value. */ }
    window.dispatchEvent(new Event(eventName));
  }, [key]);
  return [value, setValue] as const;
}
