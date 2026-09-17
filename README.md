# Zhiyy Portfolio

Portfolio personal Reavlenia Arezha — dark modern theme dengan warna merah darah sebagai branding utama.

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · Supabase · Vercel

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file
cp .env.local.example .env.local
# → Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run dev server
npm run dev
```

---

## Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** dan jalankan isi file `supabase/schema.sql`
3. Copy **Project URL** dan **anon key** dari Settings → API
4. Paste ke `.env.local`

---

## Deployment ke Vercel

1. Push repo ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy 🚀

---

## Cara Tambah Project Baru

Cukup tambahkan row baru di tabel `projects` di Supabase Dashboard:

| Field | Keterangan |
|---|---|
| `title` | Nama project |
| `description` | Deskripsi singkat |
| `tech_stack` | Array teknologi, contoh: `{Next.js,React}` |
| `image_url` | URL thumbnail (bisa dari Supabase Storage) |
| `live_url` | Link demo live |
| `github_url` | Link GitHub repo |
| `featured` | `true` untuk tampil di homepage |
| `order_index` | Urutan tampilan |
| `category` | Kategori: Web, Mobile, dll |

---

## Struktur Folder

```
src/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Homepage
│   └── projects/
│       └── page.tsx        # Halaman semua project
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   └── ContactSection.tsx
│   └── ui/
│       ├── ProjectCard.tsx
│       ├── Button.tsx
│       └── Badge.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   └── server.ts       # Server client
│   └── utils.ts
└── types/
    └── database.ts         # Supabase type definitions
```
