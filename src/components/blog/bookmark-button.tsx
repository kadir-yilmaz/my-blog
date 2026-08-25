// ==========================================
// 🎓 Bookmark Button Component (Client Component)
// ==========================================
"use client";

import { useState, useTransition } from "react";
import { toggleBookmarkArticle } from "@/actions/article.actions";

interface BookmarkButtonProps {
  articleId: string;
}

export function BookmarkButton({ articleId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleBookmark() {
    startTransition(async () => {
      const res = await toggleBookmarkArticle(articleId);
      if (res.success) {
        setIsBookmarked(res.bookmarked || false);
      } else {
        alert(res.error || "Kaydetmek için giriş yapmalısınız.");
      }
    });
  }

  return (
    <button
      onClick={handleBookmark}
      disabled={isPending}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
        isBookmarked
          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <span>{isBookmarked ? "🔖 Kaydedildi" : "📑 Kaydet"}</span>
    </button>
  );
}
