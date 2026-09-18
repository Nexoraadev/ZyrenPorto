"use client";

import { GlitchReveal } from "@/components/ui/GlitchReveal";
import {
  Code2, Palette, Camera, Lightbulb, Brush, Music,
  Film, Globe, Cpu, Star, Heart, Zap, BookOpen,
  Layers, Monitor, Smartphone, Package, Pen,
  User, MapPin, Briefcase, Cpu as Chip,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Code2, Palette, Camera, Lightbulb, Brush, Music,
  Film, Globe, Cpu, Star, Heart, Zap, BookOpen,
  Layers, Monitor, Smartphone, Package, Pen,
};

const DEFAULT_ABOUT_STATS = [
  { value: "10+", label: "Projects"     },
  { value: "15+", label: "Technologies" },
  { value: "5+",  label: "Design Tools" },
  { value: "3+",  label: "Years Active" },
];

const DEFAULT_TRAITS = [
  { icon: "Code2",     title: "Web Development",       desc: "Next.js, TypeScript, Supabase — build clean, fast apps."   },
  { icon: "Palette",   title: "Design & Illustration", desc: "UI/UX with Figma, digital illustrations, branding."         },
  { icon: "Camera",    title: "Visual Creative",       desc: "2D animation, motion graphics, photography storytelling."   },
  { icon: "Lightbulb", title: "Problem Solver",        desc: "Breaking down complex problems with elegant solutions."     },
];

const DEFAULT_PARAS = [
  "Halo! Aku Reavlenia Arezha, seorang creative multidisiplin yang bergerak di dunia digital.",
  "Bukan cuma ngoding — aku juga bikin animasi 2D, desain logo, UI/UX, fotografi, dan ilustrasi.",
  "Stack utamaku Next.js + TypeScript untuk dev, Figma + Adobe Suite untuk desain, dan After Effects untuk animasi.",
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
  /** Kept for CMS compatibility — no longer rendered in the public layout. */
  personalityTags?: string[];
}

export function AboutSection({ paragraphs, aboutStats, traits, profile }: AboutSectionProps) {
  const displayParas  = paragraphs  && paragraphs.length  > 0 ? paragraphs  : DEFAULT_PARAS;
  const displayStats  = aboutStats  && aboutStats.length  > 0 ? aboutStats  : DEFAULT_ABOUT_STATS;
  const displayTraits = traits      && traits.length       > 0 ? traits      : DEFAULT_TRAITS;
  const p = { ...DEFAULT_PROFILE, ...(profile ?? {}) };
  const userName = p.name;

  return (
    <section
      id="about"
      className="py-20 px-4 sm:px-6 relative overflow-hidden"
      style={{ background: "var(--section-alt)" }}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        <GlitchReveal className="text-center mb-14">
          <span
            className="font-mono text-xs tracking-[0.35em] uppercase"
            style={{ color: "var(--blood-600, #06b6d4)" }}
          >
            — Profile —
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-black" style={{ color: "var(--text-primary)" }}>
            Who<span className="text-gradient-blood">_Am_I</span>
          </h2>
        </GlitchReveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* LEFT: Profile & stats */}
          <GlitchReveal className="lg:col-span-3" delay={100}>
            <div
              className="rounded-lg border p-6 sm:p-8"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
            >
              <p
                className="font-mono text-[10px] tracking-[0.25em] uppercase mb-6"
                style={{ color: "var(--text-muted)" }}
              >
                Profile
              </p>

              <dl className="space-y-4">
                <ProfileField icon={User}      label="Name"     value={userName} emphasis />
                <ProfileField icon={Briefcase} label="Role"     value={p.role} />
                <ProfileField icon={MapPin}    label="Location" value={p.location} />
                <ProfileField
                  icon={Chip}
                  label="Status"
                  value={
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
                      <span style={{ color: "#4ade80" }}>{p.status}</span>
                    </span>
                  }
                />
                <ProfileField icon={Monitor} label="Environment" value={p.env} />
              </dl>

              <div className="mt-8 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
                <p
                  className="font-mono text-[10px] tracking-[0.25em] uppercase mb-5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Statistics
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {displayStats.map(({ value, label }) => (
                    <div key={label} className="min-w-0">
                      <div
                        className="text-2xl sm:text-3xl font-black leading-none tracking-tight text-gradient-blood"
                      >
                        {value}
                      </div>
                      <div
                        className="mt-1.5 text-[10px] tracking-[0.2em] uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlitchReveal>

          {/* RIGHT: Specializations */}
          <GlitchReveal className="lg:col-span-2" delay={200}>
            <p
              className="font-mono text-[10px] tracking-[0.25em] uppercase mb-5"
              style={{ color: "var(--text-muted)" }}
            >
              Specializations
            </p>

            <div className="space-y-4">
              {displayTraits.map(({ icon: iconName, title, desc }) => {
                const Icon = ICON_MAP[iconName] ?? Lightbulb;
                return (
                  <article
                    key={title}
                    className="group rounded-lg border p-4 sm:p-5 transition-colors duration-200 hover:border-[rgba(34,211,238,0.25)]"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--bg-card)",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-9 h-9 shrink-0 rounded-md flex items-center justify-center"
                        style={{ background: "rgba(34,211,238,0.06)" }}
                      >
                        <Icon size={16} className="text-blood-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-sm tracking-tight mb-1"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {title}
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {desc}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </GlitchReveal>
        </div>

        <GlitchReveal className="mt-12 lg:mt-14" delay={300}>
          <div
            className="rounded-lg border p-6 sm:p-8"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-card)",
            }}
          >
            <p
              className="font-mono text-[10px] tracking-[0.25em] uppercase mb-5"
              style={{ color: "var(--text-muted)" }}
            >
              Bio
            </p>
            <div className="space-y-4 text-sm sm:text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {displayParas.map((para, i) => {
                const highlighted =
                  i === 0 && para.includes(userName)
                    ? (() => {
                        const parts = para.split(userName);
                        return (
                          <>
                            {parts[0]}
                            <span className="font-semibold text-blood-400">{userName}</span>
                            {parts.slice(1).join(userName)}
                          </>
                        );
                      })()
                    : para;
                return <p key={i}>{highlighted}</p>;
              })}
            </div>
          </div>
        </GlitchReveal>
      </div>
    </section>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  emphasis = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="grid grid-cols-[auto_5.5rem_1fr] sm:grid-cols-[auto_6.5rem_1fr] items-baseline gap-x-3 gap-y-1">
      <Icon size={14} className="text-blood-500 shrink-0 mt-0.5" />
      <dt
        className="font-mono text-[10px] tracking-[0.15em] uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </dt>
      <dd
        className={emphasis ? "font-semibold text-base tracking-tight" : "text-sm"}
        style={{ color: emphasis ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        {value}
      </dd>
    </div>
  );
}
