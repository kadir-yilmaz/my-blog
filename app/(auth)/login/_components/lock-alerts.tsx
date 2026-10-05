"use client";

import { ShieldBan, ShieldAlert, Timer } from "lucide-react";

interface LockAlertsProps {
  isPermanentlyLocked: boolean;
  isBlocked: boolean;
  blockTier: number;
  formattedCountdown: string;
  error: string | null;
}

export function LockAlerts({
  isPermanentlyLocked,
  isBlocked,
  blockTier,
  formattedCountdown,
  error,
}: LockAlertsProps) {
  // 1. Kalıcı Kilit Uyarısı
  if (isPermanentlyLocked) {
    return (
      <div className="rounded-xl bg-destructive/15 border-2 border-destructive p-4 space-y-2 text-destructive animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2 font-black text-sm">
          <ShieldBan className="w-5 h-5 shrink-0" />
          <span>HESAP KALICI OLARAK KİLİTLENDİ</span>
        </div>
        <p className="text-xs leading-relaxed opacity-90">
          Tüm deneme ve bekleme aşamaları (5 dk, 15 dk ve 30 dk) aşıldığı için güvenlik protokolü devreye girdi ve bu hesap kalıcı olarak kilitlendi.
        </p>
        <div className="pt-2 border-t border-destructive/20 text-[11px] font-semibold">
          ⚠️ Kilidin açılması için lütfen sunucu yöneticisi ile iletişime geçin.
        </div>
      </div>
    );
  }

  // 2. Süreli Rate Limit Kilit Uyarısı (5, 15 veya 30 dk)
  if (isBlocked) {
    return (
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-2 text-amber-700 dark:text-amber-300 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between font-bold text-sm">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 animate-spin" />
            <span>Güvenlik Kilidi Aktif</span>
          </div>
          {blockTier > 0 && (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20">
              Aşama {blockTier}/3
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          5 hatalı giriş nedeniyle hesabınız geçici olarak duraklatıldı.
        </p>
        <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-xs">
          <span>Kalan Bekleme Süresi:</span>
          <span className="font-mono text-sm font-black tracking-wider bg-amber-500/20 px-2.5 py-0.5 rounded-md">
            {formattedCountdown}
          </span>
        </div>
      </div>
    );
  }

  // 3. Genel Hata Mesajı
  if (error) {
    return (
      <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3.5 text-xs font-semibold text-destructive flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="flex-1">{error}</div>
      </div>
    );
  }

  return null;
}
