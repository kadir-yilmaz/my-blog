import Link from "next/link";

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
  _count?: { articles: number };
}

interface CategoryTreeProps {
  categories: CategoryNode[];
  activeSlug?: string;
  totalArticlesCount?: number;
  hideTitleHeader?: boolean;
}

export function CategoryTree({
  categories,
  activeSlug,
  totalArticlesCount,
  hideTitleHeader = false,
}: CategoryTreeProps) {
  const isAllActive = !activeSlug;

  const renderCategoryNode = (cat: CategoryNode, depth: number = 0) => {
    const isActive = activeSlug === cat.slug;
    const count = cat._count?.articles ?? 0;
    const hasChildren = cat.children && cat.children.length > 0;

    return (
      <li key={cat.id} className="space-y-1">
        <Link
          href={`/blog/category/${cat.slug}`}
          className={`flex items-center justify-between rounded-lg transition-all ${
            depth === 0 ? "px-3 py-2 text-sm" : "px-2.5 py-1.5 text-xs"
          } ${
            isActive
              ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/20"
              : depth === 0
              ? "hover:bg-accent hover:text-accent-foreground text-foreground/90 font-semibold"
              : "hover:bg-accent hover:text-accent-foreground text-muted-foreground font-medium"
          }`}
        >
          <span className="truncate pr-2">{cat.name}</span>
          <span
            className={`text-xs shrink-0 font-bold ${
              isActive
                ? "text-white/90"
                : "text-muted-foreground/80 font-medium"
            }`}
          >
            ({count})
          </span>
        </Link>

        {/* Recursive Children (Derin Hiyerarşik Alt Kategoriler) */}
        {hasChildren && (
          <ul className="pl-3 space-y-1 border-l-2 border-border/40 ml-3.5 my-1">
            {cat.children!.map((child) => renderCategoryNode(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div
      className={
        hideTitleHeader
          ? "space-y-2"
          : "rounded-xl border border-border/80 bg-card p-5 space-y-3 shadow-sm"
      }
    >
      {!hideTitleHeader && (
        <h3 className="font-bold text-lg border-b border-border/60 pb-2">Kategoriler</h3>
      )}
      <ul className="space-y-1.5 text-sm">
        {/* Default 'Tüm Makaleler' Option */}
        <li>
          <Link
            href="/blog"
            className={`flex items-center justify-between rounded-lg px-3 py-2 transition-all ${
              isAllActive
                ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/20"
                : "hover:bg-accent hover:text-accent-foreground text-muted-foreground font-semibold"
            }`}
          >
            <span>Tüm Makaleler</span>
            <span
              className={`text-xs font-bold ${
                isAllActive ? "text-white/90" : "text-muted-foreground/80 font-medium"
              }`}
            >
              ({totalArticlesCount ?? categories.reduce((sum, c) => sum + (c._count?.articles || 0), 0)})
            </span>
          </Link>
        </li>

        {categories.map((cat) => renderCategoryNode(cat, 0))}
      </ul>
    </div>
  );
}
