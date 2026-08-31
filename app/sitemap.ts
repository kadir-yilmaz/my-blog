// ==========================================
// 🎓 Dynamic Sitemap Generator (`sitemap.ts`)
// ==========================================
import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";
import { getArticleSlug, getCategorySlug } from "@/lib/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Statik rotalar
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    // 1. Yayınlanmış makaleler (Dinamik Slug)
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, updatedAt: true },
    });

    const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${baseUrl}/blog/${getArticleSlug(article.title, article.id)}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // 2. Kategoriler (Dinamik Slug)
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    });

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/blog/category/${getCategorySlug(cat.name, cat.id)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...routes, ...articleRoutes, ...categoryRoutes];
  } catch (error) {
    console.error("Sitemap generation database query error:", error);
    // Veritabanı henüz hazır değilse statik rotaları dön
    return routes;
  }
}
