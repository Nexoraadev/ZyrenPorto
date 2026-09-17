# Requirements Document

## Introduction

Fitur ini adalah redesign sistem project portfolio untuk website milik Reavlenia Arezha — seorang multidisiplin creative yang mencakup web development, animasi 2D, desain logo, UI/UX (Figma), fotografi, serta ilustrasi digital dan tradisional.

Sistem portfolio yang ada saat ini hanya mendukung satu gambar per project (`image_url` tunggal), kategori yang terbatas (Web/Mobile/Backend/UI/UX/Other), dan tidak memiliki dukungan video embed. Redesign ini bertujuan memperluas kemampuan data model dan tampilan agar mencerminkan luasnya bidang karya Reavlenia, memberikan pengalaman browsing yang terstruktur bagi pengunjung dan HRD, serta mempermudah admin dalam mengelola konten.

## Glossary

- **Portfolio_System**: Keseluruhan fitur yang dibangun dalam spec ini, mencakup sisi publik dan admin.
- **Project**: Satu entri karya dalam portfolio, memiliki judul, deskripsi, media, kategori, dan metadata.
- **Category**: Pengelompokan project berdasarkan jenis karya (contoh: Web, Animation, Illustration, Logo/Branding, Photography, UI/UX).
- **Project_Image**: Satu file gambar yang diunggah ke Supabase Storage dan diasosiasikan dengan sebuah Project.
- **Image_Carousel**: Komponen tampilan yang menampilkan beberapa Project_Image secara bergantian secara otomatis (auto-slide).
- **Video_Embed**: Komponen yang menampilkan video YouTube di dalam halaman menggunakan iframe, tanpa mengarahkan pengunjung keluar dari website.
- **Video_Modal**: Overlay atau inline player yang muncul setelah pengunjung mengklik tombol play, menampilkan Video_Embed.
- **Admin**: Pengguna yang telah terautentikasi (Reavlenia) dengan akses penuh ke dashboard `/zhaorukou/dashboard`.
- **Visitor**: Pengunjung publik (termasuk HRD) yang mengakses halaman publik tanpa autentikasi.
- **Project_Form**: Form pada dashboard admin untuk membuat atau mengedit Project.
- **ProjectCard**: Komponen kartu yang menampilkan ringkasan satu Project di halaman publik (landing page dan halaman `/projects`).
- **Category_Filter**: Komponen UI yang memungkinkan Visitor memfilter tampilan project berdasarkan Category.
- **Featured**: Status boolean pada Project yang menandai project tersebut ditampilkan di section homepage.
- **order_index**: Nilai integer pada Project yang menentukan urutan tampilan relatif antar project.
- **Supabase_Storage**: Layanan penyimpanan file dari Supabase yang digunakan untuk menyimpan Project_Image.

---

## Requirements

### Requirement 1: Skema Data Project yang Diperluas

**User Story:** Sebagai Admin, saya ingin skema database project mendukung beberapa gambar dan URL video, sehingga setiap karya saya bisa dipresentasikan dengan media yang lengkap.

#### Acceptance Criteria

1. THE Portfolio_System SHALL menyimpan data setiap Project dengan field: `id`, `created_at`, `title`, `description`, `long_description`, `tech_stack`, `live_url`, `github_url`, `featured`, `order_index`, dan `category`.
2. THE Portfolio_System SHALL menyimpan beberapa Project_Image per Project dalam tabel terpisah `project_images` dengan field: `id`, `project_id` (foreign key ke `projects.id`), `storage_path`, `url`, dan `order_index`.
3. THE Portfolio_System SHALL menyimpan field `video_url` bertipe TEXT nullable pada tabel `projects` untuk menerima URL YouTube.
4. WHEN sebuah Project dihapus, THE Portfolio_System SHALL menghapus semua Project_Image yang berelasi dengan Project tersebut secara otomatis (cascade delete).
5. THE Portfolio_System SHALL menyimpan data Category dalam tabel terpisah `project_categories` dengan field: `id`, `name` (unik), dan `order_index`.
6. THE Portfolio_System SHALL menyimpan field `category_id` (foreign key ke `project_categories.id`) pada tabel `projects` sebagai pengganti field `category` bertipe TEXT.

---

### Requirement 2: Manajemen Category oleh Admin

**User Story:** Sebagai Admin, saya ingin bisa memilih category dari daftar default dan menambahkan category custom sendiri, sehingga saya tidak terbatas pada pilihan yang sudah ada.

#### Acceptance Criteria

1. THE Portfolio_System SHALL menyediakan category default berikut saat inisialisasi: Web, Animation, Illustration, Logo/Branding, Photography, UI/UX.
2. WHEN Admin mengakses Project_Form, THE Project_Form SHALL menampilkan daftar category yang tersedia dari tabel `project_categories` sebagai pilihan dropdown.
3. WHEN Admin memasukkan nama category baru yang belum ada dalam daftar, THE Project_Form SHALL menyimpan category baru tersebut ke tabel `project_categories` dan langsung menggunakannya pada Project yang sedang dibuat atau diedit.
4. IF nama category yang dimasukkan Admin sudah ada (case-insensitive), THEN THE Project_Form SHALL menggunakan category yang sudah ada tanpa membuat duplikat.
5. THE Portfolio_System SHALL memastikan kolom `name` pada tabel `project_categories` bersifat unik.

