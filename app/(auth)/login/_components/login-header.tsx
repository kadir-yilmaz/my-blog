"use client";

import { Lock, ShieldBan } from "lucide-react";

interface LoginHeaderProps {
  isPermanentlyLocked: boolean;
}

export function LoginHeader({ isPermanentlyLocked }: LoginHeaderProps) {
  return (
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
  );
}
