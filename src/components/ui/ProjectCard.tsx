"use client";

import { useState } from "react";
import { ExternalLink, Github, Play, Lock } from "lucide-react";
import type { ProjectWithRelations } from "@/types/database";
import { cn } from "@/lib/utils";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { VideoModal } from "@/components/ui/VideoModal";
import { GlitchReveal } from "@/components/ui/GlitchReveal";

interface ProjectCardProps {
  project: ProjectWithRelations;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <GlitchReveal>
    <article
      className={cn(
        "group card-dark rounded-xl overflow-hidden hover:border-blood-900 transition-all duration-300 flex flex-col h-full",
        className
      )}
    >
      {/* Thumbnail / Carousel */}
      <div className="relative w-full h-52 bg-dark-900 overflow-hidden flex-shrink-0">
        <div className={cn("absolute inset-0", project.nda_mode && "blur-sm scale-105 pointer-events-none")}>
          <ImageCarousel
            images={project.project_images}
            alt={project.title}
            fallbackText={project.title}
            className="absolute inset-0"
          />
        </div>

        {/* NDA Overlay */}
        {project.nda_mode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-950/70 z-10 gap-2">
            <Lock size={22} className="text-yellow-500" />
            <span className="text-xs font-mono text-yellow-400/80">NDA / Confidential</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-blood-950/0 group-hover:bg-blood-950/40 transition-colors duration-300 pointer-events-none" />

        {/* Video play button overlay (hidden if NDA) */}
        {project.video_url !== null && !project.nda_mode && (
          <button
            onClick={() => setIsVideoOpen(true)}
            className="absolute inset-0 flex items-center justify-center z-10"
            aria-label={`Tonton video ${project.title}`}
          >
            <span className="w-11 h-11 rounded-full bg-black/60 hover:bg-blood-700/80 border border-white/20 flex items-center justify-center transition-colors">
              <Play size={20} className="text-white ml-0.5" />
            </span>
          </button>
        )}

        {/* Featured badge */}
        {project.featured && !project.nda_mode && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono bg-blood-800/80 text-blood-200 border border-blood-700/50 z-10 pointer-events-none">
            Featured
          </span>
        )}
      </div>

      {/* Content — gambar di atas, info di bawah seperti referensi */}
      <div className="p-4 flex flex-col flex-1">

        {/* Row: title + brand logo */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-sm leading-tight text-dark-100 group-hover:text-blood-400 transition-colors">
            {project.title}
          </h3>
          {/* Brand/category badge top-right */}
          <span className="shrink-0 text-[10px] font-mono text-dark-600 leading-none mt-0.5">
            {project.project_categories?.name ?? ""}
          </span>
        </div>

        <p className="text-xs text-dark-500 leading-relaxed flex-1 mb-3">
          {project.description}
        </p>

        {/* Badges row: Featured + Category + Links */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.featured && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-blood-900/60 text-blood-300 border border-blood-800/60">
                Featured
              </span>
            )}
            {project.nda_mode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-yellow-900/50 text-yellow-400 border border-yellow-800/50">
                <Lock size={8} /> NDA
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-dark-900/60 text-dark-500 border border-dark-800">
              {project.project_categories?.name ?? "—"}
            </span>
          </div>

          {/* Live / Source link */}
          <div className="flex items-center gap-2">
            {project.nda_mode ? (
              <span className="flex items-center gap-1 text-[10px] text-yellow-600/60 font-mono">
                <Lock size={9} /> Confidential
              </span>
            ) : (
              <>
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-dark-400 hover:text-blood-400 transition-colors font-mono"
                  >
                    <ExternalLink size={11} />
                    Live demo
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-dark-400 hover:text-blood-400 transition-colors font-mono"
                  >
                    <Github size={11} />
                    Source
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {project.video_url && (
        <VideoModal
          videoUrl={project.video_url}
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
        />
      )}
    </article>
    </GlitchReveal>
  );
}
