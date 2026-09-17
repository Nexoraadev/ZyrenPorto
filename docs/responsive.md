# Panduan Responsif ZhiyyPorto

> Update terakhir: Agustus 2026 — Selaras dengan implementasi aktual di codebase.

---

## 📱 Breakpoint System (Tailwind)

| Device | Breakpoint | Kelas Tailwind | Layout |
|---|---|---|---|
| HP kecil (Android) | `< 640px` | default | 1 kolom, `px-4`, foto hero hidden |
| HP sedang | `640–767px` | `sm:` | 1 kolom, `px-6` |
| Tablet | `768–1023px` | `md:` | Transisi ke 2 kolom, foto muncul |
| Desktop normal | `1024–1439px` | `lg:` | Full 2-kolom layout |
| Monitor besar | `≥ 1440px` | `xl:` | Max-width container limited |

---

## 🖼️ Hero Section

### Desktop
- Tata letak 2 kolom: teks di kiri (`width: 52%`), foto di kanan (`flex: 1`)
- Foto anchor ke bawah (`self-end`) dengan tinggi `clamp(420px, 88vh, 820px)`
- Efek hover spotlight (mouse crosshair) aktif

### Mobile
- Foto profil **disembunyikan** sepenuhnya (`md:hidden` pada foto wrapper)
- Teks menggunakan `font-size: clamp(1.6rem, 7vw, 2.2rem)` — fluid scaling
- Stat pills pakai `flex-wrap` agar tidak overflow di layar sempit
- Padding: `px-5 pt-16 pb-20` — bottom padding cukup untuk clear mobile nav bar

---

## 📐 Section Layout Rules

### Padding Standard (Diterapkan di Semua Section)
```
py-16 px-4 sm:px-6
```
- `py-16` → cukup breathing room tanpa terlalu banyak scroll di mobile  
- `px-4` → lebih ramping di HP kecil  
- `sm:px-6` → normal di HP sedang ke atas

### Grid Per Section
| Section | Mobile | Tablet | Desktop |
|---|---|---|---|
| About traits | `grid-cols-1` | `sm:grid-cols-2` | `sm:grid-cols-2` |
| About stats | `grid-cols-2` | `grid-cols-2` | `grid-cols-2` |
| Skills carousel | full-width scroll | full-width scroll | full-width scroll |
| Certificates | `grid-cols-1` | `md:grid-cols-2` | `lg:grid-cols-3` |
| Projects | `grid-cols-1` | `md:grid-cols-2` | `lg:grid-cols-3` |
| Contact | `grid-cols-1` | `grid-cols-1` | `lg:grid-cols-2` |

---

## ⚡ Optimasi Khusus Mobile (Performa)

### Background Effects
Semua efek visual berat dinonaktifkan di mobile untuk performa:
- **AuroraBlobs** (CSS blur) → `hidden md:block` — tidak di-render di HP
- **Starfield Canvas** → guard `if (window.innerWidth < 768) return;`
- **BloodCrackTrail** → guard `if (!matchMedia("(hover: hover)").matches) return;`

### Animasi
- SkillCarousel throttle ke 30fps dan pause saat tab hidden
- `prefers-reduced-motion` respects: semua animasi dimatikan untuk aksesibilitas

### Touch
```css
a, button { touch-action: manipulation; } /* Hapus 300ms tap delay */
```

---

## 🧭 Navigasi Mobile

### Mobile Top Header
- Posisi: `fixed top-0` — selalu terlihat
- Tinggi: `h-12` (48px)
- Isi: Logo kiri, Music toggle + Theme toggle kanan

### Mobile Bottom Nav
- Posisi: `fixed bottom-0` — 5 ikon navigasi utama
- Tinggi: `h-16` (64px) + `safe-area-inset-bottom` via `pb-20` di `<main>`
- Item: Home, About, Skills, Projects, Contact
- Semua item punya `aria-label` untuk aksesibilitas

### Desktop Top Navbar
- Bergerak dari `bottom-0` (saat di Hero) → `top-0` (saat scroll)
- Transisi smooth via `transition-all duration-500`

---

## 🔢 Heading Hierarchy (SEO & Aksesibilitas)

Urutan heading harus konsisten di seluruh halaman:

```
<h1> — Nama di HeroSection (satu per halaman)
  <h2> — Judul setiap section (About, Skills, Projects, dst)
    <h3> — Sub-item dalam section (trait card, project card, cert card)
```

**Jangan:**
- Loncat dari `<h1>` ke `<h3>` langsung
- Pakai heading hanya untuk ukuran font (pakai Tailwind class saja)

---

## 📋 Checklist QA Responsif

Sebelum deploy, cek di browser DevTools (responsive mode):

- [ ] iPhone SE (375px) — tidak ada horizontal scroll
- [ ] Samsung Galaxy S (412px) — hero teks terbaca, stat pills tidak overflow
- [ ] iPad (768px) — transisi ke layout 2 kolom normal
- [ ] Desktop 1280px — foto hero muncul dan anchor ke bawah
- [ ] Mobile nav bar tidak menutup konten penting
- [ ] Semua link/button bisa di-tap dengan mudah (min 44×44px touch target)