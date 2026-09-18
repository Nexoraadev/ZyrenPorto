"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Award, ExternalLink, Calendar, BadgeCheck, Link as LinkIcon,
  FileText, File, ChevronDown, ChevronUp, Terminal, Trophy,
} from "lucide-react";
import { GlitchReveal } from "@/components/ui/GlitchReveal";
import type { Certificate } from "@/types/database";

interface CertificatesSectionProps {
  certificates: Certificate[];
}

function detectPlatform(url: string | null): keyof typeof PLATFORM_META {
  if (!url) return "other";
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("credly.com")) return "credly";
  if (url.includes("coursera.org")) return "coursera";
  if (url.includes("google.com") || url.includes("grow.google") || url.includes("cloud.google")) return "google";
  if (url.includes("dicoding.com")) return "dicoding";
  return "other";
}

const PLATFORM_META = {
  linkedin:  { label: "LinkedIn",   accent: "#0A66C2" },
  credly:    { label: "Credly",     accent: "#FF6B00" },
  coursera:  { label: "Coursera",   accent: "#0056D2" },
  google:    { label: "Google",     accent: "#4285F4" },
  dicoding:  { label: "Dicoding",   accent: "#4FC3F7" },
  other:     { label: "Sertifikat", accent: "#06b6d4" },
} as const;

function formatDate(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return "—";
  }
}

function getYear(d: string | null): number {
  if (!d) return 0;
  try { return new Date(d).getFullYear(); } catch { return 0; }
}

interface GroupedCerts {
  [year: number]: Certificate[];
}

