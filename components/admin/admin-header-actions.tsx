"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, FileText, FolderKanban, Globe, LogOut } from "lucide-react";

export function AdminHeaderActions({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between w-full">
        {/* Left Section: Mobile Menu Toggle & Greeting */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
            aria-label="Menüyü Aç"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">
            👋 <span className="hidden sm:inline">Hoş geldin, </span>
            <strong className="text-red-600">{userName}</strong>
          </span>
          
          <span className="hidden sm:inline-block rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
            Admin
          </span>
        </div>

        {/* Right Section: Quick Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground border border-border px-2.5 py-1.5 sm:px-3 rounded-lg transition-colors flex items-center gap-1.5"
            title="Siteyi yeni sekmede aç"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Siteye Dön</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs font-bold bg-red-600/90 hover:bg-red-700 text-white px-2.5 py-1.5 sm:px-3 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative w-64 bg-card text-card-foreground border-r border-border h-full shadow-2xl p-4 flex flex-col justify-between z-50">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow">
                    A
                  </div>
                  <h2 className="font-extrabold text-base">Admin Panel</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 text-sm font-medium">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-muted text-foreground transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-red-500" /> Dashboard
                </Link>
                <Link
                  href="/admin/articles"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-muted text-foreground transition-colors"
                >
                  <FileText className="w-4 h-4 text-blue-500" /> Makaleler
                </Link>
                <Link
                  href="/admin/categories"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-muted text-foreground transition-colors"
                >
                  <FolderKanban className="w-4 h-4 text-amber-500" /> Kategoriler
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-muted text-foreground transition-colors"
                >
                  <Globe className="w-4 h-4 text-emerald-500" /> Siteyi Görüntüle ↗
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t border-border">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white py-2.5 text-sm font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
