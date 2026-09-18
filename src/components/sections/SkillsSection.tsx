"use client";

import type { Skill } from "@/types/database";
import { GlitchReveal } from "@/components/ui/GlitchReveal";

interface SkillsSectionHeading {
  label?:       string;
  titleMain?:   string;
  titleAccent?: string;
  subtitle?:    string;
}

interface SkillsSectionProps {
  skills:   Skill[];
  heading?: SkillsSectionHeading;
}

const CATEGORY_ORDER = ["Frontend", "Backend", "Tools", "Creative"] as const;

const CATEGORY_LABELS: Record<(typeof CATEGORY_ORDER)[number], string> = {
  Frontend: "Engineering",
  Backend:  "Backend",
  Tools:    "Tools",
  Creative: "Design",
};

const defaultSkills: Omit<Skill, "id">[] = [
  { name: "Next.js",       category: "Frontend", level: 90, icon: "https://cdn.simpleicons.org/nextdotjs/ffffff",         icon_size: 70, order_index: 1  },
  { name: "React",         category: "Frontend", level: 90, icon: "https://cdn.simpleicons.org/react/61DAFB",             icon_size: 70, order_index: 2  },
  { name: "TypeScript",    category: "Frontend", level: 85, icon: "https://cdn.simpleicons.org/typescript/3178C6",        icon_size: 70, order_index: 3  },
  { name: "Tailwind CSS",  category: "Frontend", level: 90, icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4",     icon_size: 70, order_index: 4  },
  { name: "Node.js",       category: "Backend",  level: 80, icon: "https://cdn.simpleicons.org/nodedotjs/339933",         icon_size: 70, order_index: 5  },
  { name: "Supabase",      category: "Backend",  level: 85, icon: "https://cdn.simpleicons.org/supabase/3ECF8E",          icon_size: 70, order_index: 6  },
  { name: "PostgreSQL",    category: "Backend",  level: 75, icon: "https://cdn.simpleicons.org/postgresql/4169E1",        icon_size: 70, order_index: 7  },
  { name: "Git",           category: "Tools",    level: 85, icon: "https://cdn.simpleicons.org/git/F05032",               icon_size: 70, order_index: 8  },
  { name: "Figma",         category: "Tools",    level: 88, icon: "https://cdn.simpleicons.org/figma/F24E1E",             icon_size: 70, order_index: 9  },
  { name: "Vercel",        category: "Tools",    level: 90, icon: "https://cdn.simpleicons.org/vercel/ffffff",            icon_size: 70, order_index: 10 },
  { name: "Photoshop",     category: "Creative", level: 80, icon: "https://cdn.simpleicons.org/adobephotoshop/31A8FF",    icon_size: 70, order_index: 11 },
  { name: "Illustrator",   category: "Creative", level: 80, icon: "https://cdn.simpleicons.org/adobeillustrator/FF9A00",  icon_size: 70, order_index: 12 },
  { name: "After Effects", category: "Creative", level: 75, icon: "https://cdn.simpleicons.org/adobeaftereffects/9999FF", icon_size: 70, order_index: 13 },
  { name: "Premiere Pro",  category: "Creative", level: 70, icon: "https://cdn.simpleicons.org/adobepremierepro/9999FF",  icon_size: 70, order_index: 14 },
];

function groupSkills(skills: Skill[]) {
  const grouped = new Map<string, Skill[]>();

  for (const skill of skills) {
    const category = skill.category ?? "Tools";
    const existing = grouped.get(category) ?? [];
    existing.push(skill);
    grouped.set(category, existing);
  }

  for (const [, items] of grouped) {
    items.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }

  const orderedCategories = [
    ...CATEGORY_ORDER.filter(cat => grouped.has(cat)),
    ...[...grouped.keys()].filter(cat => !CATEGORY_ORDER.includes(cat as (typeof CATEGORY_ORDER)[number])),
  ];

  return orderedCategories.map(category => ({
    category,
    label:
      CATEGORY_LABELS[category as (typeof CATEGORY_ORDER)[number]] ??
      category,
    skills: grouped.get(category) ?? [],
  }));
}

export function SkillsSection({ skills, heading = {} }: SkillsSectionProps) {
  const src = (skills.length > 0 ? skills : defaultSkills) as Skill[];
  const groups = groupSkills(src);

  const label       = heading.label       ?? "— Expertise —";
  const titleMain   = heading.titleMain   ?? "Skills &";
  const titleAccent = heading.titleAccent ?? "Tools";
  const subtitle    = heading.subtitle    ?? "Dari kode sampai kanvas — tools yang aku kuasai.";

  return (
    <section
      id="skills"
      className="py-20 overflow-hidden relative"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <GlitchReveal className="text-center mb-12 sm:mb-14">
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

        <div className="space-y-0">
          {groups.map(({ category, label: groupLabel, skills: groupSkillsList }, groupIndex) => (
            <GlitchReveal key={category} delay={groupIndex * 60}>
              <div
                className={[
                  "py-6 sm:py-7",
                  groupIndex > 0 ? "border-t" : "",
                ].join(" ")}
                style={{ borderColor: "var(--border)" }}
              >
                <h3
                  className="font-mono text-[10px] sm:text-[11px] tracking-[0.28em] uppercase mb-4"
                  style={{ color: "var(--blood-600, #06b6d4)" }}
                >
                  {groupLabel}
                </h3>

                <ul className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3">
                  {groupSkillsList.map((skill, index) => (
                    <li key={skill.id ?? `${skill.name}-${index}`} className="inline-flex items-center min-w-0">
                      {index > 0 && (
                        <span
                          className="mr-2 sm:mr-3 select-none"
                          style={{ color: "var(--text-muted)" }}
                          aria-hidden="true"
                        >
                          ·
                        </span>
                      )}
                      <span
                        className="inline-flex items-center gap-2 text-sm sm:text-[15px] font-medium transition-colors duration-200 hover:text-blood-400"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {skill.icon && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={skill.icon}
                            alt=""
                            aria-hidden="true"
                            className="w-4 h-4 object-contain opacity-80 shrink-0"
                            loading="lazy"
                          />
                        )}
                        {skill.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlitchReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
