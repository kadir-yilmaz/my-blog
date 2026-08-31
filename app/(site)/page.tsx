import Link from "next/link";
import { HeroSection } from "@/components/portfolio/hero-section";
import { ArticleCard } from "@/components/blog/article-card";
import { getArticles } from "@/actions/article.actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const articlesRes = await getArticles({ limit: 10 });
  const articles = articlesRes.data || [];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <HeroSection />

      {/* Son Eklenen Makaleler Section */}
      <section className="container mx-auto max-w-6xl px-4 space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Son Eklenen Makaleler
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Yazılım mimarileri, C#, .NET ve modern web teknolojileri üzerine derinlemesine teknik yazılar.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-sm transition-colors"
          >
            <span>Tüm yazılar</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Makale Kartları Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Henüz makale eklenmedi. Yakında yeni yazılar eklenecektir.
          </div>
        )}
      </section>
    </div>
  );
}
