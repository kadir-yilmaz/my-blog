"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Mail } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface HeaderNavProps {
  author: {
    name: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

export function HeaderNav({ author }: HeaderNavProps) {
  const pathname = usePathname();

  const isBlogActive = pathname.startsWith("/blog");
  const isContactActive = pathname === "/contact";

  return (
    <div className="flex items-center space-x-1.5 sm:space-x-2">
      {/* 📱 Mobilde Doğrudan İkon Butonları (Makaleler, İletişim) */}
      <div className="flex items-center gap-1 md:hidden">
        {/* Makaleler Butonu */}
        <Link
          href="/blog"
          title="Makaleler"
          className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all active:scale-95 ${
            isBlogActive
              ? "bg-red-600/15 border-red-500/40 text-red-600 font-bold"
              : "border-border/80 bg-muted/40 text-foreground hover:bg-muted"
          }`}
          aria-label="Makaleler"
        >
          <BookOpen className="w-4 h-4" />
        </Link>

        {/* İletişim Butonu */}
        <Link
          href="/contact"
          title="İletişim"
          className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all active:scale-95 ${
            isContactActive
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 font-bold"
              : "border-border/80 bg-muted/40 text-foreground hover:bg-muted"
          }`}
          aria-label="İletişim"
        >
          <Mail className="w-4 h-4" />
        </Link>
      </div>

      {/* 💻 Masaüstünde Sosyal Medya Linkleri (Mobilde Gizli) */}
      <div className="hidden md:flex items-center gap-2 border-l border-border/60 pl-2.5 ml-2">
        {author.github && (
          <a
            href={author.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-border/80 bg-muted/40 text-foreground hover:bg-muted hover:text-foreground transition-all hover:scale-105 shadow-2xs"
            aria-label="GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>
        )}
        {author.linkedin && (
          <a
            href={author.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-border/80 bg-muted/40 text-foreground hover:bg-muted hover:text-foreground transition-all hover:scale-105 shadow-2xs"
            aria-label="LinkedIn"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        )}
      </div>

      {/* Dark / Light Theme Toggle (Tüm Cihazlarda) */}
      <ThemeToggle />
    </div>
  );
}
