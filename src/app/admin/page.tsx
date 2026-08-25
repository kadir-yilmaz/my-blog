// ==========================================
// 🎓 Admin Dashboard — Overview
// ==========================================
// Route: /admin

import Link from "next/link";
import { getDashboardStats } from "@/actions/admin.actions";
import { formatDate } from "@/lib/utils";

export const revalidate = 0; // Dynamic dashboard

export default async function AdminDashboardPage() {
  const res = await getDashboardStats();

  const stats = res.data || {
    totalArticles: 0,
    totalViews: 0,
    totalComments: 0,
    recentArticles: [],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">İstatistik Paneli</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sitenizin genel durumu, okunma sayıları ve son aktiviteler.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Toplam Makale</p>
          <p className="text-3xl font-extrabold">{stats.totalArticles}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Toplam Görüntülenme</p>
          <p className="text-3xl font-extrabold">{stats.totalViews}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Yorum Sayısı</p>
          <p className="text-3xl font-extrabold">{stats.totalComments}</p>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
        >
          <span>✍️</span> Yeni Makale Yaz
        </Link>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold hover:bg-accent"
        >
          <span>📁</span> Kategori Yönetimi
        </Link>
      </div>

      {/* Recent Articles */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Son Eklenen Makaleler</h2>
          <Link href="/admin/articles" className="text-xs text-primary font-semibold hover:underline">
            Tümünü Gör →
          </Link>
        </div>

        <div className="space-y-3">
          {stats.recentArticles.length === 0 ? (
            <p className="text-xs text-muted-foreground">Henüz makale yok.</p>
          ) : (
            stats.recentArticles.map((article: any) => (
              <div key={article.id} className="flex items-center justify-between border-b border-border/40 pb-2 text-sm">
                <div>
                  <p className="font-semibold">{article.title}</p>
                  <span className="text-xs text-muted-foreground">{article.category?.name || "Kategorisiz"}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    article.status === "PUBLISHED"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {article.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
