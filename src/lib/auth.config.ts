// ==========================================
// 🎓 Auth.js v5 — Edge-Compatible Config
// ==========================================
// Bu dosya proxy.ts (eski adıyla middleware.ts) tarafından import edilir.
// Edge Runtime'da çalışır → Prisma, bcrypt gibi Node.js-only kütüphaneler KULLANILAMAZ.
//
// Neden ayrı dosya?
// - proxy.ts Edge Runtime'da çalışır (Cloudflare Workers benzeri)
// - Prisma Adapter Node.js gerektirir (Edge'de çalışmaz)
// - Bu yüzden Auth.js config'i ikiye bölünür:
//   1. auth.config.ts → Edge-safe (burada): sadece provider tanımları ve basit callback'ler
//   2. auth.ts → Node.js-only: Prisma Adapter, user enrich, password hash

import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export default {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    // 🎓 GitHub OAuth Provider
    // Kullanıcı GitHub hesabıyla giriş yapabilir
    // GitHub Developer Settings'ten Client ID ve Secret alınır
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),

    // 🎓 Google OAuth Provider
    // Google Cloud Console'dan Client ID ve Secret alınır
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),

    // 🎓 Credentials Provider
    // Email + password ile giriş (klasik login)
    // authorize() fonksiyonu auth.ts'de tanımlanacak (bcrypt edge'de çalışmaz)
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // authorize burada tanımlanmıyor çünkü bcrypt edge'de çalışmaz
      // auth.ts'de override edilecek
      authorize: async () => null,
    }),
  ],

  // 🎓 Route tanımları
  pages: {
    signIn: "/login",       // Default /api/auth/signin yerine custom login sayfamız
    // signOut: "/logout",  // Gerekirse custom signout sayfası
    // error: "/auth/error", // Auth hataları için
  },

  // 🎓 Callbacks: Auth flow'un her adımında çalışan hook'lar
  callbacks: {
    // authorized(): proxy.ts tarafından çağrılır
    // Route koruması burada yapılır
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.isAdmin === true;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

      // Admin rotalarına sadece admin erişebilir
      if (isAdminRoute) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
        if (!isAdmin) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Login/Register sayfalarına zaten giriş yapmış kullanıcı erişemez
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
// 🎓 `satisfies` vs `as`:
// satisfies: Tipi kontrol eder ama orijinal tipi korur (daha güvenli)
// as: Tipi zorla dönüştürür (tip güvenliği kaybolabilir)
