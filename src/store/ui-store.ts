// 🎓 Zustand — Theme Store
// Neden Zustand?
// - Redux'a göre çok daha az boilerplate
// - Provider wrapper gerektirmez (ama biz next-themes kullanıyoruz)
// - Küçük bundle size (~1KB)
// - TypeScript-first
//
// Bu store şimdilik minimal. Faz 3'te editor-store ve search-store eklenecek.
// Theme için next-themes yeterli ama Zustand'ı öğrenmek adına
// ek UI state'leri burada yönetilecek.

import { create } from "zustand";

interface UIStore {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));

// 🎓 Zustand Kullanım:
// import { useUIStore } from "@/store/ui-store";
// const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
//
// Zustand vs Context API:
// - Context: Provider gerektirir, re-render problemi var
// - Zustand: Provider yok, selector ile sadece ilgili parça re-render olur
// - Zustand: DevTools desteği, persist middleware, immer middleware