---

### Requirement 3: Upload dan Manajemen Beberapa Gambar per Project

**User Story:** Sebagai Admin, saya ingin bisa mengunggah lebih dari satu gambar untuk setiap project, sehingga karya yang memiliki beberapa visual bisa ditampilkan secara lengkap.

#### Acceptance Criteria

1. WHEN Admin membuka Project_Form untuk membuat project baru, THE Project_Form SHALL menyediakan input file yang menerima beberapa file gambar sekaligus (multiple file selection).
2. WHEN Admin memilih beberapa file gambar, THE Project_Form SHALL menampilkan pratinjau (preview) thumbnail setiap gambar yang dipilih sebelum disimpan.
3. WHEN Admin menyimpan Project, THE Portfolio_System SHALL mengunggah setiap gambar yang dipilih ke Supabase_Storage dan menyimpan `storage_path` serta `url` hasil unggahan ke tabel `project_images`.
4. WHEN Admin membuka Project_Form untuk mengedit project yang sudah ada, THE Project_Form SHALL menampilkan daftar Project_Image yang sudah tersimpan beserta opsi untuk menghapus masing-masing gambar.
5. WHEN Admin menghapus satu Project_Image melalui Project_Form, THE Portfolio_System SHALL menghapus file dari Supabase_Storage dan menghapus baris yang sesuai dari tabel `project_images`.
6. THE Project_Form SHALL menerima file gambar dengan format JPEG, PNG, WebP, atau GIF.
7. IF ukuran file gambar yang diunggah melebihi 5MB, THEN THE Project_Form SHALL menampilkan pesan error yang menyebutkan batas ukuran file dan tidak mengunggah file tersebut.

---

### Requirement 4: Input Video URL pada Admin

**User Story:** Sebagai Admin, saya ingin bisa menautkan video YouTube ke sebuah project sebagai alternatif atau tambahan gambar, sehingga karya berbasis video (animasi, motion graphic) bisa ditampilkan dengan baik.

#### Acceptance Criteria

1. WHEN Admin mengakses Project_Form, THE Project_Form SHALL menyediakan field input teks opsional berlabel "Video URL" untuk memasukkan URL YouTube.
2. WHEN Admin memasukkan nilai pada field Video URL, THE Project_Form SHALL menerima format URL YouTube standar, termasuk format `https://www.youtube.com/watch?v=...` dan `https://youtu.be/...`.
3. IF Admin memasukkan URL pada field Video URL yang bukan merupakan URL YouTube yang valid, THEN THE Project_Form SHALL menampilkan pesan error validasi dan tidak menyimpan project.
4. WHEN Admin mengosongkan field Video URL, THE Portfolio_System SHALL menyimpan nilai `null` pada field `video_url` project tersebut.

---

### Requirement 5: Tampilan Project Terfilter Berdasarkan Category di Halaman Publik

**User Story:** Sebagai Visitor, saya ingin bisa memfilter project berdasarkan kategori, sehingga saya bisa fokus melihat karya dalam bidang yang saya minati tanpa tercampur aduk.

#### Acceptance Criteria

1. WHEN Visitor mengakses halaman `/projects`, THE Portfolio_System SHALL menampilkan semua Project yang tersimpan dalam grid terstruktur.
2. THE Portfolio_System SHALL menampilkan Category_Filter di halaman `/projects` berupa tab atau tombol pilihan yang memuat semua category yang memiliki minimal satu Project.
3. WHEN Visitor memilih satu Category dari Category_Filter, THE Portfolio_System SHALL menampilkan hanya Project yang memiliki `category_id` sesuai Category yang dipilih.
4. WHEN Visitor belum memilih category apapun (state awal), THE Portfolio_System SHALL menampilkan semua Project.
5. THE Portfolio_System SHALL selalu menampilkan opsi "Semua" pada Category_Filter sebagai pilihan pertama untuk mereset filter.
6. WHILE sebuah Category aktif dipilih, THE Category_Filter SHALL menampilkan indikator visual yang membedakan category yang aktif dari yang tidak aktif.

---

### Requirement 6: Image Carousel Otomatis pada ProjectCard

**User Story:** Sebagai Visitor, saya ingin project dengan lebih dari satu gambar menampilkan carousel otomatis di card-nya, sehingga saya bisa melihat beberapa tampilan karya tanpa harus mengklik apapun.

#### Acceptance Criteria

