// ==========================================
// 🎓 Auth Layout — Login/Register Sayfaları İçin
// ==========================================
// Route Group: (auth)
// Site layout'tan FARKLI bir layout kullanır:
// - Navbar yok
// - Footer yok
// - Ortaya hizalı, minimal tasarım
//
// 🎓 Route Groups'un gücü:
// (site) ve (auth) aynı URL seviyesinde ama farklı layout'lara sahip.
// /login → (auth)/login/page.tsx → (auth)/layout.tsx → Root Layout
// /blog  → (site)/blog/page.tsx  → (site)/layout.tsx → Root Layout

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 px-4">
        {children}
      </div>
    </div>
  );
}
