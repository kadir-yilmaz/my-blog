// ==========================================
// 🎓 Admin Kategori Yönetimi (Tam Boy & Modal Mimarisi)
// ==========================================
// Route: /admin/categories

import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";
import { DEFAULT_CATEGORIES } from "@/lib/default-data";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        parent: { select: { name: true } },
        _count: { select: { articles: true } },
      },
    });
  } catch (dbError) {
    console.warn("AdminCategoriesPage DB query warning:", dbError);
  }

  // Veritabanı henüz seed edilmemiş veya servis çevrimdışı ise varsayılan hiyerarşik kategorileri göster
  const displayCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <div className="space-y-6">
      <CategoryManager initialCategories={displayCategories} />
    </div>
  );
}
