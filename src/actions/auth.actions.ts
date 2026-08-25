"use server";

// ==========================================
// 🎓 Auth Server Actions with 5 -> 15 -> 30 -> Permanent Lock Progression
// ==========================================

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

interface RateLimitInfo {
  attempts: number;
  blockCount: number;
  blockedUntil: number | null;
  isPermanentlyLocked: boolean;
}

// In-memory rate limit store
const rateLimitMap = new Map<string, RateLimitInfo>();

const MAX_ATTEMPTS = 5;
// Kilit kademeleri: 1. kilit: 5 dk, 2. kilit: 15 dk, 3. kilit: 30 dk, sonrası: Kalıcı Kilit
const BLOCK_TIERS_MINUTES = [5, 15, 30];

export async function loginAction(formData: { email: string; password: string }) {
  const email = formData.email.trim().toLowerCase();
  const password = formData.password;

  const now = Date.now();
  let record = rateLimitMap.get(email) || {
    attempts: 0,
    blockCount: 0,
    blockedUntil: null,
    isPermanentlyLocked: false,
  };

  // 1. Kalıcı kilit kontrolü
  if (record.isPermanentlyLocked) {
    return {
      success: false,
      error: "Hesabınız art arda çok sayıda başarısız deneme nedeniyle kalıcı olarak kilitlenmiştir. Lütfen sistem yöneticisiyle iletişime geçiniz.",
      isPermanentlyLocked: true,
    };
  }

  // 2. Aktif süreli bloklama kontrolü
  if (record.blockedUntil && record.blockedUntil > now) {
    const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    return {
      success: false,
      error: `Çok fazla hatalı giriş denemesi yapıldı. Lütfen ${remainingMinutes} dakika sonra tekrar deneyiniz.`,
      blockedUntil: record.blockedUntil,
      remainingSeconds,
      attempts: record.attempts,
      blockTier: record.blockCount,
    };
  }

  // Blok süresi dolmuşsa bekleme süresini ve deneme sayısını sıfırla
  if (record.blockedUntil && record.blockedUntil <= now) {
    record.blockedUntil = null;
    record.attempts = 0;
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });

    // Başarılı girişte tüm deneme ve blok kayıtlarını temizle
    rateLimitMap.delete(email);
    return { success: true };
  } catch (error: any) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        record.attempts += 1;

        // 5 yanlış denemeye ulaşıldı mı?
        if (record.attempts >= MAX_ATTEMPTS) {
          record.blockCount += 1;

          // 3. kademeden (30 dk) sonraki kilitlenme kalıcı kilit olur
          if (record.blockCount > BLOCK_TIERS_MINUTES.length) {
            record.isPermanentlyLocked = true;
            record.blockedUntil = null;
            rateLimitMap.set(email, record);

            return {
              success: false,
              error: "Tüm deneme ve bekleme haklarınız tükendi. Güvenlik gerekçesiyle hesabınız KALICI OLARAK kilitlendi.",
              isPermanentlyLocked: true,
            };
          }

          // 5, 15 veya 30 dakika süre
          const blockDurationMinutes = BLOCK_TIERS_MINUTES[record.blockCount - 1];
          const blockedUntil = now + blockDurationMinutes * 60 * 1000;
          record.blockedUntil = blockedUntil;
          rateLimitMap.set(email, record);

          return {
            success: false,
            error: `5 kez hatalı şifre girdiniz. Güvenliğiniz için hesabınız ${blockDurationMinutes} dakika süreyle kilitlendi (${record.blockCount}/3 aşama).`,
            blockedUntil,
            remainingSeconds: blockDurationMinutes * 60,
            attempts: record.attempts,
            blockTier: record.blockCount,
          };
        }

        rateLimitMap.set(email, record);
        const remainingAttempts = MAX_ATTEMPTS - record.attempts;
        return {
          success: false,
          error: `E-posta adresi veya şifre hatalı. (Kalan deneme hakkı: ${remainingAttempts})`,
          attempts: record.attempts,
          remainingAttempts,
        };
      }

      return { success: false, error: "Giriş yapılırken bir hata oluştu." };
    }

    // Next.js yönlendirmelerini (NEXT_REDIRECT) yukarı fırlat
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
