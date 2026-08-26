// ==========================================
// 🎓 Admin Server Actions
// ==========================================
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper to check admin permission
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("Admin yetkisi gereklidir.");
  }
  return session.user;
}

// Helper to ensure an author exists in the database
async function getOrCreateAuthorId(adminUser: { id?: string; email?: string | null }) {
  if (adminUser.id) {
    const existing = await prisma.user.findUnique({ where: { id: adminUser.id } }).catch(() => null);
    if (existing) return existing.id;
  }
  if (adminUser.email) {
    const existingByEmail = await prisma.user.findUnique({ where: { email: adminUser.email } }).catch(() => null);
    if (existingByEmail) return existingByEmail.id;
  }
  const firstAdmin = await prisma.user.findFirst({ where: { isAdmin: true } }).catch(() => null);
  if (firstAdmin) return firstAdmin.id;

  const newAdmin = await prisma.user.create({
    data: {
      email: adminUser.email || process.env.ADMIN_EMAIL || "admin@example.com",
      name: "Admin",
      isAdmin: true,
    },
  });
  return newAdmin.id;
}

// 1. Dashboard Stats
export async function getDashboardStats() {
  try {
    await checkAdmin();

    try {
      const [totalArticles, totalViews, totalComments, recentArticles] =
        await Promise.all([
          prisma.article.count(),
          prisma.view.count(),
          prisma.comment.count(),
          prisma.article.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { category: { select: { name: true } } },
          }),
        ]);

      return {
        success: true,
        data: {
          totalArticles,
          totalViews,
          totalComments,
          recentArticles,
        },
      };
    } catch (dbError: any) {
      console.warn("getDashboardStats database query warning:", dbError?.message);
      return {
        success: true,
        data: {
          totalArticles: 0,
          totalViews: 0,
          totalComments: 0,
          recentArticles: [],
        },
      };
    }
  } catch (error: any) {
    console.error("getDashboardStats error:", error);
    return { success: false, error: error.message };
  }
}

// 2. Article CRUD
export async function createArticle(data: {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  categoryId?: string;
  status?: "DRAFT" | "PUBLISHED";
  readingTime?: number;
}) {
  try {
    const admin = await checkAdmin();
    const authorId = await getOrCreateAuthorId(admin);

    const article = await prisma.article.create({
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        categoryId: data.categoryId || null,
        status: data.status || "DRAFT",
        readingTime: data.readingTime || Math.ceil((data.content || "").split(" ").length / 200),
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        authorId,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/blog");
    revalidatePath("/admin/articles");
    return { success: true, data: article };
  } catch (error: any) {
    console.error("createArticle error:", error);
    return {
      success: false,
      error: `Makale oluşturulamadı: ${error?.message || "Veritabanı bağlantı hatası"}`,
    };
  }
}

export async function updateArticle(
  id: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    categoryId?: string;
    status?: "DRAFT" | "PUBLISHED";
    readingTime?: number;
  }
) {
  try {
    const admin = await checkAdmin();
    const authorId = await getOrCreateAuthorId(admin);

    const existing = await prisma.article.findUnique({ where: { id } }).catch(() => null);

    let article;
    if (existing) {
      article = await prisma.article.update({
        where: { id },
        data: {
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          coverImage: data.coverImage,
          categoryId: data.categoryId || null,
          status: data.status,
          readingTime: data.readingTime || (data.content ? Math.ceil(data.content.split(" ").length / 200) : existing.readingTime),
          publishedAt:
            data.status === "PUBLISHED" && !existing.publishedAt
              ? new Date()
              : existing.publishedAt,
        },
      });
    } else {
      // Eğer varsayılan mock makalelerden biri düzenleniyorsa ve henüz DB'de yoksa, DB'ye ekle
      article = await prisma.article.create({
        data: {
          id,
          title: data.title || "İsimsiz Makale",
          content: data.content || "",
          excerpt: data.excerpt || null,
          coverImage: data.coverImage || null,
          categoryId: data.categoryId || null,
          status: data.status || "DRAFT",
          readingTime: data.readingTime || Math.ceil((data.content || "").split(" ").length / 200),
          publishedAt: data.status === "PUBLISHED" ? new Date() : null,
          authorId,
        },
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/blog");
    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${id}/edit`);
    return { success: true, data: article };
  } catch (error: any) {
    console.error("updateArticle error:", error);
    return {
      success: false,
      error: `Makale güncellenemedi: ${error?.message || "Veritabanı bağlantı hatası"}`,
    };
  }
}

export async function deleteArticle(id: string) {
  try {
    await checkAdmin();
    await prisma.article.delete({ where: { id } });
    revalidatePath("/", "layout");
    revalidatePath("/blog");
    revalidatePath("/admin/articles");
    return { success: true };
  } catch (error: any) {
    console.error("deleteArticle error:", error);
    return {
      success: false,
      error: `Makale silinemedi: ${error?.message || "Veritabanı hatası"}`,
    };
  }
}

// 3. Category CRUD
export async function createCategory(data: { name: string; parentId?: string }) {
  try {
    await checkAdmin();

    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        parentId: data.parentId || null,
      },
    });
    revalidatePath("/blog");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles/new");
    return { success: true, data: category };
  } catch (error: any) {
    console.error("createCategory error:", error);
    return {
      success: false,
      error: `Kategori oluşturulamadı: ${error?.message || "Veritabanı hatası"}`,
    };
  }
}

export async function updateCategory(id: string, data: { name: string; parentId?: string | null }) {
  try {
    await checkAdmin();

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name.trim(),
        parentId: data.parentId ?? undefined,
      },
    });
    revalidatePath("/blog");
    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error: any) {
    console.error("updateCategory error:", error);
    return {
      success: false,
      error: `Kategori güncellenemedi: ${error?.message || "Veritabanı hatası"}`,
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    await checkAdmin();
    await prisma.category.delete({ where: { id } });
    revalidatePath("/blog");
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    console.error("deleteCategory error:", error);
    return {
      success: false,
      error: `Kategori silinemedi: ${error?.message || "Veritabanı hatası"}`,
    };
  }
}




