// 🎓 Global Error Page
// "use client" zorunlu: Error boundary'ler client component olmalı
// Herhangi bir sayfada yakalanmamış bir hata olursa bu component render edilir.
// root layout hataları yakalanamaz (bunun için global-error.tsx kullanılır)

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hata loglama servisi entegre edilebilir (Sentry, LogRocket vb.)
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-foreground">Bir Hata Oluştu</h1>
      <p className="mt-4 text-muted-foreground">
        Beklenmeyen bir hata ile karşılaşıldı. Lütfen tekrar deneyin.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
