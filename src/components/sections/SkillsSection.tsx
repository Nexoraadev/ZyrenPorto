"use client";

import { useState } from "react";
import type { Skill } from "@/types/database";
import { GlitchReveal } from "@/components/ui/GlitchReveal";
import { Sparkles, ShieldCheck, Gem, Circle, Package } from "lucide-react";

interface SkillsSectionHeading {
  label?:    string;
  titleMain?:  string;
  titleAccent?: string;
  subtitle?: string;
}

interface SkillsSectionProps {
  skills:   Skill[];
  heading?: SkillsSectionHeading;
}

type RarityKey = "legend" | "epic" | "rare" | "common";

const RARITY_META: Record<RarityKey, {
  label: string;
  symbol: string;
  text: string;
  border: string;
  bg: string;
  glow: string;
  badgeBg: string;
  dot: string;
}> = {
  legend: {
    label:   "Legend",
    symbol:  "★",
    text:    "text-[#facc15]",
    border:  "border-[#facc15]/60",
    bg:      "bg-[#facc15]/5",
    glow:    "0 0 24px -6px rgba(250,204,21,0.55)",
    badgeBg: "bg-[#facc15]/10 border-[#facc15]/40",
    dot:     "bg-[#facc15]",
  },
  epic: {
    label:   "Epic",
    symbol:  "◆",
    text:    "text-blood-400",
    border:  "border-blood-500/60",
    bg:      "bg-blood-500/5",
    glow:    "0 0 24px -6px rgba(34,211,238,0.55)",
    badgeBg: "bg-blood-500/10 border-blood-500/40",
    dot:     "bg-blood-400",
  },
  rare: {
    label:   "Rare",
    symbol:  "✦",
    text:    "text-[#8B5CF6]",
    border:  "border-[#8B5CF6]/50",
    bg:      "bg-[#8B5CF6]/5",
    glow:    "0 0 18px -6px rgba(139,92,246,0.45)",
    badgeBg: "bg-[#8B5CF6]/10 border-[#8B5CF6]/35",
    dot:     "bg-[#8B5CF6]",
  },
  common: {
    label:   "Uncommon",
    symbol:  "○",
    text:    "text-[#64748b]",
    border:  "border-[#334155]/60",
    bg:      "bg-[#334155]/5",
    glow:    "none",
    badgeBg: "bg-[#334155]/10 border-[#334155]/40",
    dot:     "bg-[#64748b]",
  },
};

function classifyRarity(level: number | null | undefined): RarityKey {
  const l = level ?? 80;
  if (l >= 88) return "legend";
  if (l >= 80) return "epic";
  if (l >= 70) return "rare";
  return "common";
}

const CATEGORY_TABS = [
  { id: "all",       label: "All" },
  { id: "Frontend",  label: "Frontend" },
  { id: "Backend",   label: "Backend" },
  { id: "Tools",     label: "Tools" },
  { id: "Creative",  label: "Creative" },
] as const;

type TabId = typeof CATEGORY_TABS[number]["id"];