function groupByYear(list: Certificate[]): GroupedCerts {
  const g: GroupedCerts = {};
  for (const c of list) {
    const y = getYear(c.issue_date);
    if (!g[y]) g[y] = [];
    g[y].push(c);
  }
  const sortedYears = Object.keys(g).map(Number).sort((a, b) => b - a);
  const sorted: GroupedCerts = {};
  for (const y of sortedYears) sorted[y] = g[y];
  return sorted;
}

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  if (!certificates || certificates.length === 0) return null;

  const sorted = [...certificates].sort((a, b) => {
    const da = a.issue_date ? new Date(a.issue_date).getTime() : 0;
    const db = b.issue_date ? new Date(b.issue_date).getTime() : 0;
    return db - da;
  });
  const grouped = groupByYear(sorted);
  const totalCount = certificates.length;

  return (
    <section id="certificates" className="py-20 px-4 sm:px-6 relative overflow-hidden"
      style={{ background: "var(--section-alt)" }}
    >
      <div className="max-w-5xl mx-auto relative z-10">

        <GlitchReveal className="text-center mb-14">
          <span className="font-mono text-xs tracking-[0.4em] uppercase text-blood-600">
            ── achievement_log.db ──
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-black" style={{ color: "var(--text-primary)" }}>
            Quest <span className="text-gradient-blood">Journal</span>
          </h2>
          <div className="mt-2 flex items-center justify-center gap-4">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Semua pencapaian & skill certification yang berhasil di-unlock.
            </p>
          </div>
          <div className="mt-3 flex items-center justify-center gap-3 text-[10px] font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Trophy size={11} className="text-[#facc15]" />
              {totalCount} Achievements
            </span>
            <span className="opacity-40">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Terminal size={11} />
              &gt; tail -f achievements.log
            </span>
          </div>
        </GlitchReveal>

        <div className="relative">
          {Object.entries(grouped).map(([yearStr, items]) => {
            const year = Number(yearStr);
            const roman = toRoman(year - 2022) || "I";
            return (
              <div key={year} className="mb-12 last:mb-0">

                <GlitchReveal>
                  <div className="flex items-center gap-4 mb-6 pl-4 sm:pl-14">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border font-black text-sm"
                        style={{
                          borderColor: "rgba(34,211,238,0.35)",
                          background: "rgba(34,211,238,0.08)",
                          color: "#22d3ee",
                        }}
                      >
                        {String(year).slice(2)}
                      </span>
                      <div>
                        <p className="text-xl font-black leading-tight"
                          style={{ color: "var(--text-primary)" }}
                        >{year || "Undated"}</p>
                        <p className="text-[10px] font-mono tracking-[0.3em] uppercase"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Chapter {roman}
                        </p>
                      </div>
                    </div>
                    <div className="h-px flex-1" style={{
                      background: "linear-gradient(to right, var(--border) 0%, transparent 100%)",
                    }} />
                    <span className="text-[10px] font-mono tracking-widest"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {items.length} unlocked
                    </span>
                  </div>
                </GlitchReveal>

                <div className="relative">
                  <div className="absolute left-4 sm:left-14 top-0 bottom-0 w-px"
                    style={{
                      background: "linear-gradient(to bottom, rgba(34,211,238,0.45) 0%, rgba(34,211,238,0.06) 90%, transparent 100%)",
                    }}
                    aria-hidden="true"
                  />

                  {items.map((cert, idx) => (
                    <GlitchReveal key={cert.id} delay={idx * 60}>
                      <TimelineEntry cert={cert} index={idx} />
                    </GlitchReveal>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

function TimelineEntry({ cert, index }: { cert: Certificate; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const platform = detectPlatform(cert.linkedin_url);
  const meta = PLATFORM_META[platform];
  const hasFile = !!cert.file_url;
  const hasLink = !!cert.linkedin_url;
  const isImageFile = cert.file_type === "image";

  return (
    <div className="relative mb-5 last:mb-0 pl-12 sm:pl-[72px]">

      <div
        className="absolute left-4 sm:left-14 -translate-x-1/2 top-6 w-4 h-4 rounded-full border-2 z-10"
        style={{
          borderColor: meta.accent,
          background: cert.linkedin_url
            ? meta.accent
            : "var(--bg-card)",
          boxShadow: hasLink
            ? `0 0 0 3px ${meta.accent}22, 0 0 12px -2px ${meta.accent}66`
            : "none",
        }}
        aria-hidden="true"
      >
        {hasLink && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-40"
            style={{ background: meta.accent }} />
        )}
      </div>

      <div
        className="group relative rounded-xl border overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-card)",
          boxShadow: "0 1px 0 0 rgba(255,255,255,0.02) inset",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">

          <div className="sm:w-44 shrink-0 relative border-b sm:border-b-0 sm:border-r overflow-hidden"
            style={{
              borderColor: "var(--border)",
              background: hasFile && isImageFile && cert.file_url ? undefined
                : `linear-gradient(135deg, ${meta.accent}14 0%, transparent 70%)`,
            }}
          >
            {hasFile && isImageFile && cert.file_url ? (
              <div className="relative h-32 sm:h-full min-h-[112px] w-full">
                <Image
                  src={cert.file_url}
                  alt={cert.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 180px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0"
                  style={{ background: `linear-gradient(to right, transparent 60%, ${meta.accent}22 100%)` }} />
              </div>
            ) : (
              <div className="h-32 sm:h-full min-h-[112px] flex flex-col items-center justify-center p-3">
                {hasFile && cert.file_url && !isImageFile ? (
                  cert.file_type === "pdf"
                    ? <FileText size={30} className="mb-1.5 text-blood-400 opacity-60" />
                    : <File size={30} className="mb-1.5" style={{ color: "var(--text-muted)" }} />
                ) : (
                  <Award size={34} className="mb-1.5" style={{ color: meta.accent, opacity: 0.8 }} />
                )}
                <span className="text-[10px] font-mono tracking-[0.25em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  {cert.file_type ? cert.file_type.toUpperCase() : platform.toUpperCase()}
                </span>
              </div>
            )}

            <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono tracking-wider uppercase border backdrop-blur-sm"
              style={{
                color: meta.accent,
                borderColor: `${meta.accent}55`,
                background: hasFile && isImageFile ? "rgba(0,0,0,0.55)" : `${meta.accent}10`,
              }}
            >
              <span className="w-1 h-1 rounded-full" style={{ background: meta.accent }} />
              {meta.label}
            </span>
          </div>

          <div className="flex-1 flex flex-col p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div>
                <div className="flex items-center gap-2 mb-1 text-[10px] font-mono tracking-widest uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span>#{String(index + 1).padStart(3, "0")}</span>
                  <span className="opacity-40">•</span>
                  <span>{cert.category || "certification"}</span>
                </div>
                <h3 className="font-bold leading-snug tracking-tight group-hover:text-blood-400 transition-colors text-sm sm:text-[15px]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {cert.title}
                </h3>
              </div>
              {hasLink && (
                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[9px] font-mono tracking-wider uppercase"
                  style={{
                    color: "#10b981",
                    borderColor: "rgba(16,185,129,0.35)",
                    background: "rgba(16,185,129,0.08)",
                  }}
                >
                  <BadgeCheck size={11} /> Verified
                </span>
              )}
            </div>

            <p className="text-xs font-semibold mb-2" style={{ color: meta.accent }}>
              {cert.issuer}
            </p>

            {cert.description && (
              <p className={`text-xs leading-relaxed mb-3 ${expanded ? "" : "line-clamp-2"}`}
                style={{ color: "var(--text-secondary)" }}
              >
                {cert.description}
              </p>
            )}

            {expanded && hasFile && isImageFile && cert.file_url && (
              <div className="mt-2 mb-3 rounded-lg overflow-hidden border relative aspect-video"
                style={{ borderColor: "var(--border)" }}
              >
                <Image
                  src={cert.file_url}
                  alt={`${cert.title} preview`}
                  fill
                  sizes="(max-width: 640px) 100vw, 500px"
                  className="object-contain"
                  style={{ background: "var(--bg-secondary)" }}
                />
              </div>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                <Calendar size={11} className="text-blood-500" />
                {formatDate(cert.issue_date)}
              </div>
              <div className="flex items-center gap-1.5">
                {(cert.description || (hasFile && isImageFile)) && (
                  <button
                    onClick={() => setExpanded(v => !v)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-mono transition-colors hover:text-dark-200"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {expanded ? <><ChevronUp size={11} /> Less</> : <><ChevronDown size={11} /> Detail</>}
                  </button>
                )}
                {hasLink ? (
                  <a
                    href={cert.linkedin_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase border transition-colors"
                    style={{
                      color: meta.accent,
                      borderColor: `${meta.accent}55`,
                      background: `${meta.accent}10`,
                    }}
                  >
                    <LinkIcon size={11} /> Verify
                  </a>
                ) : hasFile ? (
                  <a
                    href={cert.file_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase border transition-colors"
                    style={{
                      color: "var(--text-secondary)",
                      borderColor: "var(--border-hover)",
                    }}
                  >
                    <ExternalLink size={11} /> Open
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Award size={11} /> Earned
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <span className="absolute left-0 top-6 h-px w-10 sm:w-14 rounded-full"
          style={{
            background: `linear-gradient(to right, ${meta.accent}66, ${meta.accent}11, transparent)`,
          }}
        />
      </div>
    </div>
  );
}

function toRoman(num: number): string | null {
  if (num < 1) return null;
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  let n = num;
  for (const [value, symbol] of map) {
    while (n >= value) { result += symbol; n -= value; }
  }
  return result;
}
