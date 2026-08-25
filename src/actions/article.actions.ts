// ==========================================
// 🎓 Article Server Actions (Dynamic Slug Architecture)
// ==========================================
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  getArticleSlug,
  getCategorySlug,
  getTagSlug,
  extractArticleIdFromSlug,
  extractCategoryIdFromSlug,
  extractTagIdFromSlug,
} from "@/lib/slug";
import { DEFAULT_ARTICLES, DEFAULT_CATEGORIES } from "@/lib/default-data";
import { getCategoryAncestorChain } from "./category.actions";

/**
 * Verilen kategori ID'sini ve bu kategorinin altındaki tüm alt kategorilerin (çocuklar, torunlar) ID'lerini döner.
 */
async function getAllDescendantCategoryIds(categoryId: string): Promise<string[]> {
  try {
    const allCategories = await prisma.category.findMany({
      select: { id: true, parentId: true },
    }).catch(() => []);

    const resultIds = new Set<string>([categoryId]);
    const queue = [categoryId];

    while (queue.length > 0) {
      const currentParent = queue.shift()!;
      const children = allCategories.filter((c) => c.parentId === currentParent);
      for (const ch of children) {
        if (!resultIds.has(ch.id)) {
          resultIds.add(ch.id);
          queue.push(ch.id);
        }
      }
    }

    // Default categories fallback kontrolü
    const defaultQueue = [categoryId];
    while (defaultQueue.length > 0) {
      const currentParent = defaultQueue.shift()!;
      const children = DEFAULT_CATEGORIES.filter((c) => c.parentId === currentParent);
      for (const ch of children) {
        if (!resultIds.has(ch.id)) {
          resultIds.add(ch.id);
          defaultQueue.push(ch.id);
        }
      }
    }

    return Array.from(resultIds);
  } catch {
    return [categoryId];
  }
}

