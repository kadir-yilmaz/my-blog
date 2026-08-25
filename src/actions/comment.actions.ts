// ==========================================
// 🎓 Comment Server Actions
// ==========================================
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addComment(data: {
  articleId: string;
  content: string;
  parentId?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Yorum yapmak için giriş yapmalısınız." };
    }

    if (!data.content.trim()) {
      return { success: false, error: "Yorum içeriği boş olamaz." };
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        articleId: data.articleId,
        userId: session.user.id,
        parentId: data.parentId || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    revalidatePath(`/blog`);
    return { success: true, data: comment };
  } catch (error: any) {
    console.error("addComment error:", error);
    return { success: false, error: error.message || "Yorum eklenirken hata oluştu." };
  }
}

export async function getCommentsByArticleId(articleId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        parentId: null, // Top-level comments
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    return { success: true, data: comments };
  } catch (error: any) {
    console.error("getCommentsByArticleId error:", error);
    return { success: false, data: [] };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Yetkisiz işlem." };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return { success: false, error: "Yorum bulunamadı." };
    }

    if (comment.userId !== session.user.id && !session.user.isAdmin) {
      return { success: false, error: "Bu yorumu silme yetkiniz yok." };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/blog`);
    return { success: true };
  } catch (error: any) {
    console.error("deleteComment error:", error);
    return { success: false, error: error.message || "Yorum silinemedi." };
  }
}
