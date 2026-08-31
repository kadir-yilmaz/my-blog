// ==========================================
// 🎓 İletişim Sayfası — SSG / ISR
// ==========================================
// Route: /contact

import type { Metadata } from "next";
import { ContactForm } from "@/components/portfolio/contact-form";
import { siteConfig } from "@/config/site";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "İletişim",
  description: `${siteConfig.author.name} ile iletişime geçin. Proje teklifleri, sorular veya iş birliği mesajları gönderin.`,
};

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden py-12 md:py-16">
      {/* Ambient Gradient Glow (Arka Plan Işıltısı) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-4xl h-96 bg-gradient-to-tr from-purple-500/15 via-red-500/10 to-sky-500/15 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="container mx-auto max-w-4xl px-4">
        {/* Başlık */}
        <div className="text-center space-y-3 mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            İletişim
          </h1>
          <div className="h-1 w-12 mx-auto rounded-full bg-gradient-to-r from-red-600 to-purple-600" />
          <p className="mx-auto max-w-xl text-base sm:text-lg text-muted-foreground pt-1">
            Proje fikirleriniz, danışmanlık veya sadece merhaba demek için bana ulaşabilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-start">
          {/* İletişim Bilgileri Kartı */}
          <div className="space-y-6 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md p-6 sm:p-8 shadow-lg shadow-black/5 md:col-span-1">
            <h2 className="text-lg font-bold text-foreground">Doğrudan Bağlantı</h2>
            
            <div className="space-y-5 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 text-red-500" />
                  <span>E-posta</span>
                </div>
                <a
                  href={`mailto:${siteConfig.author.email}`}
                  className="block text-foreground font-medium hover:text-red-500 transition-colors break-all"
                >
                  {siteConfig.author.email}
                </a>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <svg className="w-3.5 h-3.5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  <span>GitHub</span>
                </div>
                <a
                  href={siteConfig.author.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-foreground font-medium hover:text-purple-500 transition-colors"
                >
                  github.com/kadir-yilmaz
                </a>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <svg className="w-3.5 h-3.5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn</span>
                </div>
                <a
                  href={siteConfig.author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-foreground font-medium hover:text-sky-500 transition-colors"
                >
                  linkedin.com/in/kadir-yilmaz
                </a>
              </div>
            </div>
          </div>

          {/* Form Kartı */}
          <div className="rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md p-6 sm:p-8 shadow-lg shadow-black/5 md:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
