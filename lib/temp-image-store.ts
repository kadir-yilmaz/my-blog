// ==========================================
// 🎓 Temporary Image Registry & Deferred Uploader for Editor.js
// ==========================================

export interface EditorImageBlockData {
  file?: {
    url?: string;
  };
  url?: string;
  caption?: string;
  withBorder?: boolean;
  withBackground?: boolean;
  stretched?: boolean;
}

export interface EditorBlock {
  id?: string;
  type: string;
  data?: EditorImageBlockData | Record<string, unknown>;
}

// Bellek içi geçici dosya deposu: Blob URL -> File nesnesi
const tempFileRegistry = new Map<string, File>();

/**
 * Dosya için tarayıcı belleğinde geçici bir `blob:` URL üretir ve hafızaya kaydeder.
 * Bu sayede editörde 0 ms gecikmeyle, hiçbir sunucu isteği olmadan anında önizleme sağlanır.
 */
export function registerTempImage(file: File): string {
  const blobUrl = URL.createObjectURL(file);
  tempFileRegistry.set(blobUrl, file);
  return blobUrl;
}

/**
 * Verilen blob URL'e ait File nesnesini döner.
 */
export function getTempFile(blobUrl: string): File | undefined {
  return tempFileRegistry.get(blobUrl);
}

/**
 * Tek bir geçici blob URL'ini temizler ve hafızadan siler.
 */
export function clearTempImage(blobUrl: string): void {
  if (tempFileRegistry.has(blobUrl)) {
    try {
      URL.revokeObjectURL(blobUrl);
    } catch {
      // noop
    }
    tempFileRegistry.delete(blobUrl);
  }
}

/**
 * Tüm geçici blob URL'lerini temizler (ör. form iptal edildiğinde veya unmount olduğunda).
 */
export function clearAllTempImages(): void {
  tempFileRegistry.forEach((_, blobUrl) => {
    try {
      URL.revokeObjectURL(blobUrl);
    } catch {
      // noop
    }
  });
  tempFileRegistry.clear();
}

/**
 * Tek bir File nesnesini /api/upload endpointine yükler ve kalıcı dosya URL'sini döner.
 */
export async function uploadSingleFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("image", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Görsel yüklenemedi (HTTP ${res.status})`);
  }

  const data = await res.json();
  const permanentUrl = data.file?.url || data.url;

  if (!permanentUrl) {
    throw new Error("Sunucudan geçerli bir görsel URL'si alınamadı.");
  }

  return permanentUrl;
}

/**
 * Base64 Data URL veya uzak URL'i /api/upload endpointine göndererek kalıcı URL'e dönüştürür.
 */
export async function uploadUrlOrBase64(urlOrBase64: string): Promise<string> {
  // Eğer zaten yerel kalıcı bir URL ise doğrudan dön
  if (
    urlOrBase64.startsWith("/api/images/") ||
    urlOrBase64.startsWith("/images/") ||
    urlOrBase64.startsWith("/uploads/")
  ) {
    return urlOrBase64;
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: urlOrBase64 }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Uzak görsel sunucuya kaydedilemedi (HTTP ${res.status})`);
  }

  const data = await res.json();
  const permanentUrl = data.file?.url || data.url;

  if (!permanentUrl) {
    throw new Error("Sunucudan geçerli bir görsel URL'si alınamadı.");
  }

  return permanentUrl;
}

/**
 * Editor.js bloklarını tarar, tüm geçici `blob:` ve `data:` resimlerini kalıcı olarak sunucuya yükler
 * ve bloklardaki URL'leri sunucu dosya yolları ile günceller.
 * Ayrıca makaledeki ilk resmi kapak görseli (coverImage) adayı olarak döner.
 */
export async function processAndUploadEditorBlocks(blocks: EditorBlock[]): Promise<{
  blocks: EditorBlock[];
  coverImage: string | null;
}> {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return { blocks: blocks || [], coverImage: null };
  }

  // Deep clone blocks to prevent unintended side effects
  const clonedBlocks: EditorBlock[] = JSON.parse(JSON.stringify(blocks));
  let firstImageUrl: string | null = null;

  // Görselleri paralel olarak sunucuya yükle
  const uploadPromises: Promise<void>[] = [];

  for (const block of clonedBlocks) {
    if (block.type === "image" && block.data) {
      const imageData = block.data as EditorImageBlockData;
      const currentUrl: string = imageData.file?.url || imageData.url || "";

      if (!currentUrl) continue;

      if (currentUrl.startsWith("blob:")) {
        const promise = (async () => {
          let file = getTempFile(currentUrl);

          // Eğer hafızadaki map'te bulunamazsa fetch ile blob'u almayı dene
          if (!file) {
            try {
              const res = await fetch(currentUrl);
              const blob = await res.blob();
              file = new File([blob], `image-${Date.now()}.png`, { type: blob.type || "image/png" });
            } catch (err) {
              console.error("Blob getirme hatası:", err);
            }
          }

          if (file) {
            const permanentUrl = await uploadSingleFile(file);
            imageData.file = { url: permanentUrl };
            imageData.url = permanentUrl;
            clearTempImage(currentUrl);

            if (!firstImageUrl) {
              firstImageUrl = permanentUrl;
            }
          }
        })();

        uploadPromises.push(promise);
      } else if (currentUrl.startsWith("data:")) {
        const promise = (async () => {
          const permanentUrl = await uploadUrlOrBase64(currentUrl);
          imageData.file = { url: permanentUrl };
          imageData.url = permanentUrl;

          if (!firstImageUrl) {
            firstImageUrl = permanentUrl;
          }
        })();

        uploadPromises.push(promise);
      } else {
        // Zaten kalıcı bir URL (veya dış URL)
        if (!firstImageUrl && (currentUrl.startsWith("/") || currentUrl.startsWith("http"))) {
          firstImageUrl = currentUrl;
        }
      }
    }
  }

  // Tüm yüklemelerin tamamlanmasını bekle
  if (uploadPromises.length > 0) {
    await Promise.all(uploadPromises);
  }

  // İlk görseli garanti etmek için tekrar kontrol et
  if (!firstImageUrl) {
    for (const block of clonedBlocks) {
      if (block.type === "image" && block.data) {
        const imageData = block.data as EditorImageBlockData;
        const u = imageData.file?.url || imageData.url;
        if (u && !u.startsWith("blob:") && !u.startsWith("data:")) {
          firstImageUrl = u;
          break;
        }
      }
    }
  }

  return {
    blocks: clonedBlocks,
    coverImage: firstImageUrl,
  };
}
