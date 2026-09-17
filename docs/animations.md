# Dokumentasi Animasi — Zhiyy Portfolio

Dokumen ini menjelaskan seluruh sistem animasi yang digunakan pada proyek Zhiyy Portfolio, mulai dari splash screen saat pertama kali membuka website hingga animasi scroll dan interaksi user.

## Ringkasan Teknologi Animasi

| Teknologi | Penggunaan |
|-----------|-----------|
| CSS `@keyframes` | Glitch intro, aurora blobs, scanlines, noise blocks, gradient shift |
| Canvas API (vanilla JS) | Starfield partikel, blood crack trail cursor, scroll vein |
| CSS Transitions | Parallax slide-in, hover effects, theme switch, navbar position |
| `IntersectionObserver` | Scroll-triggered reveals (GlitchReveal, ParallaxSection) |
| `requestAnimationFrame` | Skill carousel, error code scroll, starfield, blood crack |
| framer-motion | Hanya di `VideoModal.tsx` (animate in/out modal) |

> **Catatan:** framer-motion **tidak** digunakan untuk animasi utama. Hampir seluruh animasi dibangun dengan CSS murni + Canvas API untuk performa optimal.

---

## Alur Animasi Saat Pertama Buka Website

```
Browser load halaman
  │
  ├── RootLayout (src/app/layout.tsx)
  │     └── ClientShell (src/components/layout/ClientShell.tsx)
  │           ├── <GlitchIntro />        ← Splash screen muncul duluan
  │           ├── <ScrollProgress />
  │           ├── <DynamicFavicon />
  │           ├── <BackgroundEffects />  ← Aurora + Starfield + Noise + BloodCrack
  │           ├── {children}             ← HeroSection + sections lainnya
  │           ├── <FloatingActions />
  │           └── <ChatBot />
  │
  ├── GlitchIntro selesai (2.6 detik)
  │     └── Phase: glitch → fade → done → unmount
  │
  └── Website terlihat penuh, semua background effects aktif
```

---

## 1. GlitchIntro — Splash Screen

**File:** `src/components/layout/GlitchIntro.tsx`

Animasi pertama yang terlihat oleh pengunjung. Menampilkan teks "ZIYYZOYA" dengan efek glitch intens selama 2.6 detik.

### Fase Animasi

| Fase | Durasi | CSS | Deskripsi |
|------|--------|-----|-----------|
| `glitch` | 0 – 2000ms | `opacity: 1`, tidak ada transisi | Teks glitch aktif: scanlines, RGB channel shift, noise blocks bergerak acak |
| `fade` | 2000 – 2600ms | `opacity: 0.5s ease` | Seluruh layar fade-out ke transparan |
| `done` | 2600ms+ | — | Komponen unmount dari DOM. `sessionStorage("zhiyy_intro_done")` diset. Reload tidak menampilkan ulang. |

### Keyframes yang Digunakan

```css
/* Teks utama bergerak acak */
@keyframes glitchMain {
  0%,100% { transform: translate(0); opacity:1; }
  20%  { transform: translate(-3px,1px); clip-path: inset(20% 0 60% 0); }
  40%  { transform: translate(3px,-1px); clip-path: inset(60% 0 10% 0); }
  60%  { transform: translate(-1px,2px); opacity:0.8; }
  80%  { transform: translate(2px,-2px); }
}

/* Channel merah bergeser horizontal */
@keyframes glitchRed { ... }

/* Channel biru bergeser horizontal */
@keyframes glitchBlue { ... }

/* Seluruh container bergetar */
@keyframes glitchShake { ... }

/* Scanline bergeser vertikal */
@keyframes scanline { ... }

/* 3 variasi noise block muncul/hilang */
@keyframes noiseBlock0 { ... }
@keyframes noiseBlock1 { ... }
@keyframes noiseBlock2 { ... }
```

### Efek Visual

- **Scanlines:** Garis-garis horizontal transparan bergerak ke bawah (overlay CRT effect)
- **RGB Split:** Teks yang sama dirender 3 kali — warna putih (utama), merah (clip-path bagian atas), biru (clip-path bagian tengah)
- **Noise Blocks:** 6 blok persegi panjang berwarna merah muncul secara acak di posisi random, bergerak horizontal

### Persistensi

```typescript
// Hanya tampilkan per sesi browser
if (sessionStorage.getItem("zhiyy_intro_done")) {
  setPhase("done"); // Skip langsung
  return;
}
```

---

## 2. Background Effects

**File:** `src/components/layout/BackgroundEffects.tsx`

Empat efek latar belakang yang aktif secara bersamaan sepanjang halaman.

