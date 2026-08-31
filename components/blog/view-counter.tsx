"use client";

import { useEffect } from "react";
import { incrementArticleViews } from "@/actions/article.actions";

export function ViewCounter({ articleId }: { articleId: string }) {
  useEffect(() => {
    const storageKey = `viewed_article_${articleId}`;
    const hasViewed = localStorage.getItem(storageKey);

    if (!hasViewed) {
      incrementArticleViews(articleId).catch(console.error);
      // Makaleyi okundu olarak işaretle (Kullanıcı tarayıcısında saklanır)
      localStorage.setItem(storageKey, "true");
    }
  }, [articleId]);

  return null;
}