export async function getArticles(params?: {
  categoryId?: string;
  categorySlug?: string;
  tagId?: string;
  tagSlug?: string;
  search?: string;
  limit?: number;
  page?: number;
}) {
  let targetCategoryId = params?.categoryId;
  if (!targetCategoryId && params?.categorySlug) {
    targetCategoryId = extractCategoryIdFromSlug(params.categorySlug) || undefined;
  }

  let targetCategoryIds: string[] = [];

  try {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      status: "PUBLISHED",
    };

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search } },
        { excerpt: { contains: params.search } },
        { content: { contains: params.search } },
      ];
    }

    if (targetCategoryId) {
      targetCategoryIds = await getAllDescendantCategoryIds(targetCategoryId);
      if (targetCategoryIds.length === 1) {
        where.categoryId = targetCategoryIds[0];
      } else if (targetCategoryIds.length > 1) {
        where.categoryId = { in: targetCategoryIds };
      }
    }

    if (params?.tagId) {
      where.tags = { some: { tagId: params.tagId } };
    } else if (params?.tagSlug) {
      const tagId = extractTagIdFromSlug(params.tagSlug);
      if (tagId) {
        where.tags = { some: { tagId } };
      }
    }

    const [rawArticles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, image: true } },
          category: { select: { id: true, name: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true, likes: true, views: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    const articles = rawArticles.map((article) => ({
      ...article,
      slug: getArticleSlug(article.title, article.id),
      category: article.category
        ? {
            ...article.category,
            slug: getCategorySlug(article.category.name, article.category.id),
          }
        : null,
      tags: article.tags.map((t) => ({
        ...t,
        tag: {
          ...t.tag,
          slug: getTagSlug(t.tag.name, t.tag.id),
        },
      })),
    }));

    return {
      success: true,
      data: articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  } catch (error: any) {
    console.warn("getArticles warning, using default articles fallback:", error);
  }

  // Fallback to DEFAULT_ARTICLES
  let filteredFallback = DEFAULT_ARTICLES;
  if (targetCategoryId && targetCategoryIds.length > 0) {
    filteredFallback = DEFAULT_ARTICLES.filter((a) => targetCategoryIds.includes(a.categoryId));
  } else if (params?.search) {
    const q = params.search.toLowerCase();
    filteredFallback = DEFAULT_ARTICLES.filter((a) =>
      a.title.toLowerCase().includes(q) || (a.excerpt || "").toLowerCase().includes(q)
    );
  }

  const fallbackArticles = filteredFallback.map((a) => ({
    ...a,
    slug: getArticleSlug(a.title, a.id),
    category: a.category
      ? {
          id: a.categoryId,
          name: a.category.name,
          slug: getCategorySlug(a.category.name, a.categoryId),
        }
      : null,
    tags: [],
    author: { id: "admin-id", name: a.author?.name || "Kadir Yılmaz", image: null },
    createdAt: a.publishedAt,
    updatedAt: a.publishedAt,
  }));

  return {
    success: true,
    data: fallbackArticles,
    pagination: {
      total: fallbackArticles.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };
}

export async function getArticleBySlug(slugOrId: string) {
  try {
    const articleId = extractArticleIdFromSlug(slugOrId);
    if (articleId) {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
          author: { select: { id: true, name: true, image: true, bio: true } },
          category: {
            select: {
              id: true,
              name: true,
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
            },
          },
          tags: { include: { tag: true } },
          _count: { select: { comments: true, likes: true, views: true } },
        },
      });

      if (article) {
        const categoryChain = await getCategoryAncestorChain(article.categoryId);
        const breadcrumbs = [
          { name: "Blog", href: "/blog" },
          ...categoryChain.map((c) => ({
            name: c.name,
            href: `/blog/category/${c.slug}`,
          })),
        ];

        const formattedArticle = {
          ...article,
          slug: getArticleSlug(article.title, article.id),
          breadcrumbs,
          category: article.category
            ? {
                ...article.category,
                slug: getCategorySlug(article.category.name, article.category.id),
                parent: article.category.parent
                  ? {
                      ...article.category.parent,
                      slug: getCategorySlug(article.category.parent.name, article.category.parent.id),
                      parent: article.category.parent.parent
                        ? {
                            ...article.category.parent.parent,
                            slug: getCategorySlug(
                              article.category.parent.parent.name,
                              article.category.parent.parent.id
                            ),
                          }
                        : null,
                    }
                  : null,
              }
            : null,
          tags: article.tags.map((t) => ({
            ...t,
            tag: {
              ...t.tag,
              slug: getTagSlug(t.tag.name, t.tag.id),
            },
          })),
        };
        return { success: true, data: formattedArticle };
      }
    }
  } catch (error: any) {
    console.warn("getArticleBySlug warning, checking default data:", error);
  }

  // Fallback search in DEFAULT_ARTICLES
  const targetId = extractArticleIdFromSlug(slugOrId) || slugOrId;
  const fallback = DEFAULT_ARTICLES.find((a) => a.id === targetId || getArticleSlug(a.title, a.id) === slugOrId);
  if (fallback) {
    const formatted = {
      ...fallback,
      slug: getArticleSlug(fallback.title, fallback.id),
      category: fallback.category
        ? {
            id: fallback.categoryId,
            name: fallback.category.name,
            slug: getCategorySlug(fallback.category.name, fallback.categoryId),
            parent: null,
          }
        : null,
      tags: [],
      author: { id: "admin-id", name: fallback.author?.name || "Kadir Yılmaz", image: null, bio: "Full Stack Software Engineer" },
      createdAt: fallback.publishedAt,
      updatedAt: fallback.publishedAt,
    };
    return { success: true, data: formatted };
  }

  return { success: false, data: null };
}

export async function toggleLikeArticle(articleId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Beğenmek için giriş yapmalısınız." };
    }

    const userId = session.user.id;

    const existingLike = await prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
    } else {
      await prisma.like.create({
        data: {
          articleId,
          userId,
        },
      });
    }

    revalidatePath(`/blog`);
    return { success: true, liked: !existingLike };
  } catch (error: any) {
    console.error("toggleLikeArticle error:", error);
    return { success: false, error: error.message || "İşlem gerçekleştirilemedi." };
  }
}

export async function toggleBookmarkArticle(articleId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Yer imlerine eklemek için giriş yapmalısınız." };
    }

    const userId = session.user.id;

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
    } else {
      await prisma.bookmark.create({
        data: {
          articleId,
          userId,
        },
      });
    }

    revalidatePath(`/blog`);
    return { success: true, bookmarked: !existingBookmark };
  } catch (error: any) {
    console.error("toggleBookmarkArticle error:", error);
    return { success: false, error: error.message || "İşlem gerçekleştirilemedi." };
  }
}

export async function incrementArticleViews(articleId: string, ip?: string) {
  try {
    await prisma.view.create({
      data: {
        articleId,
        ip: ip || "unknown",
      },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false };
  }
}
