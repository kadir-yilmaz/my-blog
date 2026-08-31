// ==========================================
// 🎓 Constants
// ==========================================

export const ARTICLES_PER_PAGE = 12;

export const REVALIDATE_TIMES = {
  HOME: 3600,           // Ana sayfa: 1 saat
  BLOG_LIST: 600,       // Blog listesi: 10 dakika
  ARTICLE: 3600,        // Makale detay: 1 saat
  CATEGORY: 600,        // Kategori sayfası: 10 dakika
  TAG: 600,             // Etiket sayfası: 10 dakika
  RSS: 3600,            // RSS Feed: 1 saat
} as const;

// 🎓 Neden sabitler ayrı dosyada?
// - Bir yerde değiştiğinde tüm projede güncellensin
// - Magic number'ları önle (3600 ne demek? REVALIDATE_TIMES.HOME daha anlaşılır)
// - Test edilebilirlik: Sabitler mock'lanabilir
