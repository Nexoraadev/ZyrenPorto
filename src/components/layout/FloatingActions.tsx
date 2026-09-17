"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingActions() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className={cn(
        "fixed z-[9990]",
        "w-10 h-10 rounded-full",
        "bg-blood-700 hover:bg-blood-600 text-white",
        "flex items-center justify-center",
        "shadow-lg shadow-blood-900/40",
        "transition-all duration-300",
        show
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
      style={{
        right:  "20px",
        bottom: "145px", // di atas chatbot kita (36px) + Tidio (~60px) + gap 5px tiap
      }}
    >
      <ArrowUp size={16} />
    </button>
  );
}
