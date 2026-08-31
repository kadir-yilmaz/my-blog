// ==========================================
// 🎓 Comment Section Component (Client Component)
// ==========================================
"use client";

import { useState, useTransition } from "react";
import { addComment, deleteComment } from "@/actions/comment.actions";
import { formatDate } from "@/lib/utils";

interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface ReplyItem {
  id: string;
  content: string;
  createdAt: Date | string;
  user: CommentUser;
}

interface CommentItemData {
  id: string;
  content: string;
  createdAt: Date | string;
  user: CommentUser;
  replies?: ReplyItem[];
}

interface CommentSectionProps {
  articleId: string;
  initialComments: CommentItemData[];
}

export function CommentSection({ articleId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItemData[]>(initialComments);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await addComment({ articleId, content: newCommentText });
      if (res.success && res.data) {
        const created: CommentItemData = {
          id: res.data.id,
          content: res.data.content,
          createdAt: res.data.createdAt,
          user: res.data.user,
          replies: [],
        };
        setComments([created, ...comments]);
        setNewCommentText("");
      } else {
        setErrorMsg(res.error || "Yorum gönderilemedi.");
      }
    });
  }

  async function handleAddReply(parentId: string) {
    if (!replyText.trim()) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await addComment({ articleId, content: replyText, parentId });
      if (res.success && res.data) {
        const replyItem: ReplyItem = {
          id: res.data.id,
          content: res.data.content,
          createdAt: res.data.createdAt,
          user: res.data.user,
        };
        setComments(
          comments.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), replyItem] }
              : c
          )
        );
        setReplyText("");
        setReplyingToId(null);
      } else {
        setErrorMsg(res.error || "Yanıt gönderilemedi.");
      }
    });
  }

  async function handleDelete(commentId: string, isReply: boolean = false, parentId?: string) {
    if (!confirm("Yorumu silmek istediğinize emin misiniz?")) return;

    startTransition(async () => {
      const res = await deleteComment(commentId);
      if (res.success) {
        if (isReply && parentId) {
          setComments(
            comments.map((c) =>
              c.id === parentId
                ? { ...c, replies: c.replies?.filter((r) => r.id !== commentId) }
                : c
            )
          );
        } else {
          setComments(comments.filter((c) => c.id !== commentId));
        }
      } else {
        alert(res.error || "Yorum silinemedi.");
      }
    });
  }

  return (
    <div className="space-y-8 border-t border-border/80 pt-10">
      <h3 className="text-2xl font-bold tracking-tight">Yorumlar ({comments.length})</h3>

      {errorMsg && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Yorum Ekleme Formu */}
      <form onSubmit={handleAddComment} className="space-y-3">
        <textarea
          rows={3}
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Düşüncelerinizi paylaşın... (Giriş yapmış olmalısınız)"
          className="w-full rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={isPending || !newCommentText.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Gönderiliyor..." : "Yorum Yap"}
        </button>
      </form>

      {/* Yorum Listesi */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{comment.user.name || "Kullanıcı"}</span>
              <span>{formatDate(comment.createdAt)}</span>
            </div>

            <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>

            <div className="flex items-center gap-4 text-xs font-semibold pt-1">
              <button
                onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                className="text-primary hover:underline"
              >
                Yanıtla
              </button>
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-red-500 hover:underline"
              >
                Sil
              </button>
            </div>

            {/* Yanıt Formu */}
            {replyingToId === comment.id && (
              <div className="mt-3 pl-4 border-l-2 border-primary space-y-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Yanıtınızı yazın..."
                  className="w-full rounded-md border border-input bg-background p-2 text-xs"
                />
                <button
                  onClick={() => handleAddReply(comment.id)}
                  disabled={isPending || !replyText.trim()}
                  className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground"
                >
                  Yanıtı Gönder
                </button>
              </div>
            )}

            {/* Alt Yanıtlar */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 pl-4 border-l-2 border-muted space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="rounded-lg bg-muted/40 p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{reply.user.name || "Kullanıcı"}</span>
                      <span>{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-xs text-foreground">{reply.content}</p>
                    <button
                      onClick={() => handleDelete(reply.id, true, comment.id)}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
