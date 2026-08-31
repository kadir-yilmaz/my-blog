"use client";

// ==========================================
// 🎓 Gençay Yıldız Usulü Dropdown Kategori Barı
// ==========================================
// Kategori barında ana kategoriler yatay dizilir.
// Alt kategorisi olanların yanında küçük ok (▼) çıkar ve
// üzerine gelindiğinde/tıklandığında açılır dropdown menü açılır.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: CategoryItem[];
  _count?: { articles: number };
}

interface CategoryNavBarProps {
  categories: CategoryItem[];
  activeSlug?: string;
}

export function CategoryNavBar({ categories, activeSlug }: CategoryNavBarProps) {
  const pathname = usePathname();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Filter root categories (or use provided if already root)
  const rootCategories = categories.filter((cat) => !cat.parentId);

  const isAllActive = pathname === "/blog" && !activeSlug;

  return (
    <div className="w-full bg-slate-800 dark:bg-slate-900 text-slate-100 rounded-xl shadow-md p-2.5 sm:p-3 overflow-x-auto border border-slate-700/60">
      <nav className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs sm:text-sm font-medium">
        {/* Tümü Button */}
        <Link
          href="/blog"
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            isAllActive
              ? "bg-red-600 text-white font-semibold shadow-sm"
              : "hover:bg-slate-700 text-slate-200"
          }`}
        >
          Tüm Yazılar
        </Link>

        {rootCategories.map((category) => {
          const hasChildren = category.children && category.children.length > 0;
          const isActive =
            activeSlug === category.slug ||
            category.children?.some((child) => child.slug === activeSlug);
          const isOpen = openDropdownId === category.id;

          return (
            <div
              key={category.id}
              className="relative group"
              onMouseEnter={() => hasChildren && setOpenDropdownId(category.id)}
              onMouseLeave={() => hasChildren && setOpenDropdownId(null)}
            >
              <div className="flex items-center">
                <Link
                  href={`/blog/category/${category.slug}`}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap ${
                    isActive
                      ? "bg-slate-700 text-white font-bold border-b-2 border-red-500"
                      : "hover:bg-slate-700/80 text-slate-200"
                  }`}
                >
                  <span>{category.name}</span>
                  {category._count?.articles !== undefined && category._count.articles > 0 && (
                    <span className="text-[10px] bg-slate-700/90 text-slate-300 px-1.5 py-0.2 rounded-full ml-1">
                      {category._count.articles}
                    </span>
                  )}
                  {hasChildren && (
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 ${
                        isOpen ? "rotate-180 text-white" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </Link>
              </div>

              {/* Dropdown Menu */}
              {hasChildren && (
                <div
                  className={`absolute left-0 top-full mt-1 w-48 sm:w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 z-50 transition-all duration-150 ${
                    isOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-1 pointer-events-none"
                  }`}
                >
                  <div className="px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-800 mb-1">
                    {category.name} Alt Başlıkları
                  </div>
                  {category.children!.map((child) => {
                    const isChildActive = activeSlug === child.slug;
                    return (
                      <Link
                        key={child.id}
                        href={`/blog/category/${child.slug}`}
                        className={`flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm transition-colors ${
                          isChildActive
                            ? "bg-red-600/90 text-white font-semibold"
                            : "hover:bg-slate-800 text-slate-300 hover:text-white"
                        }`}
                        onClick={() => setOpenDropdownId(null)}
                      >
                        <span>{child.name}</span>
                        {child._count?.articles !== undefined && (
                          <span className="text-[11px] text-slate-400">
                            ({child._count.articles})
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
