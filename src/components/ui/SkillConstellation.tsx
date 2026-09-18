"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Skill } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SkillItem {
  name:     string;
  category: string;
  desc:     string;
  iconUrl:  string;
  /** Position as % of the composition box (0–100) */
  x: number;
  y: number;
  /** Parallax depth layer — 0 front, 1 mid, 2 back */
  layer: number;
}

// ─── Static metadata ──────────────────────────────────────────────────────────

const META: Record<string, { category: string; desc: string; iconUrl: string }> = {
  React:          { category: "UI Library",       desc: "Membangun antarmuka yang cepat, dinamis, dan scalable.",         iconUrl: "https://cdn.simpleicons.org/react/61DAFB"       },
  "Next.js":      { category: "Framework",         desc: "Full-stack React framework dengan SSR dan file-based routing.",  iconUrl: "https://cdn.simpleicons.org/nextdotjs/ffffff"   },
  TypeScript:     { category: "Language",          desc: "JavaScript dengan type safety untuk kode yang lebih robust.",    iconUrl: "https://cdn.simpleicons.org/typescript/3178C6" },
  "Tailwind CSS": { category: "CSS Framework",     desc: "Utility-first CSS untuk desain yang konsisten dan cepat.",       iconUrl: "https://cdn.simpleicons.org/tailwindcss/06B6D4"},
  "Node.js":      { category: "Runtime",           desc: "JavaScript runtime untuk backend services dan APIs.",            iconUrl: "https://cdn.simpleicons.org/nodedotjs/339933"  },
  Supabase:       { category: "BaaS / Database",   desc: "Open-source Firebase alternative dengan PostgreSQL.",            iconUrl: "https://cdn.simpleicons.org/supabase/3ECF8E"   },
  PostgreSQL:     { category: "Database",          desc: "Relational database yang powerful dan reliable.",                iconUrl: "https://cdn.simpleicons.org/postgresql/4169E1" },
  Docker:         { category: "DevOps",            desc: "Containerization untuk deployment yang konsisten.",              iconUrl: "https://cdn.simpleicons.org/docker/2496ED"     },
  Git:            { category: "Version Control",   desc: "Distributed version control untuk kolaborasi dan history.",      iconUrl: "https://cdn.simpleicons.org/git/F05032"        },
  Figma:          { category: "Design Tool",       desc: "Kolaboratif UI/UX design tool untuk prototyping.",               iconUrl: "https://cdn.simpleicons.org/figma/F24E1E"      },
  Vercel:         { category: "Deployment",        desc: "Platform deployment untuk frontend dan serverless.",             iconUrl: "https://cdn.simpleicons.org/vercel/ffffff"     },
  "REST API":     { category: "API Architecture",  desc: "Desain dan konsumsi RESTful APIs yang scalable.",                iconUrl: "https://cdn.simpleicons.org/fastapi/009688"    },
};

/**
 * Art-directed positions matching the reference screenshot.
 *
 * Reference layout:
 *   React        — upper-left (on inner orbit)
 *   Next.js      — upper-center (on mid orbit)
 *   TypeScript   — right-of-center upper (on inner orbit)
 *   Tailwind CSS — far-right upper (on outer orbit)
 *   Figma        — left mid (on outer orbit)
 *   Vercel       — left lower-mid (on mid orbit)
 *   Node.js      — right mid (on mid orbit)
 *   Supabase     — far-right mid (on outer orbit)
 *   Docker       — lower-left (on inner orbit)
 *   Git          — bottom-center (on inner orbit)
 *   PostgreSQL   — lower-right-of-center (on mid orbit)
 *   REST API     — right lower-mid (on outer orbit)
 */
const LAYOUT: Record<string, { x: number; y: number; layer: number }> = {
  React:          { x: 30,  y: 16,  layer: 0 },
  "Next.js":      { x: 48,  y: 12,  layer: 1 },
  TypeScript:     { x: 62,  y: 19,  layer: 0 },
  "Tailwind CSS": { x: 79,  y: 26,  layer: 2 },
  Figma:          { x: 17,  y: 40,  layer: 2 },
  Vercel:         { x: 21,  y: 60,  layer: 1 },
  "Node.js":      { x: 72,  y: 52,  layer: 1 },
  Supabase:       { x: 86,  y: 56,  layer: 2 },
  Docker:         { x: 30,  y: 76,  layer: 0 },
  Git:            { x: 48,  y: 83,  layer: 0 },
  PostgreSQL:     { x: 62,  y: 76,  layer: 1 },
  "REST API":     { x: 76,  y: 70,  layer: 2 },
};

