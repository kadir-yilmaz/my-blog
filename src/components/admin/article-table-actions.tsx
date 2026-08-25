"use client";

import Link from "next/link";
import { useTransition } from "react";
import { updateArticle, deleteArticle } from "@/actions/admin.actions";
import { Pencil, Trash2, Globe, Archive } from "lucide-react";

interface ArticleTableActionsProps {
  articleId: string;
  status: "DRAFT" | "PUBLISHED" | string;
}

export function ArticleTableActions({ articleId, status }: ArticleTableActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggleStatus() {
    const nextStatus = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    startTransition(async () => {
      await updateArticle(articleId, { status: nextStatus });
    });
  }

  function handleDelete() {
    if (!confirm("Bu makaleyi silmek istediğinize emin misiniz?")) return;
    startTransition(async () => {
      await deleteArticle(articleId);
    });
  }

  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2 justify-end">
      {/* Yayınla / Taslağa Çek */}
      <button
        onClick={handleToggleStatus}
        disabled={isPending}
        title={status === "PUBLISHED" ? "Taslağa Çek" : "Yayınla"}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
          status === "PUBLISHED"
            ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 dark:bg-amber-500/20 dark:hover:bg-amber-500/30"
            : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30"
        } disabled:opacity-50`}
      >
        {status === "PUBLISHED" ? (
          <>
            <Archive className="w-3.5 h-3.5" />
            <span>Taslak</span>
          </>
        ) : (
          <>
            <Globe className="w-3.5 h-3.5" />
            <span>Yayınla</span>
          </>
        )}
      </button>

      {/* Düzenle */}
      <Link
        href={`/admin/articles/${articleId}/edit`}
        title="Düzenle"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:text-indigo-400 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 transition-all duration-200"
      >
        <Pencil className="w-3.5 h-3.5" />
        <span>Düzenle</span>
      </Link>

      {/* Sil */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        title="Sil"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white dark:text-red-400 dark:bg-red-500/20 dark:hover:bg-red-600 dark:hover:text-white transition-all duration-200 disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Sil</span>
      </button>
    </div>
  );
}
