# Design Document — Portfolio Project System

## Overview

Redesign sistem project portfolio untuk ZhiyyPorto (Reavlenia Arezha). Scope mencakup perluasan database schema, update TypeScript types, arsitektur komponen baru, dan data fetching approach untuk mendukung multi-image per project, category terstruktur, video embed, dan category filter interaktif.

Stack: **Next.js 15 App Router · TypeScript · Supabase (PostgreSQL + Storage) · Tailwind CSS · Framer Motion**

---

## Architecture

Proyek menggunakan arsitektur **Next.js 15 App Router** dengan pola berikut:

- **Server Components** untuk semua halaman read-only (publik dan admin list) — fetch langsung dari Supabase di server, tidak ada client-side data loading
- **Client Components** untuk interaksi (filter, carousel, modal, form admin) — menggunakan Supabase browser client
- **Supabase PostgreSQL** sebagai sumber data tunggal dengan RLS untuk access control
- **Supabase Storage** untuk file gambar project, diakses via public URL

```
Browser
  └── Next.js App Router
        ├── Server Components → Supabase (server client, cookie-based auth)
        │     ├── /app/(public)/page.tsx
        │     ├── /app/(public)/projects/page.tsx
        │     └── /app/zhaorukou/dashboard/**
        └── Client Components → Supabase (browser client, anon key)
              ├── CategoryFilter + ProjectsClientPage (filter state)
              ├── ProjectCard (carousel + video modal state)
              └── ProjectForm + ImageUploader + CategoryCombobox (mutations)
```

**Data flow untuk halaman publik:**
1. Server Component fetch semua data (projects + relasi) di server
2. Pass `ProjectWithRelations[]` sebagai props ke Client Components
3. Client Components hanya mengelola UI state (tidak refetch data)

**Data flow untuk admin mutations:**
1. Client Component (ProjectForm) menggunakan `createAdminClient()` (browser client)
2. Upload file ke Supabase Storage → dapat public URL
3. Insert/update row di Supabase DB
4. `router.refresh()` untuk re-render Server Components dengan data terbaru

---

## Components and Interfaces

### Komponen Baru

#### `src/components/ui/ImageCarousel.tsx`

```typescript
interface ImageCarouselProps {
  images: ProjectImage[];
  alt: string;
  fallbackText?: string;  // teks fallback jika tidak ada gambar (inisial judul)
  className?: string;
}
```

Behaviour:
- 0 images → placeholder dengan `fallbackText`
- 1 image → `<Image>` statis
- \>1 images → auto-slide tiap 3 detik, pause on hover, dot indicator

#### `src/components/ui/VideoModal.tsx`

```typescript
interface VideoModalProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
}
```

Behaviour: ekstrak YouTube ID, render iframe embed dengan `autoplay=1`, portal ke `document.body`, lock body scroll saat open, AnimatePresence untuk animasi.

#### `src/components/ui/CategoryFilter.tsx`

```typescript
interface CategoryFilterProps {
  categories: ProjectCategory[];
  activeCategory: string | null;  // null = semua
  onSelect: (id: string | null) => void;
}
```

#### `src/components/admin/ImageUploader.tsx`

```typescript
interface ImageUploaderProps {
  projectId?: string;
  existingImages: ProjectImage[];
  onPendingFilesChange: (files: File[]) => void;
  onDeleteExisting: (image: ProjectImage) => void;
}
```

Validasi: accept JPEG/PNG/WebP/GIF, max 5MB per file.

#### `src/components/admin/CategoryCombobox.tsx`

```typescript
interface CategoryComboboxProps {
  categories: ProjectCategory[];
  value: string | null;
  onChange: (id: string) => void;
}
```

Mendukung pemilihan existing category dan pembuatan category baru dengan upsert logic.

#### `src/app/(public)/projects/ProjectsClientPage.tsx`

```typescript
interface ProjectsClientPageProps {
  projects: ProjectWithRelations[];
  categories: ProjectCategory[];
}
```

Client Component yang mengelola `activeCategory` state dan filter projects.

### Komponen yang Diupdate

| Komponen | Perubahan Utama |
|----------|----------------|
| `ProjectCard` | Prop `project: ProjectWithRelations`, integrasi `ImageCarousel` + `VideoModal`, jadi Client Component |
| `ProjectsSection` | Prop type `ProjectWithRelations[]` |
| `ProjectForm` | Integrasi `CategoryCombobox` + `ImageUploader` + field `video_url` |
| `DeleteProjectButton` | Hapus Storage files sebelum delete DB row |

---

## Data Models

### Tabel Baru: `project_categories`

```sql
CREATE TABLE IF NOT EXISTS public.project_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  CONSTRAINT project_categories_name_key UNIQUE (name)
);
```

Default data: Web, Animation, Illustration, Logo/Branding, Photography, UI/UX.

### Tabel Baru: `project_images`

```sql
CREATE TABLE IF NOT EXISTS public.project_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url          TEXT NOT NULL,
  order_index  INTEGER DEFAULT 0
);
```

