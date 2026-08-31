// ==========================================
// 🎓 Theme Provider — next-themes Wrapper
// ==========================================
// "use client" direktifi: Bu component client-side'da çalışır
// Neden? next-themes, DOM'a erişir (document.documentElement'e class ekler)
// Server Component'lar DOM'a erişemez
//
// 🎓 "use client" ne demek?
// - Bu dosya ve import ettiği modüller client bundle'a dahil edilir
// - Server'da da render edilir (SSR) ama hydration sonrası client'ta çalışır
// - useState, useEffect, event handler'lar kullanılabilir
// - "use client" = "sadece client" değil, "client boundary başlangıcı"

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
