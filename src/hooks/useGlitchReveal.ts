"use client";

import { useEffect, useRef, useState } from "react";

export function useGlitchReveal(threshold = 0.1) {
  const ref     = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"hidden" | "glitch" | "visible">("hidden");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if element is already in viewport on mount (above-the-fold)
    // If so, skip the animation entirely — prevents LCP/Speed Index penalty
    const rect = el.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (inViewport) {
      setState("visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && state === "hidden") {
          setState("glitch");
          setTimeout(() => setState("visible"), 300);
        }
      },
      // Trigger 80px before element enters viewport — smoother reveal
      { threshold, rootMargin: "0px 0px 80px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, state };
}
