// ==========================================
// 🎓 Prisma Client Singleton (Prisma 7 SQL Server Adapter Pattern)
// ==========================================
// Prisma 7 ile birlikte veritabanı sürücüleri "adapter" mimarisine geçti.
// Microsoft SQL Server için @prisma/adapter-mssql kullanılır.
// Next.js development hot reload esnasında bağlantı havuzunun (connection pool)
// tükenmesini engellemek için singleton pattern kullanılmaya devam edilir.

import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL ortam değişkeni bulunamadı. Lütfen .env dosyanızı veya secret ayarlarınızı kontrol edin.");
}

const adapter = new PrismaMssql(connectionString);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