### 2a. Aurora Blobs

Dua blob radial gradient merah besar dengan blur tinggi yang bergerak perlahan.

| Blob | Ukuran | Durasi Animasi | Gerakan |
|------|--------|----------------|---------|
| Blob 1 (atas-kiri) | 550px | 20s loop | translate + scale 1.06× |
| Blob 2 (bawah-kanan) | 650px | 26s loop | translate + scale 1.08× |

```css
@keyframes blob1 {
  0%,100% { transform: translate(0,0) scale(1) }
  33%     { transform: translate(70px,50px) scale(1.06) }
  66%     { transform: translate(-30px,100px) scale(0.96) }
}
```

- Opacity rendah (0.055 – 0.07) agar tidak mengganggu konten
- Hanya tampil di desktop (`hidden md:block`)

### 2b. Starfield (Canvas)

Partikel bintang berkedip yang dirender menggunakan `<canvas>`.

| Parameter | Nilai |
|-----------|-------|
| Frame rate | ~30fps (throttle manual) |
| Jumlah bintang | `(width × height) / 9000` |
| Warna | Merah gelap (`rgba(180,40,40)`), abu-abu, merah terang |
| Ukuran | 0.4 – 1.8px |
| Twinkle | `Math.sin(time × speed + offset)` |
| Scroll boost | Kecepatan bintang naik proporsional `scrollY × 0.0003` |

- Bintang besar (>1.2px) mendapat glow radial gradient
- Nonaktif di mobile (check `window.innerWidth < 768`)
- `mix-blend-mode: screen` agar menyatu dengan background gelap

### 2c. Noise Texture

Overlay statis menggunakan SVG `feTurbulence` sebagai film grain.

```html
<div style="
  background-image: url('data:image/svg+xml,...feTurbulence...');
  opacity: 0.025;
  mix-blend-mode: overlay;
" />
```

- Tidak dianimasikan (statis) — sangat ringan
- z-index 1, pointer-events none

### 2d. Blood Crack Trail (Canvas)

Efek retakan darah yang mengikuti pergerakan cursor mouse.

| Parameter | Nilai |
|-----------|-------|
| Trigger | `mousemove` (jarak ≥ 20px dari titik terakhir) |
| Maks crack aktif | 35 sistem |
| Cabang per crack | 2–3, rekursif sampai depth 2 |
| Warna | Merah tua (`rgba(170,15,15)`) dengan glow |
| Lifetime | `life -= 0.016` per frame (fade out) |
| Non-aktif | Touch device (check `hover: hover` media query) |

**Algoritma `genCrack`:**
1. Mulai dari titik awal dengan sudut acak
2. Setiap segmen: panjang 9–20px, sudut berubah ±0.65rad
3. 30% chance cabang baru di setiap titik (depth - 1)
4. Lebar berkurang di setiap kedalaman

---

## 3. ScrollVein — Urat Tumbuh Mengikuti Scroll

**File:** `src/components/layout/ScrollVein.tsx`

Pohon vena/urat merah yang tumbuh dari atas layar ke bawah seiring user scroll.

### Cara Kerja

1. **Build:** Dua pohon vena dibangun secara rekursif (`buildVeinTree`)
   - Pohon 1: dari kanan-atas (`x: 85%`, sudut ke bawah)
   - Pohon 2: dari kiri-atas (`x: 15%`, sudut ke bawah)
2. **Draw:** Menggunakan `scrollProgress` (0–1) sebagai timer pertumbuhan
3. Setiap node baru mulai digambar setelah parent selesai
4. Lebar vena berkurang di setiap cabang (6px → 0.3px)

### Layer Rendering (per node)

```
Layer 1: Shadow/glow merah (blur 6px)
Layer 2: Dark vein (lebar 1.8×, opacity rendah)
Layer 3: Red vein (lebar normal)
Layer 4: Bright core (hanya untuk lebar > 1.5px)
```

- z-index 1, opacity 0.6
- Menggunakan `requestAnimationFrame` untuk render loop

---

## 4. ScrollProgress — Progress Bar

**File:** `src/components/layout/ScrollProgress.tsx`

Progress bar tipis (2px) di paling atas layar.

```typescript
progress = (scrollY / (documentHeight - windowHeight)) * 100
```

- Gradient merah: `from-blood-700 via-blood-500 to-blood-700`
- `transition: width 75ms` untuk pergerakan halus
- z-index 60

---

## 5. ErrorCodeScroll — Teks Error Scrolling

**File:** `src/components/ui/ErrorCodeScroll.tsx`

Tiga kolom teks error/kode fatal yang scroll vertikal terus-menerus di sisi kanan hero section.

