"use client";

// ==========================================
// 🎓 Modern Full-Width Hierarchical Category Manager
// ==========================================

import { useState, useTransition } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/admin.actions";
import {
  Folder,
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  Loader2,
  FolderPlus,
  Layers,
} from "lucide-react";
import { getCategorySlug } from "@/lib/slug";

export interface CategoryItem {
  id: string;
  name: string;
  parentId: string | null;
  parent?: { name: string } | null;
  _count?: { articles: number };
}

interface CategoryManagerProps {
  initialCategories: CategoryItem[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Varsayılan olarak tüm ana kategorileri açık başlat
    return new Set(initialCategories.filter((c) => !c.parentId).map((c) => c.id));
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalParentId, setModalParentId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Ağaç Yapısını Oluştur (Tree Builder)
  const rootCategories = categories.filter((cat) => !cat.parentId);
  const getChildren = (parentId: string) => categories.filter((cat) => cat.parentId === parentId);

  // Toplam makale sayısını (alt kategoriler dahil) hesaplar
  const getTotalArticleCount = (catId: string): number => {
    const current = categories.find((c) => c.id === catId);
    const directCount = current?._count?.articles || 0;
    const children = getChildren(catId);
    const childrenCount = children.reduce((sum, child) => sum + getTotalArticleCount(child.id), 0);
    return directCount + childrenCount;
  };

  // Aç / Kapa (Accordion)
  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Yeni Kategori Modalını Aç
  function openCreateModal(parentId: string = "") {
    setEditingCategory(null);
    setModalName("");
    setModalParentId(parentId);
    setErrorMsg(null);
    setIsModalOpen(true);
  }

  // Düzenleme Modalını Aç
  function openEditModal(category: CategoryItem) {
    setEditingCategory(category);
    setModalName(category.name);
    setModalParentId(category.parentId || "");
    setErrorMsg(null);
    setIsModalOpen(true);
  }

  // Kaydet (Create or Update)
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!modalName.trim()) return;

    setErrorMsg(null);

