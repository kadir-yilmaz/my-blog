import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // ==========================================
  // Admin User
  // ==========================================
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin+Secret123!";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      hashedPassword,
      isAdmin: true,
    },
    create: {
      email: adminEmail,
      name: "Kadir Yılmaz",
      hashedPassword,
      isAdmin: true,
      bio: "Software Engineer",
    },
  });
  console.log(`✅ Admin user created/updated: ${admin.email}`);

  // ==========================================
  // 1. Root Categories
  // ==========================================
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

  // ==========================================
  // 2. Backend Subcategories
  // ==========================================
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

  // ==========================================
  // 3. Database Subcategories
  // ==========================================
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

  // ==========================================
  // 4. Frontend Subcategories
  // ==========================================
  await Promise.all([
    prisma.category.upsert({ where: { id: "cat-nextjs" }, update: {}, create: { id: "cat-nextjs", name: "Next.js", parentId: frontendRoot.id, order: 1 } }),
    prisma.category.upsert({ where: { id: "cat-react" }, update: {}, create: { id: "cat-react", name: "React", parentId: frontendRoot.id, order: 2 } }),
    prisma.category.upsert({ where: { id: "cat-aspnet-mvc" }, update: {}, create: { id: "cat-aspnet-mvc", name: "ASP.NET Core MVC", parentId: frontendRoot.id, order: 3 } }),
  ]);

  // ==========================================
  // 5. DevOps Subcategories
  // ==========================================
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
    prisma.category.upsert({ where: { id: "cat-k8s" }, update: {}, create: { id: "cat-k8s", name: "Kubernetes", parentId: containersGroup.id, order: 2 } }),
    prisma.category.upsert({ where: { id: "cat-ghactions" }, update: {}, create: { id: "cat-ghactions", name: "GitHub Actions", parentId: cicdGroup.id, order: 1 } }),
    prisma.category.upsert({ where: { id: "cat-jenkins" }, update: {}, create: { id: "cat-jenkins", name: "Jenkins", parentId: cicdGroup.id, order: 2 } }),
    prisma.category.upsert({ where: { id: "cat-dokploy" }, update: {}, create: { id: "cat-dokploy", name: "Dokploy", parentId: serverNetGroup.id, order: 1 } }),
    prisma.category.upsert({ where: { id: "cat-cftunnel" }, update: {}, create: { id: "cat-cftunnel", name: "Cloudflare Tunnel", parentId: serverNetGroup.id, order: 2 } }),
    prisma.category.upsert({ where: { id: "cat-ubuntu" }, update: {}, create: { id: "cat-ubuntu", name: "Ubuntu Server", parentId: serverNetGroup.id, order: 3 } }),
  ]);

  console.log("✅ Categories created");

  // ==========================================
  // Tags
  // ==========================================
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { name: ".NET" }, update: {}, create: { name: ".NET", color: "#512BD4" } }),
    prisma.tag.upsert({ where: { name: "YARP" }, update: {}, create: { name: "YARP", color: "#0078D7" } }),
    prisma.tag.upsert({ where: { name: "DevOps" }, update: {}, create: { name: "DevOps", color: "#2496ED" } }),
    prisma.tag.upsert({ where: { name: "Redis" }, update: {}, create: { name: "Redis", color: "#DC382D" } }),
    prisma.tag.upsert({ where: { name: "Cloudflare" }, update: {}, create: { name: "Cloudflare", color: "#F38020" } }),
  ]);
  console.log(`✅ ${tags.length} tags created`);

  console.log("🎉 Seeding completed (Admin, Categories, Tags ready)!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
