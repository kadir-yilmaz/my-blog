import Link from "next/link";
import { HeroSection } from "@/components/portfolio/hero-section";
import { ArticleCard } from "@/components/blog/article-card";
import { getArticles } from "@/actions/article.actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const articlesRes = await getArticles({ limit: 10 });
  const articles = articlesRes.data || [];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <HeroSection />

      {/* Öne Çıkan Projeler Section */}
      <section className="container mx-auto max-w-6xl px-4 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Öne Çıkan Projeler
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Geliştirdiğim canlı projelere ve web uygulamalarına göz atın.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Defence DB Card */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-red-500/20 bg-card/50 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:border-red-500/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-foreground group-hover:text-red-600 transition-colors">Defence DB</h3>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              .NET 8 ve ASP.NET Core MVC ile geliştirilmiş, ileri düzey performans optimizasyonlarına sahip savunma sanayii veritabanı. CQRS mimarisi ile çalışan ultra hızlı SQL Read Model, otomatik Image Thumbnail üretimi, Lazy Loading ve Zero-impact YouTube iFrame özellikleriyle maksimum hız sunar.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">.NET 8</span>
              <span className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">CQRS</span>
              <span className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">Image Optimization</span>
              <span className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">Clean Architecture</span>
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-border/50">
              <a 
                href="https://github.com/kadir-yilmaz/DefenceDB" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                Github Repo
              </a>
              <a 
                href="https://defencedb.kadiryilmaz.online" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
              >
                Siteye Git
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>
          
          {/* Game Garaj Card */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-purple-500/20 bg-card/50 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-foreground group-hover:text-purple-600 transition-colors">Game Garaj (Microservices)</h3>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              3 Master ve 2 Worker node'lu kendi K3s Homelab kümem üzerinde koşan dağıtık e-ticaret platformu. Saga Pattern, YARP API Gateway, Go ile geliştirilmiş Search Service ve Redis Sentinel cache yapısı içerir. ArgoCD ile GitOps süreçleriyle otomatik deploy edilmektedir.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">Microservices</span>
              <span className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">Kubernetes (K3s)</span>
              <span className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">Saga Pattern</span>
              <span className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">Go</span>
              <span className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">YARP</span>
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-border/50">
              <a 
                href="https://github.com/kadir-yilmaz/GameGaraj" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                Github Repo
              </a>
              <a 
                href="https://gamegaraj.kadiryilmaz.online" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
              >
                Siteye Git
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Son Eklenen Makaleler Section */}
      <section className="container mx-auto max-w-6xl px-4 space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Son Eklenen Makaleler
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Yazılım mimarileri, C#, .NET ve modern web teknolojileri üzerine derinlemesine teknik yazılar.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-sm transition-colors"
          >
            <span>Tüm yazılar</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Makale Kartları Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Henüz makale eklenmedi. Yakında yeni yazılar eklenecektir.
          </div>
        )}
      </section>
    </div>
  );
}
