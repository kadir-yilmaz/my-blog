"use client";

// ==========================================
// 🎓 Admin Login Page with 5 -> 15 -> 30 -> Permanent Lock Progression
// ==========================================

import { useState, useEffect } from "react";
import { loginAction } from "@/actions/auth.actions";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldBan,
  Timer,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [isPermanentlyLocked, setIsPermanentlyLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [blockTier, setBlockTier] = useState<number>(0);

  // Sayfa yüklendiğinde localStorage'dan kilit durumunu kontrol et
  useEffect(() => {
    try {
      const isPermanent = localStorage.getItem("login_permanently_locked");
      if (isPermanent === "true") {
        setIsPermanentlyLocked(true);
        return;
      }

      const storedBlock = localStorage.getItem("login_blocked_until");
      if (storedBlock) {
        const blockTimestamp = parseInt(storedBlock, 10);
        if (blockTimestamp > Date.now()) {
          setBlockedUntil(blockTimestamp);
        } else {
          localStorage.removeItem("login_blocked_until");
        }
      }
    } catch {
      // localStorage fallback
    }
  }, []);

  // Blok süresi için canlı geri sayım (Countdown Timer)
  useEffect(() => {
    if (!blockedUntil || isPermanentlyLocked) {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        setBlockedUntil(null);
        setError(null);
        setRemainingAttempts(null);
        try {
          localStorage.removeItem("login_blocked_until");
        } catch {}
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [blockedUntil, isPermanentlyLocked]);

  // Saniyeyi "04:59" gibi MM:SS formatına çevirir
  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isBlocked = (!!blockedUntil && remainingSeconds > 0) || isPermanentlyLocked;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isBlocked) return;

    setLoading(true);
    setError(null);

    try {
      const res = await loginAction({ email, password });
      if (res && !res.success) {
        setError(res.error || "E-posta veya şifre hatalı.");
        
        if (res.isPermanentlyLocked) {
          setIsPermanentlyLocked(true);
          try {
            localStorage.setItem("login_permanently_locked", "true");
            localStorage.removeItem("login_blocked_until");
          } catch {}
        } else if (res.blockedUntil) {
          setBlockedUntil(res.blockedUntil);
          if (res.blockTier) setBlockTier(res.blockTier);
          try {
            localStorage.setItem("login_blocked_until", res.blockedUntil.toString());
          } catch {}
        }

        if (typeof res.remainingAttempts === "number") {
          setRemainingAttempts(res.remainingAttempts);
        }

        setLoading(false);
      }
    } catch (err: any) {
      // Next.js yönlendirmelerini (NEXT_REDIRECT) yukarı fırlat
      if (err?.digest?.startsWith("NEXT_REDIRECT") || err?.message === "NEXT_REDIRECT") {
        throw err;
      }
      console.error("Login submission error:", err);
      setError("Giriş yapılırken bir hata oluştu.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/10 text-red-600 border border-red-500/20 shadow-xs mb-2">
            {isPermanentlyLocked ? (
              <ShieldBan className="w-7 h-7 text-destructive animate-pulse" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Admin Giriş Paneli
          </h1>
          <p className="text-sm text-muted-foreground">
            Yönetim paneline erişmek için yetkili oturum açın
          </p>
        </div>

        {/* Form Kartı */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-md p-6 sm:p-8 shadow-xl space-y-5">
          
          {/* 1. Kalıcı Kilit Uyarısı */}
          {isPermanentlyLocked ? (
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
          ) : isBlocked ? (
            /* 2. Süreli Rate Limit Kilit Uyarısı (5, 15 veya 30 dk) */
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
                  {formatCountdown(remainingSeconds)}
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3.5 text-xs font-semibold text-destructive flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* E-posta Alanı */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>E-posta Adresi</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-muted-foreground pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  disabled={isBlocked || loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-input bg-background pl-9 pr-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
            </div>

            {/* Şifre Alanı */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Şifre</span>
                {remainingAttempts !== null && !isBlocked && (
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    Kalan hak: {remainingAttempts}
                  </span>
                )}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-muted-foreground pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isBlocked || loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background pl-9 pr-11 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 font-mono disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                
                {/* 
                  Göz İkonu Mantığı:
                  - Şifre gizliyken (type="password"): Açık göz ikonu (Eye) görünür -> Tıklayınca şifre açılır.
                  - Şifre açıkken (type="text"): Kapalı/çizgili göz ikonu (EyeOff) görünür -> Tıklayınca şifre gizlenir.
                */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isBlocked || loading}
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  className="absolute right-2 z-10 flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5 text-red-600 dark:text-red-400" />
                  ) : (
                    <Eye className="w-4.5 h-4.5 hover:text-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={loading || isBlocked}
              className="w-full rounded-xl bg-red-600 py-2.5 sm:py-3 text-sm font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : isPermanentlyLocked ? (
                <>
                  <ShieldBan className="w-4 h-4" />
                  <span>Erişim Engellendi (Kalıcı Kilit)</span>
                </>
              ) : isBlocked ? (
                <>
                  <Timer className="w-4 h-4" />
                  <span>Kilitlendi ({formatCountdown(remainingSeconds)})</span>
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>

          {/* Alt Link */}
          <div className="pt-2 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
