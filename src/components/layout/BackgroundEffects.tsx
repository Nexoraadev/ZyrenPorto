"use client";

import { useEffect, useRef } from "react";

// ─── 1. Portrait Radial Glow — strong cyan behind photo ──────────────────────
function PortraitGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const posRef  = useRef({ x: 68, y: 52 });
  const curRef  = useRef({ x: 68, y: 52 });
  const rafRef  = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      posRef.current = {
        x: 50 + (e.clientX / window.innerWidth  - 0.5) * 30,
        y: 40 + (e.clientY / window.innerHeight - 0.5) * 25,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const animate = () => {
      curRef.current.x += (posRef.current.x - curRef.current.x) * 0.015;
      curRef.current.y += (posRef.current.y - curRef.current.y) * 0.015;
      if (glowRef.current) {
        glowRef.current.style.background = [
          `radial-gradient(ellipse 60% 65% at ${curRef.current.x}% ${curRef.current.y}%,`,
          `  rgba(6,182,212,0.28) 0%,`,
          `  rgba(8,145,178,0.18) 25%,`,
          `  rgba(14,116,144,0.09) 50%,`,
          `  transparent 72%`,
          `)`,
        ].join("");
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
    <>
      {/* Tracked primary glow */}
      <div
        ref={glowRef}
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 60% 65% at 68% 52%, rgba(6,182,212,0.28) 0%, rgba(8,145,178,0.18) 25%, rgba(14,116,144,0.09) 50%, transparent 72%)",
        }}
      />
      {/* Depth layer — always fixed right */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 45% 55% at 82% 58%, rgba(8,145,178,0.14) 0%, transparent 60%)",
        }}
      />
      {/* Left side darkening — keeps text readable */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "linear-gradient(to right, rgba(4,8,13,0.55) 0%, rgba(4,8,13,0.2) 38%, transparent 55%)",
        }}
      />
    </>
  );
}

