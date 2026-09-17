"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Skill } from "@/types/database";

interface SkillCarouselProps {
  skills: Skill[];
  direction?: "left" | "right";
  label?: string;
}

function SkillItem({ skill }: { skill: Skill }) {
  const [hovered, setHovered] = useState(false);
  const initials = skill.name
    .split(/[\s./]/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  const iconSize = skill.icon_size ?? 70;
  const pad = Math.round((100 - iconSize) / 2 * 0.16); // px padding inside container

  return (
    <div
      className="relative flex flex-col items-center justify-center gap-2 shrink-0 cursor-default group"
      style={{ width: 72, margin: "0 12px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon or initials */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 overflow-hidden",
          hovered
            ? "border-blood-700 bg-blood-950/60 scale-110 shadow-lg shadow-blood-900/40"
            : "border-[var(--border)] bg-[var(--bg-card)]"
        )}
        style={{ padding: `${pad}px` }}
      >
        {skill.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={skill.icon}
            alt={skill.name}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = "none";
              const fallback = t.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        {/* Fallback initials — shown when no icon or img error */}
        <span
          className="text-blood-500 font-black text-[10px] font-mono"
          style={{ display: skill.icon ? "none" : "flex" }}
        >
          {initials}
        </span>
      </div>

      {/* Tooltip name on hover */}
      <span
        className={cn(
          "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono text-dark-300 bg-[var(--bg-card)] border border-[var(--border)] px-2 py-0.5 rounded-md transition-all duration-200 pointer-events-none z-10",
          hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        )}
      >
        {skill.name}
      </span>
    </div>
  );
}

export function SkillCarousel({ skills, direction = "left", label }: SkillCarouselProps) {
  const trackRef   = useRef<HTMLDivElement>(null);
  const pauseRef   = useRef(false);
  const posRef     = useRef(0);
  const rafRef     = useRef<number>(0);

  // Speed in px/frame (≈60fps)
  const speed = direction === "left" ? -0.45 : 0.45;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || skills.length === 0) return;

    const raf = requestAnimationFrame(() => {
      const totalW = track.scrollWidth / 2;
      if (totalW <= 0) return;

      let lastTime = 0;
      const FPS_INTERVAL = 1000 / 30; // throttle to 30fps

      const animate = (now: number) => {
        rafRef.current = requestAnimationFrame(animate);
        // Skip frame if not enough time has passed
        if (now - lastTime < FPS_INTERVAL) return;
        // Skip if tab is hidden
        if (document.hidden) return;
        lastTime = now;

        if (!pauseRef.current) {
          posRef.current += speed;
          if (posRef.current <= -totalW) posRef.current += totalW;
          if (posRef.current >= 0)       posRef.current -= totalW;
          if (track) track.style.transform = `translateX(${posRef.current}px)`;
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(rafRef.current);
    };
  }, [skills, speed]);

  // Don't animate if too few items
  const shouldAnimate = skills.length >= 4;
  const displaySkills = shouldAnimate ? [...skills, ...skills] : skills;

  return (
    <div>
      {label && (
        <div className="flex items-center gap-4 mb-5 px-4">
          <span className="font-mono text-xs text-blood-700 uppercase tracking-widest shrink-0">
            {label}
          </span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
      )}

      <div
        className="relative overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}
        onMouseEnter={() => { pauseRef.current = true;  }}
        onMouseLeave={() => { pauseRef.current = false; }}
        onTouchStart={() => { pauseRef.current = true;  }}
        onTouchEnd={()   => { setTimeout(() => { pauseRef.current = false; }, 1500); }}
      >
        {/* Carousel track */}
        <div
          ref={trackRef}
          className="flex items-center py-6"
          style={{
            width:     "max-content",
            transform: "translateX(0)",
            willChange: "transform",
          }}
        >
          {displaySkills.map((skill, i) => (
            <SkillItem key={`${skill.id ?? skill.name}-${i}`} skill={skill} />
          ))}
        </div>
      </div>
    </div>
  );
}
