"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 pt-6 border-t border-border/40">
      {/* Önceki Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-accent transition-colors"
        >
          ← Önceki
        </Link>
      ) : (
        <span className="px-3.5 py-1.5 rounded-lg border border-border/40 bg-muted/30 text-xs font-semibold text-muted-foreground/40 cursor-not-allowed">
          ← Önceki
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <Link
              key={p}
              href={createPageUrl(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? "bg-red-600 text-white shadow-sm shadow-red-600/20"
                  : "bg-card border border-border text-foreground hover:bg-accent"
              }`}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {/* Sonraki Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-accent transition-colors"
        >
          Sonraki →
        </Link>
      ) : (
        <span className="px-3.5 py-1.5 rounded-lg border border-border/40 bg-muted/30 text-xs font-semibold text-muted-foreground/40 cursor-not-allowed">
          Sonraki →
        </span>
      )}
    </nav>
  );
}