const DEFAULT_ORDER = Object.keys(LAYOUT);

const OVERFLOW_SLOTS = [
  { x: 38, y: 62, layer: 1 },
  { x: 68, y: 38, layer: 1 },
  { x: 55, y: 70, layer: 2 },
];

/** Sparse semantic connections — only where it makes conceptual sense */
const CONNECTIONS: [string, string][] = [
  ["React",    "Next.js"],
  ["React",    "TypeScript"],
  ["Next.js",  "TypeScript"],
  ["Node.js",  "REST API"],
  ["REST API", "PostgreSQL"],
  ["REST API", "Supabase"],
  ["Docker",   "Git"],
  ["Figma",    "React"],
  ["Vercel",   "Docker"],
];

// ─── Build items ──────────────────────────────────────────────────────────────

function buildItems(dbSkills: Skill[]): SkillItem[] {
  const source =
    dbSkills.length > 0
      ? [...dbSkills].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      : DEFAULT_ORDER.map((name, i) => ({
          name,
          category: META[name]?.category ?? "Tools",
          icon: META[name]?.iconUrl ?? null,
          description: META[name]?.desc ?? null,
          order_index: i,
        } as Skill));

  let overflow = 0;
  return source.map(skill => {
    const meta = META[skill.name];
    const pos  = LAYOUT[skill.name] ?? OVERFLOW_SLOTS[overflow++ % OVERFLOW_SLOTS.length];
    return {
      name:     skill.name,
      category: meta?.category ?? skill.category ?? "Tools",
      desc:     skill.description?.trim() || meta?.desc || `${skill.name} — bagian dari toolkit.`,
      iconUrl:  skill.icon ?? meta?.iconUrl ?? "",
      x:        pos.x,
      y:        pos.y,
      layer:    pos.layer,
    };
  });
}

// ─── Parallax ─────────────────────────────────────────────────────────────────

/** Depth multiplier per layer: layer 0 (front) moves most */
const LAYER_DEPTH = [0.9, 0.5, 0.2] as const;

function useParallax(enabled: boolean) {
  const [off, setOff]  = useState({ x: 0, y: 0 });
  const tgt  = useRef({ x: 0, y: 0 });
  const cur  = useRef({ x: 0, y: 0 });
  const raf  = useRef<number>(0);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    tgt.current = {
      x: ((e.clientX - r.left) / r.width  - 0.5) * 14,
      y: ((e.clientY - r.top)  / r.height - 0.5) * 9,
    };
  }, [enabled]);

  const onLeave = useCallback(() => { tgt.current = { x: 0, y: 0 }; }, []);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      cur.current.x += (tgt.current.x - cur.current.x) * 0.06;
      cur.current.y += (tgt.current.y - cur.current.y) * 0.06;
      setOff({ ...cur.current });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [enabled]);

  return { off, onMove, onLeave };
}

// ─── Animated orbital dot ─────────────────────────────────────────────────────

/**
 * A single dot that travels along an SVG ellipse path using CSS animation.
 * `orbitId` must match the <path id> of the orbit in OrbitalSVG.
 */
