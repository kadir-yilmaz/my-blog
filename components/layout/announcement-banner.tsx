// ==========================================
// 🎓 Announcement Banner Component
// ==========================================
import Link from "next/link";

export function AnnouncementBanner() {
  return (
    <div className="bg-red-600 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
      <svg
        className="w-4 h-4 animate-pulse shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
      <span>
        Yazılım mimarileri ve .NET ekosistemi üzerine yeni makaleler yayında!
      </span>
      <Link
        href="/blog"
        className="underline hover:no-underline ml-1 font-semibold opacity-90 hover:opacity-100 transition-opacity"
      >
        Makaleleri Oku →
      </Link>
    </div>
  );
}
