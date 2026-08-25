// ==========================================
// 🎓 Default Fallback Data (Categories & Featured Articles)
// ==========================================

export interface CategoryData {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  parent?: { name: string } | null;
  _count: { articles: number };
}

export interface ArticleData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED";
  readingTime: number;
  publishedAt: Date;
  categoryId: string;
  category?: { name: string };
  author?: { name: string };
  tags?: { tag: { name: string; color: string } }[];
  _count: { comments: number; likes: number; views: number };
}

export const DEFAULT_CATEGORIES: CategoryData[] = [
  // 1. Root Categories
  { id: "cat-root-backend", name: "Backend", parentId: null, order: 1, _count: { articles: 0 } },
  { id: "cat-root-databases", name: "Veritabanları (SQL & NoSQL)", parentId: null, order: 2, _count: { articles: 0 } },
  { id: "cat-root-frontend", name: "Frontend", parentId: null, order: 3, _count: { articles: 0 } },
  { id: "cat-root-devops", name: "DevOps & Altyapı", parentId: null, order: 4, _count: { articles: 0 } },

  // 2. Backend Subcategories
  { id: "cat-aspnet-api", name: "ASP.NET Core Web API", parentId: "cat-root-backend", order: 1, parent: { name: "Backend" }, _count: { articles: 0 } },
  { id: "cat-signalr", name: "SignalR", parentId: "cat-root-backend", order: 2, parent: { name: "Backend" }, _count: { articles: 0 } },
  { id: "cat-rabbitmq", name: "RabbitMQ", parentId: "cat-root-backend", order: 3, parent: { name: "Backend" }, _count: { articles: 0 } },
  { id: "cat-redis-backend", name: "Redis", parentId: "cat-root-backend", order: 4, parent: { name: "Backend" }, _count: { articles: 0 } },
  { id: "cat-elasticsearch", name: "Elasticsearch", parentId: "cat-root-backend", order: 5, parent: { name: "Backend" }, _count: { articles: 0 } },
  { id: "cat-yarp", name: "YARP", parentId: "cat-root-backend", order: 6, parent: { name: "Backend" }, _count: { articles: 0 } },
  { id: "cat-ocelot", name: "Ocelot", parentId: "cat-root-backend", order: 7, parent: { name: "Backend" }, _count: { articles: 0 } },
  { id: "cat-keycloak", name: "Keycloak", parentId: "cat-root-backend", order: 8, parent: { name: "Backend" }, _count: { articles: 0 } },
  { id: "cat-identityserver", name: "IdentityServer", parentId: "cat-root-backend", order: 9, parent: { name: "Backend" }, _count: { articles: 0 } },
  { id: "cat-go", name: "Go", parentId: "cat-root-backend", order: 10, parent: { name: "Backend" }, _count: { articles: 0 } },
  { id: "cat-django", name: "Django", parentId: "cat-root-backend", order: 11, parent: { name: "Backend" }, _count: { articles: 0 } },

  // 3. Database Subcategories
  { id: "cat-group-sql", name: "SQL (İlişkisel)", parentId: "cat-root-databases", order: 1, parent: { name: "Veritabanları (SQL & NoSQL)" }, _count: { articles: 0 } },
  { id: "cat-group-nosql", name: "NoSQL", parentId: "cat-root-databases", order: 2, parent: { name: "Veritabanları (SQL & NoSQL)" }, _count: { articles: 0 } },
  { id: "cat-sqlserver", name: "SQL Server", parentId: "cat-group-sql", order: 1, parent: { name: "SQL (İlişkisel)" }, _count: { articles: 0 } },
  { id: "cat-postgres", name: "PostgreSQL", parentId: "cat-group-sql", order: 2, parent: { name: "SQL (İlişkisel)" }, _count: { articles: 0 } },
  { id: "cat-mongodb", name: "MongoDB", parentId: "cat-group-nosql", order: 1, parent: { name: "NoSQL" }, _count: { articles: 0 } },
  { id: "cat-redis-db", name: "Redis", parentId: "cat-group-nosql", order: 2, parent: { name: "NoSQL" }, _count: { articles: 0 } },

  // 4. Frontend Subcategories
  { id: "cat-nextjs", name: "Next.js", parentId: "cat-root-frontend", order: 1, parent: { name: "Frontend" }, _count: { articles: 0 } },
  { id: "cat-react", name: "React", parentId: "cat-root-frontend", order: 2, parent: { name: "Frontend" }, _count: { articles: 0 } },
  { id: "cat-aspnet-mvc", name: "ASP.NET Core MVC", parentId: "cat-root-frontend", order: 3, parent: { name: "Frontend" }, _count: { articles: 0 } },

  // 5. DevOps Subcategories
  { id: "cat-group-containers", name: "Konteyner & Orkestrasyon", parentId: "cat-root-devops", order: 1, parent: { name: "DevOps & Altyapı" }, _count: { articles: 0 } },
  { id: "cat-group-cicd", name: "CI / CD Otomasyon", parentId: "cat-root-devops", order: 2, parent: { name: "DevOps & Altyapı" }, _count: { articles: 0 } },
  { id: "cat-group-servernet", name: "Sunucu & Ağ Yönetimi", parentId: "cat-root-devops", order: 3, parent: { name: "DevOps & Altyapı" }, _count: { articles: 0 } },
  { id: "cat-docker", name: "Docker", parentId: "cat-group-containers", order: 1, parent: { name: "Konteyner & Orkestrasyon" }, _count: { articles: 0 } },
  { id: "cat-k8s", name: "Kubernetes", parentId: "cat-group-containers", order: 2, parent: { name: "Konteyner & Orkestrasyon" }, _count: { articles: 0 } },
  { id: "cat-ghactions", name: "GitHub Actions", parentId: "cat-group-cicd", order: 1, parent: { name: "CI / CD Otomasyon" }, _count: { articles: 0 } },
  { id: "cat-jenkins", name: "Jenkins", parentId: "cat-group-cicd", order: 2, parent: { name: "CI / CD Otomasyon" }, _count: { articles: 0 } },
  { id: "cat-dokploy", name: "Dokploy", parentId: "cat-group-servernet", order: 1, parent: { name: "Sunucu & Ağ Yönetimi" }, _count: { articles: 0 } },
  { id: "cat-cftunnel", name: "Cloudflare Tunnel", parentId: "cat-group-servernet", order: 2, parent: { name: "Sunucu & Ağ Yönetimi" }, _count: { articles: 0 } },
  { id: "cat-ubuntu", name: "Ubuntu Server", parentId: "cat-group-servernet", order: 3, parent: { name: "Sunucu & Ağ Yönetimi" }, _count: { articles: 0 } },
];

export const DEFAULT_ARTICLES: ArticleData[] = [];
