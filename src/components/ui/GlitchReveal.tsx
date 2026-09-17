"use client";

import { useGlitchReveal } from "@/hooks/useGlitchReveal";
import { cn } from "@/lib/utils";

interface GlitchRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function GlitchReveal({ children, className, delay = 0 }: GlitchRevealProps) {
  const { ref, state } = useGlitchReveal();

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      style={{
        transitionDelay: `${delay}ms`,
        opacity:
          state === "hidden"  ? 0 :
          state === "glitch"  ? 1 : 1,
        transform:
          state === "hidden"  ? "translateY(20px)" :
          state === "glitch"  ? "translateY(0)"    : "translateY(0)",
        transition:
          state === "hidden"  ? "none" :
          state === "glitch"  ? "transform 0.1s steps(3)" :
          "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease",
        filter:
          state === "glitch"
            ? "drop-shadow(3px 0 0 rgba(255,0,0,0.7)) drop-shadow(-3px 0 0 rgba(0,200,255,0.7))"
            : "none",
      }}
    >
      {children}
    </div>
  );
}
