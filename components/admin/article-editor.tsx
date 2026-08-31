"use client";

// ==========================================
// 🎓 Article Editor Component with Quick Category Modal
// ==========================================

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { createArticle, updateArticle, createCategory } from "@/actions/admin.actions";
import { Plus, FolderPlus, X, AlertCircle, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import type { EditorJsRef } from "@/components/admin/editorjs-editor";

const EditorJsEditor = dynamic(
  () => import("@/components/admin/editorjs-editor"),
  { 
    ssr: false, 
    loading: () => <div className="p-4 text-sm text-muted-foreground animate-pulse border border-input rounded-lg min-h-[500px]">Editör yükleniyor...</div> 
  }
);

interface CategoryOption {
  id: string;
  name: string;
  displayName?: string;
}

interface ArticleEditorProps {
  categories: CategoryOption[];
  initialData?: {
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    categoryId: string | null;
    status: "DRAFT" | "PUBLISHED";
  };
}

export function ArticleEditor({ categories: initialCategories, initialData }: ArticleEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isProcessingSave, setIsProcessingSave] = useState(false);
  const editorRef = useRef<EditorJsRef>(null);

  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>(initialCategories);
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initialData?.status || "DRAFT");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatParentId, setNewCatParentId] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsCreatingCategory(true);
    setCatError(null);

    startTransition(async () => {
      const res = await createCategory({
        name: newCatName.trim(),
        parentId: newCatParentId || undefined,
      });

      if (res.success && res.data) {
        const newCat: CategoryOption = {
          id: res.data.id,
          name: res.data.name,
        };
        const updatedList = [...categoriesList, newCat];
        setCategoriesList(updatedList);
        setCategoryId(res.data.id);
        setIsCategoryModalOpen(false);
        setNewCatName("");
        setNewCatParentId("");
      } else {
        setCatError(res.error || "Kategori oluşturulamadı.");
      }
      setIsCreatingCategory(false);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setIsProcessingSave(true);

    let latestContent = content;
    let autoCoverImage: string | null = initialData?.coverImage || null;

    // 🎓 Editör içeriğini kaydet ve geçici resimleri kalıcı sunucuya yükle
    if (editorRef.current) {
      try {
        const saveResult = await editorRef.current.save();
        latestContent = saveResult.content;
        if (saveResult.coverImage) {
          autoCoverImage = saveResult.coverImage;
        }
        setContent(latestContent);
      } catch (err: any) {
        console.error("Failed to process and upload editor content:", err);
        setErrorMsg(err?.message || "Görseller yüklenirken veya editör kaydedilirken bir hata oluştu.");
        setIsProcessingSave(false);
        return;
      }
    }

    startTransition(async () => {
      let res;
      if (initialData?.id) {
        res = await updateArticle(initialData.id, {
          title: title.trim(),
          content: latestContent,
          coverImage: autoCoverImage || undefined,
          categoryId: categoryId || undefined,
          status,
        });
      } else {
        res = await createArticle({
          title: title.trim(),
          content: latestContent,
          coverImage: autoCoverImage || undefined,
          categoryId: categoryId || undefined,
          status,
        });
      }

      if (res.success) {
        router.push("/admin/articles");
        router.refresh();
      } else {
        setErrorMsg(res.error || "İşlem sırasında hata oluştu.");
      }
      setIsProcessingSave(false);
    });
  }

  const isSubmitting = isPending || isProcessingSave;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 relative">
        {/* Sticky Header with Actions - Docks below main admin header */}
        <div className="sticky top-16 z-30 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 bg-background/95 backdrop-blur-md py-2.5 sm:py-3.5 border-b border-border/60 -mx-4 px-4 sm:-mx-8 sm:px-8 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              İptal
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap sm:flex-nowrap">
            {/* Category Select + Quick Add Button */}
            <div className="flex items-center gap-1">
              <select
                value={categoryId}
                onChange={(e) => {
                  if (e.target.value === "__create_new__") {
                    setIsCategoryModalOpen(true);
                  } else {
                    setCategoryId(e.target.value);
                  }
                }}
                className="rounded-md border border-input bg-background pl-3 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm font-medium max-w-[150px] sm:max-w-[240px] truncate cursor-pointer"
              >
                <option value="">Kategori Seçin</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.displayName || cat.name}
                  </option>
                ))}
                <option value="__create_new__" className="text-red-600 font-bold">
                  + Yeni Kategori Ekle...
                </option>
              </select>

              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                title="Hemen Yeni Kategori Ekle"
                className="inline-flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-md bg-muted hover:bg-red-600/10 hover:text-red-600 text-muted-foreground transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
              className="rounded-md border border-input bg-background pl-3 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm font-medium cursor-pointer"
            >
              <option value="DRAFT">Taslak</option>
              <option value="PUBLISHED">Yayınla</option>
            </select>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                "Kaydet"
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400 break-words">
            {errorMsg}
          </div>
        )}

        {/* Kategori Yok Uyarısı ve Hızlı Ekleme Butonu */}
        {categoriesList.length === 0 && (
          <div className="max-w-6xl w-full mx-auto rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Sistemde henüz hiç kategori bulunmuyor. Makalenizi gruplamak için hemen bir kategori oluşturabilirsiniz.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Kategori Oluştur</span>
            </button>
          </div>
        )}

        {/* Editor Content Area */}
        <div className="max-w-6xl w-full mx-auto space-y-6 pt-4">
          
          {/* Title Input */}
          <div className="border-b border-border/60 pb-6">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Makale Başlığı..."
              className="w-full bg-transparent text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl border-none outline-none focus:ring-0 placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Editor.js Editor */}
          <div className="min-h-[500px] pt-4">
            <EditorJsEditor 
              ref={editorRef}
              initialContent={initialData?.content} 
              onChange={(jsonString) => setContent(jsonString)} 
            />
          </div>
        </div>
      </form>

      {/* Quick Category Modal Popup */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-lg text-foreground">Yeni Kategori Oluştur</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {catError && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-xs font-semibold text-destructive break-words leading-relaxed max-h-32 overflow-y-auto">
                ⚠️ {catError}
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Kategori Adı *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="ör. .NET, ASP.NET Core, Docker"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Üst Kategori (Opsiyonel)</label>
                <select
                  value={newCatParentId}
                  onChange={(e) => setNewCatParentId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
                >
                  <option value="">(Yok - Ana Kategori)</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold hover:bg-accent transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategory || !newCatName.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isCreatingCategory ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Ekleniyor...</span>
                    </>
                  ) : (
                    "Kategori Ekle"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
