# PRD (Product Requirements Document)
## ZyrenPorto — Admin Panel / CMS

**Versi**: 1.0
**Tanggal**: 2026-09-17
**Status**: Existing System Documentation
**Scope**: Admin Panel (CMS) — tidak mencakup landing page public-facing

---

## 1. Executive Summary

Admin Panel (dikenal juga sebagai "Zhiya Admin") adalah CMS internal untuk mengelola seluruh konten portfolio website ZyrenPorto. Akses terbatas hanya untuk pemilik website melalui Supabase Authentication (email + password). Route tersembunyi: `/zhaorukou` (bukan `/admin`) untuk security through obscurity.

Admin panel menangani 10 domain pekerjaan: dashboard analytics, messages inbox (Email + WhatsApp), content editor landing page, CRUD project portfolio, CRUD certificates, CRUD skills, upload background music, content protection, API keys & site settings, serta preview website.

---

## 2. Goals & Objectives

### Primary Goals
| # | Goal | Success Metric |
|---|------|----------------|
| 1 | Admin bisa mengelola SEMUA konten portfolio tanpa edit kode | 100% konten landing page bisa diubah via CMS |
| 2 | Pemilik bisa membalas pesan masuk (Email & WA) tanpa buka platform lain | Semua pesan dikelola dari 1 halaman inbox terpusat |
| 3 | Analytics page views terlihat realtime di dashboard | Statistik views per bulan tampil dalam chart interaktif |
| 4 | Proteksi konten untuk mencegah copy-paste / scraping | 5 lapisan proteksi bisa toggle on/off |

### Non-Goals
- ❌ Multi-user / role-based access (hanya single admin)
- ❌ Post scheduling / workflow approval
- ❌ A/B testing
- ❌ Built-in database backup

---

## 3. Users & Personas

| User | Akses | Use Case Utama |
|------|-------|----------------|
| **Super Admin** (Pemilik portfolio: Reavlenia Arezha) | Full access ke semua route | Mengelola konten harian, balas pesan, update portfolio project, ganti API keys |

Hanya 1 role. Tidak ada editor, viewer, atau guest role.

---

## 4. Architecture Overview

### 4.1 Technology Stack
| Layer | Teknologi |
|-------|-----------|
| Frontend Framework | Next.js 15.5.x (App Router) |
| UI Library | React 18 + Tailwind CSS + Custom Design System (tema gelap `dark-*` + aksen `blood-*`) |
| Icons | Lucide React |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Email/Password) |
| File Storage | Supabase Storage (buckets: `hero`, `logos`, `project-images`, `certificates`, `music`) |
| Hosting | Vercel |
| External API | Remove.bg (image background removal) |

### 4.2 Route Structure (URL)
```
/zhaorukou                          → Login Page (halaman auth)
/zhaorukou/dashboard                → Dashboard Utama (analytics + ringkasan)
  ├─ messages                       → Email Inbox (sub-tab: Settings, WA Inbox)
  │   ├─ wa                         → WhatsApp Inbox
  │   └─ settings                   → Messages Settings (webhook, template balasan)
  ├─ content                        → Content Editor (semua section landing page)
  ├─ projects                       → List semua project
  │   ├─ new                        → Form tambah project baru
  │   └─ [id]                       → Form edit project by ID
  ├─ certificates                   → CRUD sertifikat
  ├─ skills                         → List semua skill/tech stack
  │   ├─ new                        → Form tambah skill
  │   └─ [id]                       → Form edit skill by ID
  ├─ music                          → Upload & kelola background music
  ├─ protection                     → Content Protection settings
  ├─ settings                       → API Keys & site info
  └─ preview                        → Iframe preview website publik
```

### 4.3 Layout Hierarchy (3-level nesting)
1. **`/zhaorukou/layout.tsx`** — Inject `HideTidio`, set metadata `noindex nofollow`
2. **`/zhaorukou/dashboard/layout.tsx`** — Sidebar kiri (fixed) + Main content (scrollable max-w-5xl)
3. **`/zhaorukou/dashboard/messages/layout.tsx`** — Sub-tabs untuk Messages module

