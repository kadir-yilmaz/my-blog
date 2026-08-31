// ==========================================
// 🎓 Database Auto Initialization & Native Pure-SQL Auto-Migrate
// ==========================================
// SQL Server üzerinde harici CLI (npx prisma db push) veya child_process çalıştırmadan,
// doğrudan Node.js DB bağlantısı üzerinden tabloları, indexleri, foreign key'leri ve
// seed verilerini (Admin & Kategoriler) otomatik olarak oluşturur.

import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SCHEMA_SQL = `
BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- 1. users
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [email] NVARCHAR(1000) NOT NULL,
    [emailVerified] DATETIME2,
    [image] NVARCHAR(1000),
    [hashedPassword] NVARCHAR(1000),
    [bio] NVARCHAR(1000),
    [isAdmin] BIT NOT NULL CONSTRAINT [users_isAdmin_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- 2. accounts
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'accounts' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[accounts] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [provider] NVARCHAR(1000) NOT NULL,
    [providerAccountId] NVARCHAR(1000) NOT NULL,
    [refresh_token] NVARCHAR(max),
    [access_token] NVARCHAR(max),
    [expires_at] INT,
    [token_type] NVARCHAR(1000),
    [scope] NVARCHAR(1000),
    [id_token] NVARCHAR(max),
    [session_state] NVARCHAR(1000),
    CONSTRAINT [accounts_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [accounts_provider_providerAccountId_key] UNIQUE NONCLUSTERED ([provider],[providerAccountId])
);

-- 3. sessions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sessions' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[sessions] (
    [id] NVARCHAR(1000) NOT NULL,
    [sessionToken] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [sessions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [sessions_sessionToken_key] UNIQUE NONCLUSTERED ([sessionToken])
);

-- 4. verification_tokens
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'verification_tokens' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[verification_tokens] (
    [identifier] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [verification_tokens_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [verification_tokens_identifier_token_key] UNIQUE NONCLUSTERED ([identifier],[token])
);

-- 5. categories
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'categories' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[categories] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [order] INT NOT NULL CONSTRAINT [categories_order_df] DEFAULT 0,
    [parentId] NVARCHAR(1000),
    CONSTRAINT [categories_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- 6. articles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'articles' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[articles] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [excerpt] NVARCHAR(max),
    [coverImage] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [articles_status_df] DEFAULT 'DRAFT',
    [readingTime] INT NOT NULL CONSTRAINT [articles_readingTime_df] DEFAULT 0,
    [publishedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [articles_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [authorId] NVARCHAR(1000) NOT NULL,
    [categoryId] NVARCHAR(1000),
    CONSTRAINT [articles_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- 7. tags
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tags' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[tags] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [color] NVARCHAR(1000) NOT NULL CONSTRAINT [tags_color_df] DEFAULT '#3B82F6',
    CONSTRAINT [tags_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [tags_name_key] UNIQUE NONCLUSTERED ([name])
);

-- 8. article_tags
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'article_tags' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[article_tags] (
    [articleId] NVARCHAR(1000) NOT NULL,
    [tagId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [article_tags_pkey] PRIMARY KEY CLUSTERED ([articleId],[tagId])
);

-- 9. comments
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'comments' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[comments] (
    [id] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [comments_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [articleId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [parentId] NVARCHAR(1000),
    CONSTRAINT [comments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- 10. likes
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'likes' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[likes] (
    [id] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [likes_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [articleId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [likes_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [likes_articleId_userId_key] UNIQUE NONCLUSTERED ([articleId],[userId])
);

-- 11. bookmarks
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bookmarks' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[bookmarks] (
    [id] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [bookmarks_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [articleId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [bookmarks_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [bookmarks_articleId_userId_key] UNIQUE NONCLUSTERED ([articleId],[userId])
);

-- 12. views
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'views' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[views] (
    [id] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [views_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [articleId] NVARCHAR(1000) NOT NULL,
    [ip] NVARCHAR(1000),
    [userAgent] NVARCHAR(1000),
    CONSTRAINT [views_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- 13. experiences
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'experiences' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[experiences] (
    [id] NVARCHAR(1000) NOT NULL,
    [company] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [startDate] DATETIME2 NOT NULL,
    [endDate] DATETIME2,
    [current] BIT NOT NULL CONSTRAINT [experiences_current_df] DEFAULT 0,
    [order] INT NOT NULL CONSTRAINT [experiences_order_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [experiences_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [experiences_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- 14. skills
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'skills' AND schema_id = SCHEMA_ID('dbo'))
CREATE TABLE [dbo].[skills] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [icon] NVARCHAR(1000),
    [proficiency] INT NOT NULL CONSTRAINT [skills_proficiency_df] DEFAULT 0,
    [order] INT NOT NULL CONSTRAINT [skills_order_df] DEFAULT 0,
    CONSTRAINT [skills_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'articles_status_publishedAt_idx' AND object_id = OBJECT_ID('dbo.articles'))
CREATE NONCLUSTERED INDEX [articles_status_publishedAt_idx] ON [dbo].[articles]([status], [publishedAt] DESC);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'articles_categoryId_idx' AND object_id = OBJECT_ID('dbo.articles'))
CREATE NONCLUSTERED INDEX [articles_categoryId_idx] ON [dbo].[articles]([categoryId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'articles_authorId_idx' AND object_id = OBJECT_ID('dbo.articles'))
CREATE NONCLUSTERED INDEX [articles_authorId_idx] ON [dbo].[articles]([authorId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'categories_parentId_idx' AND object_id = OBJECT_ID('dbo.categories'))
CREATE NONCLUSTERED INDEX [categories_parentId_idx] ON [dbo].[categories]([parentId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'comments_articleId_idx' AND object_id = OBJECT_ID('dbo.comments'))
CREATE NONCLUSTERED INDEX [comments_articleId_idx] ON [dbo].[comments]([articleId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'comments_userId_idx' AND object_id = OBJECT_ID('dbo.comments'))
CREATE NONCLUSTERED INDEX [comments_userId_idx] ON [dbo].[comments]([userId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'comments_parentId_idx' AND object_id = OBJECT_ID('dbo.comments'))
CREATE NONCLUSTERED INDEX [comments_parentId_idx] ON [dbo].[comments]([parentId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'views_articleId_idx' AND object_id = OBJECT_ID('dbo.views'))
CREATE NONCLUSTERED INDEX [views_articleId_idx] ON [dbo].[views]([articleId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'views_articleId_ip_idx' AND object_id = OBJECT_ID('dbo.views'))
CREATE NONCLUSTERED INDEX [views_articleId_ip_idx] ON [dbo].[views]([articleId], [ip]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'skills_category_idx' AND object_id = OBJECT_ID('dbo.skills'))
CREATE NONCLUSTERED INDEX [skills_category_idx] ON [dbo].[skills]([category]);

-- Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'accounts_userId_fkey')
ALTER TABLE [dbo].[accounts] ADD CONSTRAINT [accounts_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'sessions_userId_fkey')
ALTER TABLE [dbo].[sessions] ADD CONSTRAINT [sessions_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'articles_authorId_fkey')
ALTER TABLE [dbo].[articles] ADD CONSTRAINT [articles_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'articles_categoryId_fkey')
ALTER TABLE [dbo].[articles] ADD CONSTRAINT [articles_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[categories]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'categories_parentId_fkey')
ALTER TABLE [dbo].[categories] ADD CONSTRAINT [categories_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[categories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'article_tags_articleId_fkey')
ALTER TABLE [dbo].[article_tags] ADD CONSTRAINT [article_tags_articleId_fkey] FOREIGN KEY ([articleId]) REFERENCES [dbo].[articles]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'article_tags_tagId_fkey')
ALTER TABLE [dbo].[article_tags] ADD CONSTRAINT [article_tags_tagId_fkey] FOREIGN KEY ([tagId]) REFERENCES [dbo].[tags]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'comments_articleId_fkey')
ALTER TABLE [dbo].[comments] ADD CONSTRAINT [comments_articleId_fkey] FOREIGN KEY ([articleId]) REFERENCES [dbo].[articles]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'comments_userId_fkey')
ALTER TABLE [dbo].[comments] ADD CONSTRAINT [comments_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'comments_parentId_fkey')
ALTER TABLE [dbo].[comments] ADD CONSTRAINT [comments_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[comments]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'likes_articleId_fkey')
ALTER TABLE [dbo].[likes] ADD CONSTRAINT [likes_articleId_fkey] FOREIGN KEY ([articleId]) REFERENCES [dbo].[articles]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'likes_userId_fkey')
ALTER TABLE [dbo].[likes] ADD CONSTRAINT [likes_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'bookmarks_articleId_fkey')
ALTER TABLE [dbo].[bookmarks] ADD CONSTRAINT [bookmarks_articleId_fkey] FOREIGN KEY ([articleId]) REFERENCES [dbo].[articles]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'bookmarks_userId_fkey')
ALTER TABLE [dbo].[bookmarks] ADD CONSTRAINT [bookmarks_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'views_articleId_fkey')
ALTER TABLE [dbo].[views] ADD CONSTRAINT [views_articleId_fkey] FOREIGN KEY ([articleId]) REFERENCES [dbo].[articles]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH
`;

export async function runAutoMigrate(): Promise<boolean> {
  if (process.env.AUTO_MIGRATE === "false") {
    return true;
  }

  try {
    console.log("🔄 [Auto-Migrate] SQL Server şeması kontrol ediliyor...");
    
    // users ve categories tablolarının varlığını kontrol et
    const check = await prisma.$queryRawUnsafe<any[]>(
      `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'users'`
    ).catch(() => []);

    if (check.length === 0) {
      console.log("🔄 [Auto-Migrate] Tablolar bulunamadı, şema doğrudan SQL ile oluşturuluyor...");
      await prisma.$executeRawUnsafe(SCHEMA_SQL);
      console.log("✅ [Auto-Migrate] Veritabanı tabloları SQL Server üzerinde başarıyla oluşturuldu.");
    } else {
      console.log("✅ [Auto-Migrate] Tablolar mevcut, şema hazır.");
    }

    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn("⚠️ [Auto-Migrate] Otomatik şema güncelleme uyarısı:", msg);
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
  await runAutoMigrate();
  await ensureDefaultAdmin();
  await ensureInitialCategories();
}
