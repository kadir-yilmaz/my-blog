"use client";

// ==========================================
// 🎓 Responsive Category Sidebar & Mobile Left Drawer
// ==========================================
// Masaüstünde sabit sol sidebar, mobilde ise soldan %80 genişlikle açılan
// animasyonlu ve buzlu cam efektli kategori çekmecesi sunar.

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FolderTree, X, SlidersHorizontal } from "lucide-react";
import { CategoryTree } from "./category-tree";

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
  _count?: { articles: number };
}

interface CategorySidebarProps {
  categories: CategoryNode[];
  activeSlug?: string;
  totalArticlesCount?: number;
}

export function CategorySidebar({
  categories,
  activeSlug,
  totalArticlesCount,
}: CategorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Kategori seçildiğinde veya rota değiştiğinde çekmeceyi otomatik kapat
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // ESC tuşu ve arka plan kaydırma kilidi
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/* 📱 1. Mobil Buton (Masaüstünde Gizli) */}
      <div className="md:hidden w-full">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/80 bg-card/90 hover:bg-accent text-foreground font-semibold shadow-2xs transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <FolderTree className="w-4 h-4 text-red-600" />
            <span>Kategoriler</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtrele</span>
          </div>
        </button>
      </div>

      {/* 📱 2. Mobil Soldan Açılan Çekmece (%80 Genişlik) */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Arka Plan Karartma / Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          />

          {/* Soldan Açılan Panel (%80 En) */}
          <div className="fixed top-0 bottom-0 left-0 w-[82%] max-w-sm bg-background/95 dark:bg-zinc-950/95 backdrop-blur-xl border-r border-border shadow-2xl p-5 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              {/* Çekmece Başlığı & Kapat Butonu */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-lg text-foreground">Kategoriler</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Kapat"
                  className="p-2 rounded-full bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Kategori Ağacı */}
              <div className="pt-1">
                <CategoryTree
                  categories={categories}
                  activeSlug={activeSlug}
                  totalArticlesCount={totalArticlesCount}
                  hideTitleHeader={true}
                />
              </div>
            </div>

            {/* Alt Kısım Bilgilendirme */}
            <div className="pt-4 mt-6 border-t border-border/50 text-xs text-muted-foreground text-center">
              Filtrelemek istediğiniz kategoriye tıklayın
            </div>
          </div>
        </div>
      )}

      {/* 💻 3. Masaüstü Sabit Sidebar (Mobilde Gizli) */}
      <div className="hidden md:block">
        <CategoryTree
          categories={categories}
          activeSlug={activeSlug}
          totalArticlesCount={totalArticlesCount}
        />
      </div>
    </>
  );
}
