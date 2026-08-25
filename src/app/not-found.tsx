// 🎓 Global Not Found Page (404)
// URL ile eşleşen hiçbir sayfa bulunamazsa bu sayfa gösterilir.
// Sayfa bazlı not-found.tsx dosyaları da oluşturulabilir (blog/[slug]/not-found.tsx)

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">
        Aradığınız sayfa bulunamadı.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
