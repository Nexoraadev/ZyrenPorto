"use client";

import type { Skill } from "@/types/database";
import { GlitchReveal } from "@/components/ui/GlitchReveal";
import { SkillConstellation } from "@/components/ui/SkillConstellation";

interface SkillsSectionHeading {
  label?:       string;
  titleMain?:   string;
  titleAccent?: string;
  subtitle?:    string;
}

interface SkillsSectionProps {
  skills?:  Skill[];
  heading?: SkillsSectionHeading;
}

export function SkillsSection({ skills = [], heading = {} }: SkillsSectionProps) {
  const label       = heading.label       ?? "-- EXPERTISE --";
  const titleMain   = heading.titleMain   ?? "Skills &";
  const titleAccent = heading.titleAccent ?? "Tools";
  const subtitle    = heading.subtitle    ?? "Dari kode sampai kanvas — tools yang aku kuasai.";

  return (
    <section
      id="skills"
      className="py-20 relative"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Heading — unchanged */}
        <GlitchReveal className="text-center mb-14 sm:mb-16">
          <span className="font-mono text-xs tracking-[0.35em] uppercase text-blood-600">
            {label}
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-black" style={{ color: "var(--text-primary)" }}>
            {titleMain}{" "}
            <span className="text-gradient-blood">{titleAccent}</span>
          </h2>
          {subtitle && (
            <p className="mt-3 text-sm max-w-lg mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          )}
        </GlitchReveal>

        {/* Tech Constellation */}
        <GlitchReveal>
          <SkillConstellation skills={skills} />
        </GlitchReveal>

      </div>
    </section>
  );
}