### 4.4 Security Layer
| Layer | Implementasi |
|-------|--------------|
| Route Protection | **Next.js Middleware** di `middleware.ts` — matcher `/zhaorukou/:path*`. Cek `supabase.auth.getUser()` sebelum route dieksekusi. Belum login → redirect `/zhaorukou`. Sudah login tapi akses `/zhaorukou` → redirect `/dashboard`. |
| Auth Method | Supabase Email/Password Sign-In |
| API Key Exposure | Server-only keys (REMOVEBG_API_KEY) tidak di-expose ke client (ditampilkan masked `••••••`). `NEXT_PUBLIC_*` prefix hanya untuk client-safe Supabase URL + publishable key. |
| noindex | Halaman admin `robots: { index: false, follow: false }` |
| Hidden Route | Path tidak mudah ditebak (`/zhaorukou` bukan `/admin`) |

---

## 5. Features Specification

---

### 5.1 Auth (Login / Logout)
**Route**: `/zhaorukou` (login), Sidebar → Sign Out button

#### Acceptance Criteria
- Form login punya field Email + Password (toggle show/hide password)
- Error state "Email atau password salah" tampil jika auth gagal
- Sukses → redirect `/zhaorukou/dashboard` + `router.refresh()`
- Sign Out → `supabase.auth.signOut()` + redirect `/zhaorukou`
- Link "View Site" buka homepage tab baru

---

### 5.2 Dashboard
**Route**: `/zhaorukou/dashboard`
**Komponen**: `DashboardPage` (Server Component) + `AnalyticsChart` + `ContentProtection`

#### Sections & Data Fetched
| Section | Data Source | Keterangan |
|---------|-------------|------------|
| **4 Stat Cards** (grid 4 kolom) | `projects`, `skills`, `page_views`, `messages` + `messages_wa` | Clickable link ke halaman masing-masing. Badge pulsating merah jika ada pesan unread. |
| **Analytics Chart** | `page_views` (semua record) | Group views by tahun+bulan. Dropdown filter tahun. Show total views. |
| **Pesan Terbaru** | `messages` (3 terbaru) + `messages_wa` (2 terbaru) | Gabung sort by created_at DESC, max 4 item. Indicator read/unread. |
| **Quick Actions** | Static links | "Tambah Project Baru" + "Tambah Skill Baru" |
| **Recent Projects Table** | `projects` JOIN `project_categories` | 5 project terbaru. Columns: Title, Category, Featured badge. |
| **Content Protection Widget** | `site_settings.key='content_protection'` | Toggle master on/off + per-feature toggle (lihat 5.8) |

#### Data Points
- Total Projects + count Featured
- Total Skills + count unique categories
- Total Views all-time + views bulan ini
- Total Messages (Email + WA) + total unread

---

### 5.3 Sidebar Navigation
**Komponen**: `AdminSidebar.tsx` (Client Component)

#### 10 Menu Items (static array `navItems`)
| Order | Label | Icon | Route | Active Logic |
|-------|-------|------|-------|--------------|
| 1 | Dashboard | LayoutDashboard | `/dashboard` | exact match |
| 2 | Messages | MessageSquare | `/messages` | startWith + **badge unread counter** |
| 3 | Content | FileText | `/content` | startsWith |
| 4 | Projects | FolderOpen | `/projects` | startsWith |
| 5 | Certificates | Award | `/certificates` | startsWith |
| 6 | Skills | Wrench | `/skills` | startsWith |
| 7 | Music | Music | `/music` | startsWith |
| 8 | Protection | Shield | `/protection` | startsWith |
| 9 | Settings | Settings | `/settings` | startsWith |
| 10 | Preview | Eye | `/preview` | startsWith |

#### Realtime Badge
- **Polling**: setiap 30 detik fetch count `messages.read=false` + `messages_wa.read=false`
- Display: `{unread}` sebagai badge merah pojok kanan menu Messages (max display 9+, sisanya "9+")

---

### 5.4 Messages Module (3 Sub-Tabs)
**Layout**: Tabbed sub-navbar di route `/messages/*`

#### Sub-Tab A — Email Inbox (`/messages`)
**Komponen**: `MessagesInbox.tsx`

| Fitur | Detail |
|-------|--------|
| Layout | Split view: list (kiri w-80) + detail+reply (kanan flex-1), tinggi `h-[calc(100vh-180px)]` |
| Message List | Urut newest first. Indicator: border-l merah jika unread, icon MailOpen, checkmark hijau jika sudah direply. Nama, email, preview 2 baris pesan, timestamp. |
| Mark Read | Otomatis saat pesan di-select |
| Delete | Tombol Trash + confirm dialog "Hapus pesan dari {name}?" |
| Reply Form | Textarea + Send button. Submit ke `/api/email-reply` POST. Status: loading spinner, error text, success "✓ Terkirim" (auto-hide 3 detik). Tandai `replied=true` di DB. |

