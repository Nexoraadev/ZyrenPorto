# Blueprint & Roadmap Proyek

Dokumen ini memuat detail fungsionalitas aplikasi yang sudah berjalan secara penuh (berdasarkan struktur *codebase* mendalam) dan visi pengembangannya ke depan.

## 1. Fitur Utama yang Berjalan (Current State)

Berbeda dengan sekadar web statis, portfolio ini sudah berfungsi layaknya **SaaS / Custom CMS Internal**:

- **Admin Dashboard Lengkap (`/zhaorukou`)**: 
  - Dilindungi middleware Supabase.
  - Memiliki fitur manajemen Proyek, Kategori, Skill, hingga Pengaturan Web (Teks Hero, Bio, Kontak).
- **Relational CMS untuk Portfolio**:
  - Proyek kini mendukung relasi `category_id`, banyak gambar per proyek (`project_images`), dan `video_url`.
- **Sistem Pesan Terpusat (Inbox)**:
  - **Email**: Form kontak frontend masuk ke database `messages`, dan admin dapat membalasnya langsung via dashboard menggunakan **Resend API** (`/api/email-reply`).
  - **WhatsApp**: Pesan WA masuk melalui webhook **Fonnte** (`/api/wa-webhook`) dan disimpan di `messages_wa`. Admin bisa balas langsung dari dashboard.
- **Visitor Analytics Sendiri**:
  - Setiap *page view* dicatat oleh `/api/track-view` (menyimpan path, referrer, user agent) dan disimpan di database secara mandiri tanpa bergantung pada Google Analytics.
- **AI & Media Tools**:
  - Chatbot terintegrasi dengan n8n & OpenAI.
  - Terdapat API untuk menghapus *background* gambar (`/api/remove-bg`).
- **Music Player**:
  - Fitur pemutar musik *background* terintegrasi melalui *API route* dan *bucket* penyimpanan musik.

## 2. Roadmap Pengembangan (Future Features)

Berdasarkan rencana fitur canggih yang diusulkan, berikut adalah target penyelesaian fitur-fitur skala *enterprise*:

### Fase 1: Fitur Spesifik Profesional (Segera Dikembangkan)
- [ ] **Sistem Manajemen Sertifikat (Certificates Hub)**: 
  - Membangun tabel `certificates` dan endpoint `/api/certificates-save`.
  - Mendukung input PDF lokal maupun sinkronisasi otomatis dari Credly / LinkedIn.
- [ ] **NDA / Sanitized Mode**: 
  - Menambahkan *toggle* NDA pada API `/api/project-save`.
  - Menerapkan perlindungan sensor gambar otomatis untuk portofolio Cybersecurity atau rahasia perusahaan.
- [ ] **CMS Desain Lanjutan (Block-Based UI)**:
  - Meningkatkan CMS agar mendukung deskripsi multi-gambar (caption per gambar untuk menceritakan *problem-solving* per komponen desain).

### Fase 2: Otomatisasi & Workflow (Jangka Menengah)
- [ ] **Mode "Anti-Mager" (Auto-Upload via WA)**:
  - Menghubungkan Fonnte Webhook ke n8n yang dapat melakukan *parsing* gambar yang dikirim admin via WhatsApp, dan secara otomatis menyimpannya ke Supabase Storage dan tabel `projects`.
- [ ] **Admin Quick Add UI (`/zhaorukou/quick-add`)**:
  - Halaman khusus responsif yang difokuskan pada kecepatan unggah (hanya perlu tap dan *upload*).
- [ ] **AI Multi-Language Support**:
  - Mengoptimalkan n8n + ChatGPT agar chatbot otomatis merespons dalam 3 bahasa (Indo, Eng, Mandarin) dengan akurasi tinggi.

### Fase 3: Peningkatan Stabilitas (Jangka Panjang)
- [ ] **Penyempurnaan Music Player**: Memastikan kelancaran *playback* musik antar halaman tanpa putus.
- [ ] **Optimasi Gambar Lanjutan**: Kompresi otomatis (WebP) saat *upload*.
