"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

// Archive search. Submits to /blog?q=… (server reads searchParams).
export function SearchBar({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/blog?q=${encodeURIComponent(q)}` : "/blog");
  }

  return (
    <form onSubmit={submit} className="relative mx-auto w-full max-w-md">
      <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="جستجو در مقالات…"
        className="w-full rounded-full border border-border bg-panel py-3 ps-11 pe-4 text-sm text-text outline-none transition-colors focus:border-accent"
      />
    </form>
  );
}
