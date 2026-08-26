// ==========================================
// 🎓 Zod Validation — Article (Dynamic Slug)
// ==========================================

import { z } from "zod";

export const createArticleSchema = z.object({
  title: z
    .string()
    .min(3, "Başlık en az 3 karakter olmalı")
    .max(200, "Başlık en fazla 200 karakter olabilir"),
  content: z
    .string()
    .min(10, "İçerik en az 10 karakter olmalı"),
  excerpt: z
    .string()
    .max(500, "Özet en fazla 500 karakter olabilir")
    .optional(),
  coverImage: z.string().optional().nullable(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const updateArticleSchema = createArticleSchema.partial();

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
