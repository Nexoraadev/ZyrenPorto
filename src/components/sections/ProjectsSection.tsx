"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Plus, ExternalLink, Github, Lock, Play, Calendar,
  Sparkles, ChevronRight, Terminal,
} from "lucide-react";
import { GlitchReveal } from "@/components/ui/GlitchReveal";
import { VideoModal } from "@/components/ui/VideoModal";
import type { ProjectWithRelations } from "@/types/database";
import { cn } from "@/lib/utils";

interface ProjectsSectionProps {
  projects: ProjectWithRelations[];
}

interface BentoClass {
  wrapper: string;
  cover: string;
  showDesc: boolean;
  showTechCount: number;
}

function bentoVariant(i: number, total: number): BentoClass {
  if (i === 0) {
    return {
      wrapper: "lg:col-span-2 lg:row-span-2",
      cover: "",
      showDesc: true,
      showTechCount: 6,
    };
  }
  if (i === 3 && total >= 5) {
    return {
      wrapper: "lg:row-span-2",
      cover: "",
      showDesc: true,
      showTechCount: 3,
    };
  }
  return {
    wrapper: "",
    cover: "",
    showDesc: i <= 2,
    showTechCount: i === 0 ? 6 : 3,
  };
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="py-20 px-4 sm:px-6 relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-6xl mx-auto relative z-10">

        <GlitchReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
          <div>
            <span className="font-mono text-xs tracking-[0.4em] uppercase text-blood-600">
              ── featured_builds.md ──
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-black"
              style={{ color: "var(--text-primary)" }}
            >
              Showcase / <span className="text-gradient-blood">Projects</span>
            </h2>
            <p className="mt-2 text-sm max-w-lg" style={{ color: "var(--text-muted)" }}>
              Beberapa karya terbaru — dari web app, desain UI, sampai motion project.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono border transition-all hover:-translate-y-0.5"
              style={{
                color: "var(--text-secondary)",
                borderColor: "var(--border)",
                background: "var(--bg-card)",
              }}
            >
              <span className="inline-flex items-center gap-1">
                <Terminal size={11} className="text-blood-500" />
                ls ./all_projects
              </span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform text-blood-500" />
            </Link>
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
              total: {projects.length || "∞"} builds
            </span>
          </div>
        </GlitchReveal>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 auto-rows-[minmax(200px,auto)] lg:auto-rows-[220px] lg:[&>*:first-child]:row-span-2"
            style={{ gridAutoFlow: "dense" }}
          >
            {projects.map((project, i) => {
              const variant = bentoVariant(i, projects.length);
              const isFeatured = i === 0;
              return (
                <GlitchReveal key={project.id} delay={i * 70} className={variant.wrapper}>
                  <BentoCard
                    project={project}
                    index={i}
                    variant={variant}
                    featured={isFeatured || !!project.featured}
                  />
                </GlitchReveal>
              );
            })}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}