Storage path convention: `projects/{project_id}/{timestamp}-{filename}`

### Perubahan Tabel `projects`

**Kolom ditambahkan:**
- `category_id UUID NOT NULL REFERENCES project_categories(id)` — menggantikan `category TEXT`
- `video_url TEXT` — nullable, URL YouTube

**Kolom dihapus (setelah migrasi):**
- `image_url TEXT` — digantikan tabel `project_images`
- `category TEXT` — digantikan `category_id`

### TypeScript Types (update `src/types/database.ts`)

```typescript
// Types baru
export type ProjectImage    = Database["public"]["Tables"]["project_images"]["Row"];
export type ProjectCategory = Database["public"]["Tables"]["project_categories"]["Row"];

// Type existing diupdate
export type Project = Database["public"]["Tables"]["projects"]["Row"];
// projects.Row sekarang punya: category_id, video_url (tanpa image_url, category)

// Type gabungan untuk query dengan relasi
export type ProjectWithRelations = Project & {
  project_categories: ProjectCategory;
  project_images: ProjectImage[];
};

// Helper functions
export function extractYouTubeId(url: string): string | null;
export function isValidYouTubeUrl(url: string): boolean;
```

---

## Correctness Properties

### Property 1: Cascade delete konsisten
Setiap penghapusan row `projects` HARUS diikuti penghapusan semua `project_images` rows dengan `project_id` yang sama. Dijamin oleh `ON DELETE CASCADE` di database, ditambah manual cleanup Storage files di `DeleteProjectButton`.

**Validates: Requirements 1.4, 9.9**

### Property 2: Category name unik (case-insensitive di aplikasi)
Tidak boleh ada dua `project_categories` rows dengan nama yang sama secara case-insensitive. Di DB dijaga oleh `UNIQUE` constraint; di aplikasi dijaga oleh query `.ilike()` sebelum insert baru.

**Validates: Requirements 1.5, 2.4, 2.5**

### Property 3: YouTube URL validation simetri
`isValidYouTubeUrl(url)` mengembalikan `true` jika dan hanya jika `extractYouTubeId(url)` mengembalikan non-null string. Keduanya harus konsisten — jika URL lolos validasi, embed iframe HARUS bisa dikonstruksi.

**Validates: Requirements 4.2, 4.3**

### Property 4: Image file size guard
File yang diupload HARUS dicek `file.size <= 5 * 1024 * 1024` sebelum dikirim ke Supabase Storage. File yang gagal validasi TIDAK boleh sampai ke Storage maupun `project_images`.

**Validates: Requirements 3.7**

### Property 5: Storage path konsisten
Setiap `project_images.storage_path` HARUS diawali `projects/{project_id}/`. `url` yang tersimpan HARUS merupakan public URL valid yang dapat di-resolve dari `storage_path` tersebut.

**Validates: Requirements 1.2, 3.3**

---

## Error Handling

### Upload Gambar
- Validasi ukuran file di sisi client sebelum upload — tampilkan error per file
- Jika upload ke Storage gagal — tampilkan error, jangan insert ke `project_images`
- Jika upload partial (beberapa berhasil, beberapa gagal) — tampilkan daftar file yang gagal, file yang berhasil tetap tersimpan

### Manajemen Category
- Jika insert category baru gagal (race condition duplikat) — retry dengan fetch existing, fallback graceful tanpa crash form

### Delete Project
- Jika Storage file deletion gagal — log error tapi tetap lanjutkan delete DB row (Storage orphan files dapat dibersihkan manual)
- Tampilkan loading state di `DeleteProjectButton` selama proses hapus berlangsung

### Validasi Form
- Field `title` dan `description` wajib — browser native validation (`required`)
- `video_url` jika diisi harus valid YouTube URL — validasi dengan `isValidYouTubeUrl()` saat blur dan submit
- Error ditampilkan inline di bawah masing-masing field dengan styling `text-blood-400`

### Query Errors
- Semua Supabase query di Server Components menggunakan destructured `{ data, error }` — jika error, render halaman dengan state kosong daripada throw

---

## Testing Strategy

### Unit Testing (functions)
- `extractYouTubeId()` — test berbagai format URL YouTube (watch, youtu.be, embed, invalid)
- `isValidYouTubeUrl()` — konsistensi dengan `extractYouTubeId`
- Validasi file size logic

### Component Testing
- `ImageCarousel` — test switch kondisi (0/1/>1 images), test pause on hover
- `CategoryFilter` — test render, test active state styling, test onSelect callback
- `VideoModal` — test portal render, test body scroll lock, test close mechanisms

### Integration Testing (manual)
- End-to-end create project dengan multi-image + category baru + video URL
- End-to-end edit project (tambah/hapus gambar)
- End-to-end delete project (verifikasi Storage cleanup)
- Category filter di halaman publik (semua state)
- Video modal (open, autoplay, close)

### Build Verification
- `npm run build` harus selesai tanpa TypeScript errors
- `npm run lint` harus pass tanpa errors
