// ==========================================
// 🎓 Category Server Actions (Dynamic Slug Architecture)
// ==========================================
"use server";

import { prisma } from "@/lib/prisma";
import { getCategorySlug } from "@/lib/slug";
import { DEFAULT_CATEGORIES } from "@/lib/default-data";

export async function getCategories() {
  try {
    let rawCategories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: { select: { articles: true } },
      },
    });

    if (rawCategories.length === 0) {
      rawCategories = DEFAULT_CATEGORIES as any;
    }

    const categories = rawCategories.map((cat: any) => {
      let displayName = cat.name;
      if (cat.parent?.parent) {
        displayName = `${cat.parent.parent.name} → ${cat.parent.name} → ${cat.name}`;
      } else if (cat.parent) {
        displayName = `${cat.parent.name} → ${cat.name}`;
      }

      return {
        ...cat,
        displayName,
        slug: getCategorySlug(cat.name, cat.id),
        _count: { articles: cat._count?.articles || 0 },
      };
    });

    return { success: true, data: categories };
  } catch (error: any) {
    console.warn("getCategories warning, using default categories:", error);
    const categories = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      displayName: cat.name,
      slug: getCategorySlug(cat.name, cat.id),
      _count: { articles: cat._count?.articles || 0 },
    }));
    return { success: true, data: categories };
  }
}

/**
 * Verilen bir kategori ID'sinin kök kategoriden yaprağa kadar olan tüm ata zincirini (breadcrumbs) döner.
 */
export async function getCategoryAncestorChain(
  categoryId: string | null | undefined
): Promise<Array<{ name: string; slug: string }>> {
  if (!categoryId) return [];

  try {
    const chain: Array<{ name: string; slug: string }> = [];
    let currentId: string | null = categoryId;
    let safetyDepth = 0;

    while (currentId && safetyDepth < 10) {
      safetyDepth++;
      const cat: { id: string; name: string; parentId: string | null } | null =
        await prisma.category.findUnique({
          where: { id: currentId },
          select: { id: true, name: true, parentId: true },
        });

      if (!cat) break;
      chain.unshift({
        name: cat.name,
        slug: getCategorySlug(cat.name, cat.id),
      });
      currentId = cat.parentId;
    }

    return chain;
  } catch (error) {
    console.warn("getCategoryAncestorChain warning:", error);
    const chain: Array<{ name: string; slug: string }> = [];
    let currentId: string | null = categoryId;
    let safety = 0;
    while (currentId && safety < 10) {
      safety++;
      const found = DEFAULT_CATEGORIES.find((c) => c.id === currentId);
      if (!found) break;
      chain.unshift({
        name: found.name,
        slug: getCategorySlug(found.name, found.id),
      });
      currentId = found.parentId;
    }
    return chain;
  }
}

export async function getCategoryTree() {
  try {
    // Top-level categories (parentId: null) with recursive children and total article count
    const [rawRootCategories, totalPublishedArticles] = await Promise.all([
      prisma.category.findMany({
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: {
          children: {
            orderBy: { order: "asc" },
            include: {
              children: {
                orderBy: { order: "asc" },
                include: {
                  _count: { select: { articles: true } },
                },
              },
              _count: { select: { articles: true } },
            },
          },
          _count: { select: { articles: true } },
        },
      }),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
    ]);

    if (rawRootCategories.length > 0) {
      const mapAndCountCategory = (cat: any): any => {
        const children = cat.children ? cat.children.map(mapAndCountCategory) : [];
        const directCount = cat._count?.articles || 0;
        const childrenTotal = children.reduce((sum: number, ch: any) => sum + (ch._count?.articles || 0), 0);
        return {
          ...cat,
          slug: getCategorySlug(cat.name, cat.id),
          children,
          _count: { articles: directCount + childrenTotal },
        };
      };

      const rootCategories = rawRootCategories.map(mapAndCountCategory);
      return { 
        success: true, 
        data: rootCategories, 
        totalArticles: totalPublishedArticles 
      };
    }
  } catch (error: any) {
    console.warn("getCategoryTree warning, building from default data:", error);
  }

  // Fallback tree construction from DEFAULT_CATEGORIES with recursive counts
  const buildTree = (parentId: string | null): any[] => {
    return DEFAULT_CATEGORIES
      .filter((c) => c.parentId === parentId)
      .map((c) => {
        const children = buildTree(c.id);
        const directCount = c._count?.articles || 0;
        const childrenTotal = children.reduce((sum: number, ch: any) => sum + (ch._count?.articles || 0), 0);
        return {
          ...c,
          slug: getCategorySlug(c.name, c.id),
          children,
          _count: { articles: directCount + childrenTotal },
        };
      });
  };

  return { 
    success: true, 
    data: buildTree(null), 
    totalArticles: 0
  };
}
