// ==========================================
// 🎓 Blog Listesi Sayfası — ISR
// ==========================================
// Route: /blog

import type { Metadata } from "next";
import { ArticleCard } from "@/components/blog/article-card";
import { CategoryTree } from "@/components/blog/category-tree";
import { BlogSearch } from "@/components/blog/blog-search";
import { Pagination } from "@/components/blog/pagination";
import { getArticles } from "@/actions/article.actions";
import { getCategoryTree } from "@/actions/category.actions";

export const metadata: Metadata = {
  title: "Blog & Teknik Makaleler",
  description: "Next.js, React, TypeScript, C#, Docker ve bulut mimarileri üzerine derinlemesine teknik makaleler.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BlogPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const page = Number(params.page) || 1;

  const [articlesRes, categoryTreeRes] = await Promise.all([
    getArticles({ search, page, limit: 9 }),
    getCategoryTree(),
  ]);

  const articles = articlesRes.data || [];
  const categories = categoryTreeRes.data || [];
  const pagination = articlesRes.pagination || { total: 0, page: 1, totalPages: 0 };

  return (
    <div className="relative overflow-hidden py-6">
      {/* Ambient Gradient Glow (Arka Plan Işıltısı) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-5xl h-96 bg-gradient-to-tr from-purple-500/15 via-red-500/10 to-sky-500/15 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="container mx-auto max-w-6xl px-4 space-y-6">
        {/* Compact Top Bar with Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Blog</span>
            <span>/</span>
            <span>Tüm Makaleler</span>
          </div>
          <BlogSearch />
        </div>

        {/* Main Content Layout with Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <CategoryTree categories={categories} totalArticlesCount={categoryTreeRes.totalArticles} />
          </aside>

          {/* Articles Grid & Pagination */}
          <main className="md:col-span-3 space-y-6">
            {articles.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
                Aramanıza uygun makale bulunamadı.
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
