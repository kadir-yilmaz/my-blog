// ==========================================
// 🎓 Dynamic Slug & Base62 ID Generator Module
// ==========================================
// Veritabanında slug sütunu tutulmaz.
// 1. Makaleler için:  makale-adi-a-makaleidbase62
// 2. Kategoriler için: kategori-adi-c-categoryidbase62
// 3. Etiketler için:    etiket-adi-t-tagidbase62
// 
// Avantajları:
// - Veritabanında slug sütununa ve unique index yüküne gerek kalmaz.
// - Başlık veya kategori adı değişse bile URL (-a-{id} veya -c-{id}) sayesinde kalıcıdır (Permanent URL).
// - SEO dostu ve insan tarafından okunabilir URL yapısı sağlar.

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Türkçe karakterleri ve özel işaretleri URL uyumlu slug metnine dönüştürür.
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "") // Harf, rakam, boşluk ve tire dışındakileri temizle
    .replace(/[\s_]+/g, "-") // Boşluk ve alt çizgileri tireye çevir
    .replace(/-+/g, "-") // Ardışık tireleri teke indir
    .replace(/^-+|-+$/g, ""); // Baş ve sondaki tireleri temizle
}

const ZERO_BIGINT = BigInt(0);
const SIXTY_TWO_BIGINT = BigInt(62);

/**
 * String ID değerini Base62 formatına kodlar.
 */
export function encodeBase62(str: string): string {
  if (!str) return "";
  let hex = Buffer.from(str, "utf8").toString("hex");
  let num = BigInt("0x" + hex);
  if (num === ZERO_BIGINT) return "0";
  let result = "";
  while (num > ZERO_BIGINT) {
    const remainder = Number(num % SIXTY_TWO_BIGINT);
    result = BASE62[remainder] + result;
    num = num / SIXTY_TWO_BIGINT;
  }
  return result;
}

/**
 * Base62 formatındaki kodlanmış değeri orijinal string ID'ye geri çözer.
 */
export function decodeBase62(base62Str: string): string {
  if (!base62Str) return "";
  let num = ZERO_BIGINT;
  for (const char of base62Str) {
    const index = BASE62.indexOf(char);
    if (index === -1) return "";
    num = num * SIXTY_TWO_BIGINT + BigInt(index);
  }
  let hex = num.toString(16);
  if (hex.length % 2 !== 0) hex = "0" + hex;
  return Buffer.from(hex, "hex").toString("utf8");
}

/**
 * Dinamik Makale Slug'ı Üretir: `makale-adi-a-makaleidbase62`
 */
export function getArticleSlug(title: string, id: string): string {
  const cleanTitle = slugify(title) || "makale";
  const b62 = encodeBase62(id);
  return `${cleanTitle}-a-${b62}`;
}

/**
 * Makale Slug'ından Orijinal Makale ID'sini Çıkarır.
 */
export function extractArticleIdFromSlug(slug: string): string | null {
  if (!slug) return null;
  const parts = slug.split("-a-");
  if (parts.length < 2) {
    // Eğer direkt ID veya tek parça geldiyse fallback olarak çözmeyi veya direkt ID olarak denemeyi sağla
    return decodeBase62(slug) || slug;
  }
  const b62Id = parts[parts.length - 1];
  return decodeBase62(b62Id) || null;
}

/**
 * Dinamik Kategori Slug'ı Üretir: `kategori-adi-c-categoryidbase62`
 */
export function getCategorySlug(name: string, id: string): string {
  const cleanName = slugify(name) || "kategori";
  const b62 = encodeBase62(id);
  return `${cleanName}-c-${b62}`;
}

/**
 * Kategori Slug'ından Orijinal Kategori ID'sini Çıkarır.
 */
export function extractCategoryIdFromSlug(slug: string): string | null {
  if (!slug) return null;
  const parts = slug.split("-c-");
  if (parts.length < 2) {
    return decodeBase62(slug) || slug;
  }
  const b62Id = parts[parts.length - 1];
  return decodeBase62(b62Id) || null;
}

/**
 * Dinamik Etiket Slug'ı Üretir: `etiket-adi-t-tagidbase62`
 */
export function getTagSlug(name: string, id: string): string {
  const cleanName = slugify(name) || "etiket";
  const b62 = encodeBase62(id);
  return `${cleanName}-t-${b62}`;
}

/**
 * Etiket Slug'ından Orijinal Etiket ID'sini Çıkarır.
 */
export function extractTagIdFromSlug(slug: string): string | null {
  if (!slug) return null;
  const parts = slug.split("-t-");
  if (parts.length < 2) {
    return decodeBase62(slug) || slug;
  }
  const b62Id = parts[parts.length - 1];
  return decodeBase62(b62Id) || null;
}