#### Sub-Tab B — WhatsApp Inbox (`/messages/wa`)
**Komponen**: `WaInbox.tsx`

- Mirip Email Inbox, tapi data dari table `messages_wa`
- Reply via POST `/api/wa-reply`
- Webhook penerima: `POST /api/wa-webhook`

#### Sub-Tab C — Messages Settings (`/messages/settings`)
**Komponen**: `MessageSettings.tsx`

- Konfigurasi: email tujuan (forward ke admin email), WA API URL, webhook secret, template balasan otomatis

---

### 5.5 Content Editor
**Route**: `/content`
**Komponen**: `ContentEditor.tsx` (Client Component, sangat state-heavy)

Edit SEMUA section landing page dari 1 halaman. Data disimpan ke tabel `site_settings` (key-value JSON).

#### Sections Bisa Diedit
| Section | Fields yang Bisa Diedit |
|---------|------------------------|
| **Hero** | Nama first/last, roles array (typewriter effect), bio text, stats items (value+label), **hero image** upload + crop editor |
| **Site Logo** | Upload logo PNG/SVG ke bucket `logos` (max 5MB) |
| **About** | Stats items, traits (icon + title + desc, 4 traits default), bio paragraphs array |
| **Skills Heading** | Label, titleMain, titleAccent, subtitle |
| **Contact Heading** | Label, titleMain, titleAccent, subtitle |
| **Contact Info** | Dynamic social links CRUD (14 icon options: mail, github, linkedin, instagram, twitter, youtube, facebook, twitch, tiktok, dribbble, figma, phone, globe, link), location text + show toggle, Google Maps URL + show toggle, WhatsApp number |

#### Upload Behavior
- Hero image: max 10MB → buka `ImageEditor` (crop/rotate/remove-bg via remove.bg API) → upload ke bucket `hero` via `/api/upload-asset` (server route delete file lama otomatis)
- Semua upload pakai FormData → server API `POST /api/upload-asset`

---

### 5.6 Projects CRUD
List route: `/projects`
New route: `/projects/new`
Edit route: `/projects/[id]`
**Komponen form**: `ProjectForm.tsx` + helper `CategoryCombobox.tsx`, `ImageUploader.tsx`, `ImageEditor.tsx`, `DeleteProjectButton.tsx`

#### Form Fields
| Field | Type | Validasi / Note |
|-------|------|-----------------|
| Title | string | required |
| Description | string (short) | required, untuk card di homepage |
| Long Description | text (long) | opsional, untuk halaman detail project |
| Content Blocks | `ContentBlock[]` array dinamis | Editor blok: **text**, **image**, **embed** (Figma/Behance/YouTube), **divider**. Bisa reorder ↑↓, delete, add. |
| Category | FK → `project_categories.id` | `CategoryCombobox` + bisa buat kategori baru inline |
| Tech Stack | string, comma-separated | Disimpan sebagai `text[]` PostgreSQL |
| Linked Skills | multi-select FK → `project_skills` | Hubungkan project ke tabel `skills` (many-to-many) |
| Gallery Images | `File[]` multiple upload | Maks per file 10MB, hapus gambar lama bisa individual, `ImageEditor` opsional |
| Thumbnail / Cover | single image | Ditampilkan di card portfolio |
| Live URL | URL | "Buka Demo" button |
| GitHub URL | URL | Source code link |
| Video URL | YouTube URL | Validasi `isValidYouTubeUrl()`, extract video ID otomatis |
| Featured | boolean toggle | Muncul di bagian "Featured Projects" homepage |
| NDA Mode | boolean toggle | Jika aktif, konten disensor / blur di public |
| Order Index | number | Urutan tampil di list (ASC) |

#### Delete Flow
- Tombol merah di edit page → confirm dialog → `DELETE FROM projects WHERE id = ?` + cascade delete `project_images` dan file di Storage

---

### 5.7 Skills CRUD
List route: `/skills`
New route: `/skills/new`
Edit route: `/skills/[id]`
**Komponen form**: `SkillForm.tsx` + `DeleteSkillButton.tsx`

