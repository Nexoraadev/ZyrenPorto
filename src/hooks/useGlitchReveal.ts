"use client";

import { useEffect, useRef, useState } from "react";

export function useGlitchReveal(threshold = 0.15) {
  const ref     = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"hidden" | "glitch" | "visible">("hidden");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && state === "hidden") {
          setState("glitch");
          setTimeout(() => setState("visible"), 350);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [state, threshold]);

  return { ref, state };
}
