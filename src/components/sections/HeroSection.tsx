"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Hero Background — rendered INSIDE the section ───────────────────────────
function HeroBg() {
  const glowRef = useRef<HTMLDivElement>(null);
  const svgRef  = useRef<SVGSVGElement>(null);
  const rafRef  = useRef<number>(0);
  const posRef  = useRef({ x: 68, y: 52 });
  const curRef  = useRef({ x: 68, y: 52 });
  const parRef  = useRef({ x: 0, y: 0 });
  const parCur  = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      posRef.current = {
        x: 50 + (e.clientX / window.innerWidth  - 0.5) * 28,
        y: 42 + (e.clientY / window.innerHeight - 0.5) * 22,
      };
      parRef.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 12,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const animate = () => {
      // Glow follows pointer slowly
      curRef.current.x += (posRef.current.x - curRef.current.x) * 0.014;
      curRef.current.y += (posRef.current.y - curRef.current.y) * 0.014;
      if (glowRef.current) {
        glowRef.current.style.background = [
          `radial-gradient(ellipse 62% 68% at ${curRef.current.x}% ${curRef.current.y}%,`,
          `rgba(6,182,212,0.30) 0%, rgba(8,145,178,0.18) 28%,`,
          `rgba(14,116,144,0.08) 52%, transparent 72%)`,
        ].join(" ");
      }
      // SVG parallax
      parCur.current.x += (parRef.current.x - parCur.current.x) * 0.032;
      parCur.current.y += (parRef.current.y - parCur.current.y) * 0.032;
      if (svgRef.current) {
        svgRef.current.style.transform =
          `translate(${parCur.current.x * 0.35}px, ${parCur.current.y * 0.35}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden" aria-hidden="true">

      {/* ── Radial portrait glow ── */}
      <div
        ref={glowRef}
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 62% 68% at 68% 52%, rgba(6,182,212,0.30) 0%, rgba(8,145,178,0.18) 28%, rgba(14,116,144,0.08) 52%, transparent 72%)",
        }}
      />
      {/* Depth secondary glow — always anchored right */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 40% 50% at 84% 60%, rgba(8,145,178,0.12) 0%, transparent 58%)",
      }} />

      {/* ── Left readability gradient ── */}
      <div className="absolute inset-0 hidden md:block" style={{
        background: "linear-gradient(to right, rgba(4,8,13,0.60) 0%, rgba(4,8,13,0.22) 40%, transparent 58%)",
      }} />

      {/* ── Film grain ── */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.04,
        mixBlendMode: "overlay" as React.CSSProperties["mixBlendMode"],
      }} />

      {/* ── Editorial SVG layer — desktop only ── */}
      <div className="absolute inset-0 hidden md:block" style={{ overflow: "hidden" }}>
        <svg
          ref={svgRef}
          style={{
            position: "absolute",
            top: "-5%", left: "-2%",
            width: "104%", height: "110%",
            willChange: "transform",
          }}
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* ── ENGINEER / DESIGN / BUILD — stroke outline, no fill ── */}
          <text x="430" y="248"
            fontFamily="var(--font-geist-sans,'Inter',sans-serif)"
            fontWeight="900" fontSize="152" letterSpacing="-4"
            fill="none" stroke="rgba(34,211,238,0.20)" strokeWidth="0.8"
          >ENGINEER</text>
          <text x="430" y="420"
            fontFamily="var(--font-geist-sans,'Inter',sans-serif)"
            fontWeight="900" fontSize="152" letterSpacing="-4"
            fill="none" stroke="rgba(34,211,238,0.16)" strokeWidth="0.8"
          >DESIGN</text>
          <text x="430" y="592"
            fontFamily="var(--font-geist-sans,'Inter',sans-serif)"
            fontWeight="900" fontSize="152" letterSpacing="-4"
            fill="none" stroke="rgba(34,211,238,0.14)" strokeWidth="0.8"
          >BUILD</text>

          {/* ── Stack annotations ── */}
          <g fontFamily="var(--font-geist-mono,'SF Mono',monospace)"
            fontSize="12" fill="rgba(34,211,238,0.35)" letterSpacing="1.8">
            <text x="432" y="640">{'// FULL STACK'}</text>
            <text x="432" y="660">{'// WEB & APP'}</text>
            <text x="432" y="680">{'// OPEN SOURCE'}</text>
          </g>

          {/* ── Top-right tagline ── */}
          <g fontFamily="var(--font-geist-mono,'SF Mono',monospace)"
            fontSize="10.5" fill="rgba(34,211,238,0.30)" letterSpacing="2.2" textAnchor="end">
            <text x="1410" y="80">BETTER CODE</text>
            <text x="1410" y="97">BIGGER DREAMS</text>
          </g>

          {/* ── Perspective guide lines ── */}
          <g stroke="rgba(34,211,238,0.07)" strokeWidth="0.5" fill="none">
            <line x1="1440" y1="450" x2="260" y2="40"  />
            <line x1="1440" y1="450" x2="160" y2="260" />
            <line x1="1440" y1="450" x2="160" y2="640" />
            <line x1="1440" y1="450" x2="260" y2="860" />
          </g>

          {/* ── Diagonal structural lines ── */}
          <g stroke="rgba(34,211,238,0.065)" strokeWidth="0.5" fill="none">
            <line x1="680" y1="0"   x2="1200" y2="900" />
            <line x1="800" y1="0"   x2="1440" y2="800" />
          </g>

          {/* ── Horizontal rules ── */}
          <g stroke="rgba(34,211,238,0.065)" strokeWidth="0.4">
            <line x1="0"    y1="84"  x2="400"  y2="84"  />
            <line x1="0"    y1="816" x2="360"  y2="816" />
            <line x1="1040" y1="36"  x2="1440" y2="36"  />
          </g>

          {/* ── Crosshair marks ── */}
          <g stroke="rgba(34,211,238,0.32)" strokeWidth="0.8" fill="none">
            <line x1="698" y1="430" x2="722" y2="430" />
            <line x1="710" y1="418" x2="710" y2="442" />
            <circle cx="710" cy="430" r="5.5" strokeWidth="0.5" />
            <line x1="1292" y1="122" x2="1312" y2="122" />
            <line x1="1302" y1="112" x2="1302" y2="132" />
            <line x1="138"  y1="750" x2="158"  y2="750" />
            <line x1="148"  y1="740" x2="148"  y2="760" />
          </g>

          {/* ── Corner brackets ── */}
          <g stroke="rgba(34,211,238,0.20)" strokeWidth="0.7" fill="none">
            <polyline points="1392,18 1422,18 1422,48" />
            <polyline points="18,882  18,852  48,852"  />
          </g>

          {/* ── Abstract V-monogram ── */}
          <g stroke="rgba(34,211,238,0.065)" strokeWidth="1.0" fill="none">
            <polyline points="590,55 760,510 930,55" />
          </g>
        </svg>
      </div>
    </div>
  );
}

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

// ─── Terminal Label ───────────────────────────────────────────────────────────
function TerminalLabel() {
  return (
    <span className="font-mono text-[10px] text-blood-600 tracking-[0.25em] uppercase mb-1.5 flex items-center gap-0.5">
      <span className="opacity-60">{">"}</span>
      <span className="ml-1">init ./portfolio</span>
      <span
        className="inline-block w-[1px] h-[10px] bg-blood-500 ml-0.5 align-middle"
        style={{ animation: "blink-cursor 1s step-end infinite" }}
      />
      <style>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </span>
  );
}

// ─── Availability Badge ───────────────────────────────────────────────────────
function AvailabilityBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-emerald-900/50 bg-emerald-950/30 font-mono text-[9px] tracking-widest uppercase text-emerald-400 mb-2 w-fit">
      <span
        className="w-1.5 h-1.5 rounded-full bg-emerald-400"
        style={{ animation: "pulse-dot 2s ease-in-out infinite" }}
      />
      Available
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </span>
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
        <TerminalLabel />
        <AvailabilityBadge />
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
            className={`rounded-sm bg-blood-700 hover:bg-blood-600 text-white font-semibold transition-all hover:scale-105 active:scale-95 ring-1 ring-blood-700/40 hover:ring-blood-500/60 ${compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-xs"}`}>
            Lihat Karya →
          </Link>
          <Link href="/#contact"
            className={`rounded-sm border border-dark-700 hover:border-blood-600 text-dark-400 hover:text-blood-400 font-semibold transition-all hover:scale-105 active:scale-95 ${compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-xs"}`}>
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

const FALLBACK_IMAGE = "https://uskpxggqqfqidyrroobx.supabase.co/storage/v1/object/public/portfolio-assets/hero/1789625657620-nobg-k1pjb2prcff.png";

export function HeroSection({ heroImageUrl, roles = [], nameFirst = "REAVLENIA", nameLast = "AREZHA", bio = "", stats = [] }: HeroSectionProps) {
  const imageUrl = heroImageUrl || FALLBACK_IMAGE;
  const displayRoles = roles.length > 0 ? roles : ["Web Developer", "Animator", "UI/UX Designer", "Illustrator"];

  return (
    <section id="home"
      className="sticky top-0 overflow-hidden animated-gradient-bg w-full max-w-full"
      style={{ zIndex: 1, height: "100vh" }}
    >
      {/* ── Hero Background ── */}
      <HeroBg />

      {/* Dark/light overlay left — readability */}
      <div className="absolute hidden md:block z-[3] pointer-events-none"
        style={{
          left: 0, top: 0, bottom: 0, width: "50%",
          background: "linear-gradient(to right, var(--overlay-left) 0%, color-mix(in srgb, var(--overlay-left) 60%, transparent) 70%, transparent 100%)",
        }}
        aria-hidden="true"
      />

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
