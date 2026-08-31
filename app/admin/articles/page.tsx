// ==========================================
// 🎓 Admin Makale Yönetimi
// ==========================================
// Route: /admin/articles

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ArticleTableActions } from "@/components/admin/article-table-actions";
import { DEFAULT_ARTICLES } from "@/lib/default-data";

export const revalidate = 0;

export default async function AdminArticlesPage() {
  let articles: any[] = [];
  let isDbOnline = false;
  try {
    articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        _count: { select: { views: true, likes: true, comments: true } },
      },
    });
    isDbOnline = true;
  } catch (dbError) {
    console.warn("AdminArticlesPage DB query warning:", dbError);
  }

  const displayArticles = isDbOnline
    ? articles
    : DEFAULT_ARTICLES.map((a) => ({
        ...a,
        createdAt: a.publishedAt,
        _count: { views: 0, likes: 0, comments: 0 },
      }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Makaleler</h1>
          <p className="text-sm text-muted-foreground">
            Blog makalelerini yönetin, yayınlayın veya taslak olarak saklayın.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition-colors"
        >
          + Yeni Makale
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
            <tr>
              <th className="p-4">Başlık</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Durum</th>
              <th className="p-4">Görüntülenme</th>
              <th className="p-4">Tarih</th>
              <th className="p-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {displayArticles.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Henüz makale eklenmemiş.
                </td>
              </tr>
            ) : (
              displayArticles.map((article) => (
                <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-semibold text-foreground">{article.title}</td>
                  <td className="p-4 text-muted-foreground">{article.category?.name || "-"}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        article.status === "PUBLISHED"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{article._count?.views || 0}</td>
                  <td className="p-4 text-muted-foreground text-xs">{formatDate(article.createdAt || new Date())}</td>
                  <td className="p-4 text-right">
                    <ArticleTableActions articleId={article.id} status={article.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
