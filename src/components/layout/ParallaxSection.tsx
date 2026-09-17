"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  intensity?: number;
  delay?: number;
}

export function ParallaxSection({
  children,
  className,
  direction = "up",
  intensity = 0.15,
  delay = 0,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Start as visible=true to avoid SSR flash / CLS penalty
  const [visible, setVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const el = ref.current;
    if (!el) return;

    // On mobile, skip parallax entirely for performance
    const isMobile = window.innerWidth < 768;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect(); // only need to trigger once
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);

    // Only add scroll parallax on desktop
    if (!isMobile && intensity > 0) {
      let rafId = 0;
      let ticking = false;
      const onScroll = () => {
        if (!ticking) {
          rafId = requestAnimationFrame(() => {
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        observer.disconnect();
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(rafId);
      };
    }

    return () => observer.disconnect();
  }, [intensity, delay]);

  // Before mount (SSR): render children fully visible, no transform
  if (!hasMounted) {
    return (
      <div className={cn("relative", className)} style={{ position: "relative", zIndex: 10, background: "var(--bg-primary)" }}>
        {children}
      </div>
    );
  }

  // Simple slide-in reveal, no continuous parallax scroll (better performance)
  const hiddenTransform = {
    up:    "translateY(32px)",
    down:  "translateY(-32px)",
    left:  "translateX(32px)",
    right: "translateX(-32px)",
  }[direction];

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{
        transform:  visible ? "translate(0)" : hiddenTransform,
        opacity:    visible ? 1 : 0,
        transition: visible
          ? `transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity 0.6s ease ${delay}ms`
          : "none",
        isolation: "isolate",
        position:  "relative",
        zIndex:    10,
        background: "var(--bg-primary)",
      }}
    >
      {children}
    </div>
  );
}