// ─── 2. Hero Editorial Layer — SVG with parallax ─────────────────────────────
function EditorialLayer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number>(0);
  const posRef  = useRef({ x: 0, y: 0 });
  const curRef  = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Skip parallax on mobile
    if (window.innerWidth < 768) return;

    const onMove = (e: MouseEvent) => {
      posRef.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 24,
        y: (e.clientY / window.innerHeight - 0.5) * 14,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const animate = () => {
      curRef.current.x += (posRef.current.x - curRef.current.x) * 0.035;
      curRef.current.y += (posRef.current.y - curRef.current.y) * 0.035;
      if (wrapRef.current) {
        wrapRef.current.style.transform =
          `translate(${curRef.current.x * 0.4}px, ${curRef.current.y * 0.4}px)`;
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
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={wrapRef}
        style={{ position: "absolute", inset: "-5%", willChange: "transform" }}
      >
        <svg
          width="110%"
          height="110%"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* ── ENGINEER DESIGN BUILD — large stacked editorial text ── */}
          <text x="480" y="230"
            fontFamily="var(--font-geist-sans, 'Inter', sans-serif)"
            fontWeight="900" fontSize="148" letterSpacing="-4"
            fill="rgba(10,22,35,0.0)" stroke="rgba(34,211,238,0.22)"
            strokeWidth="0.8" paintOrder="stroke"
          >ENGINEER</text>
          <text x="480" y="390"
            fontFamily="var(--font-geist-sans, 'Inter', sans-serif)"
            fontWeight="900" fontSize="148" letterSpacing="-4"
            fill="rgba(10,22,35,0.0)" stroke="rgba(34,211,238,0.18)"
            strokeWidth="0.8" paintOrder="stroke"
          >DESIGN</text>
          <text x="480" y="550"
            fontFamily="var(--font-geist-sans, 'Inter', sans-serif)"
            fontWeight="900" fontSize="148" letterSpacing="-4"
            fill="rgba(10,22,35,0.0)" stroke="rgba(34,211,238,0.16)"
            strokeWidth="0.8" paintOrder="stroke"
          >BUILD</text>

          {/* ── Stack list — // FULL STACK etc ── */}
          <g
            fontFamily="var(--font-geist-mono, 'SF Mono', monospace)"
            fontSize="13" fill="rgba(34, 211, 238, 0.39)" letterSpacing="1.5"
          >
            <text x="482" y="610">// FULL STACK</text>
            <text x="482" y="632">// WEB &amp; APP</text>
            <text x="482" y="654">// OPEN SOURCE</text>
            <text x="482" y="676">// 2026 —</text>
          </g>

          {/* ── Top-right small tagline ── */}
          <g
            fontFamily="var(--font-geist-mono, 'SF Mono', monospace)"
            fontSize="11" fill="rgba(34, 211, 238, 0.39)" letterSpacing="2"
            textAnchor="end"
          >
            <text x="1400" y="55">BETTER CODE</text>
            <text x="1400" y="72">BIGGER DREAMS</text>
          </g>

          {/* ── Geometric construction lines ── */}
          {/* Perspective guides — converge right */}
          <g stroke="rgba(34,211,238,0.08)" strokeWidth="0.6" fill="none">
            <line x1="1440" y1="450" x2="300"  y2="50"  />
            <line x1="1440" y1="450" x2="200"  y2="250" />
            <line x1="1440" y1="450" x2="200"  y2="650" />
            <line x1="1440" y1="450" x2="300"  y2="850" />
          </g>

          {/* Diagonal structural lines */}
          <g stroke="rgba(34,211,238,0.07)" strokeWidth="0.5" fill="none">
            <line x1="650"  y1="0"   x2="1180" y2="900" />
            <line x1="780"  y1="0"   x2="1440" y2="820" />
          </g>

          {/* Horizontal structural rules */}
          <g stroke="rgba(34,211,238,0.07)" strokeWidth="0.4">
            <line x1="0"    y1="88"  x2="420"  y2="88"  />
            <line x1="0"    y1="812" x2="380"  y2="812" />
            <line x1="1020" y1="40"  x2="1440" y2="40"  />
            <line x1="1080" y1="860" x2="1440" y2="860" />
          </g>

          {/* ── Crosshair / registration marks ── */}
          <g stroke="rgba(34,211,238,0.28)" strokeWidth="0.8" fill="none">
            {/* center-field mark */}
            <line x1="700" y1="420" x2="726" y2="420" />
            <line x1="713" y1="407" x2="713" y2="433" />
            <circle cx="713" cy="420" r="6" strokeWidth="0.5" />
            {/* top-right */}
            <line x1="1288" y1="118" x2="1308" y2="118" />
            <line x1="1298" y1="108" x2="1298" y2="128" />
            {/* bottom-left */}
            <line x1="132" y1="748" x2="152"  y2="748" />
            <line x1="142" y1="738" x2="142"  y2="758" />
          </g>

          {/* Corner brackets */}
          <g stroke="rgba(34,211,238,0.18)" strokeWidth="0.7" fill="none">
            <polyline points="1390,22 1420,22 1420,52" />
            <polyline points="22,878  22,848  52,848"  />
          </g>

          {/* ── Abstract V-shape / monogram ── */}
          <g stroke="rgba(34,211,238,0.07)" strokeWidth="1.2" fill="none">
            <polyline points="580,60 760,500 940,60" />
            <polyline points="620,60 760,440 900,60" />
          </g>
        </svg>
      </div>
    </div>
  );
}

// ─── 3. Film Grain ────────────────────────────────────────────────────────────
function FilmGrain() {
  return (
    <div
      className="fixed inset-0 z-[1] pointer-events-none"
      aria-hidden="true"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.04,
        mixBlendMode: "overlay" as React.CSSProperties["mixBlendMode"],
      }}
    />
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function BackgroundEffects() {
  return (
    <>
      <PortraitGlow />
      <EditorialLayer />
      <FilmGrain />
    </>
  );
}