| Kolom | Kecepatan | Ukuran Font | Opacity | Posisi |
|-------|-----------|-------------|---------|--------|
| 1 | 0.70 px/frame | 14px | 0.50 | `left: 0%` |
| 2 | 0.50 px/frame | 12px | 0.32 | `left: 20%` |
| 3 | 0.85 px/frame | 15px | 0.42 | `left: 38%` |

### Mekanisme

- Teks diduplikasi (2× lipat) untuk seamless loop
- Saat `translateY` mencapai setengah tinggi track, reset ke 0
- Baris yang mengandung "FATAL", "CRITICAL", "PANIC", "ROOTKIT" berwarna merah lebih terang
- Baris utama (setiap ke-4) lebih bold dan terang
- Masking gradient transparan di tepi kiri + atas/bawah

---

## 6. GlitchReveal — Scroll-Triggered Reveal

**File:** `src/components/ui/GlitchReveal.tsx` + `src/hooks/useGlitchReveal.ts`

Wrapper komponen yang memicu efek glitch saat element masuk viewport.

### State Machine

```
hidden → glitch (350ms) → visible
```

| State | opacity | transform | filter | transition |
|-------|---------|-----------|--------|------------|
| `hidden` | 0 | `translateY(20px)` | none | none |
| `glitch` | 1 | `translateY(0)` | `drop-shadow(3px 0 0 rgba(255,0,0,0.7)) drop-shadow(-3px 0 0 rgba(0,200,255,0.7))` | `transform 0.1s steps(3)` |
| `visible` | 1 | `translateY(0)` | none | `transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease` |

### IntersectionObserver Config

```typescript
{ threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
```

### Penggunaan

```tsx
// Basic
<GlitchReveal>
  <h2>Judul Section</h2>
</GlitchReveal>

// Dengan delay bertingkat
<GlitchReveal delay={200}>
  <Card />
</GlitchReveal>
```

Digunakan di: **AboutSection**, **SkillsSection**, **ProjectsSection**, **ProjectCard**

---

## 7. ParallaxSection — Slide-In on Scroll

**File:** `src/components/layout/ParallaxSection.tsx`

Komponen wrapper yang membuat children slide-in dari arah tertentu saat masuk viewport.

### Konfigurasi

```tsx
<ParallaxSection direction="up" intensity={0.15} delay={100}>
  {children}
</ParallaxSection>
```

| Prop | Default | Opsi |
|------|---------|------|
| `direction` | `"up"` | `up`, `down`, `left`, `right` |
| `intensity` | `0.15` | Angka (saat ini continuous parallax di-disable untuk performa) |
| `delay` | `0` | Milidetik |

### Transform per Direction

```typescript
const hiddenTransform = {
  up:    "translateY(32px)",
  down:  "translateY(-32px)",
  left:  "translateX(32px)",
  right: "translateX(-32px)",
}[direction];
```

### SSR Handling

Sebelum client mount, komponen dirender tanpa transform (full visible) untuk menghindari CLS. Setelah mount, IntersectionObserver mengambil alih.

---

## 8. Hero Section Animations

**File:** `src/components/sections/HeroSection.tsx`

### 8a. Animated Gradient Background

```css
.animated-gradient-bg {
  background: linear-gradient(135deg, #0a0a0a 0%, #150303 25%, ...);
  background-size: 400% 400%;
  animation: gradientShift 12s ease infinite;
}

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### 8b. Role Ticker

Teks role berubah secara bergantian dengan efek fade + slide:

```
Perubahan terjadi tiap 2800ms:
  - 0ms: text visible (opacity 1, translateY 0)
  - 2800ms: text hidden (opacity 0, translateY 8px) — duration 350ms
  - 3150ms: index role berganti, text baru muncul — duration 350ms
