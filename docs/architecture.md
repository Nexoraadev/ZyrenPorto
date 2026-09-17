# Arsitektur Sistem Zhiyy Portfolio

Dokumen ini menjelaskan struktur arsitektur tingkat tinggi (*high-level architecture*) dan teknologi yang digunakan pada proyek portfolio Revalin Amalia. Berdasarkan analisis mendalam, aplikasi ini lebih dari sekadar halaman statis, melainkan sebuah platform *Fullstack* dengan CMS internal, otomatisasi pesan (WA/Email), sistem sertifikat & karya terintegrasi, fitur keamanan proyek NDA/Internal, serta analitik mandiri.

## 1. High-Level Architecture

```mermaid
graph TD
    Client[Browser / Pengunjung] -->|HTTP/Next.js| Frontend[Next.js App Router]
    
    subgraph "Backend API (Next.js /api/*)"
        API_Chat[/api/chat]
        API_WA[/api/wa-webhook & wa-reply]
        API_Email[/api/contact & email-reply]
        API_Analytics[/api/track-view]
        API_Media[/api/remove-bg & image-proxy]
        API_Music[/api/music]
        API_CMS[/api/project-save, upload-asset, portfolio-info]
        API_Certs[/api/certificates-save & fetch]
        API_Settings[/api/update-setting, protection-settings, footer-settings]
        API_Notification[/api/test-notification]
    end
    
    Frontend --> API_Chat
    Frontend --> API_Analytics
    Frontend --> API_Media
    Frontend --> API_Music
    Frontend --> API_CMS
    Frontend --> API_Certs
    Frontend -->|Submit Form| API_Email
    
    Admin[Admin / Reva] -->|Login ke /zhaorukou| AdminDash[Admin Dashboard / Quick Add UI]
    AdminDash --> API_Email
    AdminDash --> API_WA
    AdminDash --> API_CMS
    AdminDash --> API_Certs
    AdminDash --> API_Settings
    AdminDash --> API_Media
    AdminDash --> API_Notification
    
    Frontend -->|Supabase Client| Supabase[(Supabase)]
    AdminDash -->|Supabase Client| Supabase
    
    Supabase -->|Database| Postgres[PostgreSQL]
    Supabase -->|Auth| Auth[Supabase Auth via Middleware]
    Supabase -->|Storage| Storage[Supabase Storage]
    
    API_Chat -->|Webhook| n8n[n8n Automation Engine]
    n8n --> OpenAI[ChatGPT / Multi-language AI]
    
    API_WA <-->|Webhook & API| Fonnte[Fonnte API WhatsApp]
    Fonnte -->|Auto-Upload via WA Chat| n8n
    n8n -->|Parsing & Insert Data| Supabase
    
    API_Email -->|SMTP/API| Resend[Resend API]
```

## 2. Tech Stack & Services

| Kategori | Teknologi | Penjelasan Tambahan |
| --- | --- | --- |
| **Core Framework** | Next.js 15 (App Router) | Menangani SSR/CSR, Routing, Middleware, dan API Routes. |
| **API & Integrasi** | API Routes Next.js | Menangani 18+ *endpoints* termasuk webhooks, proxy gambar, pemutar musik, manajemen sertifikat, dan manipulasi media. |
| **Database & Auth** | Supabase | Menyimpan data dinamis (proyek, sertifikat, skema desain, skills, pengaturan web) serta autentikasi dashboard. |
| **Messaging & Auto-Input** | Fonnte & Resend | Fonnte untuk *bot/webhook* WhatsApp (sekaligus *trigger* auto-upload anti-mager), Resend untuk pengiriman & *responder* email. |
| **AI & Automation** | n8n & OpenAI API | *Chatbot* interaktif 3 bahasa (Indo, Eng, Mandarin), parser data otomatis dari WA ke Supabase, dan integrasi fitur AI. |

## 3. Sistem Keamanan & Middleware

Aplikasi ini memiliki sistem autentikasi dan sanitasi data untuk melindungi akses serta aset sensitif:

- **Admin Path**: `/zhaorukou` (Disallow pada `robots.txt` agar tidak terindeks mesin pencari).
- **Middleware** (`src/middleware.ts`): Secara otomatis mengecek sesi (*session*) Supabase. Jika belum login, segala akses ke `/zhaorukou/*` akan diredirect ke halaman login `/zhaorukou`. Jika sudah login, akses login diredirect ke `/zhaorukou/dashboard`.
- **Content & NDA Protection**:
  - Memiliki fitur *NDA/Sanitized Mode* untuk proyek kerjaan internal/cybersecurity. Mengubah tampilan gambar rahasia menjadi diagram arsitektur interaktif atau indikator metrik aman.
  - Konfigurasi perlindungan konten (anti klik-kanan / nonaktifkan *select text*) diatur via API `/api/protection-settings` dan tabel `site_settings`.

