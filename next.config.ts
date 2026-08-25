import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ProseMirror (BlockNote/Tiptap) React 19 StrictMode bug'ını aşmak için kapatıldı
  reactStrictMode: false,

  // Node.js sunucu paketlerinin Turbopack tarafından istemciye bundle edilmesini engelle
  serverExternalPackages: ["jsdom"],

  // 🎓 output: 'standalone'
  // Docker deployment için kritik. Next.js, build çıktısını tek başına
  // çalışabilecek minimal bir bundle olarak üretir.
  output: "standalone",

  // Harici resim domain'lerini tanımlıyoruz
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // GitHub profil resimleri
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profil resimleri
      },
      {
        protocol: "https",
        hostname: "skillicons.dev", // Skill Icons
      },
    ],
  },
};

export default nextConfig;
