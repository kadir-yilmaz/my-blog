// ==========================================
// 🎓 Database Auto Initialization & Auto-Migrate
// ==========================================

import { execSync } from "child_process";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function runAutoMigrate(): Promise<boolean> {
  if (process.env.AUTO_MIGRATE === "false") {
    return true;
  }

  try {
    console.log("🔄 [Auto-Migrate] SQL Server şeması kontrol ediliyor (Prisma db push)...");
    execSync("npx prisma db push --skip-generate", {
      stdio: "pipe",
      env: { ...process.env },
    });
    console.log("✅ [Auto-Migrate] Veritabanı tabloları SQL Server üzerinde başarıyla güncellendi.");
    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn("⚠️ [Auto-Migrate] Otomatik şema güncelleme atlandı veya ertelendi:", msg);
    return false;
  }
}

export async function ensureDefaultAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const defaultPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !defaultPassword) {
      return;
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: "Kadir Yılmaz",
          hashedPassword,
          isAdmin: true,
          bio: "Software Engineer",
        },
      });
      console.log(`✅ [Auto-Init] Varsayılan admin kullanıcısı (${adminEmail}) oluşturuldu.`);
    } else if (!existingAdmin.isAdmin || !existingAdmin.hashedPassword) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          isAdmin: true,
          hashedPassword,
        },
      });
      console.log(`✅ [Auto-Init] Admin yetkileri ve parolası senkronize edildi: ${adminEmail}.`);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn("⚠️ [Auto-Init] Admin kullanıcı kontrolü ertelendi:", msg);
  }
}

export async function ensureInitialCategories() {
  try {
    const categoryCount = await prisma.category.count();
    if (categoryCount > 0) return;

    console.log("🌱 [Auto-Init] Hiyerarşik teknoloji kategorileri yükleniyor...");

    // ==========================================
    // 1. Root Categories
    // ==========================================
    const backendRoot = await prisma.category.create({
      data: { name: "Backend", order: 1 },
    });

    const dbRoot = await prisma.category.create({
      data: { name: "Veritabanları (SQL & NoSQL)", order: 2 },
    });

    const frontendRoot = await prisma.category.create({
      data: { name: "Frontend", order: 3 },
    });

    const devopsRoot = await prisma.category.create({
      data: { name: "DevOps & Altyapı", order: 4 },
    });

    // ==========================================
    // 2. Backend Subcategories
    // ==========================================
    await Promise.all([
      prisma.category.create({ data: { name: "ASP.NET Core Web API", parentId: backendRoot.id, order: 1 } }),
      prisma.category.create({ data: { name: "SignalR", parentId: backendRoot.id, order: 2 } }),
      prisma.category.create({ data: { name: "RabbitMQ", parentId: backendRoot.id, order: 3 } }),
      prisma.category.create({ data: { name: "Redis", parentId: backendRoot.id, order: 4 } }),
      prisma.category.create({ data: { name: "Elasticsearch", parentId: backendRoot.id, order: 5 } }),
      prisma.category.create({ data: { name: "YARP", parentId: backendRoot.id, order: 6 } }),
      prisma.category.create({ data: { name: "Ocelot", parentId: backendRoot.id, order: 7 } }),
      prisma.category.create({ data: { name: "Keycloak", parentId: backendRoot.id, order: 8 } }),
      prisma.category.create({ data: { name: "IdentityServer", parentId: backendRoot.id, order: 9 } }),
      prisma.category.create({ data: { name: "Go", parentId: backendRoot.id, order: 10 } }),
      prisma.category.create({ data: { name: "Django", parentId: backendRoot.id, order: 11 } }),
    ]);

    // ==========================================
    // 3. Database Subcategories
    // ==========================================
    const [sqlGroup, nosqlGroup] = await Promise.all([
      prisma.category.create({ data: { name: "SQL (İlişkisel)", parentId: dbRoot.id, order: 1 } }),
      prisma.category.create({ data: { name: "NoSQL", parentId: dbRoot.id, order: 2 } }),
    ]);

    await Promise.all([
      prisma.category.create({ data: { name: "SQL Server", parentId: sqlGroup.id, order: 1 } }),
      prisma.category.create({ data: { name: "PostgreSQL", parentId: sqlGroup.id, order: 2 } }),
      prisma.category.create({ data: { name: "MongoDB", parentId: nosqlGroup.id, order: 1 } }),
      prisma.category.create({ data: { name: "Redis", parentId: nosqlGroup.id, order: 2 } }),
    ]);

    // ==========================================
    // 4. Frontend Subcategories
    // ==========================================
    await Promise.all([
      prisma.category.create({ data: { name: "Next.js", parentId: frontendRoot.id, order: 1 } }),
      prisma.category.create({ data: { name: "React", parentId: frontendRoot.id, order: 2 } }),
      prisma.category.create({ data: { name: "ASP.NET Core MVC", parentId: frontendRoot.id, order: 3 } }),
    ]);

    // ==========================================
    // 5. DevOps Subcategories
    // ==========================================
    const [containersGroup, cicdGroup, serverNetGroup] = await Promise.all([
      prisma.category.create({ data: { name: "Konteyner & Orkestrasyon", parentId: devopsRoot.id, order: 1 } }),
      prisma.category.create({ data: { name: "CI / CD Otomasyon", parentId: devopsRoot.id, order: 2 } }),
      prisma.category.create({ data: { name: "Sunucu & Ağ Yönetimi", parentId: devopsRoot.id, order: 3 } }),
    ]);

    await Promise.all([
      prisma.category.create({ data: { name: "Docker", parentId: containersGroup.id, order: 1 } }),
      prisma.category.create({ data: { name: "Kubernetes", parentId: containersGroup.id, order: 2 } }),
      prisma.category.create({ data: { name: "GitHub Actions", parentId: cicdGroup.id, order: 1 } }),
      prisma.category.create({ data: { name: "Jenkins", parentId: cicdGroup.id, order: 2 } }),
      prisma.category.create({ data: { name: "Dokploy", parentId: serverNetGroup.id, order: 1 } }),
      prisma.category.create({ data: { name: "Cloudflare Tunnel", parentId: serverNetGroup.id, order: 2 } }),
      prisma.category.create({ data: { name: "Ubuntu Server", parentId: serverNetGroup.id, order: 3 } }),
    ]);

    console.log("✅ [Auto-Init] Tüm hiyerarşik kategoriler başarıyla oluşturuldu.");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn("⚠️ [Auto-Init] Kategori yükleme uyarısı:", msg);
  }
}

export async function initializeDatabase() {
  await runAutoMigrate();
  await ensureDefaultAdmin();
  await ensureInitialCategories();
}
