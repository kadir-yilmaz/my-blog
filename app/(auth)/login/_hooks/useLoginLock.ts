"use client";

import { useState, useEffect, useCallback } from "react";

export function useLoginLock() {
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [isPermanentlyLocked, setIsPermanentlyLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [blockTier, setBlockTier] = useState<number>(0);

  // 1. Sayfa ilk açıldığında localStorage'dan kilit durumunu yükle
  useEffect(() => {
    try {
      if (localStorage.getItem("login_permanently_locked") === "true") {
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
      // localStorage erişim hatası güvenli yutulur
    }
  }, []);

  // 2. Kilit süresi için canlı saniyelik geri sayım motoru
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

  // 3. Sunucudan dönen hata yanıtını işleyip kilit durumlarını güncelle
  const handleServerBlock = useCallback((res: {
    isPermanentlyLocked?: boolean;
    blockedUntil?: number | null;
    blockTier?: number;
    remainingAttempts?: number | null;
  }) => {
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
  }, []);

  // Saniyeyi "04:59" gibi MM:SS formatına çevirir
  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isBlocked = (!!blockedUntil && remainingSeconds > 0) || isPermanentlyLocked;

  return {
    isBlocked,
    isPermanentlyLocked,
    remainingSeconds,
    remainingAttempts,
    blockTier,
    formattedCountdown: formatCountdown(remainingSeconds),
    handleServerBlock,
  };
}
