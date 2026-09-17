"use client";

import { useState } from "react";
import { GlitchReveal } from "@/components/ui/GlitchReveal";
import {
  Code2, Palette, Camera, Lightbulb, Brush, Music,
  Film, Globe, Cpu, Star, Heart, Zap, BookOpen,
  Layers, Monitor, Smartphone, Package, Pen,
  User, MapPin, Briefcase, Cpu as Chip, Terminal,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Code2, Palette, Camera, Lightbulb, Brush, Music,
  Film, Globe, Cpu, Star, Heart, Zap, BookOpen,
  Layers, Monitor, Smartphone, Package, Pen,
};

const DEFAULT_ABOUT_STATS = [
  { value: "10+", label: "Projects"    },
  { value: "15+", label: "Technologies"},
  { value: "5+",  label: "Design Tools"},
  { value: "3+",  label: "Years Active"},
];

const DEFAULT_TRAITS = [
  { icon: "Code2",     title: "Web Development",      desc: "Next.js, TypeScript, Supabase — build clean, fast apps."   },
  { icon: "Palette",   title: "Design & Illustration", desc: "UI/UX with Figma, digital illustrations, branding."         },
  { icon: "Camera",    title: "Visual Creative",       desc: "2D animation, motion graphics, photography storytelling."   },
  { icon: "Lightbulb", title: "Problem Solver",        desc: "Breaking down complex problems with elegant solutions."     },
];

const DEFAULT_PARAS = [
  "Halo! Aku Reavlenia Arezha, seorang creative multidisiplin yang bergerak di dunia digital.",
  "Bukan cuma ngoding — aku juga bikin animasi 2D, desain logo, UI/UX, fotografi, dan ilustrasi.",
  "Stack utamaku Next.js + TypeScript untuk dev, Figma + Adobe Suite untuk desain, dan After Effects untuk animasi.",
];

const DEFAULT_PERSONALITY = [
  "Perfectionist", "Night Owl", "Coffee-Driven",
  "Multitasker", "Detail Oriented", "Creative Thinker",
];

const DEFAULT_PROFILE = {
  name:     "Reavlenia Arezha",
  role:     "Creative Multidisciplinary",
  location: "Indonesia",
  status:   "OPEN_FOR_COLLAB",
  env:      "VS Code · Figma · Adobe CC",
};

export type AboutProfile = {
  name?:     string;
  role?:     string;
  location?: string;
  status?:   string;
  env?:      string;
};

interface AboutSectionProps {
  paragraphs?:      string[];
  aboutStats?:      { value: string; label: string }[];
  traits?:          { icon: string; title: string; desc: string }[];
  profile?:         AboutProfile;
  personalityTags?: string[];
}

