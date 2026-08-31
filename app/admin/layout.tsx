// ==========================================
// 🎓 Admin Layout — Admin Panel İçin
// ==========================================

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminHeaderActions } from "@/components/admin/admin-header-actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation - Fixed & Sticky */}
      <aside className="hidden w-64 border-r border-border/80 bg-card text-card-foreground lg:block shadow-sm sticky top-0 h-screen overflow-y-auto">
        <div className="flex h-16 items-center border-b border-border/80 px-6 gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-extrabold text-sm shadow">
            A
          </div>
          <h2 className="text-lg font-extrabold tracking-tight">Admin Control</h2>
        </div>

        <nav className="space-y-1.5 p-4 text-sm font-medium">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 hover:bg-muted text-foreground transition-colors"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/admin/articles"
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 hover:bg-muted text-foreground transition-colors"
          >
            📝 Makaleler
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 hover:bg-muted text-foreground transition-colors"
          >
            📂 Kategoriler
          </Link>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 items-center border-b border-border/80 bg-card px-6 shadow-sm sticky top-0 z-40">
          <AdminHeaderActions userName={session.user.name || session.user.email || "Admin"} />
        </header>
        <main className="p-6 md:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
