// ==========================================
// 🎓 Zod Validation — Category (Dynamic Slug)
// ==========================================

import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Kategori adı en az 2 karakter olmalı")
    .max(100, "Kategori adı en fazla 100 karakter olabilir"),
  parentId: z.string().optional().nullable(),
  order: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
