// ==========================================
// 🎓 Auth.js v5 — Full Configuration (Node.js)
// ==========================================

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import authConfig from "./auth.config";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    ...authConfig.providers.filter((p) => p.id !== "credentials"),
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        const defaultAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const defaultAdminPassword = process.env.ADMIN_PASSWORD;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user && user.hashedPassword) {
            const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
            if (isPasswordValid) {
              console.log(`[Auth] Database login successful for (${email})`);
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                isAdmin: user.isAdmin,
              };
            }
          }
        } catch (dbError) {
          console.warn("[Auth] Veritabanı henüz hazır değil veya erişilemedi, ortam değişkenleri kontrol ediliyor...");
        }

        // Varsayılan Admin Kontrolü (.env ortam değişkenlerinden)
        if (defaultAdminEmail && defaultAdminPassword && email === defaultAdminEmail && password === defaultAdminPassword) {
          console.log(`[Auth] Environment admin login successful for (${email})`);
          return {
            id: "default-admin-1",
            email: defaultAdminEmail,
            name: "Admin",
            image: null,
            isAdmin: true,
          };
        }

        console.log(`[Auth] Login attempt failed: Invalid credentials for (${email})`);
        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
});
