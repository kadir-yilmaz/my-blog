// ==========================================
// 🎓 Prisma Client Singleton (Prisma 7 Postgres Adapter Pattern)
// ==========================================

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

let connectionString = process.env.DATABASE_URL;

// Build esnasında (Portainer) ortam değişkeni henüz gelmemiş olabilir
if (!connectionString) {
  console.warn("⚠️ DATABASE_URL bulunamadı. Build aşaması olduğu varsayılıyor.");
  connectionString = "postgresql://dummy:dummy@localhost:5432/dummy";
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

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