function OrbitDot({
  pathId,
  duration,
  delay,
  size = 3,
  opacity = 0.7,
}: {
  pathId:   string;
  duration: number;
  delay:    number;
  size?:    number;
  opacity?: number;
}) {
  return (
    <circle r={size} fill={`rgba(34,211,238,${opacity})`}>
      <animateMotion
        dur={`${duration}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
        calcMode="linear"
      >
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </circle>
  );
}

// ─── Main orbital SVG ─────────────────────────────────────────────────────────

/**
 * Renders the three layered tilted elliptical orbits.
 *
 * The ellipses are defined in SVG viewBox space (1000 × 560).
 * They are explicitly tilted using `transform="rotate(…)"` to look like
 * the 3D perspective tracks in the reference.
 *
 * ORBIT HIERARCHY:
 *   #orbit-primary   — largest, brightest, solid cyan, slight tilt
 *   #orbit-secondary — medium, dashed, tilted opposite way
 *   #orbit-tertiary  — smallest inner, dashed, nearly horizontal
 */
function OrbitalSVG() {
  return (
    /*
     * The SVG is positioned to bleed 8vw outside the left/right container edges.
     * This allows the wide orbital ellipses to extend naturally beyond the
     * section boundary, matching the reference where orbits bleed to screen edges.
     */
    <svg
      className="absolute pointer-events-none"
      style={{
        left:   "-8vw",
        right:  "-8vw",
        top:    0,
        bottom: 0,
        width:  "calc(100% + 16vw)",
        height: "100%",
        overflow: "visible",
      }}
      viewBox="0 0 1000 560"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        {/* Ambient centre glow */}
        <radialGradient id="sk-cg" cx="50%" cy="50%" r="30%">
          <stop offset="0%"   stopColor="rgba(34,211,238,0.2)"  />
          <stop offset="100%" stopColor="rgba(34,211,238,0)"    />
        </radialGradient>
        {/* Subtle background atmosphere */}
        <radialGradient id="sk-atm" cx="50%" cy="50%" r="60%">
          <stop offset="0%"   stopColor="rgba(6,26,44,0.0)"  />
          <stop offset="70%"  stopColor="rgba(6,26,44,0.0)"  />
          <stop offset="100%" stopColor="rgba(34,211,238,0.035)" />
        </radialGradient>
      </defs>

      {/* ── Atmosphere wash ── */}
      <ellipse cx="500" cy="280" rx="490" ry="270" fill="url(#sk-atm)" />

      {/* ── Central ambient glow ── */}
      <ellipse cx="500" cy="280" rx="140" ry="90" fill="url(#sk-cg)" />

      {/* ════════════════════════════════════════
          PRIMARY ORBIT — largest, solid, 1.4px
          Tilted ~–12° (reference shows a wide
          shallow ellipse tilted slightly)
          ════════════════════════════════════════ */}
      <g transform="rotate(-10, 500, 280)">
        <ellipse
          id="orbit-primary"
          cx="500" cy="280"
          rx="460" ry="115"
          fill="none"
          stroke="rgba(34,211,238,0.55)"
          strokeWidth="1.4"
        />
      </g>
      {/* Same path for animateMotion — must be <path> not <ellipse> */}
      <path
        id="orbit-primary-path"
        d="M 500,165 A 460,115 0 1 1 499.99,165"
        fill="none"
        stroke="none"
        transform="rotate(-10, 500, 280)"
      />

      {/* ════════════════════════════════════════
          SECONDARY ORBIT — medium, dashed, tilted +8°
          ════════════════════════════════════════ */}
      <g transform="rotate(8, 500, 280)">
        <ellipse
          id="orbit-secondary"
          cx="500" cy="280"
          rx="330" ry="90"
          fill="none"
          stroke="rgba(34,211,238,0.38)"
          strokeWidth="1.1"
          strokeDasharray="18 12"
        />
      </g>
      <path
        id="orbit-secondary-path"
        d="M 500,190 A 330,90 0 1 1 499.99,190"
        fill="none"
        stroke="none"
        transform="rotate(8, 500, 280)"
      />

      {/* ════════════════════════════════════════
          TERTIARY ORBIT — small inner, dashed, –5°
          ════════════════════════════════════════ */}
      <g transform="rotate(-5, 500, 280)">
        <ellipse
          id="orbit-tertiary"
          cx="500" cy="280"
          rx="200" ry="65"
          fill="none"
          stroke="rgba(34,211,238,0.22)"
          strokeWidth="0.8"
          strokeDasharray="10 16"
        />
      </g>
      <path
        id="orbit-tertiary-path"
        d="M 500,215 A 200,65 0 1 1 499.99,215"
        fill="none"
        stroke="none"
        transform="rotate(-5, 500, 280)"
      />

      {/* ════════════════════════════════════════
          QUATERNARY ORBIT — outermost, very faint, +15°
          ════════════════════════════════════════ */}
      <g transform="rotate(15, 500, 280)">
        <ellipse
          cx="500" cy="280"
          rx="470" ry="200"
          fill="none"
          stroke="rgba(34,211,238,0.1)"
          strokeWidth="0.7"
          strokeDasharray="6 22"
        />
      </g>

      {/* ── Animated dots on primary orbit ── */}
      <g transform="rotate(-10, 500, 280)">
        <OrbitDot pathId="orbit-primary-path" duration={22} delay={0}   size={3.5} opacity={0.75} />
        <OrbitDot pathId="orbit-primary-path" duration={22} delay={11}  size={2.5} opacity={0.45} />
      </g>

      {/* ── Animated dots on secondary orbit ── */}
      <g transform="rotate(8, 500, 280)">
        <OrbitDot pathId="orbit-secondary-path" duration={30} delay={5}  size={3}   opacity={0.6}  />
        <OrbitDot pathId="orbit-secondary-path" duration={30} delay={20} size={2}   opacity={0.35} />
      </g>

      {/* ── Static glowing nodes at key orbit points ── */}
      {/* These mark "intersections" and add depth */}
      {([
        // x,    y,  r, opacity
        [104,  248, 4, 0.6],
        [896,  310, 4, 0.5],
        [500,  168, 3, 0.55],
        [500,  388, 3, 0.45],
        [185,  322, 3.5, 0.5],
        [820,  238, 3.5, 0.45],
      ] as [number, number, number, number][]).map(([cx, cy, r, op], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r + 5} fill={`rgba(34,211,238,${op * 0.18})`} />
          <circle cx={cx} cy={cy} r={r}     fill={`rgba(34,211,238,${op})`} />
        </g>
      ))}

      {/* ── Corner crosshair / registration marks ── */}
      <g stroke="rgba(34,211,238,0.3)" strokeWidth="1.5" fill="none">
        <line x1="22"  y1="18"  x2="52"  y2="18"  /><line x1="22"  y1="18"  x2="22"  y2="48"  />
        <line x1="978" y1="18"  x2="948" y2="18"  /><line x1="978" y1="18"  x2="978" y2="48"  />
        <line x1="22"  y1="542" x2="52"  y2="542" /><line x1="22"  y1="542" x2="22"  y2="512" />
        <line x1="978" y1="542" x2="948" y2="542" /><line x1="978" y1="542" x2="978" y2="512" />
      </g>

      {/* ── Mini crosshairs (decorative extras) ── */}
      <g stroke="rgba(34,211,238,0.18)" strokeWidth="1.2" fill="none">
        <line x1="878" y1="18"  x2="904" y2="18"  /><line x1="891" y1="6"   x2="891" y2="32"  />
        <line x1="96"  y1="542" x2="122" y2="542" /><line x1="109" y1="528" x2="109" y2="554" />
      </g>

      {/* ── Diagonal accent lines ── */}
      <line x1="22"  y1="530" x2="105" y2="447"
        stroke="rgba(34,211,238,0.14)" strokeWidth="1.1" strokeDasharray="7 12" />
      <line x1="978" y1="28"  x2="895" y2="111"
        stroke="rgba(34,211,238,0.1)"  strokeWidth="0.9" />

      {/* ── Large subtle background geometry ── */}
      {/* Bottom-right triangular architectural shapes — bleed out of viewBox */}
      <polygon
        points="680,560 1100,230 1100,560"
        fill="rgba(34,211,238,0.022)"
        stroke="rgba(34,211,238,0.055)"
        strokeWidth="0.7"
      />
      <polygon
        points="810,560 1100,360 1100,560"
        fill="rgba(34,211,238,0.016)"
      />
      {/* Left-side faint geometric echo */}
      <polygon
        points="320,560 -100,310 -100,560"
        fill="rgba(34,211,238,0.012)"
        stroke="rgba(34,211,238,0.03)"
        strokeWidth="0.5"
      />

      {/* Top-right subtle angular plane */}
      <polygon
        points="880,0 1100,0 1100,180 820,0"
        fill="rgba(34,211,238,0.014)"
        stroke="rgba(34,211,238,0.038)"
        strokeWidth="0.6"
      />

      {/* ── Decorative technical labels ── */}
      <text
        x="958" y="70"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="9"
        fill="rgba(34,211,238,0.28)"
        textAnchor="end"
        letterSpacing="2"
      >
        BUILD
      </text>
      <text
        x="968" y="85"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="9"
        fill="rgba(34,211,238,0.22)"
        textAnchor="end"
        letterSpacing="2"
      >
        CREATE
      </text>
      <text
        x="975" y="100"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="9"
        fill="rgba(34,211,238,0.18)"
        textAnchor="end"
        letterSpacing="2"
      >
        IMPROVE
      </text>

      <text
        x="22" y="520"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="8"
        fill="rgba(34,211,238,0.22)"
        letterSpacing="2.5"
      >
        MODERN TECH STACK
      </text>
      <text
        x="22" y="533"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="8"
        fill="rgba(34,211,238,0.18)"
        letterSpacing="2.5"
      >
        BETTER SOLUTIONS
      </text>

      {/* Grain filter */}
      <filter id="sk-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="1000" height="560" filter="url(#sk-grain)" opacity="0.025" />
    </svg>
  );
}

// ─── Connection lines (same coordinate space as skill % positions) ────────────

function ConnectionLines({ items }: { items: SkillItem[] }) {
  const byName = useMemo(() => {
    const m = new Map<string, SkillItem>();
    items.forEach(s => m.set(s.name, s));
    return m;
  }, [items]);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {CONNECTIONS.map(([a, b]) => {
        const p1 = byName.get(a);
        const p2 = byName.get(b);
        if (!p1 || !p2) return null;
        const mx = (p1.x + p2.x) / 2 + (p2.y - p1.y) * 0.035;
        const my = (p1.y + p2.y) / 2 + (p1.x - p2.x) * 0.035;
        return (
          <path
            key={`${a}-${b}`}
            d={`M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`}
            fill="none"
            stroke="rgba(34,211,238,0.18)"
            strokeWidth="0.22"
            strokeDasharray="2 4"
          />
        );
      })}
    </svg>
  );
}

// ─── Central V / FULL STACK ───────────────────────────────────────────────────

function CenterMark() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 6 }}
      aria-hidden="true"
    >
      {/* Outer decorative ring — thin dashed */}
      <svg
        width="140" height="140"
        viewBox="0 0 140 140"
        style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
      >
        <circle cx="70" cy="70" r="66"
          fill="none"
          stroke="rgba(34,211,238,0.18)"
          strokeWidth="0.8"
          strokeDasharray="6 9"
        />
        <circle cx="70" cy="70" r="50"
          fill="none"
          stroke="rgba(34,211,238,0.12)"
          strokeWidth="0.6"
        />
        {/* Tick marks at cardinal points */}
        <line x1="70"  y1="4"   x2="70"  y2="13"  stroke="rgba(34,211,238,0.4)" strokeWidth="1"   />
        <line x1="70"  y1="127" x2="70"  y2="136" stroke="rgba(34,211,238,0.4)" strokeWidth="1"   />
        <line x1="4"   y1="70"  x2="13"  y2="70"  stroke="rgba(34,211,238,0.4)" strokeWidth="1"   />
        <line x1="127" y1="70"  x2="136" y2="70"  stroke="rgba(34,211,238,0.4)" strokeWidth="1"   />
      </svg>

      {/* V + FULL STACK */}
      <div
        className="relative flex flex-col items-center justify-center select-none"
        style={{ width: 140, height: 140 }}
      >
        <span
          style={{
            fontFamily:    "var(--font-geist-sans), system-ui, sans-serif",
            fontWeight:    900,
            fontSize:      "clamp(2.4rem, 5.5vw, 3.2rem)",
            lineHeight:    1,
            color:         "rgba(34,211,238,0.94)",
            textShadow:    "0 0 40px rgba(34,211,238,0.5), 0 0 16px rgba(34,211,238,0.3)",
            letterSpacing: "-0.03em",
          }}
        >
          V
        </span>
        <div style={{ width: 38, height: 1, background: "rgba(34,211,238,0.32)", margin: "7px 0 6px" }} />
        <span
          style={{
            fontFamily:    "var(--font-geist-mono), monospace",
            fontWeight:    500,
            fontSize:      "0.45rem",
            letterSpacing: "0.38em",
            textTransform: "uppercase" as const,
            color:         "rgba(34,211,238,0.52)",
          }}
        >
          Full Stack
        </span>
      </div>
    </div>
  );
}

// ─── Skill Node ───────────────────────────────────────────────────────────────

function SkillNode({
  skill,
  active,
  dimmed,
  px,
  py,
  onEnter,
  onLeave,
}: {
  skill:   SkillItem;
  active:  boolean;
  dimmed:  boolean;
  px:      number;
  py:      number;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const [imgOk, setImgOk] = useState(true);
  const above  = skill.y > 56;
  const left   = skill.x > 64;
  const circSz = active ? 66 : 54;
  const imgSz  = active ? 32 : 26;

  const initials = skill.name
    .split(/[\s./]+/).filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div
      className="absolute flex flex-col items-center"
      role="button"
      tabIndex={0}
      aria-label={`${skill.name} — ${skill.category}`}
      style={{
        left:      `${skill.x}%`,
        top:       `${skill.y}%`,
        transform: `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`,
        zIndex:    active ? 40 : 15,
        outline:   "none",
        cursor:    "default",
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {/* ── Floating tooltip ── */}
      {active && (
        <div
          role="tooltip"
          style={{
            position:    "absolute",
            width:       190,
            maxWidth:    "min(210px, 70vw)",
            ...(above  ? { bottom: `calc(100% + 13px)` } : { top: `calc(100% + 13px)` }),
            ...(left   ? { right: "0" }                  : { left: "0" }),
            padding:      "10px 13px",
            background:   "rgba(4,9,18,0.97)",
            border:       "1px solid rgba(34,211,238,0.24)",
            borderRadius:  7,
            boxShadow:    "0 8px 36px rgba(0,0,0,0.55), 0 0 0 1px rgba(34,211,238,0.06), 0 0 20px rgba(34,211,238,0.06)",
            pointerEvents: "none",
            zIndex:        50,
          }}
        >
          <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {skill.name}
          </p>
          <p style={{
            fontFamily:    "var(--font-geist-mono), monospace",
            fontSize:      "0.58rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
            color:         "rgba(34,211,238,0.75)",
            marginTop:     "3px",
          }}>
            {skill.category}
          </p>
          <p style={{ fontSize: "0.67rem", lineHeight: 1.55, color: "var(--text-secondary)", marginTop: "7px" }}>
            {skill.desc}
          </p>
        </div>
      )}

      {/* ── Icon circle ── */}
      <div
        style={{
          position:       "relative",
          width:           circSz,
          height:          circSz,
          borderRadius:   "50%",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          background:     active
            ? "radial-gradient(circle at 38% 32%, rgba(18,38,54,0.97) 0%, rgba(5,10,18,0.99) 100%)"
            : dimmed
            ? "rgba(4,8,14,0.45)"
            : "radial-gradient(circle at 38% 32%, rgba(12,28,44,0.94) 0%, rgba(4,9,18,0.97) 100%)",
          border: active
            ? "1.5px solid rgba(34,211,238,0.6)"
            : dimmed
            ? "1px solid rgba(34,211,238,0.05)"
            : "1px solid rgba(34,211,238,0.22)",
          boxShadow: active
            ? "0 0 24px rgba(34,211,238,0.28), 0 0 8px rgba(34,211,238,0.18), inset 0 0 14px rgba(34,211,238,0.07)"
            : "none",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Outer glow halo on active */}
        {active && (
          <div style={{
            position:     "absolute",
            inset:        -10,
            borderRadius: "50%",
            background:   "radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
        )}

        {imgOk && skill.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={skill.iconUrl}
            alt=""
            aria-hidden="true"
            width={imgSz}
            height={imgSz}
            loading="lazy"
            style={{
              objectFit:  "contain",
              position:   "relative",
              transition: "all 0.3s ease",
              opacity:    active ? 1 : dimmed ? 0.18 : 0.72,
              filter:     active
                ? "brightness(1.3) drop-shadow(0 0 6px rgba(34,211,238,0.45))"
                : dimmed
                ? "grayscale(0.55) brightness(0.5)"
                : "brightness(0.92)",
            }}
            onError={() => setImgOk(false)}
          />
        ) : (
          <span style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontWeight:  700,
            fontSize:   "0.62rem",
            color:      active ? "rgba(34,211,238,0.92)" : "rgba(34,211,238,0.5)",
            opacity:    dimmed ? 0.22 : 1,
            transition: "all 0.3s ease",
          }}>
            {initials}
          </span>
        )}
      </div>

      {/* ── Name label ── */}
      <span
        style={{
          marginTop:     "9px",
          fontFamily:    "var(--font-geist-mono), monospace",
          fontSize:      "clamp(0.62rem, 1.2vw, 0.72rem)",
          fontWeight:    active ? 600 : 400,
          color:         active
            ? "rgba(34,211,238,0.95)"
            : dimmed
            ? "rgba(70,95,110,0.28)"
            : "rgba(135,165,185,0.78)",
          whiteSpace:    "nowrap",
          textAlign:     "center",
          pointerEvents: "none",
          userSelect:    "none",
          transition:    "color 0.3s ease",
          letterSpacing: "0.02em",
        }}
      >
        {skill.name}
      </span>
    </div>
  );
}

// ─── Mobile — horizontal scroll category rows ────────────────────────────────
//
// Design matches the reference screenshot:
//   • Category label (uppercase, accent color) + thin separator line
//   • Horizontal scrollable row of rounded-square icon tiles
//   • Icon only — no name label underneath (clean)
//   • Tap icon → small tooltip with name + category
//   • No orbital paths on mobile
//

interface MobileNodeProps {
  skill:   SkillItem;
  active:  boolean;
  onTap:   () => void;
}

/** Single rounded-square icon tile */
function MobileTile({ skill, active, onTap }: MobileNodeProps) {
  const [imgOk, setImgOk] = useState(true);
  const initials = skill.name
    .split(/[\s./]+/).filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {/* Tooltip — shows above on tap */}
      {active && (
        <div
          role="tooltip"
          style={{
            position:     "absolute",
            bottom:       "calc(100% + 10px)",
            left:         "50%",
            transform:    "translateX(-50%)",
            width:         160,
            maxWidth:     "75vw",
            padding:      "8px 11px",
            background:   "rgba(4,9,18,0.97)",
            border:       "1px solid rgba(34,211,238,0.22)",
            borderRadius:  7,
            boxShadow:    "0 8px 24px rgba(0,0,0,0.55)",
            zIndex:        50,
            pointerEvents: "none",
            whiteSpace:   "normal",
          }}
        >
          <p style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {skill.name}
          </p>
          <p style={{
            fontFamily:    "var(--font-geist-mono),monospace",
            fontSize:      "0.56rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase" as const,
            color:         "rgba(34,211,238,0.7)",
            marginTop:     3,
          }}>
            {skill.category}
          </p>
        </div>
      )}

      {/* Rounded-square icon tile */}
      <button
        type="button"
        aria-label={`${skill.name} — ${skill.category}`}
        aria-pressed={active}
        onClick={onTap}
        style={{
          width:          72,
          height:         72,
          borderRadius:   16,
          border:         active
            ? "1.5px solid rgba(34,211,238,0.55)"
            : "1px solid rgba(255,255,255,0.07)",
          background:     active
            ? "rgba(12,28,44,0.97)"
            : "rgba(10,18,28,0.92)",
          boxShadow:      active
            ? "0 0 20px rgba(34,211,238,0.18)"
            : "0 2px 12px rgba(0,0,0,0.35)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:         0,
          cursor:          "pointer",
          outline:         "none",
          transition:      "all 0.22s ease",
        }}
        className="focus-visible:ring-1 focus-visible:ring-cyan-500/40"
      >
        {imgOk && skill.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={skill.iconUrl} alt="" aria-hidden="true"
            width={36} height={36} loading="lazy"
            style={{
              objectFit:  "contain",
              opacity:    active ? 1 : 0.82,
              filter:     active
                ? "brightness(1.2) drop-shadow(0 0 6px rgba(34,211,238,0.35))"
                : "brightness(0.9)",
              transition: "all 0.22s ease",
            }}
            onError={() => setImgOk(false)}
          />
        ) : (
          <span style={{
            fontFamily: "var(--font-geist-mono),monospace",
            fontSize:   "0.72rem",
            fontWeight:  700,
            color:      active ? "rgba(34,211,238,0.9)" : "rgba(34,211,238,0.55)",
          }}>
            {initials}
          </span>
        )}
      </button>
    </div>
  );
}

/** One category section: label + thin line + auto-scrolling marquee row */
function MobileRow({
  label,
  skills,
  activeSkill,
  onTap,
}: {
  label:       string;
  skills:      SkillItem[];
  activeSkill: string | null;
  onTap:       (name: string) => void;
}) {
  if (skills.length === 0) return null;

  // Duration scales with number of items so speed feels consistent
  const duration = Math.max(skills.length * 4, 18);

  // Duplicate items to create seamless loop
  const doubled = [...skills, ...skills];

  return (
    <div>
      {/* Category label */}
      <p style={{
        fontFamily:    "var(--font-geist-mono),monospace",
        fontSize:      "0.62rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase" as const,
        color:         "rgba(34,211,238,0.55)",
        userSelect:    "none",
        marginBottom:  10,
      }}>
        {label}
      </p>

      {/* Thin separator */}
      <div style={{
        height:       1,
        background:   "linear-gradient(to right, rgba(34,211,238,0.2), rgba(34,211,238,0.05) 70%, transparent)",
        marginBottom: 14,
      }} />

      {/* Marquee container — clips overflow, auto-scrolls */}
      <div
        style={{
          overflow:   "hidden",
          position:   "relative",
          /* Fade edges */
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          maskImage:        "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div
          className="mob-marquee"
          style={{
            display:        "flex",
            flexDirection:  "row",
            gap:             12,
            width:           "max-content",
            animationDuration: `${duration}s`,
            paddingBottom:   6,
          }}
        >
          {doubled.map((s, i) => (
            <MobileTile
              key={`${s.name}-${i}`}
              skill={s}
              active={activeSkill === s.name}
              onTap={() => onTap(s.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile groups:
 *   SKILLS        → core dev stack (8 skills)
 *   TOOLS & CREATIVE → deployment + design + version control (5 tools incl. GitHub)
 *
 * Any skill from DB not in these lists is silently appended to the closest group
 * rather than creating a "More" row.
 */
const MOBILE_GROUPS: { label: string; names: string[] }[] = [
  {
    label: "Skills",
    names: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "Supabase", "REST API"],
  },
  {
    label: "Tools & Creative",
    names: ["Vercel", "Figma", "Docker", "Git", "GitHub"],
  },
];

function MobileView({ items }: { items: SkillItem[] }) {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  // Build lookup map — keep ALL skills including GitHub
  const byName = useMemo(() => {
    const m = new Map<string, SkillItem>();
    items.forEach(s => m.set(s.name, s));
    return m;
  }, [items]);

  const handleTap = (name: string) =>
    setActiveSkill(prev => prev === name ? null : name);

  // Dismiss tooltip on outside tap
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const dismiss = (e: TouchEvent | MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveSkill(null);
      }
    };
    document.addEventListener("touchstart", dismiss, { passive: true });
    document.addEventListener("mousedown", dismiss);
    return () => {
      document.removeEventListener("touchstart", dismiss);
      document.removeEventListener("mousedown", dismiss);
    };
  }, []);

  // Collect any DB skills not in predefined groups and append to last group
  const allKnown = new Set(MOBILE_GROUPS.flatMap(g => g.names));
  const extras = items.filter(s => !allKnown.has(s.name));

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Global styles for this component */}
      <style>{`
        .mob-scroll::-webkit-scrollbar { display: none; }
        @keyframes mob-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .mob-marquee { animation: mob-marquee linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mob-marquee { animation: none; }
        }
      `}</style>

      {MOBILE_GROUPS.map((group, gi) => {
        const baseItems = group.names
          .map(name => byName.get(name))
          .filter((s): s is SkillItem => s !== undefined);

        // Append overflow skills to the LAST group only
        const groupItems = gi === MOBILE_GROUPS.length - 1
          ? [...baseItems, ...extras]
          : baseItems;

        if (groupItems.length === 0) return null;

        return (
          <MobileRow
            key={group.label}
            label={group.label}
            skills={groupItems}
            activeSkill={activeSkill}
            onTap={handleTap}
          />
        );
      })}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface SkillConstellationProps {
  skills?: Skill[];
}

export function SkillConstellation({ skills = [] }: SkillConstellationProps) {
  const [activeName, setActiveName] = useState<string | null>(null);
  const items = useMemo(() => buildItems(skills), [skills]);

  const [motionOk, setMotionOk] = useState(false);
  useEffect(() => {
    setMotionOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const { off, onMove, onLeave } = useParallax(motionOk);
  const anyActive = activeName !== null;

  return (
    <>
      {/* ── Desktop (md+) ── */}
      <div
        className="hidden md:block relative w-full mx-auto select-none"
        style={{
          minHeight: 500,
          maxHeight: 600,
          height:    "min(60vh, 600px)",
          overflow:  "visible",
        }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        role="img"
        aria-label="Technology constellation — hover each icon to learn more"
      >
        <OrbitalSVG />
        <ConnectionLines items={items} />
        <CenterMark />

        {items.map(skill => {
          const d = LAYER_DEPTH[skill.layer as 0 | 1 | 2] ?? 0.5;
          return (
            <SkillNode
              key={skill.name}
              skill={skill}
              active={activeName === skill.name}
              dimmed={anyActive && activeName !== skill.name}
              px={off.x * d}
              py={off.y * d}
              onEnter={() => setActiveName(skill.name)}
              onLeave={() => setActiveName(null)}
            />
          );
        })}

        <p
          aria-hidden="true"
          style={{
            position: "absolute", bottom: 10, left: 4,
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "0.58rem", letterSpacing: "0.12em",
            color: "rgba(34,211,238,0.28)", pointerEvents: "none", userSelect: "none",
          }}
        >
          — hover icon untuk detail
        </p>
      </div>

      {/* ── Mobile (below md) ── */}
      <div className="md:hidden">
        <MobileView items={items} />
      </div>
    </>
  );
}
