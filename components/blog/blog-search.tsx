// ==========================================
// 🎓 Blog Search Component (Client Component)
// ==========================================
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function BlogSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/blog?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/blog");
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Makalelerde ara... (ör. Next.js, Docker)"
        className="w-full rounded-xl border border-input bg-background py-2.5 pl-4 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="submit"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm font-semibold"
      >
        🔍
      </button>
    </form>
  );
}
