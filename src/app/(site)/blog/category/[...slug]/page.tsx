// ==========================================
// 🎓 Kategori Filtreli Blog Sayfası (Hiyerarşik [...slug])
// ==========================================
// Route: /blog/category/[...slug] (ör. /blog/category/dotnet/aspnet-core)

import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/blog/article-card";
import { CategoryTree } from "@/components/blog/category-tree";
import { BlogSearch } from "@/components/blog/blog-search";
import { Pagination } from "@/components/blog/pagination";
import { getArticles } from "@/actions/article.actions";
import { getCategoryTree } from "@/actions/category.actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// Helper to resolve full category hierarchy breadcrumbs (Any Depth)
function buildBreadcrumbs(categories: any[], slugArray: string[]) {
  const crumbs: Array<{ name: string; href: string }> = [
    { name: "Blog", href: "/blog" },
  ];

  if (!slugArray || slugArray.length === 0) return crumbs;

  const currentSlug = slugArray[slugArray.length - 1];

  function findPath(nodes: any[], targetSlug: string, currentPath: any[] = []): any[] | null {
    for (const node of nodes) {
      const nextPath = [...currentPath, node];
      if (node.slug === targetSlug) {
        return nextPath;
      }
      if (node.children && node.children.length > 0) {
        const found = findPath(node.children, targetSlug, nextPath);
        if (found) return found;
      }
    }
    return null;
  }

  const path = findPath(categories, currentSlug);
  if (path && path.length > 0) {
    for (const node of path) {
      crumbs.push({
        name: node.name,
        href: `/blog/category/${node.slug}`,
      });
    }
    return crumbs;
  }

  // Fallback if not found in tree
  const formatted = currentSlug.replace(/-/g, " ").toUpperCase();
  crumbs.push({ name: formatted, href: `/blog/category/${currentSlug}` });
  return crumbs;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const currentSlug = slug[slug.length - 1];
  const name = currentSlug.toUpperCase();
  return {
    title: `${name} Makaleleri`,
    description: `${name} kategorisindeki en güncel teknik makaleler.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const currentCategorySlug = slug[slug.length - 1];
  const page = Number(sParams.page) || 1;

  const [articlesRes, categoryTreeRes] = await Promise.all([
    getArticles({ categorySlug: currentCategorySlug, page, limit: 9 }),
    getCategoryTree(),
  ]);

  const articles = articlesRes.data || [];
  const categories = categoryTreeRes.data || [];
  const pagination = articlesRes.pagination || { total: 0, page: 1, totalPages: 0 };

  const breadcrumbs = buildBreadcrumbs(categories, slug);

  return (
    <div className="relative overflow-hidden py-6">
      {/* Ambient Gradient Glow (Arka Plan Işıltısı) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-5xl h-96 bg-gradient-to-tr from-purple-500/15 via-red-500/10 to-sky-500/15 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="container mx-auto max-w-6xl px-4 space-y-6">
        {/* Compact Top Bar with Search & Hierarchical Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {idx > 0 && <span className="text-muted-foreground/40 font-normal">/</span>}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-foreground">{crumb.name}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          <BlogSearch />
        </div>

        {/* Main Content Layout with Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <CategoryTree 
              categories={categories} 
              activeSlug={currentCategorySlug} 
              totalArticlesCount={categoryTreeRes.totalArticles} 
            />
          </aside>

          {/* Articles Grid & Pagination */}
          <main className="md:col-span-3 space-y-6">
            {articles.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
                Bu kategoride henüz yayınlanmış makale bulunmuyor.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* Pagination Controls */}
                <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
