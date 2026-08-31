// ==========================================
// 🎓 Makale Düzenleme Sayfası (Fault-Tolerant)
// ==========================================
// Route: /admin/articles/[id]/edit

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleEditor } from "@/components/admin/article-editor";
import { getHierarchicalCategories } from "@/lib/categories";
import { DEFAULT_ARTICLES } from "@/lib/default-data";

export const revalidate = 0;

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;

  let article: any = null;
  let categories: any[] = [];

  try {
    const [dbArticle, hierCategories] = await Promise.all([
      prisma.article.findUnique({ where: { id } }),
      getHierarchicalCategories(),
    ]);
    article = dbArticle;
    categories = hierCategories;
  } catch (dbError) {
    console.warn("EditArticlePage DB query warning:", dbError);
    categories = await getHierarchicalCategories();
  }

  // Fallback to DEFAULT_ARTICLES if DB returned null or was offline
  if (!article) {
    article = DEFAULT_ARTICLES.find((a) => a.id === id) || null;
  }

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ArticleEditor
        key={article.id}
        categories={categories}
        initialData={{
          id: article.id,
          title: article.title,
          content: article.content,
          excerpt: article.excerpt || null,
          coverImage: article.coverImage || null,
          categoryId: article.categoryId || null,
          status: (article.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT") as "DRAFT" | "PUBLISHED",
        }}
      />
    </div>
  );
}
