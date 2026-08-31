// ==========================================
// 🎓 Auth.js Type Extensions
// ==========================================
// Auth.js'in default Session ve JWT tiplerini genişletiyoruz
// isAdmin alanını ekliyoruz ki TypeScript bunu tanısın

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      isAdmin: boolean;
    };
  }

  interface User {
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
  }
}
