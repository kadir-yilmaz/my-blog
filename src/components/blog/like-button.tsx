// ==========================================
// 🎓 Like Button Component (Client Component)
// ==========================================
"use client";

import { useState, useTransition } from "react";
import { toggleLikeArticle } from "@/actions/article.actions";

interface LikeButtonProps {
  articleId: string;
  initialLikes: number;
}

export function LikeButton({ articleId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    startTransition(async () => {
      const res = await toggleLikeArticle(articleId);
      if (res.success) {
        setIsLiked(res.liked || false);
        setLikes((prev) => (res.liked ? prev + 1 : Math.max(0, prev - 1)));
      } else {
        alert(res.error || "Beğenmek için giriş yapmalısınız.");
      }
    });
  }

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
        isLiked
          ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
          : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <span>{isLiked ? "❤️" : "🤍"}</span>
      <span>{likes} Beğeni</span>
    </button>
  );
}
