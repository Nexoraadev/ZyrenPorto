# Skema Database (Supabase)

Analisis mendalam pada struktur SQL di direktori `supabase/` mengungkapkan bahwa sistem database yang digunakan sangat kompleks dan relasional, tidak hanya untuk portfolio statis.

Berikut adalah tabel-tabel utama yang menggerakkan sistem CMS dan fitur aplikasi.

## 1. Domain Portfolio & Skills

### `project_categories`
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | Kunci unik kategori. |
| `name` | TEXT | Nama kategori (Web, Animation, dll). Unik. |
| `order_index` | INTEGER | Urutan tampil kategori. |

### `projects`
Menyimpan informasi inti proyek. (Kolom teks tunggal untuk *category* dan *image* telah **dihapus** di versi terbaru).
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | Kunci unik. |
| `title`, `description` | TEXT | Detail proyek dasar. |
| `long_description` | TEXT | Penjelasan lengkap proyek. |
| `tech_stack` | TEXT[] | Array of string. |
| `category_id` | UUID (FK) | Berelasi ke `project_categories`. |
| `video_url` | TEXT | URL video presentasi/animasi (nullable). |
| `featured`, `order_index` | BOOLEAN, INTEGER | Penentu prioritas di UI. |

### `project_images`
Sistem baru untuk mendukung *multi-image* per proyek.
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | Kunci unik gambar. |
| `project_id` | UUID (FK) | Relasi Cascade ke `projects`. |
| `storage_path`, `url` | TEXT | Path dan public URL dari Supabase Storage. |
| `order_index` | INTEGER | Urutan slider gambar. |

### `skills`
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `name`, `category` | TEXT | Nama skill dan kategorinya (Frontend, Backend, Tools). |
| `level` | INTEGER | Nilai keahlian (0-100). |
| `icon` | TEXT | (Opsional) URL ikon spesifik. |

---

## 2. Domain Pengaturan Konten

### `site_settings`
Sebuah tabel dinamis (Key-Value) untuk mengatur seluruh teks di website tanpa *hardcode*.
- `key` (TEXT - PK): Identitas pengaturan (contoh: `hero_name`, `about_bio`, `contact_info`).
- `value` (JSONB): Objek JSON yang berisi datanya.
> Hal ini memungkinkan admin (*Reva*) mengubah nama, bio, email, dan link sosmed langsung dari dashboard.

---

## 3. Domain Interaksi (Messaging & Analytics)

### `messages` (Form Kontak Email)
Menyimpan form yang di-submit dari website.
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `name`, `email`, `message`| TEXT | Data pengirim. |
| `read`, `replied` | BOOLEAN | Status baca dan balasan (dikelola admin). |

### `messages_wa` (Integrasi Fonnte)
Webhook penangkap pesan masuk via WhatsApp.
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `sender`, `sender_name` | TEXT | Nomor WA dan Nama pengirim. |
| `message` | TEXT | Isi pesan WA. |
| `read`, `replied` | BOOLEAN | Status di dashboard. |

### `page_views` (Sistem Analitik Internal)
Melacak interaksi pengguna ke website tanpa Google Analytics.
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `path` | TEXT | URL yang diakses (misal: `/projects/123`). |
| `referrer`, `user_agent` | TEXT | Info perangkat dan asal kedatangan. |
| `country` | TEXT | Asal negara pengguna. |

---

## 4. Keamanan & Storage (RLS & Buckets)

- **Row Level Security (RLS)**: 
  Sangat ketat. Seluruh tabel mengizinkan publik (`anon`) hanya untuk **SELECT** (terkecuali `messages`, `messages_wa`, dan `page_views` yang mengizinkan publik untuk **INSERT**). Akses `UPDATE` dan `DELETE` hanya diperuntukkan bagi admin (`authenticated`).
- **Buckets**: Terdapat setidaknya dua bucket aktif, yaitu `project-images` (untuk aset portfolio) dan `music` (berdasarkan `music-bucket.sql`).