```

### 8c. HeroPhoto Cursor Reveal

Efek foto berwarna yang mengikuti cursor:

1. Foto dasar: grayscale(100%) + blur(2px) + brightness(0.75)
2. Saat hover: `clip-path: circle(85px at X% Y%)` — reveal foto berwarna di posisi cursor
3. Transisi clip-path: 0.15s ease
4. Crosshair target muncul di posisi cursor dengan label "Focus"

---

## 9. SkillCarousel — Infinite Scroll

**File:** `src/components/ui/SkillCarousel.tsx`

Karousel horizontal yang bergerak otomatis ke kiri/kanan.

| Parameter | Nilai |
|-----------|-------|
| Frame rate | ~30fps (throttle manual) |
| Kecepatan | ±0.45 px/frame |
| Pause | Saat `mouseenter` / `touchstart` |
| Resume | `mouseleave` / `touchend` + 1500ms delay |
| Seamless loop | Skill diduplikasi, reset position saat mencapai setengah |
| Minimum items | 4 (di bawah itu tidak dianimasikan) |

### Skill Item Hover

- Icon container: `scale(1.10)` + border merah + shadow
- Tooltip nama: fade in + slide up

---

## 10. ImageCarousel — Auto-Fade

**File:** `src/components/ui/ImageCarousel.tsx`

| Parameter | Nilai |
|-----------|-------|
| Interval | 3000ms per gambar |
| Transisi | `opacity 700ms` |
| Pause | Saat hover |
| Single image | `group-hover:scale-105` (transition 500ms) |

---

## 11. VideoModal — framer-motion

**File:** `src/components/ui/VideoModal.tsx`

Satu-satunya komponen yang menggunakan framer-motion.

```tsx
<AnimatePresence>
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{ duration: 0.25 }}
    />
  </motion.div>
</AnimatePresence>
```

- Portal ke `document.body`
- Backdrop `bg-black/80`
- Close on Escape key / click backdrop
- Body scroll lock saat terbuka

---

## 12. Transisi CSS Global

### Navbar Position Transition

```tsx
// Saat scroll > 30% viewport → navbar pindah dari bawah ke atas
style={{ transition: "all 500ms" }}
```

### Theme Switch

```css
body {
  transition: background-color 0.35s ease, color 0.35s ease;
}
```

### Card Hover

```css
.card-dark {
  transition: border-color 0.2s ease, background-color 0.35s ease;
}
```

### Scroll-to-Top Button (FloatingActions)

```tsx
// Muncul setelah scroll > 40% viewport height
className={{
  "opacity-100 translate-y-0": show,
  "opacity-0 translate-y-4": !show,
  "transition-all duration-300": true
}}
```

---

## Performance Optimizations

### Yang Sudah Diterapkan

| Optimasi | Lokasi |
|----------|--------|
| **Throttle Canvas ke 30fps** | Starfield, BloodCrackTrail, SkillCarousel |
| **Non-aktif di mobile** | Starfield (`window.innerWidth < 768`), BloodCrack (touch device), ParallaxSection |
| **`content-visibility: auto`** | Section `#about`, `#skills`, `#certificates`, `#projects`, `#contact` |
| **`will-change: transform`** | ParallaxSection, SkillCarousel |
| **`prefers-reduced-motion`** | Semua animasi dimatikan |
| **`passive: true`** | Semua scroll event listeners |
| **Dynamic import (SSR: false)** | Semua komponen animasi di ClientShell |
| **Tab hidden check** | SkillCarousel skip frame saat tab tidak aktif |
| **IntersectionObserver** | GlitchReveal & ParallaxSection (sekali trigger, lalu disconnect) |

### `prefers-reduced-motion: reduce`

```css
@media (prefers-reduced-motion: reduce) {
  .animated-gradient-bg { animation: none; }
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Daftar File Animasi

| File | Tipe Animasi | Komponen Terkait |
|------|-------------|-----------------|
| `src/components/layout/GlitchIntro.tsx` | CSS @keyframes | Splash screen |
| `src/components/layout/BackgroundEffects.tsx` | CSS @keyframes + Canvas | Aurora, Starfield, Noise, BloodCrack |
| `src/components/layout/ScrollVein.tsx` | Canvas + rAF | Scroll-triggered vein growth |
| `src/components/layout/ScrollProgress.tsx` | CSS transition | Progress bar |
| `src/components/layout/ParallaxSection.tsx` | CSS transition + IO | Scroll slide-in |
| `src/components/layout/FloatingActions.tsx` | CSS transition | Scroll-to-top |
| `src/components/ui/GlitchReveal.tsx` | CSS transition + IO | Scroll-triggered reveal |
| `src/hooks/useGlitchReveal.ts` | IntersectionObserver | GlitchReveal logic |
| `src/components/ui/ErrorCodeScroll.tsx` | Canvas + rAF | Error text vertical scroll |
| `src/components/ui/SkillCarousel.tsx` | rAF + CSS transform | Infinite horizontal scroll |
| `src/components/ui/ImageCarousel.tsx` | CSS opacity transition | Auto-fade images |
| `src/components/ui/VideoModal.tsx` | framer-motion | Modal animate in/out |
| `src/components/sections/HeroSection.tsx` | CSS @keyframes + transitions | Gradient bg, role ticker, photo reveal |
| `src/app/globals.css` | CSS @keyframes | gradientShift, prefers-reduced-motion |
