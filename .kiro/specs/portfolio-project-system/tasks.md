# Implementation Plan: Portfolio Project System

## Overview

Implementasi Portfolio Project System dilakukan dalam 7 phase yang berurutan sesuai dependency: database schema dulu, lalu TypeScript types, kemudian komponen baru, update komponen existing, update halaman, dan diakhiri verifikasi menyeluruh. Total ada 34 tasks implementasi.

## Tasks

### Phase 1: Database & Schema

- [ ] 1.1 Buat tabel `project_categories` di Supabase
  - Jalankan SQL: CREATE TABLE dengan UNIQUE constraint pada `name`, enable RLS, tambah policies (public read, auth write)
  - Insert default categories: Web, Animation, Illustration, Logo/Branding, Photography, UI/UX

- [ ] 1.2 Buat tabel `project_images` di Supabase
  - Jalankan SQL: CREATE TABLE dengan `project_id REFERENCES projects(id) ON DELETE CASCADE`
  - Enable RLS, tambah policies (public read, auth write)

- [ ] 1.3 Tambah kolom baru ke tabel `projects`
  - `ALTER TABLE projects ADD COLUMN category_id UUID REFERENCES project_categories(id)`
  - `ALTER TABLE projects ADD COLUMN video_url TEXT`

- [ ] 1.4 Migrasi data lama ke skema baru
  - Update `category_id` dari nilai `category` text yang ada (case-insensitive match ke `project_categories`)
  - Migrasi `image_url` yang ada → insert ke `project_images` (storage_path = image_url, url = image_url)

- [ ] 1.5 Finalisasi tabel `projects` setelah migrasi berhasil diverifikasi
  - `ALTER TABLE projects ALTER COLUMN category_id SET NOT NULL`
  - `ALTER TABLE projects DROP COLUMN image_url`
  - `ALTER TABLE projects DROP COLUMN category`

- [ ] 1.6 Buat Supabase Storage bucket `project-images`
  - Set bucket visibility: Public
  - Tambah Storage policy: public read, authenticated write/delete
  - Verifikasi public URL dapat diakses dari browser

- [ ] 1.7 Update file `supabase/schema.sql`
  - Tambahkan definisi tabel baru (`project_categories`, `project_images`) ke schema.sql
  - Tambahkan kolom baru dan hapus kolom lama di definisi tabel `projects`
  - Tambahkan komentar migration notes

### Phase 2: TypeScript Types

- [ ] 2.1 Update `src/types/database.ts` — tambah tabel baru ke interface `Database`
  - Tambah `project_categories` (Row, Insert, Update interfaces)
  - Tambah `project_images` (Row, Insert, Update interfaces)

- [ ] 2.2 Update `src/types/database.ts` — update tabel `projects`
  - Hapus `image_url` dan `category` dari Row/Insert/Update
  - Tambah `category_id: string` (wajib di Insert) dan `video_url: string | null`

- [ ] 2.3 Update `src/types/database.ts` — convenience types dan helper functions
  - Export `ProjectCategory`, `ProjectImage`
  - Export `ProjectWithRelations` type (Project + project_categories + project_images)
  - Implementasi `extractYouTubeId(url: string): string | null` — support format watch, youtu.be, embed
  - Implementasi `isValidYouTubeUrl(url: string): boolean`

### Phase 3: Komponen UI Baru

- [ ] 3.1 Buat `src/components/ui/ImageCarousel.tsx`
  - Props: `images: ProjectImage[], alt: string, fallbackText?: string, className?: string`
  - Kondisi 0 images: tampilkan placeholder dengan inisial dari `fallbackText`
  - Kondisi 1 image: render `<Image>` statis, tidak ada interval
  - Kondisi >1 images: `setInterval` 3000ms untuk auto-slide, cleanup di `useEffect` return
  - onMouseEnter → `clearInterval` (pause), onMouseLeave → restart interval
  - Dot indicator: posisi absolut bottom-2 left-1/2, dot aktif `bg-blood-600`, lainnya `bg-dark-700`

- [ ] 3.2 Buat `src/components/ui/VideoModal.tsx`
  - Props: `videoUrl: string, isOpen: boolean, onClose: () => void`
  - Gunakan `extractYouTubeId()` untuk dapat video ID
  - Render iframe: `src="https://www.youtube.com/embed/{id}?autoplay=1"`
  - Implementasi sebagai React Portal ke `document.body`
  - `useEffect`: toggle `document.body.style.overflow = 'hidden'` saat `isOpen` true
  - Backdrop overlay hitam semi-transparan + tombol ×
  - `AnimatePresence` + `motion.div` dari framer-motion untuk fade/scale animation

- [ ] 3.3 Buat `src/components/ui/CategoryFilter.tsx`
  - Props: `categories: ProjectCategory[], activeCategory: string | null, onSelect: (id: string | null) => void`
  - Tombol "Semua" (value `null`) selalu tampil pertama
  - Render satu tombol per category dari props
  - Styling aktif: `bg-blood-600/10 border border-blood-700 text-blood-400`
  - Styling tidak aktif: `border border-dark-800 text-dark-500 hover:border-dark-700 hover:text-dark-400`

