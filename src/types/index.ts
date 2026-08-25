// ==========================================
// 🎓 TypeScript Type Definitions
// ==========================================

import type { Article as PrismaArticle, Category as PrismaCategory, Tag as PrismaTag, User, Comment } from "@prisma/client";

// Article with computed dynamic slug
export type Article = PrismaArticle & {
  slug?: string;
};

export type Category = PrismaCategory & {
  slug?: string;
};

export type Tag = PrismaTag & {
  slug?: string;
};

// Blog listesinde gösterilecek makale kartı
export type ArticleWithMeta = Article & {
  slug: string; // Dynamic computed slug: `makale-adi-a-base62`
  author: Pick<User, "id" | "name" | "image">;
  category: (Pick<Category, "id" | "name"> & { slug?: string }) | null;
  tags: { tag: Pick<Tag, "id" | "name" | "color"> & { slug?: string } }[];
  _count: {
    likes: number;
    comments: number;
    views: number;
  };
};

// Makale detay sayfası
export type ArticleDetail = Article & {
  slug: string;
  author: Pick<User, "id" | "name" | "image" | "bio">;
  category: (Pick<Category, "id" | "name"> & {
    slug?: string;
    parent: (Pick<Category, "id" | "name"> & { slug?: string }) | null;
  }) | null;
  tags: { tag: Tag & { slug?: string } }[];
  _count: {
    likes: number;
    comments: number;
    views: number;
  };
};

// ==========================================
// Category Types
// ==========================================

// Kategori ağacı (recursive)
export type CategoryTree = Category & {
  slug: string; // Dynamic computed slug: `kategori-adi-c-base62`
  children: CategoryTree[];
  _count?: {
    articles: number;
  };
};

// ==========================================
// Comment Types
// ==========================================

// Nested yorum yapısı
export type CommentWithUser = Comment & {
  user: Pick<User, "id" | "name" | "image">;
  replies: CommentWithUser[];
};

// ==========================================
// API Response Types
// ==========================================

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ==========================================
// Search Types
// ==========================================

export type SearchResult = {
  articles: ArticleWithMeta[];
  totalCount: number;
};

// ==========================================
// Admin Dashboard Types
// ==========================================

export type DashboardStats = {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  recentArticles: ArticleWithMeta[];
};
