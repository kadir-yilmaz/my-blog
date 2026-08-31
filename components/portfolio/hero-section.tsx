import { Server, Code2, Cpu } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:py-20 border-b border-border/40 bg-radial-[at_top_center] from-primary/5 via-transparent to-transparent">
      {/* Subtle Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-gradient-to-tr from-purple-500/10 via-sky-500/10 to-orange-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="container mx-auto max-w-5xl px-4">
        <div className="space-y-12 text-center">
          {/* Ad, Başlık ve Biyografi */}
          <div className="flex flex-col items-center justify-center gap-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-foreground flex items-center justify-center gap-2 flex-wrap">
              Merhaba, ben <span className="bg-gradient-to-r from-red-600 via-purple-600 to-sky-600 bg-clip-text text-transparent">Kadir Yılmaz</span>
              <span className="animate-waving-hand origin-bottom-right inline-block text-3xl md:text-5xl">👋</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center">
              <span className="font-semibold text-foreground">.NET</span> ekosisteminde kurumsal backend mimarileri ve dağıtık sistemler geliştiriyorum. Aynı zamanda kendi home-server altyapımda <span className="font-semibold text-foreground">DevOps, Kubernetes ve CI/CD</span> süreçleri üzerine aktif olarak çalışıyorum.
            </p>
          </div>

          {/* Yetenekler & Teknolojiler (Sadece SkillIcons) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-4xl mx-auto items-stretch">
            
            {/* 1. Backend Card */}
            <div className="group relative rounded-2xl border border-purple-500/20 bg-card/60 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-2 font-bold text-base text-foreground">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Server className="w-5 h-5" />
                </div>
                <span>Backend</span>
              </div>

              {/* SkillIcons */}
              <div className="py-2 flex items-center justify-center">
                <img
                  src="https://skillicons.dev/icons?i=dotnet,cs,golang,rabbitmq,redis,postgres,mongodb,elasticsearch"
                  alt="Backend Skill Icons"
                  className="h-11 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
                  loading="lazy"
                />
              </div>
            </div>

            {/* 2. Frontend Card */}
            <div className="group relative rounded-2xl border border-sky-500/20 bg-card/60 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/10 flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-2 font-bold text-base text-foreground">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                  <Code2 className="w-5 h-5" />
                </div>
                <span>Frontend</span>
              </div>

              {/* SkillIcons */}
              <div className="py-2 flex items-center justify-center">
                <img
                  src="https://skillicons.dev/icons?i=react,nextjs,ts,js,tailwind"
                  alt="Frontend Skill Icons"
                  className="h-11 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
                  loading="lazy"
                />
              </div>
            </div>

            {/* 3. DevOps Card */}
            <div className="group relative rounded-2xl border border-orange-500/20 bg-card/60 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-2 font-bold text-base text-foreground">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
                <span>DevOps</span>
              </div>

              {/* SkillIcons */}
              <div className="py-2 flex items-center justify-center">
                <img
                  src="https://skillicons.dev/icons?i=docker,kubernetes,linux,ubuntu,githubactions,jenkins,prometheus,grafana,cloudflare,nginx,git&perline=6"
                  alt="DevOps Skill Icons"
                  className="h-18 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
                  loading="lazy"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
