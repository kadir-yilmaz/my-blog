"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export function BackButton({ fallbackHref = "/blog", label = "Geri Dön" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Tarayıcı geçmişi varsa kullanıcının ayrıldığı yere geri döner
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      type="button"
      className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-border/80 bg-card/60 backdrop-blur-xs text-muted-foreground hover:text-foreground hover:border-border hover:bg-accent/70 hover:shadow-xs transition-all duration-200 cursor-pointer"
    >
      <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
      <span>{label}</span>
    </button>
  );
}
