"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-[60] h-[2px] bg-gradient-to-r from-blood-700 via-blood-500 to-blood-700 transition-all duration-75"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
}