export function AboutSection({ paragraphs, aboutStats, traits, profile, personalityTags }: AboutSectionProps) {
  const displayParas  = paragraphs  && paragraphs.length  > 0 ? paragraphs  : DEFAULT_PARAS;
  const displayStats  = aboutStats  && aboutStats.length  > 0 ? aboutStats  : DEFAULT_ABOUT_STATS;
  const displayTraits = traits      && traits.length       > 0 ? traits      : DEFAULT_TRAITS;
  const displayPersonality = personalityTags && personalityTags.length > 0 ? personalityTags : DEFAULT_PERSONALITY;
  const p = { ...DEFAULT_PROFILE, ...(profile ?? {}) };
  const userName = p.name;

  return (
    <section id="about" className="py-20 px-4 sm:px-6 relative overflow-hidden"
      style={{ background: "var(--section-alt)" }}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        <GlitchReveal className="text-center mb-14">
          <span className="font-mono text-xs tracking-[0.4em] uppercase" style={{ color: "var(--blood-600, #06b6d4)" }}>
            ── user_dossier.exe ──
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-black" style={{ color: "var(--text-primary)" }}>
            Identifier: <span className="text-gradient-blood">Who_Am_I</span>
          </h2>
          <p className="mt-2 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            &gt; cat profile.txt --verbose
          </p>
        </GlitchReveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ═══════════ LEFT: DOSSIER TERMINAL ═══════════ */}
          <GlitchReveal className="lg:col-span-3" delay={100}>
            <div className="rounded-xl overflow-hidden border shadow-2xl shadow-black/40"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b"
                style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: "#facc15" }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: "#22c55e" }} />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Terminal size={11} className="text-blood-500" />
                  user_dossier — ~/profile
                </div>
                <span className="text-[10px] font-mono w-10 text-right"
                  style={{ color: "var(--text-muted)" }}
                >zsh</span>
              </div>

              <div className="p-5 sm:p-6 font-mono text-xs space-y-4">

                <div className="space-y-2.5">
                  <DatumRow icon={User}      label="NAME"     value={userName} accent />
                  <DatumRow icon={Briefcase} label="ROLE"     value={p.role} />
                  <DatumRow icon={MapPin}    label="LOCATION" value={p.location} />
                  <DatumRow
                    icon={Chip}
                    label="STATUS"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                            style={{ background: "#22c55e" }} />
                          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#22c55e" }} />
                        </span>
                        <span style={{ color: "#4ade80" }}>{p.status}</span>
                      </span>
                    }
                  />
                  <DatumRow
                    icon={Monitor}
                    label="ENV"
                    value={<span style={{ color: "var(--text-secondary)" }}>{p.env}</span>}
                  />
                </div>

                <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <p className="mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                    <span className="text-blood-500">$</span> cat stats.log
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {displayStats.map(({ value, label }) => (
                      <div key={label}
                        className="rounded-lg p-3 text-center border transition-all hover:scale-[1.03]"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--bg-secondary)",
                        }}
                      >
                        <div className="text-xl font-black text-gradient-blood leading-none">{value}</div>
                        <div className="mt-1 text-[9px] tracking-widest uppercase"
                          style={{ color: "var(--text-muted)" }}
                        >{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <p className="mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                    <span className="text-blood-500">$</span> grep PERSONALITY config.json
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {displayPersonality.map(tag => (
                      <span key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] tracking-wide border transition-all hover:-translate-y-0.5"
                        style={{
                          borderColor: "rgba(34,211,238,0.25)",
                          background: "rgba(34,211,238,0.06)",
                          color: "#5EEAD4",
                        }}
                      >
                        <span className="w-1 h-1 rounded-full bg-current opacity-70" />
                        #{tag.toLowerCase().replace(/\s+/g, "_")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlitchReveal>

          {/* ═══════════ RIGHT: SPECIALIZATIONS ═══════════ */}
          <GlitchReveal className="lg:col-span-2 space-y-3" delay={200}>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1" style={{ background: "var(--border)" }} />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase"
                style={{ color: "var(--text-muted)" }}
              >── specializations ──</span>
              <div className="h-px flex-1" style={{ background: "var(--border)" }} />
            </div>

            {displayTraits.map(({ icon: iconName, title, desc }, i) => {
              const Icon = ICON_MAP[iconName] ?? Lightbulb;
              return (
                <div key={title}
                  className="group relative rounded-xl p-4 border transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--bg-card)",
                  }}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border group-hover:scale-110 transition-transform"
                      style={{
                        borderColor: "rgba(34,211,238,0.25)",
                        background: "rgba(34,211,238,0.08)",
                      }}
                    >
                      <Icon size={17} className="text-blood-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[10px] text-blood-600">
                          [{String(i + 1).padStart(2, "0")}]
                        </span>
                        <h3 className="font-semibold text-sm tracking-tight"
                          style={{ color: "var(--text-primary)" }}
                        >{title}</h3>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {desc}
                      </p>
                    </div>
                  </div>

                  <span className="absolute bottom-0 right-0 h-px w-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "linear-gradient(to left, #22d3ee, transparent)" }}
                  />
                </div>
              );
            })}
          </GlitchReveal>
        </div>

        <GlitchReveal className="mt-14" delay={300}>
          <div className="rounded-xl p-5 sm:p-6 border"
            style={{
              borderColor: "var(--border)",
              background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)",
            }}
          >
            <p className="mb-3 flex items-center gap-2 font-mono text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span className="text-blood-500">$</span> cat bio.md
            </p>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {displayParas.map((p, i) => {
                const highlighted =
                  i === 0 && p.includes(userName)
                    ? (() => {
                        const parts = p.split(userName);
                        return (
                          <>
                            {parts[0]}
                            <span className="font-semibold text-blood-400">{userName}</span>
                            {parts.slice(1).join(userName)}
                          </>
                        );
                      })()
                    : p;
                return <p key={i}>{highlighted}</p>;
              })}
            </div>
          </div>
        </GlitchReveal>
      </div>
    </section>
  );
}

function DatumRow({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center"
        style={{
          background: "rgba(34,211,238,0.08)",
          border: "1px solid rgba(34,211,238,0.2)",
        }}
      >
        <Icon size={13} className="text-blood-500" />
      </span>
      <span className="w-20 shrink-0 tracking-widest text-[10px]"
        style={{ color: "var(--text-muted)" }}
      >{label}:</span>
      <span className={accent ? "font-bold tracking-tight" : ""}
        style={{ color: accent ? "var(--text-primary)" : "var(--text-secondary)" }}
      >{value}</span>
    </div>
  );
}