#### Form Fields
| Field | Type / Options | Validasi |
|-------|----------------|----------|
| Nama Skill | string | required, contoh: "Next.js" |
| Category | enum select | `Frontend`, `Backend`, `Tools`, `Creative`, `Mobile`, `Other` |
| Icon URL | URL | Simpleicons CDN format: `https://cdn.simpleicons.org/{slug}/{color}`. Hint text disediakan. |
| Icon Size | range slider 20%–100% | Step 5%. Live preview thumbnail icon. Default 70%. |
| Order Index | number min 0 | Urutan tampil |

---

### 5.8 Certificates Manager
**Route**: `/certificates`
**Komponen**: `CertificatesManager.tsx`

2 Mode Input:
1. **Link Mode** — Paste URL credential (LinkedIn / Credly / Coursera / Google / Dicoding) → auto-detect platform → badge warna sesuai platform
2. **Upload Mode** — Upload file certificate (image/PDF, max 10MB) → simpan ke bucket `certificates`

#### Fields
| Field | Mode | Required |
|-------|------|----------|
| Title | Semua | ✅ |
| Issuer | Semua | ✅ |
| Issue Date | Semua | ❌ |
| Description | Semua | ❌ |
| LinkedIn / Credential URL | Link Mode | ✅ |
| File Upload + file_type detect | Upload Mode | ✅ |

#### Platform Auto-Detect & Badge Colors
Detect dari URL domain:
- LinkedIn → biru `#0A66C2`
- Credly → oranye `#FF6B00`
- Coursera → biru `#0056D2`
- Google → biru `#4285F4`
- Dicoding → biru muda `#4FC3F7`
- Other → blood red default

---

### 5.9 Music Manager
**Route**: `/music`
**Komponen**: `MusicManager.tsx`
**Bucket Storage**: `music`

#### Behavior
- Hanya bisa simpan **1 file aktif** (single background music)
- Upload file baru → file lama auto-delete dari storage
- Constraints: tipe `audio/*`, max 20MB
- Audio player inline di halaman admin: Play/Pause preview (loop)
- Filename pattern di storage: `bgm-{timestamp}.{ext}`
- Setting disimpan di `site_settings.key = 'music'` → `{ url: string }`
- Diputar otomatis (muted) di website publik, user bisa unmute di navbar

---

### 5.10 Content Protection
**Route**: `/protection` & widget di Dashboard
**Komponen**: `ContentProtection.tsx`
**Client-side enforcement**: `useContentProtection.ts` hook + `<ContentProtectionProvider>` di root layout

#### 5 Toggleable Features (JSON stored di `site_settings.key = 'content_protection'`)
| Key | Feature | Mechanism |
|-----|---------|-----------|
| `masterEnabled` | Master Switch | Toggle ON → auto aktifkan semua 5 fitur sekaligus |
| `disableRightClick` | Nonaktifkan klik kanan | `contextmenu` event → `preventDefault()` |
| `blurOnLeave` | Blur halaman saat kursor keluar | `mouseleave` window → blur CSS filter `blur(20px)` |
| `disableSelection` | Nonaktifkan seleksi teks | CSS `user-select: none` + event `copy/cut` → preventDefault |
| `blockDevTools` | Blokir shortcut DevTools | Keymap intercept: F12, Ctrl+Shift+I/J/C, Ctrl+U (view source), Ctrl+S (save), Ctrl+P (print) |
| `disableImageInteraction` | Proteksi gambar | `draggable=false` + prevent `dragstart` + CSS `-webkit-user-drag: none` + hapus context menu + `contenteditable=false` |

Status counters: `{activeCount}/5 aktif` ditampilkan di header widget

---

### 5.11 Settings & API Keys
**Route**: `/settings`
**Komponen**: `ApiSettings.tsx`

