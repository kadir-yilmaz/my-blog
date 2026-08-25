// ==========================================
// 🎓 Yeni Makale Oluşturma Sayfası
// ==========================================
// Route: /admin/articles/new

import { prisma } from "@/lib/prisma";
import { ArticleEditor } from "@/components/admin/article-editor";
import { getHierarchicalCategories } from "@/lib/categories";

export const revalidate = 0;

export default async function NewArticlePage() {
  const categories = await getHierarchicalCategories();

  return (
    <div className="space-y-6">
      <ArticleEditor key="new" categories={categories} />
    </div>
  );
}
