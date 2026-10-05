"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/actions/auth.actions";
import { useLoginLock } from "./_hooks/useLoginLock";
import { LoginHeader } from "./_components/login-header";
import { LockAlerts } from "./_components/lock-alerts";
import { Lock, Mail, Eye, EyeOff, ArrowLeft, Loader2, ShieldBan, Timer } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🧠 Tüm kilit, sayaç ve localStorage durumları Custom Hook tarafından yönetilir
  const lock = useLoginLock();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lock.isBlocked) return;

    setLoading(true);
    setError(null);

    try {
      const res = await loginAction({ email, password });
      if (res && !res.success) {
        setError(res.error || "E-posta veya şifre hatalı.");
        lock.handleServerBlock(res);
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT") || err?.message === "NEXT_REDIRECT") {
        throw err;
      }
      console.error("Login error:", err);
      setError("Giriş yapılırken bir hata oluştu.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Başlık & Logo */}
      <LoginHeader isPermanentlyLocked={lock.isPermanentlyLocked} />

      {/* 2. Form Kartı */}
      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-md p-6 sm:p-8 shadow-xl space-y-5">
        
        {/* Güvenlik & Hata Uyarıları */}
        <LockAlerts
          isPermanentlyLocked={lock.isPermanentlyLocked}
          isBlocked={lock.isBlocked}
          blockTier={lock.blockTier}
          formattedCountdown={lock.formattedCountdown}
          error={error}
        />

        {/* Form Alanı */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* E-posta */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">E-posta Adresi</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
              <input
                type="email"
                required
                disabled={lock.isBlocked || loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-input bg-background pl-9 pr-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
          </div>

          {/* Şifre */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Şifre</span>
              {lock.remainingAttempts !== null && !lock.isBlocked && (
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  Kalan hak: {lock.remainingAttempts}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={lock.isBlocked || loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-input bg-background pl-9 pr-11 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 font-mono disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={lock.isBlocked || loading}
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                className="absolute right-2 z-10 flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer disabled:opacity-40"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5 text-red-600" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Giriş Butonu */}
          <button
            type="submit"
            disabled={loading || lock.isBlocked}
            className="w-full rounded-xl bg-red-600 py-2.5 sm:py-3 text-sm font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Doğrulanıyor...</span>
              </>
            ) : lock.isPermanentlyLocked ? (
              <>
                <ShieldBan className="w-4 h-4" />
                <span>Erişim Engellendi (Kalıcı Kilit)</span>
              </>
            ) : lock.isBlocked ? (
              <>
                <Timer className="w-4 h-4" />
                <span>Kilitlendi ({lock.formattedCountdown})</span>
              </>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>

        {/* Ana Sayfaya Dön Linki */}
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
  );
}
