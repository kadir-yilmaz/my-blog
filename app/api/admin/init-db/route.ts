// ==========================================
// 🎓 Admin Database Initialization Endpoint
// ==========================================
// Veritabanı tablolarını ve seed verilerini manuel olarak tetiklemek ve kontrol etmek için kullanılır.
// GET /api/admin/init-db

import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/init-db";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("⚡ [API:init-db] Veritabanı başlatma işlemi tetiklendi...");
    await initializeDatabase();

    const [userCount, categoryCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.category.count().catch(() => 0),
    ]);

    return NextResponse.json({
      success: true,
      message: "Veritabanı tabloları ve başlangıç verileri başarıyla hazırlandı.",
      stats: {
        users: userCount,
        categories: categoryCount,
      },
    });
  } catch (error: any) {
    console.error("❌ [API:init-db] Hata:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
