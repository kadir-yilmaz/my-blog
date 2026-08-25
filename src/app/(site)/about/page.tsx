// ==========================================
// 🎓 Hakkımda — Kişisel Biyografi & Profil
// ==========================================
// Route: /about

import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Hakkımda",
  description: `${siteConfig.author.name} — Hakkımda ve teknik yetkinliklerim.`,
};

export const revalidate = 3600;

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden py-12 md:py-16">
      {/* Ambient Gradient Glow (Arka Plan Işıltısı) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-3xl h-96 bg-gradient-to-tr from-purple-500/15 via-red-500/10 to-sky-500/15 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="container mx-auto max-w-3xl px-4">
        <article className="space-y-8">
          
          {/* Başlık */}
          <header className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Hakkımda
            </h1>
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-red-600 to-purple-600" />
          </header>

          {/* Şık Border & Glassmorphism Kartı */}
          <div className="group relative rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md p-6 sm:p-10 shadow-lg shadow-black/5 hover:border-red-500/30 transition-all duration-300">
            {/* Kart içi ince ışıltı */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            <p className="relative text-foreground/90 leading-relaxed text-base sm:text-lg font-normal">
              Merhaba, ben Kadir. .NET teknolojileri üzerine çalışan bir backend geliştiricisiyim. 
              Özellikle <strong className="font-semibold text-foreground">ASP.NET Core</strong>, <strong className="font-semibold text-foreground">Web API</strong>, <strong className="font-semibold text-foreground">PostgreSQL</strong>, <strong className="font-semibold text-foreground">SQL Server</strong>, <strong className="font-semibold text-foreground">Redis</strong> ve <strong className="font-semibold text-foreground">RabbitMQ</strong> gibi teknolojilerle ölçeklenebilir ve sürdürülebilir backend sistemleri geliştirmeye odaklanıyorum. 
              Bunun yanında <strong className="font-semibold text-foreground">Docker</strong>, <strong className="font-semibold text-foreground">Kubernetes</strong>, <strong className="font-semibold text-foreground">CI/CD</strong> ve <strong className="font-semibold text-foreground">GitOps</strong> gibi DevOps teknolojileriyle uygulamaların geliştirilmesinden deployment süreçlerine kadar farklı aşamalarında çalışmayı seviyorum. 
              Yeni teknolojileri öğrenmek, farklı mimarileri deneyerek gerçek projeler üzerinde kendimi geliştirmek ve yazılımın hem teknik hem de mimari tarafını daha iyi anlamak benim için önemli.
            </p>
          </div>

        </article>
      </div>
    </div>
  );
}