### Phase 4: Komponen Admin Baru

- [ ] 4.1 Buat `src/components/admin/ImageUploader.tsx`
  - Props: `projectId?: string, existingImages: ProjectImage[], onPendingFilesChange: (files: File[]) => void, onDeleteExisting: (image: ProjectImage) => void`
  - Input file: `multiple`, `accept="image/jpeg,image/png,image/webp,image/gif"`
  - Validasi size: `file.size > 5 * 1024 * 1024` → set error state, jangan tambah ke pending
  - Preview: `URL.createObjectURL(file)` + `useEffect` cleanup dengan `URL.revokeObjectURL`
  - Section existing images: grid thumbnail + tombol × per gambar yang panggil `onDeleteExisting`
  - Section pending files: grid preview + tombol × per file yang hapus dari pending state

- [ ] 4.2 Buat `src/components/admin/CategoryCombobox.tsx`
  - Props: `categories: ProjectCategory[], value: string | null, onChange: (id: string) => void`
  - State: `inputValue` (teks yang diketik), `isOpen` (dropdown open/close)
  - Saat input match existing (case-insensitive) → highlight match di dropdown
  - Saat input tidak match → tampilkan opsi "Tambah category: '{inputValue}'"
  - Saat pilih/buat: gunakan `createAdminClient()`, insert jika baru, panggil `onChange(id)`

### Phase 5: Update Komponen yang Ada

- [ ] 5.1 Update `src/components/ui/ProjectCard.tsx`
  - Tambah `"use client"` di baris pertama
  - Ganti prop type: `project: ProjectWithRelations`
  - Import dan gunakan `ImageCarousel` dengan `images={project.project_images}` dan `fallbackText={project.title}`
  - Ganti `project.category` → `project.project_categories.name`
  - Tambah state: `const [isVideoOpen, setIsVideoOpen] = useState(false)`
  - Tambah tombol play (ikon `Play` dari lucide-react, ukuran 20) sebagai overlay absolut di atas thumbnail — hanya render jika `project.video_url !== null`
  - Render `<VideoModal>` di akhir komponen

- [ ] 5.2 Update `src/components/sections/ProjectsSection.tsx`
  - Import `ProjectWithRelations` dari `@/types/database`
  - Ganti prop type `projects: Project[]` → `projects: ProjectWithRelations[]`

- [ ] 5.3 Update `src/components/admin/ProjectForm.tsx`
  - Tambah props: `categories: ProjectCategory[]`, `existingImages?: ProjectImage[]`
  - Hapus state `category` (string), ganti dengan `categoryId: string | null`
  - Hapus field input `image_url`
  - Tambah state `pendingFiles: File[]` dan `imagesToDelete: ProjectImage[]`
  - Tambah field `video_url` dengan validasi `isValidYouTubeUrl()` — error jika diisi tapi tidak valid
  - Ganti `<select>` category → `<CategoryCombobox categories={categories} value={categoryId} onChange={setCategoryId} />`
  - Tambah `<ImageUploader existingImages={existingImages} onPendingFilesChange={setPendingFiles} onDeleteExisting={img => setImagesToDelete(prev => [...prev, img])} />`
  - Update `handleSubmit`:
    - Untuk create: insert project → dapat ID → upload pending files → insert ke `project_images`
    - Untuk edit: update project → hapus `imagesToDelete` dari Storage + DB → upload pending files baru

- [ ] 5.4 Update `src/components/admin/DeleteProjectButton.tsx`
  - Sebelum `supabase.from("projects").delete()`: list semua file di Storage path `projects/${id}`
  - Hapus semua file dengan `supabase.storage.from("project-images").remove(paths)`
  - Baru kemudian delete baris project

### Phase 6: Update Halaman

- [ ] 6.1 Update `src/app/(public)/page.tsx`
  - Update query projects: `.select("*, project_categories(*), project_images(id, url, storage_path, order_index)")`
  - Update type cast: `ProjectWithRelations[]`
  - Pass ke `<ProjectsSection>` (type sudah diupdate di task 5.2)

- [ ] 6.2 Buat `src/app/(public)/projects/ProjectsClientPage.tsx`
  - `"use client"` component
  - Props: `projects: ProjectWithRelations[], categories: ProjectCategory[]`
  - State: `const [activeCategory, setActiveCategory] = useState<string | null>(null)`
  - Computed: `filteredProjects = activeCategory ? projects.filter(p => p.category_id === activeCategory) : projects`
  - Render: `<CategoryFilter>` di atas, lalu grid `<ProjectCard>` dari `filteredProjects`

- [ ] 6.3 Update `src/app/(public)/projects/page.tsx`
  - Update query: `.select("*, project_categories(*), project_images(id, url, storage_path, order_index)")`
  - Tambah query categories: fetch `project_categories` yang ID-nya ada di projects hasil query
  - Hapus logika lama `const categories = [...new Set(projects.map(p => p.category))]`
  - Render `<ProjectsClientPage projects={projects} categories={categories} />`