function BentoCard({
  project,
  index,
  variant,
  featured,
}: {
  project: ProjectWithRelations;
  index: number;
  variant: BentoClass;
  featured: boolean;
}) {
  const [videoOpen, setVideoOpen] = useState(false);
  const firstImage = project.project_images?.[0];
  const tech = project.tech_stack ?? [];
  const category = project.project_categories?.name ?? "Misc";
  const hasLinks = !project.nda_mode && (project.live_url || project.github_url);

  return (
    <article
      className={cn(
        "group relative h-full min-h-[200px] rounded-2xl overflow-hidden border transition-all duration-300",
        "hover:-translate-y-1",
      )}
      style={{
        borderColor: "var(--border)",
        background: "var(--bg-card)",
      }}
    >
      <div className="relative w-full h-full">

        {firstImage?.url ? (
          <div className="absolute inset-0" style={{ filter: project.nda_mode ? "blur(6px) saturate(0.6)" : undefined }}>
            <Image
              src={firstImage.url}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index === 0}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%)`,
            }}
          >
            <div className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, rgba(34,211,238,0.18), transparent 55%), radial-gradient(circle at 80% 70%, rgba(139,92,246,0.15), transparent 55%)",
              }}
            />
          </div>
        )}

        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to top, rgba(5,11,16,0.98) 0%, rgba(5,11,16,0.75) 40%, rgba(5,11,16,0.25) 70%, rgba(5,11,16,0) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{
            background:
              "linear-gradient(135deg, rgba(34,211,238,0.14) 0%, rgba(139,92,246,0.08) 100%)",
          }}
        />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {featured && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase border backdrop-blur-sm"
                style={{
                  color: "#facc15",
                  background: "rgba(250,204,21,0.1)",
                  borderColor: "rgba(250,204,21,0.35)",
                }}
              >
                <Sparkles size={10} /> Featured
              </span>
            )}
            {project.nda_mode ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase border backdrop-blur-sm"
                style={{
                  color: "#facc15",
                  background: "rgba(234,179,8,0.08)",
                  borderColor: "rgba(234,179,8,0.35)",
                }}
              >
                <Lock size={10} /> NDA
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase border backdrop-blur-sm"
                style={{
                  color: "var(--text-secondary)",
                  background: "rgba(0,0,0,0.4)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                {category}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono tracking-wider backdrop-blur-sm"
            style={{
              color: "var(--text-muted)",
              background: "rgba(0,0,0,0.35)",
            }}
          >
            <span className="w-1 h-1 rounded-full bg-blood-400 animate-pulse" />
            #{String(index + 1).padStart(3, "0")}
          </span>
        </div>

        {!project.nda_mode && project.video_url && (
          <button
            onClick={() => setVideoOpen(true)}
            className="absolute inset-0 z-10 flex items-center justify-center"
            aria-label={`Play video: ${project.title}`}
          >
            <span className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: "rgba(0,0,0,0.55)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 0 30px -10px rgba(34,211,238,0.5)",
              }}
            >
              <Play size={18} className="text-white ml-0.5" />
            </span>
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6 z-10 flex flex-col gap-3">

          <div>
            <div className="flex items-center gap-2 mb-1 text-[10px] font-mono tracking-widest uppercase"
              style={{ color: "rgba(148,163,184,0.8)" }}
            >
              {project.year && (
                <>
                  <Calendar size={10} className="text-blood-500" />
                  <span>{project.year}</span>
                  <span className="opacity-40">•</span>
                </>
              )}
              <span>{project.client ?? "Personal Build"}</span>
            </div>
            <h3 className={cn(
              "font-black tracking-tight group-hover:text-blood-400 transition-colors",
              featured ? "text-xl sm:text-2xl leading-tight" : "text-base sm:text-lg leading-snug",
            )}
              style={{ color: "#e2e8f0" }}
            >
              {project.title}
            </h3>
          </div>

          {variant.showDesc && project.description && (
            <p className={cn(
              "leading-relaxed",
              featured ? "text-sm sm:text-[15px]" : "text-xs",
            )}
              style={{ color: "rgba(148,163,184,0.9)" }}
            >
              {featured
                ? project.description
                : project.description.length > 90
                  ? `${project.description.slice(0, 90)}…`
                  : project.description}
            </p>
          )}

          {tech.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tech.slice(0, variant.showTechCount).map(t => (
                <span key={t}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wide border backdrop-blur-sm"
                  style={{
                    color: "#5EEAD4",
                    background: "rgba(34,211,238,0.07)",
                    borderColor: "rgba(34,211,238,0.2)",
                  }}
                >
                  {t}
                </span>
              ))}
              {tech.length > variant.showTechCount && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono border backdrop-blur-sm"
                  style={{
                    color: "var(--text-muted)",
                    borderColor: "rgba(148,163,184,0.18)",
                  }}
                >
                  +{tech.length - variant.showTechCount}
                </span>
              )}
            </div>
          )}

          <div className={cn(
            "flex items-center justify-between",
            featured ? "pt-2 mt-1" : "pt-1",
          )}
          >
            {project.nda_mode ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono"
                style={{ color: "#facc15" }}
              >
                <Lock size={10} /> Bersifat rahasia
              </span>
            ) : hasLinks ? (
              <div className="flex items-center gap-2">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono border transition-all hover:-translate-y-0.5"
                    style={{
                      color: "#5EEAD4",
                      borderColor: "rgba(34,211,238,0.3)",
                      background: "rgba(34,211,238,0.08)",
                    }}
                  >
                    <ExternalLink size={11} /> Live
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono border transition-all hover:-translate-y-0.5"
                    style={{
                      color: "var(--text-secondary)",
                      borderColor: "var(--border-hover)",
                    }}
                  >
                    <Github size={11} /> Source
                  </a>
                )}
              </div>
            ) : (
              <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                // private repo
              </span>
            )}

            <Link
              href={`/projects#p-${project.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-mono transition-all group/cta"
              style={{ color: "var(--text-secondary)" }}
            >
              <span className="group-hover/cta:text-blood-400 transition-colors">Details</span>
              <ArrowRight size={11} className="opacity-60 -translate-x-1 group-hover/cta:opacity-100 group-hover/cta:translate-x-0 transition-all text-blood-500" />
            </Link>
          </div>
        </div>

        <span
          className="absolute top-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700 ease-out"
          style={{ background: "linear-gradient(to right, #22d3ee, transparent)" }}
        />
        <span
          className="absolute bottom-0 right-0 w-px h-0 group-hover:h-full transition-all duration-700 ease-out delay-75"
          style={{ background: "linear-gradient(to bottom, #22d3ee, transparent)" }}
        />
      </div>

      {!project.nda_mode && project.video_url && (
        <VideoModal
          videoUrl={project.video_url}
          isOpen={videoOpen}
          onClose={() => setVideoOpen(false)}
        />
      )}
    </article>
  );
}

function EmptyState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[220px] gap-4 sm:gap-5">
      <div className="md:col-span-2 md:row-span-2 rounded-2xl border-dashed border-2 flex flex-col items-center justify-center gap-3 opacity-40"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <div className="w-14 h-14 rounded-full border flex items-center justify-center"
          style={{ borderColor: "var(--border-hover)" }}
        >
          <Plus size={22} style={{ color: "var(--text-muted)" }} />
        </div>
        <span className="text-xs font-mono tracking-wider" style={{ color: "var(--text-muted)" }}>
          FEATURED_BUILD_#00 — slot kosong
        </span>
      </div>
      {[2, 3, 4, 5, 6].map(i => (
        <div key={i}
          className="rounded-2xl border-dashed border-2 flex flex-col items-center justify-center gap-2 opacity-40"
          style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        >
          <div className="w-10 h-10 rounded-full border flex items-center justify-center"
            style={{ borderColor: "var(--border-hover)" }}
          >
            <Plus size={15} style={{ color: "var(--text-muted)" }} />
          </div>
          <span className="text-[10px] font-mono tracking-wider" style={{ color: "var(--text-muted)" }}>
            project_#{String(i).padStart(3, "0")}
          </span>
        </div>
      ))}
      <div className="md:col-span-3 text-center pt-2">
        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {`// tambah project via dashboard admin → /nexoraa/dashboard/projects`}
        </p>
      </div>
    </div>
  );
}
