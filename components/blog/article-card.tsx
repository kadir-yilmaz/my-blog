import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    readingTime: number;
    publishedAt: Date | string | null;
    author?: { name: string | null; image: string | null };
    category?: { name: string; slug: string } | null;
    tags?: Array<{ tag: { name: string; slug: string } }>;
    _count?: { comments: number; likes: number; views: number };
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="relative group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-red-500/50 hover:shadow-lg">


      {/* Content Body */}
      <div className="flex flex-1 flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <h2 className="text-base font-bold tracking-tight text-foreground group-hover:text-red-600 transition-colors line-clamp-2 mt-2">
            <Link href={`/blog/${article.slug}`} className="before:absolute before:inset-0">
              {article.title}
            </Link>
          </h2>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Date & Category Path */}
        <div className="flex flex-col gap-1.5 border-t border-border/40 pt-3 text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center justify-between">
            <span>{article.publishedAt ? formatDate(article.publishedAt) : "Yeni"}</span>
            <div className="flex items-center gap-2.5">
              <span>👁️ {article._count?.views || 0}</span>
            </div>
          </div>
          <div className="text-red-600/80 font-semibold truncate" title={[article.category?.name, ...(article.tags?.map(t => t.tag.name) || [])].filter(Boolean).join(" / ")}>
            {[article.category?.name, ...(article.tags?.map(t => t.tag.name) || [])].filter(Boolean).join(" / ") || "Genel"}
          </div>
        </div>
      </div>
    </article>
  );
}
