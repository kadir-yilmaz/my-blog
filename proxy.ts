// ==========================================
// 🎓 proxy.ts — Next.js 16 Network Proxy
// ==========================================
// ⚡ Next.js 16 Değişikliği: middleware.ts → proxy.ts
//
// Bu dosya nedir?
// Her HTTP isteği sunucuya ulaşmadan önce bu dosyadan geçer.
// Edge Runtime'da çalışır (Node.js değil) → çok hızlı, çok hafif.
//
// Ne için kullanılır?
// - Auth kontrolü (giriş yapmamış kullanıcıları yönlendir)
// - Route koruması (/admin/* sadece admin'e açık)
// - Redirect'ler ve rewrite'lar
//
// Ne için KULLANILMAMALI?
// - Veritabanı sorguları (Edge'de Prisma çalışmaz)
// - Ağır iş mantığı (her istekte çalışır, hafif olmalı)
// - Dosya sistemi işlemleri
//
// 🎓 Edge Runtime vs Node.js Runtime:
// Edge: ~1ms cold start, sınırlı API, global CDN'lerde çalışır
// Node.js: ~100ms cold start, tam API, tek server'da çalışır
// proxy.ts her zaman Edge'de çalışır (seçilemez)

import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";

// 🎓 Auth.js'in edge-safe config'inden auth proxy'si oluştur
// Bu, her istekte JWT token'ı doğrular ve authorized() callback'ini çağırır
const { auth } = NextAuth(authConfig);

// 🎓 Next.js 16'da export edilen fonksiyonun adı "proxy" olmalı (middleware değil)
export const proxy = auth;

// 🎓 config.matcher: proxy.ts'in hangi route'larda çalışacağını belirler
// Belirtilmezse TÜM isteklerde çalışır (performans sorunu!)
// Aşağıdaki pattern: static dosyalar ve API auth endpoint'leri hariç her yerde çalışır
export const config = {
  matcher: [
    // ⚡ Static dosyaları, resimleri ve favicon'u ATLA
    // Bunlar için auth kontrolü gereksiz
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
