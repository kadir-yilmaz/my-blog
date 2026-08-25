import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/default-data";

export async function getHierarchicalCategories() {
  try {
    let rawCategories = await prisma.category.findMany({
      select: { id: true, name: true, parentId: true, order: true },
    });

    if (rawCategories.length === 0) {
      rawCategories = DEFAULT_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        parentId: c.parentId,
        order: c.order,
      }));
    }

    const buildCategoryName = (catId: string): string => {
      const cat = rawCategories.find((c) => c.id === catId);
      if (!cat) return "";
      if (cat.parentId) {
        return buildCategoryName(cat.parentId) + " / " + cat.name;
      }
      return cat.name;
    };

    return rawCategories
      .map((cat) => ({
        id: cat.id,
        name: buildCategoryName(cat.id),
        order: cat.order,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Hiyerarşik ve alfabetik sıralama
  } catch (error) {
    console.warn("getHierarchicalCategories DB query warning:", error);
    const rawCategories = DEFAULT_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      parentId: c.parentId,
      order: c.order,
    }));
    const buildCategoryName = (catId: string): string => {
      const cat = rawCategories.find((c) => c.id === catId);
      if (!cat) return "";
      if (cat.parentId) {
        return buildCategoryName(cat.parentId) + " / " + cat.name;
      }
      return cat.name;
    };
    return rawCategories
      .map((cat) => ({
        id: cat.id,
        name: buildCategoryName(cat.id),
        order: cat.order,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
