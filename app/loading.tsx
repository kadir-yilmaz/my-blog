// 🎓 Global Loading UI
// Bu dosya, sayfa geçişlerinde otomatik gösterilir.
// Next.js, her page.tsx'i otomatik olarak <Suspense> ile sarar.
// Veri yüklenirken loading.tsx gösterilir → Streaming SSR
//
// 🎓 Streaming Nedir?
// Geleneksel SSR: Tüm sayfa hazır olana kadar kullanıcı bekler
// Streaming SSR: Hazır olan parçalar hemen gönderilir, geri kalanı sonra gelir
// loading.tsx → hazır olmayan parçanın yerine gösterilir (fallback)

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}
