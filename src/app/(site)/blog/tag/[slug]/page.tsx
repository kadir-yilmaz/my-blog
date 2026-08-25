// ==========================================
// 🎓 Etiket Filtreli Blog Sayfası
// ==========================================
// Route: /blog/tag/[slug]

import type { Metadata } from "next";
import { ArticleCard } from "@/components/blog/article-card";
import { getArticles } from "@/actions/article.actions";

export const revalidate = 3600;

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `#${slug} Makaleleri`,
    description: `#${slug} etiketiyle yayınlanmış teknik yazılar.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const articlesRes = await getArticles({ tagSlug: slug });
  const articles = articlesRes.data || [];

  return (
    <div className="relative overflow-hidden py-12 md:py-16">
      {/* Ambient Gradient Glow (Arka Plan Işıltısı) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-4xl h-96 bg-gradient-to-tr from-purple-500/15 via-red-500/10 to-sky-500/15 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="container mx-auto max-w-6xl px-4 space-y-10">
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            #{slug}
          </h1>
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-red-600 to-purple-600" />
          <p className="text-muted-foreground text-sm sm:text-base">
            #{slug} etiketine sahip makaleler.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
            Bu etikette henüz makale bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
