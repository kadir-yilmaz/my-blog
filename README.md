# My Blog & Portfolio

Modern **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Prisma 7 (SQL Server)**, **Editor.js** ve **Auth.js v5** ile geliştirilmiş kişisel portföy ve teknik blog platformu.

---

## 📦 Kullanılan Teknolojiler ve Paketler

### 1. Çekirdek (Core & Framework)
- **`next`** (`16.2.11`): Next.js App Router, Turbopack ve Server Actions destekli modern React framework'ü.
- **`react` & `react-dom`** (`19.2.4`): React 19 Server Components ve Hooks altyapısı.
- **`typescript`** (`^5`): Tam type-safe kod geliştirme desteği.

### 2. Arayüz ve Tasarım (UI & Styling)
- **`tailwindcss` & `@tailwindcss/postcss`** (`^4`): Tailwind CSS v4 motoru ve modern CSS değişkenleri.
- **`@tailwindcss/typography`** (`^0.5.20`): Blog makaleleri ve zengin metinler için gelişmiş tipografi stilleri (`prose`).
- **`lucide-react`** (`^1.25.0`): Kapsamlı ve hafif modern SVG ikon kütüphanesi.
- **`next-themes`** (`^0.4.6`): Koyu (Dark) ve Açık (Light) tema geçiş desteği.
- **`clsx` & `tailwind-merge`**: Koşullu CSS sınıflarını dinamik ve çakışmasız birleştirme.

### 3. Zengin Metin Editörü (Editor.js)
- **`@editorjs/editorjs` & Eklentileri (`@editorjs/*`)**: Blok tabanlı, JSON çıktısı üreten modern zengin metin editörü (Başlık, resim, kod bloğu, tablo, liste, alıntı ve vurgulama araçları).


### 4. Veritabanı ve ORM (Database & Prisma)
- **`prisma` & `@prisma/client`** (`^7.9.0`): Next-gen Type-safe ORM ve migration motoru.
- **`@prisma/adapter-mssql` & `mssql`** (`^12.7.0`): Microsoft SQL Server bağlantı adaptörü ve sürücüsü.
- **`@prisma/adapter-pg` & `pg`** (`^8.22.0`): PostgreSQL bağlantı adaptörü (alternatif veritabanı desteği).

### 5. Kimlik Doğrulama ve Güvenlik (Auth & Security)
- **`next-auth`** (`^5.0.0-beta.32`): Auth.js v5 - Session yönetimi, Admin korumalı rotalar ve OAuth/Credentials sağlayıcıları.
- **`@auth/prisma-adapter`** (`^2.11.3`): Auth.js ile Prisma modelleri arasındaki oturum köprüsü.
- **`bcryptjs`** (`^3.0.3`): Güvenli parola hashleme ve doğrulama.

### 6. Depolama, Doğrulama ve Durum Yönetimi
- **`@aws-sdk/client-s3`** (`^3.1092.0`): MinIO ve AWS S3 bulut nesne depolama SDK'sı.
- **`zod`** (`^4.4.3`): Veri şeması ve form doğrulama kütüphanesi.
- **`zustand`** (`^5.0.14`): Hızlı ve hafif istemci tarafı durum yönetimi (Global State).
- **`react-markdown`** (`^10.1.0`): Eski/Fallback markdown metinlerini render motoru.
- **`dotenv`** (`^17.4.2`): Çevre değişkenleri (`.env`) yönetimi.
- **`tsx`** (`^4.23.1`): TypeScript dosyalarını doğrudan çalıştırma (Seed ve bakım betikleri).
- **`eslint` & `eslint-config-next`** (`^9`): Kod standartları ve statik analiz aracı.

---

## 🚀 Projeyi Çalıştırma

### 1. Ortam Değişkenleri
```bash
cp .env.example .env
```

### 2. Yerel Geliştirme (Local Dev)
```bash
# 1. SQL Server veritabanını Docker ile başlatın
docker-compose up -d

# 2. Veritabanı Şemasını Eşitleyin & Seed Verilerini Yükleyin
npx prisma db push
npm run db:seed

# 3. Next.js uygulamasını başlatın
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

---

## 📚 Dokümantasyon
- [getting-started.md](file:///c:/Users/kadir/OneDrive/Desktop/Projeler/my-blog/notes/getting-started.md) — Başlangıç ve Kurulum Rehberi
- [decisions.md](file:///c:/Users/kadir/OneDrive/Desktop/Projeler/my-blog/notes/decisions.md) — Mimari Kararlar Logu
- [docker.md](file:///c:/Users/kadir/OneDrive/Desktop/Projeler/my-blog/notes/docker.md) — Docker Mimarisi
- [project-architecture.md](file:///c:/Users/kadir/OneDrive/Desktop/Projeler/my-blog/notes/project-architecture.md) — Genel Sistem Mimarisi