    startTransition(async () => {
      if (editingCategory) {
        // Güncelleme
        const res = await updateCategory(editingCategory.id, {
          name: modalName.trim(),
          parentId: modalParentId || null,
        });

        if (res.success && res.data) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingCategory.id
                ? {
                    ...c,
                    name: res.data.name,
                    parentId: res.data.parentId,
                    parent: categories.find((p) => p.id === modalParentId) || null,
                  }
                : c
            )
          );
          setIsModalOpen(false);
        } else {
          setErrorMsg(res.error || "Kategori güncellenemedi.");
        }
      } else {
        // Yeni Oluşturma
        const res = await createCategory({
          name: modalName.trim(),
          parentId: modalParentId || undefined,
        });

        if (res.success && res.data) {
          const newCategory: CategoryItem = {
            id: res.data.id,
            name: res.data.name,
            parentId: res.data.parentId,
            parent: categories.find((p) => p.id === modalParentId) || null,
            _count: { articles: 0 },
          };
          setCategories((prev) => [...prev, newCategory]);
          if (modalParentId) {
            setExpandedIds((prev) => new Set([...prev, modalParentId]));
          }
          setIsModalOpen(false);
        } else {
          setErrorMsg(res.error || "Kategori oluşturulamadı.");
        }
      }
    });
  }

  // Sil
  function handleDelete(category: CategoryItem) {
    const hasChildren = getChildren(category.id).length > 0;
    const confirmMessage = hasChildren
      ? `"${category.name}" kategorisini ve altındaki tüm bağlı kategorileri silmek istediğinize emin misiniz?`
      : `"${category.name}" kategorisini silmek istediğinize emin misiniz?`;

    if (!confirm(confirmMessage)) return;

    startTransition(async () => {
      const res = await deleteCategory(category.id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== category.id && c.parentId !== category.id));
      } else {
        alert(res.error || "Kategori silinemedi.");
      }
    });
  }

  // Hiyerarşik Kategori Satırı Renderlayıcı (Recursive Item Renderer)
  const renderCategoryRow = (category: CategoryItem, depth: number = 0) => {
    const children = getChildren(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(category.id);
    const totalArticles = getTotalArticleCount(category.id);
    const dynamicSlug = getCategorySlug(category.name, category.id);

    return (
      <div key={category.id} className="border-b border-border/50 last:border-b-0">
        {/* Satır */}
        <div
          className={`flex items-center justify-between px-4 py-3.5 sm:px-6 hover:bg-muted/40 transition-colors ${
            depth > 0 ? "bg-muted/15" : "bg-card"
          }`}
          style={{ paddingLeft: `${Math.max(16, depth * 28 + 16)}px` }}
        >
          {/* Sol: İkon, Ad, Makale Sayısı ve Dinamik Slug */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {/* Açılır Kapanır Ok */}
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(category.id)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            ) : (
              <div className="w-6" /> // Hizalama için boşluk
            )}

            {/* Klasör İkonu */}
            {depth === 0 ? (
              <Folder className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />
            ) : depth === 1 ? (
              <FolderTree className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            ) : (
              <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
            )}

            {/* Kategori Adı ve Sayı */}
            <div className="flex items-center gap-2 truncate">
              <span className={`text-sm truncate ${depth === 0 ? "font-bold text-foreground" : "font-medium text-foreground/90"}`}>
                {category.name}
              </span>
              <span className="text-xs text-muted-foreground font-semibold px-1.5 py-0.5 rounded-full bg-muted">
                ({totalArticles})
              </span>
            </div>

            {/* Dinamik Slug Badge (küçük ekranlarda gizlenir) */}
            <span className="hidden md:inline-flex text-[11px] font-mono text-muted-foreground/70 bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
              {dynamicSlug}
            </span>
          </div>

          {/* Sağ: İşlem Butonları (+, ✏️, 🗑️) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-2">
            {/* Alt Kategori Ekle (+) */}
            <button
              type="button"
              onClick={() => openCreateModal(category.id)}
              title={`"${category.name}" altına alt kategori ekle`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-500/15 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Düzenle (✏️) */}
            <button
              type="button"
              onClick={() => openEditModal(category)}
              title="Kategoriyi Düzenle"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {/* Sil (🗑️) */}
            <button
              type="button"
              onClick={() => handleDelete(category)}
              title="Kategoriyi Sil"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Alt Kategoriler (Açık ise) */}
        {hasChildren && isExpanded && (
          <div className="divide-y divide-border/40">
            {children.map((child) => renderCategoryRow(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Yeni Kategori Butonu Barı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Kategori Yönetimi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kategorileri hiyerarşik olarak yönetebilir, yeni alt dallar ekleyebilirsiniz.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal("")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:from-red-700 hover:to-red-800 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Yeni Kategori</span>
        </button>
      </div>

      {/* Tam Boy Hiyerarşik Kategori Listesi Kartı */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FolderPlus className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-foreground">Henüz kategori bulunmuyor</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Makalelerinizi organize etmek ve menüde listelemek için ilk kategorinizi oluşturun.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCreateModal("")}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>İlk Kategoriyi Oluştur</span>
            </button>
          </div>
        ) : (
          <div>{rootCategories.map((rootCat) => renderCategoryRow(rootCat, 0))}</div>
        )}
      </div>

      {/* Modal Popup (Ekleme ve Düzenleme) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-lg text-foreground">
                  {editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Oluştur"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Display (No overflow) */}
            {errorMsg && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-xs font-semibold text-destructive break-words leading-relaxed max-h-32 overflow-y-auto">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Kategori Adı *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="ör. .NET, ASP.NET Core, Docker"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Üst Kategori (Opsiyonel)</label>
                <select
                  value={modalParentId}
                  onChange={(e) => setModalParentId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
                >
                  <option value="">(Yok - Ana Kategori)</option>
                  {categories
                    .filter((c) => (editingCategory ? c.id !== editingCategory.id : true))
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground border border-border/50">
                💡 <strong>Dinamik URL:</strong> Slug elle girilmez, <code>{getCategorySlug(modalName || "kategori-adi", "id")}</code> formatında otomatik üretilir.
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold hover:bg-accent transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isPending || !modalName.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : editingCategory ? (
                    "Güncelle"
                  ) : (
                    "Kategori Ekle"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
