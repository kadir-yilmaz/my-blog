// ==========================================
// 🎓 Site Configuration
// ==========================================
// Tüm site genelindeki sabit değerler burada tanımlanır.
// Metadata, SEO, footer, sosyal medya linkleri vb.
// Neden ayrı dosya? DRY prensibi — aynı bilgiyi birden fazla yerde tekrarlamamak için.

export const siteConfig = {
  name: "Kadir Yılmaz",
  description: "Kişisel portfolio ve teknik blog. Next.js, React, TypeScript ve daha fazlası hakkında derinlemesine makaleler.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  author: {
    name: "Kadir Yılmaz",
    email: "kadiryilmaz19821@gmail.com",
    github: "https://github.com/kadir-yilmaz",
    linkedin: "https://www.linkedin.com/in/kadir-y%C4%B1lmaz-166293221",
    twitter: "https://twitter.com/kadir",
  },

  // SEO
  keywords: [
    "Next.js",
    "React",
    "TypeScript",
    "Web Development",
    "Frontend",
    "Backend",
    "Full Stack",
  ],

  // Open Graph
  ogImage: "/og/default.png",

  // Navigation (Header'da gösterilecek linkler)
  mainNav: [
    { title: "Makaleler", href: "/blog" },
    { title: "İletişim", href: "/contact" },
  ],

  // Footer
  footerNav: [
    {
      title: "Makaleler",
      items: [
        { title: "Son Yazılar", href: "/blog" },
        { title: "Kategoriler", href: "/blog/category" },
        { title: "Etiketler", href: "/blog/tag" },
      ],
    },
    {
      title: "İletişim",
      items: [
        { title: "İletişim Formu", href: "/contact" },
        { title: "GitHub", href: "https://github.com/kadir-yilmaz" },
        { title: "LinkedIn", href: "https://www.linkedin.com/in/kadir-y%C4%B1lmaz-166293221" },
      ],
    },
  ],
} as const;

// 🎓 `as const` nedir?
// Object'i readonly yapar ve tüm değerleri literal type olarak infer eder.
// Örneğin: siteConfig.name tipi "My Blog" olur, string değil.
// Bu, TypeScript'in daha kesin tip kontrolü yapmasını sağlar.

export type SiteConfig = typeof siteConfig;
