// ==========================================
// 🎓 Auth.js Route Handler
// ==========================================
// Bu dosya Auth.js'in HTTP endpoint'lerini oluşturur:
//   GET  /api/auth/signin     → Login sayfası
//   POST /api/auth/signin     → Login işlemi
//   GET  /api/auth/signout    → Logout
//   POST /api/auth/signout    → Logout işlemi
//   GET  /api/auth/session    → Session bilgisi (JSON)
//   GET  /api/auth/providers  → Aktif provider'lar
//   GET  /api/auth/callback/* → OAuth callback
//
// [...nextauth] catch-all route: Auth.js'in tüm endpoint'lerini tek dosyada yönetir
// Dynamic segment: /api/auth/signin, /api/auth/callback/github vb. hepsi bu dosyaya düşer

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