#### 3 API Keys Dikelola
| Key | Env Var Name | Visibility | Docs Link |
|-----|--------------|------------|-----------|
| Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` | Client-safe, partial mask 6awal••••4akhir | Supabase Dashboard → Settings → API |
| Supabase Publishable Key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client-safe, masked | Supabase Dashboard → Settings → API |
| Remove.bg API Key | `REMOVEBG_API_KEY` | SERVER-ONLY, full masked `••••••••••••` (tidak pernah expose value asli ke browser) | remove.bg/api |

#### Important Note for Admin
> Banner di atas form menjelaskan bahwa untuk update **aktif** API keys, perlu update Environment Variables di **Vercel Dashboard** → Settings → Environment Variables, lalu trigger redeploy. Form ini simpan ke `site_settings` hanya sebagai referensi / catatan admin.

#### Info Project Panel (read-only)
Menampilkan stack yang dipakai: Framework (Next.js), Database (Supabase), Hosting (Vercel), Remove BG API, 4 nama Storage buckets

---

### 5.12 Preview Page
**Route**: `/preview`
- Menampilkan website publik (`/`) dalam `<iframe>` full-height
- Fungsinya: admin cek perubahan content tanpa keluar dari admin panel

---

## 6. Data Model (Database Schema)

### Core Tables (PostgreSQL / Supabase)

| Table Name | Primary Key | Description |
|------------|-------------|-------------|
| `project_categories` | `id` (uuid) | Kategori project: Web Dev, Design, dll |
| `projects` | `id` (uuid) | Entitas portfolio project utama |
| `project_images` | `id` (uuid) | Gallery images per project (FK → projects) |
| `project_skills` | `(project_id, skill_id)` composite FK | Many-to-many hubungkan project ↔ skill |
| `skills` | `id` (uuid) | Tech stack / keahlian |
| `certificates` | `id` (uuid) | Sertifikat achievement |
| `site_settings` | `key` (string) **PK bukan UUID** | Key-value store JSON untuk SEMUA setting dinamis (content editor, music URL, content protection, API keys reference) |
| `messages` | `id` (uuid) | Pesan dari form contact (Email channel) |
| `messages_wa` | `id` (uuid) | Pesan masuk WhatsApp channel |
| `page_views` | `id` (uuid) | Analytics: log setiap page view |

### Tabel `site_settings` (Key-Value Pattern)
Ini tabel PENTING karena hampir semua CMS settings tersimpan di sini dengan pola key:
```
key = 'hero_name'          → value: { first: string, last: string }
key = 'hero_roles'         → value: { roles: string[] }
key = 'hero_image'         → value: { url: string }
key = 'site_logo'          → value: { url: string }
key = 'about_stats'        → value: { items: StatsItem[] }
key = 'about_traits'       → value: { items: TraitItem[] }
key = 'about_bio'          → value: { paragraphs: string[] }
key = 'skills_heading'     → value: { label, titleMain, titleAccent, subtitle }
key = 'contact_info'       → value: { socialLinks: [...], location, mapsUrl, wa_number, ... }
key = 'music'              → value: { url: string }
key = 'content_protection' → value: { masterEnabled, disableRightClick, blurOnLeave, ... }
key = 'footer_settings'    → value: { links, copyright, socials }
key = `api_key_{ENV_VAR}`  → value: { value: string } ← referensi admin
```

### Storage Buckets
| Bucket Name | Content | Max Size Limit |
|-------------|---------|----------------|
| `hero` | Foto hero / profile image | 10 MB per upload |
| `logos` | Logo website | 5 MB per upload |
| `project-images` | Thumbnails + gallery project | 10 MB per gambar |
| `certificates` | File gambar / PDF sertifikat | 10 MB per file |
| `music` | Background music MP3/WAV/OGG | 20 MB per file, hanya 1 file aktif |

---

## 7. API Route Handlers (Server-Side)

Semua ada di folder `src/app/api/*`, method POST untuk write operations.

| Route | Method | Fungsi |
|-------|--------|--------|
| `/api/update-setting` | POST | Upsert `site_settings` (umum, termasuk API keys reference) |
| `/api/portfolio-info` | POST | Save bulk content editor fields (hero, about, contact, skills heading) |
| `/api/project-save` | POST | Upsert project + images + skills junction table |
| `/api/certificates-save` | POST | CRUD sertifikat (action: create/update/delete via payload) |
| `/api/upload-asset` | POST | Upload file → Supabase Storage. FormData fields: `file`, `bucket`, `oldPath?` (hapus file lama). Return `{ url, path }`. |
| `/api/music` | POST | Update music URL di site_settings |
| `/api/protection-settings` | GET | Read content_protection settings (untuk client-side enforcement) |
| `/api/protection-settings` | POST | Write content_protection settings |
| `/api/footer-settings` | POST | Update footer links + socials |
| `/api/track-view` | POST | Insert row ke `page_views` (dipanggil dari `<PageViewTracker>` client component) |
| `/api/contact` | POST | Terima submit form contact publik → insert ke tabel `messages` |
| `/api/email-reply` | POST | Admin balas email (kirim via SMTP / email provider) |
| `/api/wa-webhook` | POST | Webhook: terima WA baru dari provider (Fonnte / Whacenter / dll) |
| `/api/wa-reply` | POST | Admin balas WA via provider API |
| `/api/chat` | POST | Proxy chatbot request ke OpenAI |
| `/api/remove-bg` | POST | Proxy gambar ke Remove.bg API, return processed image |
| `/api/image-proxy` | GET | Proxy load gambar untuk proteksi (anti hotlink) |
| `/api/test-notification` | POST | Test kirim notifikasi (debug webhook) |

---

## 8. User Flows (Critical Paths)

### Flow 8.1 — Login
```
User buka /zhaorukou
  → Input Email + Password
  → POST Supabase signInWithPassword
  → ✅ Sukses → redirect /zhaorukou/dashboard
  → ❌ Gagal → show error "Email atau password salah"
```

### Flow 8.2 — Tambah Project Baru
```
Dashboard → Quick Action "+ Tambah Project Baru" (/projects/new)
  → Isi form: title, desc, category, tech stack, links
  → Upload thumbnail + gallery images (buka ImageEditor opsional)
  → Tambah Content Blocks (text/image/embed/divider, reorder)
  → Centang Featured / NDA Mode jika perlu
  → Submit
  → POST /api/project-save → Insert projects + project_images + project_skills
  → Redirect /projects (lihat project di list)
```

### Flow 8.3 — Balas Pesan Email
```
Sidebar → Messages (tab Email Inbox default)
  → Klik pesan di list kiri (auto mark read)
  → Lihat detail pesan di kanan
  → Tulis balasan di textarea
  → Send Reply
  → POST /api/email-reply (kirim email)
  → ✅ Sukses: markReplied=true (badge check hijau muncul di list)
```

### Flow 8.4 — Update Hero Content + Image
```
Content Editor (/dashboard/content)
  → Scroll ke section HERO
  → Ubah nama / roles / bio / stats
  → Klik Upload Hero Image → pilih file (max 10MB)
  → ImageEditor terbuka: crop, rotate, atau hapus background
  → Confirm Edit → POST /api/upload-asset → replace file lama
  → Klik tombol SAVE global
  → POST /api/portfolio-info → upsert multiple site_settings keys
  → Status "Saved" checkmark
```

### Flow 8.5 — Aktifkan Content Protection
Cara 1 (Dashboard Widget):
```
Dashboard → scroll ke Content Protection widget
  → Klik Master Switch → toggle ON
  → Semua 5 proteksi auto aktif
  → Auto-save ke site_settings via fetch /api/protection-settings
```
Cara 2 (Halaman Protection):
```
Protection page → toggle per-feature individual
  → Atur kombinasi yang diinginkan (misal: hanya blokir copy + right-click)
  → Auto-save realtime per toggle
```

---

## 9. UI/UX Design Guidelines

### Design Tokens (consistent di seluruh admin)
| Token | Value | Kegunaan |
|-------|-------|----------|
| **Background** | `bg-dark-950` / `#0a0a0a` | Body background |
| **Card** | `card-dark` utility class | Semua panel/container admin |
| **Borders** | `border-dark-800` (default) → `border-blood-800` (hover) | Cards, inputs |
| **Primary Accent** | `blood-*` palette (50-950) | Buttons, active menu, links, badges, CTAs |
| **Text Primary** | `text-dark-100` / `text-dark-200` | Headings, body |
| **Text Secondary** | `text-dark-500` / `text-dark-600` | Labels, hints, metadata |
| **Mono Font** | `font-mono` class | ALL labels, small text, timestamps, hints, code comments |
| **Border Radius** | `rounded-lg` (inputs), `rounded-xl` (cards), `rounded-2xl` (login card) | Consistent sizing |
| **Transitions** | `transition-colors` everywhere | Hover states smooth 150-300ms |

### Admin Branding
- Logo brand di sidebar + login: **`<Zhiya/>`** dengan angle bracket berwarna blood
- Subtitle: `// restricted access` / `// Admin Panel` (gaya komentar kode)
- All lowercase label + uppercase tracking-widest section headers
- Comment-style hints: `// ini contoh hint` untuk microcopy penjelasan

---

## 10. Components Inventory (22 Admin Components)

| Component | Lokasi File | Dipakai Di |
|-----------|-------------|------------|
| `AdminSidebar` | `components/admin/AdminSidebar.tsx` | Dashboard layout |
| `AnalyticsChart` | `components/admin/AnalyticsChart.tsx` | Dashboard page |
| `ApiSettings` | `components/admin/ApiSettings.tsx` | Settings page |
| `CategoryCombobox` | `components/admin/CategoryCombobox.tsx` | ProjectForm |
| `CertificatesManager` | `components/admin/CertificatesManager.tsx` | Certificates page |
| `ContentEditor` | `components/admin/ContentEditor.tsx` | Content page |
| `ContentProtection` | `components/admin/ContentProtection.tsx` | Dashboard widget + Protection page |
| `DeleteProjectButton` | `components/admin/DeleteProjectButton.tsx` | Edit Project page |
| `DeleteSkillButton` | `components/admin/DeleteSkillButton.tsx` | Edit Skill page |
| `HideTidio` | `components/admin/HideTidio.tsx` | Admin root layout |
| `ImageEditor` | `components/admin/ImageEditor.tsx` | ContentEditor + ProjectForm (inline before upload) |
| `ImageUploader` | `components/admin/ImageUploader.tsx` | ProjectForm |
| `MessageSettings` | `components/admin/MessageSettings.tsx` | Messages Settings page |
| `MessagesInbox` | `components/admin/MessagesInbox.tsx` | Messages Email Inbox |
| `MusicManager` | `components/admin/MusicManager.tsx` | Music page |
| `ProjectForm` | `components/admin/ProjectForm.tsx` | New + Edit Project |
| `SecurityGuard` | `components/admin/SecurityGuard.tsx` | Client-side guard admin routes |
| `SecurityPanel` | `components/admin/SecurityPanel.tsx` | Protection page detail panel |
| `SkillForm` | `components/admin/SkillForm.tsx` | New + Edit Skill |
| `WaInbox` | `components/admin/WaInbox.tsx` | Messages WA Inbox |

---

## 11. Known Constraints & Limitations

| # | Constraint | Detail |
|---|------------|--------|
| 1 | Single Admin User | Tidak support multi-admin / RLS roles |
| 2 | 1 Background Music Aktif | Tidak bisa playlist / multiple music random |
| 3 | Update true API key butuh Vercel Redeploy | Form Settings hanya simpan referensi, env vars harus di-setting manual di Vercel Dashboard |
| 4 | Upload size limits | Hero 10MB, Logo 5MB, Sertifikat 10MB, Music 20MB — di-enforce client-side alert() |
| 5 | Content Protection bisa dibypass advanced user | Blokir DevTools + copy protection hanya mitigasi, bukan keamanan absolut (bisa disable JS) |
| 6 | Badge Messages polling-based | Bukan realtime websocket, cek setiap 30 detik saja |
| 7 | No recycle bin / soft delete | Semua DELETE adalah hard delete (kecuali settings, yang pakai upsert) |

---

## 12. Files Reference Map (Untuk Developer)

| Kebutuhan | File yang perlu diubah |
|-----------|----------------------|
| Ubah menu sidebar | `components/admin/AdminSidebar.tsx` → array `navItems` |
| Ubah field form project | `components/admin/ProjectForm.tsx` → state `form` |
| Ubah field form skill | `components/admin/SkillForm.tsx` → state `form` |
| Tambah section baru di Content Editor | `components/admin/ContentEditor.tsx` → tambah state + field JSX + save ke payload portfolio-info API |
| Tambah proteksi baru | `components/admin/ContentProtection.tsx` → array `features` + hook `useContentProtection.ts` di public layout |
| Tambah API key baru | `components/admin/ApiSettings.tsx` → array `API_ENTRIES` |
| Tambah social media icon option | `components/admin/ContentEditor.tsx` → array `ICON_OPTIONS` |
| Tambah platform certificate badge | `components/admin/CertificatesManager.tsx` → fungsi `detectPlatform` + map `PLATFORM_META` |
| Ubah security route protection rules | `middleware.ts` → matcher + if logic redirect |
| Tambah API endpoint | `src/app/api/*` buat folder + `route.ts` |
| Tambah tabel DB | `src/types/database.ts` → extend interface `Database.public.Tables` |

---

**End of PRD Documentation**
