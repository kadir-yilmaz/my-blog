"use client";

// ==========================================
// 🎓 Zoomable Image & Lightbox Modal Component
// ==========================================
// Makalelerdeki görsellere tıklandığında tam ekran, estetik buzlu cam (blur)
// efektli ve animasyonlu Lightbox modalı açar. React Portal ile gövdeye bağlanır.

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn } from "lucide-react";

interface ZoomableImageProps {
  src: string;
  alt?: string;
  caption?: string;
  stretched?: boolean;
  withBorder?: boolean;
  withBackground?: boolean;
}

export function ZoomableImage({
  src,
  alt = "Makale Görseli",
  caption,
  stretched = false,
  withBorder = false,
  withBackground = false,
}: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = () => setIsOpen(true);
  const handleClose = useCallback(() => setIsOpen(false), []);

  // ESC tuşu ile kapatma ve arka plan kaydırmasını (scroll) kilitleme
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const modalContent = isOpen ? (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
      className="fixed inset-0 z-[99999] w-screen h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-black/50 dark:bg-black/65 backdrop-blur-2xl animate-in fade-in duration-200"
    >
      {/* Sağ Üst Kapatma Butonu */}
      <button
        type="button"
        onClick={handleClose}
        title="Kapat"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all duration-200 cursor-pointer border border-white/20 shadow-lg hover:scale-105"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Resim Kapsayıcısı */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center max-w-7xl max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        <img
          src={src}
          alt={caption || alt}
          className="max-h-[82vh] max-w-[92vw] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/20 cursor-default select-none ring-1 ring-black/20"
        />

        {caption && (
          <div
            className="mt-3.5 px-4 py-2 rounded-xl bg-black/60 border border-white/15 text-white/95 text-xs sm:text-sm text-center max-w-3xl backdrop-blur-md shadow-lg"
            dangerouslySetInnerHTML={{ __html: caption }}
          />
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <figure className="not-prose my-8 flex flex-col items-center justify-center w-full group/fig">
        <div
          onClick={handleOpen}
          className={`relative group cursor-zoom-in overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl ${
            stretched ? "w-full" : "inline-block w-fit max-w-full"
          } ${
            withBackground
              ? "p-3 bg-muted/40 dark:bg-zinc-900/50 rounded-2xl border border-border/70 shadow-sm"
              : withBorder
              ? "border-2 border-primary/40 shadow-md rounded-xl"
              : "border border-border/60 shadow-xs rounded-xl"
          }`}
        >
          <img
            src={src}
            alt={caption || alt}
            className={`!m-0 !p-0 block h-auto w-auto max-w-full object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01] ${
              stretched ? "w-full max-h-[850px]" : "max-h-[650px]"
            } rounded-lg`}
            loading="lazy"
          />

          {/* Hover Zoom Göstergesi (Sağ Üst Rozet) */}
          <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 bg-black/75 hover:bg-black/90 text-white rounded-lg px-2.5 py-1 text-[11px] font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm pointer-events-none border border-white/15">
            <ZoomIn className="w-3.5 h-3.5 text-white" />
            <span>Büyüt</span>
          </div>
        </div>

        {caption && (
          <figcaption
            className="text-center text-xs sm:text-sm text-muted-foreground mt-2.5 italic max-w-2xl px-4"
            dangerouslySetInnerHTML={{ __html: caption }}
          />
        )}
      </figure>

      {/* React Portal ile body'e doğrudan bağlama (Tüm ekranı %100 kaplar) */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