1. WHEN sebuah Project memiliki lebih dari satu Project_Image, THE ProjectCard SHALL menampilkan Image_Carousel yang berpindah antar gambar secara otomatis (auto-slide).
2. THE Image_Carousel SHALL berpindah ke gambar berikutnya setiap 3 detik.
3. WHEN sebuah Project hanya memiliki satu Project_Image, THE ProjectCard SHALL menampilkan gambar tersebut secara statis tanpa carousel.
4. WHEN sebuah Project tidak memiliki Project_Image, THE ProjectCard SHALL menampilkan placeholder dengan inisial judul project.
5. THE Image_Carousel SHALL menampilkan indikator titik (dot indicator) yang menunjukkan jumlah gambar dan posisi gambar yang sedang ditampilkan.
6. WHEN Image_Carousel sedang berjalan, THE Image_Carousel SHALL menghentikan auto-slide sementara ketika Visitor mengarahkan kursor (hover) ke atas ProjectCard.

---

### Requirement 7: Video Embed melalui Modal atau Inline Player

**User Story:** Sebagai Visitor, saya ingin bisa menonton video project tanpa meninggalkan halaman portfolio, sehingga saya tetap bisa membaca deskripsi dan melihat informasi project lainnya.

#### Acceptance Criteria

1. WHEN sebuah Project memiliki `video_url` yang terisi, THE ProjectCard SHALL menampilkan tombol play (ikon video) di atas area thumbnail.
2. WHEN Visitor mengklik tombol play pada ProjectCard, THE Portfolio_System SHALL menampilkan Video_Modal yang memuat Video_Embed berupa iframe YouTube.
3. THE Video_Embed SHALL menggunakan URL format embed YouTube (`https://www.youtube.com/embed/{video_id}`) yang diekstrak dari `video_url`.
4. WHEN Video_Modal sedang ditampilkan, THE Portfolio_System SHALL merender Video_Embed dengan atribut `autoplay=1` agar video langsung diputar.
5. WHEN Visitor mengklik area di luar Video_Modal atau tombol tutup (×), THE Portfolio_System SHALL menutup Video_Modal dan menghentikan pemutaran video.
6. THE Video_Modal SHALL tidak mengarahkan Visitor ke website YouTube atau tab/jendela baru.
7. WHILE Video_Modal terbuka, THE Portfolio_System SHALL mencegah scroll pada halaman di bawah overlay.

---

### Requirement 8: Tampilan Featured Projects di Landing Page

**User Story:** Sebagai Visitor yang mengunjungi homepage, saya ingin melihat project pilihan terbaik yang ditampilkan secara menonjol, sehingga saya langsung mendapatkan gambaran kualitas karya Reavlenia.

#### Acceptance Criteria

1. THE Portfolio_System SHALL menampilkan hanya Project dengan `featured = true` pada section "Featured Work" di landing page (`/`).
2. THE Portfolio_System SHALL mengurutkan project di landing page berdasarkan nilai `order_index` secara ascending.
3. WHEN sebuah Project featured memiliki lebih dari satu Project_Image, THE ProjectCard pada landing page SHALL mengaktifkan Image_Carousel sesuai Requirement 6.
4. WHEN sebuah Project featured memiliki `video_url`, THE ProjectCard pada landing page SHALL menampilkan tombol play sesuai Requirement 7.

---

### Requirement 9: Manajemen Project Lengkap di Dashboard Admin

**User Story:** Sebagai Admin, saya ingin bisa membuat, mengedit, dan menghapus project dengan semua field yang diperlukan melalui dashboard, sehingga saya punya kontrol penuh atas konten portfolio.

#### Acceptance Criteria

1. WHEN Admin mengakses halaman daftar project di dashboard, THE Portfolio_System SHALL menampilkan semua Project beserta judul, category, status `featured`, dan `order_index` dalam bentuk tabel atau daftar.
2. THE Project_Form SHALL menyediakan field wajib: `title` dan `description`.
3. THE Project_Form SHALL menyediakan field opsional: `long_description`, `tech_stack`, `live_url`, `github_url`, `video_url`, `featured` (checkbox), dan `order_index`.
4. THE Project_Form SHALL menyediakan input gambar multiple sesuai Requirement 3.
5. THE Project_Form SHALL menyediakan dropdown category dengan opsi tambah custom sesuai Requirement 2.
6. WHEN Admin menyimpan Project_Form dengan field wajib yang kosong, THE Project_Form SHALL mencegah pengiriman form dan menampilkan pesan error validasi pada field yang belum diisi.
7. WHEN Admin berhasil menyimpan project (create atau update), THE Portfolio_System SHALL mengarahkan Admin kembali ke halaman daftar project di dashboard.
8. WHEN Admin mengklik tombol hapus pada sebuah Project di dashboard, THE Portfolio_System SHALL menampilkan konfirmasi sebelum menghapus.
9. WHEN Admin mengkonfirmasi penghapusan, THE Portfolio_System SHALL menghapus Project beserta semua Project_Image terkait sesuai Requirement 1 poin 4.