- [ ] 6.4 Update `src/app/zhaorukou/dashboard/projects/page.tsx`
  - Update query: `.select("*, project_categories(name)")`
  - Ganti semua referensi `project.category` → `(project as ProjectWithCategory).project_categories?.name`

- [ ] 6.5 Update `src/app/zhaorukou/dashboard/projects/new/page.tsx`
  - Fetch `project_categories` dari Supabase server client
  - Pass `categories` sebagai prop ke `<ProjectForm>`

- [ ] 6.6 Update `src/app/zhaorukou/dashboard/projects/[id]/page.tsx`
  - Update query: `.select("*, project_categories(*), project_images(*)")`
  - Update type: cast ke `ProjectWithRelations`
  - Fetch semua `project_categories` secara terpisah untuk dropdown form
  - Pass `categories`, `existingImages={project.project_images}` ke `<ProjectForm>`

### Phase 7: Verifikasi & Polish

- [ ] 7.1 Jalankan `npm run build` dan perbaiki semua TypeScript errors
  - Pastikan tidak ada `any` yang tidak diperlukan
  - Pastikan semua import ter-update

- [ ] 7.2 Test end-to-end create project
  - Buat project dengan 3 gambar, category baru, dan video YouTube URL
  - Verifikasi gambar muncul di Supabase Storage dengan path yang benar
  - Verifikasi carousel berjalan di ProjectCard (interval + pause on hover)

- [ ] 7.3 Test end-to-end edit project
  - Tambah gambar baru ke project existing, hapus gambar lama
  - Verifikasi gambar yang dihapus hilang dari Storage dan `project_images`

- [ ] 7.4 Test delete project
  - Hapus project yang punya 3 gambar
  - Verifikasi semua file Storage terhapus
  - Verifikasi `project_images` rows terhapus via cascade

- [ ] 7.5 Test category filter halaman publik
  - Verifikasi "Semua" menampilkan semua project
  - Verifikasi filter per category hanya menampilkan project yang sesuai
  - Verifikasi visual active/inactive state

- [ ] 7.6 Test video modal
  - Verifikasi tombol play hanya muncul pada project dengan `video_url`
  - Verifikasi modal open + video autoplay
  - Verifikasi close via overlay dan tombol ×
  - Verifikasi body scroll terkunci saat modal open

- [ ] 7.7 Accessibility final check
  - Tombol play memiliki `aria-label="Tonton video {project.title}"`
  - VideoModal memiliki `role="dialog"` dan `aria-modal="true"`
  - ImageCarousel memiliki `aria-live="polite"` pada container gambar
  - Semua `<Image>` memiliki `alt` text yang bermakna

---

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1.1", "1.2", "1.3", "1.6"],
      "description": "Tabel baru dan Storage bucket (independen satu sama lain)"
    },
    {
      "wave": 2,
      "tasks": ["1.4"],
      "description": "Migrasi data lama (butuh 1.1, 1.2, 1.3)"
    },
    {
      "wave": 3,
      "tasks": ["1.5", "1.7"],
      "description": "Finalisasi schema dan update schema.sql (butuh 1.4)"
    },
    {
      "wave": 4,
      "tasks": ["2.1"],
      "description": "Tambah tabel baru ke TypeScript Database interface (butuh Phase 1)"
    },
    {
      "wave": 5,
      "tasks": ["2.2", "2.3"],
      "description": "Update projects type dan convenience types (butuh 2.1)"
    },
    {
      "wave": 6,
      "tasks": ["3.1", "3.2", "3.3", "4.1", "4.2"],
      "description": "Semua komponen baru (butuh Phase 2)"
    },
    {
      "wave": 7,
      "tasks": ["5.1", "5.2", "5.3", "5.4"],
      "description": "Update komponen existing (butuh Phase 3 dan 4)"
    },
    {
      "wave": 8,
      "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6"],
      "description": "Update semua halaman (butuh Phase 5)"
    },
    {
      "wave": 9,
      "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7"],
      "description": "Build verification, testing end-to-end, dan accessibility (butuh semua phase sebelumnya)"
    }
  ]
}
```

---

## Notes

- **Migrasi data** (Task 1.4 dan 1.5) harus dilakukan secara hati-hati — verifikasi data sudah ter-migrate dengan benar sebelum drop kolom lama
- **Storage bucket name** `project-images` harus tepat karena digunakan di kode `createAdminClient().storage.from("project-images")`
- **Client-side filtering** dipilih daripada server-side filtering karena jumlah project portfolio kecil — ini menyederhanakan arsitektur dan menghindari URL state management
- **`ProjectCard` menjadi Client Component** karena membutuhkan state (`isVideoOpen`, `currentIndex`). Ini trade-off yang dapat diterima karena komponen ini tidak perlu SEO metadata
- **`admin-client.ts`** saat ini untyped (`any`). Setelah types diupdate, bisa dipertimbangkan untuk menambahkan typing yang proper, tapi tidak wajib dalam scope ini
- **Supabase Storage cleanup** di `DeleteProjectButton` bersifat best-effort — jika gagal, baris DB tetap dihapus. Storage orphan dapat dibersihkan manual via dashboard
