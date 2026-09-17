"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ErrorCodeScroll } from "@/components/ui/ErrorCodeScroll";
import Image from "next/image";

// ─── Hero Photo ───────────────────────────────────────────────────────────────
function HeroPhoto({ src }: { src: string }) {
  const [hovered,  setHovered ] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setMousePos({
      x: Math.round(((e.clientX - r.left) / r.width)  * 100),
      y: Math.round(((e.clientY - r.top)  / r.height) * 100),
    });
  };

  return (
    <div ref={ref} className="relative h-full w-full" style={{ cursor: "crosshair" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={onMove}
    >
      <Image src={src} alt="Reavlenia Arezha"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        className="object-contain object-bottom object-right"
        style={{ filter: "grayscale(100%) blur(2px) brightness(0.75)" }}
      />
      <Image src={src} alt="" aria-hidden="true"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        className="object-contain object-bottom object-right pointer-events-none"
        style={{
          clipPath:   hovered ? `circle(85px at ${mousePos.x}% ${mousePos.y}%)` : "circle(0px at 50% 50%)",
          transition: "clip-path 0.15s ease",
        }}
      />
      {hovered && (
        <div className="absolute pointer-events-none z-10" style={{
          left: `calc(${mousePos.x}% - 80px)`, top: `calc(${mousePos.y}% - 50px)`,
          width: "160px", height: "100px",
          border: "1px solid rgba(255,255,255,0.3)",
          transition: "left 0.08s ease, top 0.08s ease",
        }}>
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/60" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/60" />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/60" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/60" />
          <span className="absolute -top-5 left-0 text-[9px] font-mono tracking-[0.3em] text-white/45 uppercase">Focus</span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 border border-blood-500/50 rounded-full" />
        </div>
      )}
    </div>
  );
}

// ─── Crescent ─────────────────────────────────────────────────────────────────
function Crescent() {
  return (
    <div className="absolute pointer-events-none select-none z-[2] hidden md:block"
      style={{ right: "2%", top: "50%", transform: "translateY(-50%)" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 400"
        className="w-[280px] h-[280px] lg:w-[400px] lg:h-[400px] xl:w-[480px] xl:h-[480px]"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cg1" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#083344" stopOpacity="0" />
          </radialGradient>
          <filter id="cglow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="csoft"><feGaussianBlur stdDeviation="12" /></filter>
        </defs>
        <ellipse cx="210" cy="200" rx="160" ry="155" fill="url(#cg1)" />
        <path d="M 200,45 A 155,155 0 1 1 200,355 A 108,108 0 1 0 200,45 Z" fill="#04212e" filter="url(#csoft)" opacity="0.55" />
        <path d="M 200,55 A 145,145 0 1 1 200,345 A 100,100 0 1 0 200,55 Z" fill="#061a25" filter="url(#cglow)" />
        <path d="M 200,65 A 135,135 0 1 1 200,335 A 92,92 0 1 0 200,65 Z" fill="#0e4858" />
        <path d="M 200,72 A 128,128 0 1 1 200,328 A 87,87 0 1 0 200,72 Z" fill="#147892" opacity="0.9" />
        <path d="M 200,80 A 120,120 0 1 1 200,320 A 82,82 0 1 0 200,80 Z" fill="none" stroke="#22d3ee" strokeWidth="1.2" opacity="0.4" />
      </svg>
    </div>
  );
}

// ─── Role Ticker ──────────────────────────────────────────────────────────────
function RoleTicker({ roles }: { roles: string[] }) {
  const [index,   setIndex  ] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (roles.length <= 1) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIndex(p => (p + 1) % roles.length); setVisible(true); }, 350);
    }, 2800);
    return () => clearInterval(id);
  }, [roles]);

  return (
    <div className="overflow-hidden" style={{ minHeight: "1.2em" }}>
      <span className="block font-black uppercase leading-tight text-dark-100"
        style={{
          fontSize: "clamp(1.4rem, 4vw, 2.8rem)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}>
        {roles[index] ?? ""}
      </span>
    </div>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-blood-900/40 bg-blood-950/20">
      <span className="text-base sm:text-lg font-black text-gradient-blood leading-none">{value}</span>
      <span className="text-[9px] font-mono text-dark-500 mt-0.5 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Hero Content (shared mobile + desktop) ───────────────────────────────────
interface HeroContentProps {
  roles:     string[];
  nameFirst: string;
  nameLast:  string;
  bio:       string;
  stats:     { value: string; label: string }[];
  compact?:  boolean;
}

function HeroContent({ roles, nameFirst, nameLast, bio, stats, compact = false }: HeroContentProps) {
  const socials = [
    { label: "GitHub",    href: "https://github.com/Rheaglitch" },
    { label: "Instagram", href: "https://instagram.com/"        },
    { label: "LinkedIn",  href: "https://linkedin.com/"         },
  ];

  const sz = compact ? "text-[clamp(1.6rem,7vw,2.2rem)]" : "text-3xl lg:text-4xl xl:text-5xl";

  return (
    <div className={`flex flex-col ${compact ? "gap-4 h-full justify-between" : "justify-between h-full min-h-[calc(100vh-4rem)] py-4"}`}>

      {/* Name */}
      <div>
        <p className="font-mono text-[10px] text-blood-600 tracking-[0.3em] uppercase mb-1.5">Creative Portfolio</p>
        <h1 className="font-black leading-none tracking-tight">
          <span className={`block text-dark-100 ${sz}`}>{nameFirst}</span>
          <span className={`block font-bold ${sz}`} style={{ color: "var(--hero-name-2)" }}>{nameLast}</span>
        </h1>
      </div>

      {/* Middle */}
      <div className={`flex flex-col ${compact ? "gap-3" : "gap-4 lg:gap-5"}`}>
        {/* Role */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-px bg-blood-700" />
            <span className="text-[9px] font-mono text-blood-600 tracking-[0.2em] uppercase">I am a</span>
          </div>
          <RoleTicker roles={roles} />
        </div>

        {/* Bio */}
        <p className={`leading-relaxed ${compact ? "text-xs" : "text-sm"}`}
          style={{ color: "var(--text-secondary)" }}>
          {bio || "Menciptakan karya yang fungsional sekaligus indah — dari kode sampai kanvas."}
        </p>

        {/* Stats */}
        <div className="flex items-center flex-wrap gap-2">
          {stats.length > 0
            ? stats.map(st => <StatPill key={st.label} value={st.value} label={st.label} />)
            : <>
                <StatPill value="10+" label="Projects" />
                <StatPill value="3+"  label="Years"    />
                <StatPill value="5+"  label="Skills"   />
              </>
          }
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/#projects"
            className={`rounded-full bg-blood-700 hover:bg-blood-600 text-white font-semibold transition-all hover:scale-105 active:scale-95 ${compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-xs"}`}>
            Lihat Karya →
          </Link>
          <Link href="/#contact"
            className={`rounded-full border border-dark-700 hover:border-blood-600 text-dark-400 hover:text-blood-400 font-semibold transition-all hover:scale-105 active:scale-95 ${compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-xs"}`}>
            Kontak
          </Link>
        </div>
      </div>

      {/* Socials */}
      <div className="flex items-center gap-4">
        {socials.map(({ label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            aria-label={`Visit my ${label}`}
            className="group flex items-center gap-1.5">
            <span className="w-3 h-px bg-dark-700 group-hover:bg-blood-600 group-hover:w-5 transition-all duration-300" />
            <span className={`text-dark-500 group-hover:text-dark-200 font-mono transition-colors ${compact ? "text-[10px]" : "text-xs"}`}>
              {label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
interface HeroSectionProps {
  heroImageUrl?: string;
  roles?:        string[];
  nameFirst?:    string;
  nameLast?:     string;
  bio?:          string;
  stats?:        { value: string; label: string }[];
}

const FALLBACK_IMAGE = "https://zljhjdhknybktcvtdutz.supabase.co/storage/v1/object/public/hero/ab9e4d158163df3ee068613735669b04-removebg-preview.png";

export function HeroSection({ heroImageUrl, roles = [], nameFirst = "REAVLENIA", nameLast = "AREZHA", bio = "", stats = [] }: HeroSectionProps) {
  const imageUrl = heroImageUrl || FALLBACK_IMAGE;
  const displayRoles = roles.length > 0 ? roles : ["Web Developer", "Animator", "UI/UX Designer", "Illustrator"];

  return (
    <section id="home"
      className="sticky top-0 overflow-hidden animated-gradient-bg w-full max-w-full"
      style={{ zIndex: 1, height: "100vh" }}
    >
      {/* Dark/light overlay left — readability */}
      <div className="absolute hidden md:block z-[3] pointer-events-none"
        style={{
          left: 0, top: 0, bottom: 0, width: "50%",
          background: "linear-gradient(to right, var(--overlay-left) 0%, color-mix(in srgb, var(--overlay-left) 60%, transparent) 70%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Error code scroll */}
      <div className="hidden md:block">
        <ErrorCodeScroll side="right" />
      </div>

      {/* Crescent */}
      <Crescent />

      {/* ═══ MOBILE ═══ */}
      <div className="md:hidden flex flex-col h-full overflow-y-auto px-5 pb-20 pt-16 gap-4">
        <HeroContent
          roles={displayRoles} nameFirst={nameFirst} nameLast={nameLast}
          bio={bio} stats={stats} compact
        />
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden md:flex h-full items-end">

        {/* Content — kiri, full height, justify between agar konten tersebar */}
        <div className="relative z-[4] h-full flex flex-col justify-between
          px-8 lg:px-12 xl:px-16 pb-16 pt-20 pointer-events-none"
          style={{ width: "52%", maxWidth: "620px", flexShrink: 0 }}
        >
          <div className="pointer-events-auto flex-1 flex flex-col justify-between">
            <HeroContent
              roles={displayRoles} nameFirst={nameFirst} nameLast={nameLast}
              bio={bio} stats={stats}
            />
          </div>
        </div>

        {/* Photo — kanan, anchored ke bottom, tinggi dikontrol secara proporsional */}
        <div className="relative z-[5] select-none self-end"
          style={{
            flex: "1 1 0",
            minWidth: 0,
            height: "clamp(420px, 88vh, 820px)",
          }}
        >
          <HeroPhoto src={imageUrl} />
        </div>

      </div>
    </section>
  );
}
