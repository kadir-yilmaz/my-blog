// ==========================================
// 🎓 Makale Detay Sayfası — SSG + ISR
// ==========================================
// Route: /blog/[slug]

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Eye } from "lucide-react";
import { getArticleBySlug } from "@/actions/article.actions";
import { ArticleContent } from "@/components/blog/article-content";
import { ViewCounter } from "@/components/blog/view-counter";
import { BackButton } from "@/components/blog/back-button";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getArticleSlug } from "@/lib/slug";

export const revalidate = 3600;

interface ArticleDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true },
    });
    return articles.map((a) => ({ slug: getArticleSlug(a.title, a.id) }));
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getArticleBySlug(slug);

  if (!res.success || !res.data) {
    return { title: "Makale Bulunamadı" };
  }

  const article = res.data;
  return {
    title: article.title,
    description: article.excerpt || `${article.title} başlıklı teknik makale.`,
  };
}

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { slug } = await params;
  const articleRes = await getArticleBySlug(slug);

  if (!articleRes.success || !articleRes.data) {
    notFound();
  }

  const article = articleRes.data;

  // Kökten yaprağa eksiksiz hiyerarşik breadcrumb zinciri
  const breadcrumbs: Array<{ name: string; href: string }> = (article as any).breadcrumbs || [
    { name: "Blog", href: "/blog" },
  ];

  const fallbackBackUrl = breadcrumbs.length > 1 
    ? breadcrumbs[breadcrumbs.length - 1].href 
    : "/blog";

  return (
    <div className="relative overflow-hidden py-8 md:py-12">
      {/* Ambient Gradient Glow (Arka Plan Işıltısı) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-4xl h-96 bg-gradient-to-tr from-purple-500/15 via-red-500/10 to-sky-500/15 blur-3xl pointer-events-none -z-10 rounded-full" />

      <article className="container mx-auto max-w-4xl px-4 space-y-8">
        {/* Top Bar: Hiyerarşik Breadcrumb Navigasyonu & Akıllı Geri Dön Butonu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {idx > 0 && <span className="text-muted-foreground/40 font-normal">/</span>}
                <Link 
                  href={crumb.href} 
                className="hover:text-foreground transition-colors font-medium hover:underline underline-offset-4"
              >
                {crumb.name}
              </Link>
            </div>
          ))}
          <span className="text-muted-foreground/40 font-normal">/</span>
          <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {article.title}
          </span>
        </nav>

        <div className="shrink-0">
          <BackButton 
            fallbackHref={fallbackBackUrl} 
            label="Geri Dön" 
          />
        </div>
      </div>

      {/* Header Info */}
      <header className="space-y-4 text-left border-b border-border/60 pb-8">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {article.category && (
            <Link
              href={`/blog/category/${article.category.slug}`}
              className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
            >
              {article.category.name}
            </Link>
          )}
          {article.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
              <span>{formatDate(article.publishedAt)}</span>
            </span>
          )}
          <span className="text-muted-foreground/30">•</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
            <span>{article.readingTime} dk okuma</span>
          </span>
          <span className="text-muted-foreground/30">•</span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-muted-foreground/70" />
            <span>{article._count?.views || 0} görüntülenme</span>
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground leading-tight">
          {article.title}
        </h1>

        {/* Author info */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-foreground">{article.author?.name || "Kadir Yılmaz"}</span>
            <span className="text-xs text-muted-foreground">Yazar</span>
          </div>
        </div>
      </header>

      <div className="py-4">
        <ArticleContent content={article.content} />
      </div>

      <ViewCounter articleId={article.id} />

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/60">
          <span className="text-xs font-semibold text-muted-foreground">Etiketler:</span>
          {article.tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/blog/tag/${tag.slug}`}
              className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium hover:bg-accent"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

    </article>
    </div>
  );
}
