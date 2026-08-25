// ==========================================
// 🎓 Root Layout — Tüm Sayfaların Ebeveyni
// ==========================================
// Bu, Next.js App Router'daki en üst düzey layout.
// Her sayfa bu layout'un children'ı olarak render edilir.
//
// Burada yapılan işler:
// 1. Font yükleme (next/font ile — layout shift'i önler)
// 2. Global metadata tanımlama
// 3. Theme provider (dark/light mode)
// 4. <html> ve <body> tag'leri (sadece burada olmalı!)
//
// 🎓 Neden Root Layout önemli?
// - Next.js'te <html> ve <body> sadece root layout'ta tanımlanır
// - Tüm sayfalar bu layout'u paylaşır
// - Font, metadata, theme gibi global ayarlar burada yapılır
// - Nested layout'lar bu layout'un İÇİNDE çalışır

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { siteConfig } from "@/config/site";
import "./globals.css";

// 🎓 next/font: Google Fonts'u build-time'da indirip self-host eder
// Avantajları:
// - Harici CDN isteği yok (privacy + performance)
// - Layout shift yok (font-display: swap otomatik)
// - CSS variable ile font ailesi tanımlanır
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🎓 Static Metadata: Tüm site için geçerli temel SEO metadata
// Sayfa bazlı override için generateMetadata() kullanılır (blog/[slug]/page.tsx)
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    // 🎓 template: Alt sayfalardaki title'a otomatik suffix ekler
    // Örnek: "Blog" → "Blog | My Blog"
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      // 🎓 suppressHydrationWarning: next-themes'in <html>'e class eklemesi
      // server/client mismatch uyarısını bastırır. Sadece burada güvenli.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* 🎓 ThemeProvider: Dark/Light mode yönetimi
            attribute="class": .dark class'ı <html>'e eklenir
            defaultTheme="light": İlk açılışta aydınlık tema kullanır
            disableTransitionOnChange: Tema geçişinde flicker'ı önler */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