const defaultSkills: Omit<Skill, "id">[] = [
  { name: "Next.js",      category: "Frontend", level: 90, icon: "https://cdn.simpleicons.org/nextdotjs/ffffff",        icon_size: 70, order_index: 1  },
  { name: "React",        category: "Frontend", level: 90, icon: "https://cdn.simpleicons.org/react/61DAFB",            icon_size: 70, order_index: 2  },
  { name: "TypeScript",   category: "Frontend", level: 85, icon: "https://cdn.simpleicons.org/typescript/3178C6",       icon_size: 70, order_index: 3  },
  { name: "Tailwind CSS", category: "Frontend", level: 90, icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4",      icon_size: 70, order_index: 4  },
  { name: "Node.js",      category: "Backend",  level: 80, icon: "https://cdn.simpleicons.org/nodedotjs/339933",        icon_size: 70, order_index: 5  },
  { name: "Supabase",     category: "Backend",  level: 85, icon: "https://cdn.simpleicons.org/supabase/3ECF8E",         icon_size: 70, order_index: 6  },
  { name: "PostgreSQL",   category: "Backend",  level: 75, icon: "https://cdn.simpleicons.org/postgresql/4169E1",       icon_size: 70, order_index: 7  },
  { name: "Git",          category: "Tools",    level: 85, icon: "https://cdn.simpleicons.org/git/F05032",              icon_size: 70, order_index: 8  },
  { name: "Figma",        category: "Tools",    level: 88, icon: "https://cdn.simpleicons.org/figma/F24E1E",            icon_size: 70, order_index: 9  },
  { name: "Vercel",       category: "Tools",    level: 90, icon: "https://cdn.simpleicons.org/vercel/ffffff",           icon_size: 70, order_index: 10 },
  { name: "Photoshop",    category: "Creative", level: 80, icon: "https://cdn.simpleicons.org/adobephotoshop/31A8FF",   icon_size: 70, order_index: 11 },
  { name: "Illustrator",  category: "Creative", level: 80, icon: "https://cdn.simpleicons.org/adobeillustrator/FF9A00", icon_size: 70, order_index: 12 },
  { name: "After Effects",category: "Creative", level: 75, icon: "https://cdn.simpleicons.org/adobeaftereffects/9999FF",icon_size: 70, order_index: 13 },
  { name: "Premiere Pro", category: "Creative", level: 70, icon: "https://cdn.simpleicons.org/adobepremierepro/9999FF", icon_size: 70, order_index: 14 },
];

export function SkillsSection({ skills, heading = {} }: SkillsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const src = (skills.length > 0 ? skills : defaultSkills) as Skill[];

  const label       = heading.label       ?? "── command_loadout.bin ──";
  const titleMain   = heading.titleMain   ?? "Arsenal /";
  const titleAccent = heading.titleAccent ?? "Loadout";
  const subtitle    = heading.subtitle    ?? "Alat dan stack yang sudah teruji di medan tempur.";

  const filtered =
    activeTab === "all"
      ? src
      : src.filter(s => s.category === activeTab);

  return (
    <section id="skills" className="py-20 overflow-hidden relative"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        <GlitchReveal className="text-center mb-12">
          <span className="font-mono text-xs tracking-[0.4em] uppercase text-blood-600">
            {label}
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-black" style={{ color: "var(--text-primary)" }}>
            {titleMain} <span className="text-gradient-blood">{titleAccent}</span>
          </h2>
          <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
          <p className="mt-1 text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
            &gt; ls ./inventory/loadout --rarity
          </p>
        </GlitchReveal>

        <GlitchReveal delay={80}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl border"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-card)",
              }}
            >
              {CATEGORY_TABS.map(tab => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      "relative px-3 sm:px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition-all duration-200",
                      active
                        ? "text-white shadow-inner"
                        : "hover:text-dark-200",
                    ].join(" ")}
                    style={{
                      color: active ? "white" : "var(--text-secondary)",
                      background: active
                        ? "linear-gradient(135deg, var(--blood-600, #0891b2) 0%, var(--blood-800, #155e75) 100%)"
                        : "transparent",
                      boxShadow: active
                        ? "0 0 20px -5px rgba(34,211,238,0.45), inset 0 1px 0 rgba(255,255,255,0.12)"
                        : "none",
                    }}
                  >
                    {tab.label}
                    <span className="ml-2 text-[9px] opacity-70">
                      {tab.id === "all"
                        ? src.length
                        : src.filter(s => s.category === tab.id).length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(Object.entries(RARITY_META) as [RarityKey, typeof RARITY_META[RarityKey]][]).map(
                ([key, meta]) => (
                  <div key={key} className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    <span style={{ color: "var(--text-muted)" }}>{meta.label}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </GlitchReveal>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5"
          style={{
            minHeight: "280px",
          }}
        >
          {filtered.map((skill, i) => {
            const rarity = classifyRarity(skill.level);
            const m = RARITY_META[rarity];
            const size = skill.icon_size ?? 64;
            return (
              <GlitchReveal key={skill.id ?? skill.name} delay={i * 35}>
                <div
                  className={[
                    "group relative rounded-xl border p-4 sm:p-5 transition-all duration-300 h-full",
                    "backdrop-blur-[2px]",
                    m.border,
                    m.bg,
                  ].join(" ")}
                  style={{
                    boxShadow: "0 0 0 0 transparent",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = m.glow;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >

                  <div className="flex items-start justify-between mb-4">
                    <span className={[
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-mono tracking-wider",
                      m.badgeBg,
                      m.text,
                    ].join(" ")}>
                      <span>{m.symbol}</span>
                      {m.label.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-mono tracking-wider opacity-50"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="relative aspect-square w-full flex items-center justify-center mb-4">
                    <div
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl"
                      style={{
                        background: `radial-gradient(circle, ${
                          rarity === "legend" ? "rgba(250,204,21,0.35)" :
                          rarity === "epic"   ? "rgba(34,211,238,0.30)" :
                          rarity === "rare"   ? "rgba(139,92,246,0.28)" :
                                                "rgba(100,116,139,0.18)"
                        } 0%, transparent 70%)`,
                      }}
                    />
                    <div className="relative w-[70%] h-[70%] flex items-center justify-center">
                      {skill.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={skill.icon}
                          alt={skill.name}
                          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                          style={{
                            width:  typeof size === "number" ? `${size * 0.8}px` : size,
                            height: typeof size === "number" ? `${size * 0.8}px` : "auto",
                            filter: rarity === "legend"
                              ? "drop-shadow(0 0 10px rgba(250,204,21,0.35))"
                              : rarity === "epic"
                              ? "drop-shadow(0 0 10px rgba(34,211,238,0.35))"
                              : "none",
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <Package size={34} style={{ color: "var(--text-muted)" }} />
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <h3
                      className="text-sm font-bold tracking-tight transition-colors duration-200 group-hover:text-dark-100"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {skill.name}
                    </h3>
                    <p className="mt-0.5 text-[10px] font-mono tracking-widest uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {skill.category ?? "Misc"}
                    </p>
                  </div>

                  <span
                    className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full opacity-40 group-hover:opacity-100 transition-opacity animate-pulse"
                    style={{
                      background:
                        rarity === "legend" ? "#facc15" :
                        rarity === "epic"   ? "#22d3ee" :
                        rarity === "rare"   ? "#8B5CF6" :
                                              "#64748b",
                    }}
                  />
                </div>
              </GlitchReveal>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            &gt; No items found in category: {activeTab}. Try another filter.
          </div>
        )}
      </div>
    </section>
  );
}
