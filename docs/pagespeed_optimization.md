# Dokumentasi Optimasi Performa & Responsif — ZhiyyPorto

> **Status Terakhir Update:** Agustus 2026  
> **Target:** PageSpeed Insights 100/100 Desktop & Mobile

---

## 📊 Skor PageSpeed Saat Ini
| Kategori | Desktop | Mobile |
|---|---|---|
| Performance | 🟢 95+ | 🟢 90+ |
| Accessibility | 🟢 100 | 🟢 100 |
| Best Practices | 🟢 100 | 🟢 100 |
| SEO | 🟢 100 | 🟢 100 |

---

## ⚡ Optimasi Performa yang Sudah Diterapkan

### 1. Dynamic Imports (Code Splitting)
Semua section di bawah Hero dan semua layout background component menggunakan `next/dynamic` dengan `ssr: false` untuk client-heavy components. Ini mengurangi Initial Bundle Size secara drastis.

**File:** `src/app/(public)/page.tsx`
```tsx
const AboutSection = dynamic(() => import("@/components/sections/AboutSection")...);
const SkillsSection = dynamic(() => import("@/components/sections/SkillsSection")...);
const CertificatesSection = dynamic(...)
const ProjectsSection = dynamic(...)
const ContactSection = dynamic(...)
```

**File:** `src/components/layout/ClientShell.tsx`
```tsx
const BackgroundEffects = dynamic(..., { ssr: false });
const ChatBot = dynamic(..., { ssr: false });
const GlitchIntro = dynamic(..., { ssr: false });
// etc.
```

### 2. Next.js Image dengan Priority (LCP Fix)
Hero image menggunakan `<Image>` dari `next/image` dengan `priority` prop untuk memaksa preload gambar LCP.

**File:** `src/components/sections/HeroSection.tsx`
```tsx
<Image src={src} alt="Reavlenia Arezha"
  fill sizes="(max-width: 768px) 100vw, 50vw"
  priority
  className="object-contain object-bottom object-right"
/>
```

### 3. Font Optimization (FOIT/FOUT Fix)
```tsx
// src/app/layout.tsx
const geistSans = Geist({ 
  variable: "--font-geist-sans", 
  subsets: ["latin"], 
  display: "swap",  // ← Kunci: teks tidak blank saat font loading
  preload: true 
});
```

### 4. ParallaxSection — SSR-Safe & No CLS
`ParallaxSection` diubah total agar tidak menyebabkan **Cumulative Layout Shift (CLS)**:
- Sebelum mount (SSR): render konten **visible** langsung (bukan `opacity: 0`)
- Scroll parallax **dinonaktifkan di mobile** (`width < 768px`)
- IntersectionObserver **disconnect setelah trigger pertama** (tidak jalan terus)
- Tidak ada `onScroll` listener yang jalan terus-menerus

**File:** `src/components/layout/ParallaxSection.tsx`

### 5. BackgroundEffects — Disabled on Mobile
| Effect | Desktop | Mobile |
|---|---|---|
| AuroraBlobs (blur CSS) | ✅ Tampil | ❌ `hidden md:block` |
| Starfield Canvas | ✅ 30fps | ❌ Skip (`width < 768`) |
| BloodCrackTrail | ✅ Mouse only | ❌ Skip (`hover: hover` check) |

Ini menghilangkan beban Canvas API di HP yang tidak punya GPU dedicated.

### 6. SkillCarousel — Throttled ke 30fps
RAF (requestAnimationFrame) di-throttle dari 60fps → 30fps, plus skip saat tab hidden.

**File:** `src/components/ui/SkillCarousel.tsx`
```ts
const FPS_INTERVAL = 1000 / 30; // throttle 30fps
if (now - lastTime < FPS_INTERVAL) return; // skip frame
if (document.hidden) return; // skip if tab is hidden
```

### 7. content-visibility: auto (Rendering Deferral)
Section yang belum terlihat tidak di-render oleh browser:
```css
/* src/app/globals.css */
#about, #skills, #certificates, #projects, #contact {
  content-visibility: auto;
  contain-intrinsic-size: 0 600px;
}
```

### 8. Touch Performance (Mobile UX)
```css
a, button, [role="button"] {
  touch-action: manipulation;            /* Hapus 300ms tap delay */
  -webkit-tap-highlight-color: transparent; /* Hapus kotak abu di tap */
}
```

### 9. Accessibility — Skor 100
- Semua ikon link sosial punya `aria-label`
- Semua nav link mobile punya `aria-label`
- NavLogo link punya `aria-label="Beranda"`
- Urutan heading `<h1>` → `<h2>` → `<h3>` konsisten

---

## 📱 Responsif Mobile (Android)

### Breakpoint System
| Device | Width | Layout |
|---|---|---|
| HP kecil | `< 640px` | 1 kolom, `px-4` |
| HP besar / Tablet | `640–768px` | 1 kolom, `px-6` |  
| Tablet landscape | `768–1024px` | 2 kolom |
| Desktop | `> 1024px` | Full layout |

### Hero Section Mobile
- Foto profil **disembunyikan** di mobile (`hidden md:block`)
- Nama menggunakan `font-size: clamp(1.6rem, 7vw, 2.2rem)` agar fluid
- Stat pills pakai `flex-wrap` agar tidak overflow
- Bottom padding `pb-20` untuk clear mobile nav bar

### Section Padding Mobile
Semua section pakai `py-16 px-4 sm:px-6` (bukan `py-20 px-6` fixed):
- `py-16` → vertical breathing room tanpa terlalu banyak scroll
- `px-4` → lebih ramping di HP kecil
- `sm:px-6` → normal di HP sedang ke atas

### Grid Responsif
- **About traits:** `grid-cols-1 sm:grid-cols-2` — 1 kolom di HP
- **Certificates:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Projects:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Contact:** `grid-cols-1 lg:grid-cols-2`

---

## 🎬 GlitchIntro — Timing
- **Phase "glitch":** 0ms → 2000ms (tampil 2 detik penuh, terbaca)
- **Phase "fade":** 2000ms → 2600ms (0.6s fade out)
- **Phase "done":** 2600ms+ (component unmount)
- **Session storage:** hanya tampil sekali per sesi browser

---

## 🔧 Panduan Jika Skor Turun Lagi

1. **LCP > 2.5s** → Cek apakah hero image sudah `priority`, dan gambar tidak terlalu besar (> 500KB)
2. **TBT tinggi** → Cek apakah ada component baru yang tidak pakai `dynamic()` atau `ssr: false`
3. **CLS > 0** → Jangan buat element yang ukurannya berubah setelah mount (contoh: konten yang `opacity: 0` di server)
4. **Mobile lambat** → Cek `BackgroundEffects` sudah `hidden md:block`, dan tidak ada Canvas API di mobile
5. **Unused JS** → Gunakan `next/dynamic` untuk setiap komponen yang hanya perlu di client side
