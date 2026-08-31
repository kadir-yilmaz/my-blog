// ==========================================
// 🎓 Next.js Instrumentation Hook
// ==========================================
// Next.js server başladığında otomatik olarak 1 kez çalışır.
// Veritabanı oto-migration/admin yüklemesini ve başlangıç ayarlarını tetikler.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializeDatabase } = await import("@/lib/init-db");
    await initializeDatabase();
  }
}
