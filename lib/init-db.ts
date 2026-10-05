// ==========================================
// 🎓 Database Auto Initialization & Seed
// ==========================================

import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function ensureDefaultAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const defaultPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !defaultPassword) {
      return;
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    }).catch(() => null);

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
    const categoryCount = await prisma.category.count().catch(() => 0);
    if (categoryCount > 0) return;

    console.log("🌱 [Auto-Init] Hiyerarşik teknoloji kategorileri yükleniyor...");

    // 1. Root Categories
    const backendRoot = await prisma.category.upsert({
      where: { id: "cat-root-backend" },
      update: {},
      create: { id: "cat-root-backend", name: "Backend", order: 1 },
    });

    const dbRoot = await prisma.category.upsert({
      where: { id: "cat-root-databases" },
      update: {},
      create: { id: "cat-root-databases", name: "Veritabanları (SQL & NoSQL)", order: 2 },
    });

    const frontendRoot = await prisma.category.upsert({
      where: { id: "cat-root-frontend" },
      update: {},
      create: { id: "cat-root-frontend", name: "Frontend", order: 3 },
    });

    const devopsRoot = await prisma.category.upsert({
      where: { id: "cat-root-devops" },
      update: {},
      create: { id: "cat-root-devops", name: "DevOps & Altyapı", order: 4 },
    });

    // 2. Backend Subcategories
    await Promise.all([
      prisma.category.upsert({ where: { id: "cat-aspnet-api" }, update: {}, create: { id: "cat-aspnet-api", name: "ASP.NET Core Web API", parentId: backendRoot.id, order: 1 } }),
      prisma.category.upsert({ where: { id: "cat-signalr" }, update: {}, create: { id: "cat-signalr", name: "SignalR", parentId: backendRoot.id, order: 2 } }),
      prisma.category.upsert({ where: { id: "cat-rabbitmq" }, update: {}, create: { id: "cat-rabbitmq", name: "RabbitMQ", parentId: backendRoot.id, order: 3 } }),
      prisma.category.upsert({ where: { id: "cat-redis-backend" }, update: {}, create: { id: "cat-redis-backend", name: "Redis", parentId: backendRoot.id, order: 4 } }),
      prisma.category.upsert({ where: { id: "cat-elasticsearch" }, update: {}, create: { id: "cat-elasticsearch", name: "Elasticsearch", parentId: backendRoot.id, order: 5 } }),
      prisma.category.upsert({ where: { id: "cat-yarp" }, update: {}, create: { id: "cat-yarp", name: "YARP", parentId: backendRoot.id, order: 6 } }),
      prisma.category.upsert({ where: { id: "cat-ocelot" }, update: {}, create: { id: "cat-ocelot", name: "Ocelot", parentId: backendRoot.id, order: 7 } }),
      prisma.category.upsert({ where: { id: "cat-keycloak" }, update: {}, create: { id: "cat-keycloak", name: "Keycloak", parentId: backendRoot.id, order: 8 } }),
      prisma.category.upsert({ where: { id: "cat-identityserver" }, update: {}, create: { id: "cat-identityserver", name: "IdentityServer", parentId: backendRoot.id, order: 9 } }),
      prisma.category.upsert({ where: { id: "cat-go" }, update: {}, create: { id: "cat-go", name: "Go", parentId: backendRoot.id, order: 10 } }),
      prisma.category.upsert({ where: { id: "cat-django" }, update: {}, create: { id: "cat-django", name: "Django", parentId: backendRoot.id, order: 11 } }),
    ]);

    // 3. Database Subcategories
    const sqlGroup = await prisma.category.upsert({
      where: { id: "cat-group-sql" },
      update: {},
      create: { id: "cat-group-sql", name: "SQL (İlişkisel)", parentId: dbRoot.id, order: 1 },
    });

    const nosqlGroup = await prisma.category.upsert({
      where: { id: "cat-group-nosql" },
      update: {},
      create: { id: "cat-group-nosql", name: "NoSQL", parentId: dbRoot.id, order: 2 },
    });

    await Promise.all([
      prisma.category.upsert({ where: { id: "cat-sqlserver" }, update: {}, create: { id: "cat-sqlserver", name: "SQL Server", parentId: sqlGroup.id, order: 1 } }),
      prisma.category.upsert({ where: { id: "cat-postgres" }, update: {}, create: { id: "cat-postgres", name: "PostgreSQL", parentId: sqlGroup.id, order: 2 } }),
      prisma.category.upsert({ where: { id: "cat-mongodb" }, update: {}, create: { id: "cat-mongodb", name: "MongoDB", parentId: nosqlGroup.id, order: 1 } }),
      prisma.category.upsert({ where: { id: "cat-redis-db" }, update: {}, create: { id: "cat-redis-db", name: "Redis", parentId: nosqlGroup.id, order: 2 } }),
    ]);

    // 4. Frontend Subcategories
    await Promise.all([
      prisma.category.upsert({ where: { id: "cat-nextjs" }, update: {}, create: { id: "cat-nextjs", name: "Next.js", parentId: frontendRoot.id, order: 1 } }),
      prisma.category.upsert({ where: { id: "cat-react" }, update: {}, create: { id: "cat-react", name: "React", parentId: frontendRoot.id, order: 2 } }),
      prisma.category.upsert({ where: { id: "cat-aspnet-mvc" }, update: {}, create: { id: "cat-aspnet-mvc", name: "ASP.NET Core MVC", parentId: frontendRoot.id, order: 3 } }),
    ]);

    // 5. DevOps Subcategories
    const containersGroup = await prisma.category.upsert({
      where: { id: "cat-group-containers" },
      update: {},
      create: { id: "cat-group-containers", name: "Konteyner & Orkestrasyon", parentId: devopsRoot.id, order: 1 },
    });

    const cicdGroup = await prisma.category.upsert({
      where: { id: "cat-group-cicd" },
      update: {},
      create: { id: "cat-group-cicd", name: "CI / CD Otomasyon", parentId: devopsRoot.id, order: 2 },
    });

    const serverNetGroup = await prisma.category.upsert({
      where: { id: "cat-group-servernet" },
      update: {},
      create: { id: "cat-group-servernet", name: "Sunucu & Ağ Yönetimi", parentId: devopsRoot.id, order: 3 },
    });

    await Promise.all([
      prisma.category.upsert({ where: { id: "cat-docker" }, update: {}, create: { id: "cat-docker", name: "Docker", parentId: containersGroup.id, order: 1 } }),
      prisma.category.upsert({ where: { id: "cat-kubernetes" }, update: {}, create: { id: "cat-kubernetes", name: "Kubernetes", parentId: containersGroup.id, order: 2 } }),
      prisma.category.upsert({ where: { id: "cat-github-actions" }, update: {}, create: { id: "cat-github-actions", name: "GitHub Actions", parentId: cicdGroup.id, order: 1 } }),
      prisma.category.upsert({ where: { id: "cat-jenkins" }, update: {}, create: { id: "cat-jenkins", name: "Jenkins", parentId: cicdGroup.id, order: 2 } }),
      prisma.category.upsert({ where: { id: "cat-dokploy" }, update: {}, create: { id: "cat-dokploy", name: "Dokploy", parentId: serverNetGroup.id, order: 1 } }),
      prisma.category.upsert({ where: { id: "cat-cloudflare" }, update: {}, create: { id: "cat-cloudflare", name: "Cloudflare Tunnel", parentId: serverNetGroup.id, order: 2 } }),
      prisma.category.upsert({ where: { id: "cat-ubuntu" }, update: {}, create: { id: "cat-ubuntu", name: "Ubuntu Server", parentId: serverNetGroup.id, order: 3 } }),
    ]);

    console.log("✅ [Auto-Init] Tüm hiyerarşik kategoriler başarıyla oluşturuldu.");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn("⚠️ [Auto-Init] Kategori yükleme uyarısı:", msg);
  }
}

export async function initializeDatabase() {
  await ensureDefaultAdmin();
  await ensureInitialCategories();
}