## 4. Fitur Khusus & Modul CMS Fleksibel (Targeted Plan)

### A. Modul Desain & Case Study (Multi-Media Engine)
Mendukung dokumentasi desain dan UX secara komprehensif tanpa membuat tampilan berantakan:
- **Block-Based / JSON Schema**: Mendukung multi-gambar per proyek (seperti UI Before/After, wireframe, design system).
- **Embedded Media & Captions**: Setiap gambar dapat diberi deskripsi spesifik/caption *problem solving*, atau langsung menyematkan (*embed*) prototype dari Figma/Behance.
- **Bulk Upload**: Fasilitas unggah banyak aset gambar sekaligus dalam sekali langkah.

### B. Certificates Hub (Manajemen Sertifikat)
Sistem penyimpanan sertifikat IT, Cybersecurity, maupun HSK Mandarin:
- **Dual Source Input**: Bisa menampung sertifikat dalam bentuk file fisik (PDF/JPG di Supabase Storage) maupun *Direct Link* (seperti badge Credly atau URL Post LinkedIn).
- **Social Integration**: Pengunjung dapat memverifikasi keabsahan sertifikat langsung via tombol redirect LinkedIn/Credly atau membuka modal *preview* file PDF secara instan.

### C. Mode "Anti-Mager" Admin (Quick Upload & WA Automation)
Sistem ini dirancang agar Reva dapat memperbarui isi portofolio dari mana saja dengan usaha minimal:
- **Mobile Quick-Add Form (`/zhaorukou/quick-add`)**: Form ringkas khusus tampilan *mobile* untuk input cepat.
- **WhatsApp Direct Auto-Upload**: Mengirim gambar sertifikat/karya via WhatsApp ke Fonnte Bot. Terhubung ke **n8n** yang secara otomatis membaca *caption*, memproses file, dan memasukkannya ke database Supabase tanpa harus membuka dashboard laptop.

## 5. Daftar Lengkap API Internal (`src/app/api/`)

Aplikasi ini memiliki 18+ endpoint API mandiri yang berfungsi sebagai *backend microservices*:

### Pesan, Notifikasi & Otomatisasi
- `/api/contact`: Menerima pengajuan dari *Contact Form* pengunjung.
- `/api/email-reply`: Integrasi ke **Resend** untuk membalas email pengunjung dari dashboard.
- `/api/wa-webhook`: Webhook dari **Fonnte** untuk menangkap pesan WhatsApp (termasuk perintah auto-upload).
- `/api/wa-reply`: Memanggil Fonnte API untuk membalas WhatsApp dari dashboard.
- `/api/test-notification`: Menguji sistem notifikasi internal (email/push).

### Media & Konten
- `/api/music`: Mengambil atau mengelola pemutaran musik latar dari Supabase *music-bucket*.
- `/api/remove-bg`: Menghapus *background* gambar secara otomatis.
- `/api/image-proxy`: *Proxy* perantara untuk gambar demi menghindari masalah CORS atau menyembunyikan sumber asli.
- `/api/upload-asset`: Menangani *upload* aset tunggal/banyak (*bulk*) ke Supabase Storage.

### Pengelolaan CMS & Sertifikat
- `/api/project-save`: Endpoint untuk validasi & penyimpan proyek (mendukung *NDA Toggle*, *Block Layout Desain*, dan *Multi-image JSON*).
- `/api/certificates-save`: Menambah, mengubah, atau menghubungkan sertifikat baru (PDF file / Link LinkedIn).
- `/api/portfolio-info`: Mengambil seluruh data portofolio, sertifikat, dan skills secara dinamis untuk tampilan *frontend*.

### Pengaturan Web (Site Settings)
- `/api/update-setting`: Menyimpan teks atau data *hero, bio, info kontak* ke tabel `site_settings`.
- `/api/protection-settings`: Menyimpan preferensi perlindungan halaman (contoh: nonaktifkan *select text* / NDA mode).
- `/api/footer-settings`: Menyimpan konfigurasi hak cipta dan *link footer*.

### Analitik
- `/api/track-view`: Mengumpulkan analitik pengunjung secara anonim (path, *referrer*, *user agent*, *country*) dan menyimpannya di tabel `page_views` sebagai pelacak statistik mandiri.