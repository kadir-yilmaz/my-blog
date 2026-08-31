// ==========================================
// 🎓 Poyraz Avsever Style Header Component
// ==========================================

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { HeaderNav } from "@/components/layout/header-nav";

export function Header() {
  return (
    <div className="w-full sticky top-0 z-50 shadow-xs">
      {/* 2. Ana Navigasyon Barı */}
      <header className="w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          
          {/* Sol Kısım: Renkli Marka / İsim ve Menü */}
          <div className="flex items-center gap-6 md:gap-10">
            {/* Renkli Kadir Yılmaz Yazısı (Kırmızı badge kaldırıldı) */}
            <Link href="/" className="group flex items-center">
              <span className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-red-600 via-purple-600 to-sky-600 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                {siteConfig.name}
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center space-x-6 md:flex">
              {siteConfig.mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-red-600 hover:font-semibold"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Sağ Butonlar (GitHub, LinkedIn, ThemeToggle) */}
          <HeaderNav author={siteConfig.author} />
        </div>
      </header>
    </div>
  );
}
