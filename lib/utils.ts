// ==========================================
// 🎓 Utility Functions
// ==========================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// cn(): Tailwind CSS class'larını birleştir + çakışmaları çöz
// 🎓 clsx: conditional class oluşturur → clsx("p-4", isActive && "bg-blue-500")
// 🎓 twMerge: çakışan Tailwind class'larını çözer → twMerge("p-2 p-4") → "p-4"
// shadcn/ui bu fonksiyonu kullanır
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Slug oluştur: "Merhaba Dünya!" → "merhaba-dunya"
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")        // Boşlukları tire yap
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/[şŞ]/g, "s")
    .replace(/[ıİ]/g, "i")
    .replace(/[ğĞ]/g, "g")
    .replace(/[^\w-]+/g, "")     // Alfanumerik olmayan karakterleri kaldır
    .replace(/--+/g, "-")        // Çoklu tireleri tekleştir
    .replace(/^-+/, "")          // Baştaki tireleri kaldır
    .replace(/-+$/, "");         // Sondaki tireleri kaldır
}

// Tarih formatla: "22 Temmuz 2026"
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// Okuma süresi hesapla (ortalama 200 kelime/dakika)
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// Markdown'dan excerpt oluştur (ilk N karakteri al, tag'leri temizle)
export function createExcerpt(content: string, length: number = 160): string {
  return content
    .replace(/#{1,6}\s/g, "")    // Heading'leri kaldır
    .replace(/[*_~`]/g, "")      // Markdown formatlamayı kaldır
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Link'leri text'e çevir
    .replace(/```[\s\S]*?```/g, "") // Kod bloklarını kaldır
    .replace(/\n+/g, " ")         // Satır sonlarını boşluğa çevir
    .trim()
    .slice(0, length)
    .trim() + (content.length > length ? "..." : "");
}
