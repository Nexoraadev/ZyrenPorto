"use client";

import { useEffect, useState } from "react";

export function GlitchIntro() {
  const [phase, setPhase] = useState<"glitch" | "fade" | "done">("glitch");

  useEffect(() => {
    // Only show on first visit per session
    if (sessionStorage.getItem("zhiyy_intro_done")) {
      setPhase("done");
      return;
    }
    const t1 = setTimeout(() => setPhase("fade"),   2000); // hold for 2s
    const t2 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem("zhiyy_intro_done", "1");
    }, 2600); // 2s hold + 0.6s fade
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: "#000",
        opacity:    phase === "fade" ? 0 : 1,
        transition: phase === "fade" ? "opacity 0.5s ease" : "none",
      }}
      aria-hidden="true"
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
          animation: "scanline 0.1s linear infinite",
        }}
      />

      {/* Main glitch text */}
      <div className="relative select-none" style={{ animation: "glitchShake 0.15s infinite" }}>
        <span
          className="font-black text-6xl md:text-8xl tracking-tighter text-white block"
          style={{ animation: "glitchMain 0.2s steps(1) infinite" }}
        >
          ZYYRENN
        </span>
        {/* Red channel shift */}
        <span
          className="font-black text-6xl md:text-8xl tracking-tighter absolute inset-0 block"
          style={{
            color: "rgba(255,0,0,0.7)",
            clipPath: "inset(30% 0 40% 0)",
            animation: "glitchRed 0.18s steps(2) infinite",
          }}
        >
          ZYYRENN
        </span>
        {/* Blue channel shift */}
        <span
          className="font-black text-6xl md:text-8xl tracking-tighter absolute inset-0 block"
          style={{
            color: "rgba(0,200,255,0.7)",
            clipPath: "inset(55% 0 10% 0)",
            animation: "glitchBlue 0.22s steps(2) infinite",
          }}
        >
          ZIYYZOYA
        </span>
      </div>

      {/* Random noise blocks */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-blood-700"
          style={{
            left:    `${Math.random() * 100}%`,
            top:     `${Math.random() * 100}%`,
            width:   `${20 + Math.random() * 200}px`,
            height:  `${2 + Math.random() * 8}px`,
            opacity: 0.6,
            animation: `noiseBlock${i % 3} 0.${3 + i}s steps(1) infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes glitchMain {
          0%,100% { transform: translate(0); opacity:1; }
          20%  { transform: translate(-3px,1px); clip-path: inset(20% 0 60% 0); }
          40%  { transform: translate(3px,-1px); clip-path: inset(60% 0 10% 0); }
          60%  { transform: translate(-1px,2px); opacity:0.8; }
          80%  { transform: translate(2px,-2px); }
        }
        @keyframes glitchRed {
          0%,100% { transform: translate(4px,0); }
          33%     { transform: translate(-4px,2px); clip-path: inset(40% 0 30% 0); }
          66%     { transform: translate(2px,-1px); clip-path: inset(10% 0 70% 0); }
        }
        @keyframes glitchBlue {
          0%,100% { transform: translate(-4px,0); }
          33%     { transform: translate(4px,-2px); clip-path: inset(60% 0 10% 0); }
          66%     { transform: translate(-2px,1px); clip-path: inset(20% 0 55% 0); }
        }
        @keyframes glitchShake {
          0%,100% { transform: translate(0); }
          25%     { transform: translate(-2px,1px); }
          50%     { transform: translate(2px,-1px); }
          75%     { transform: translate(-1px,2px); }
        }
        @keyframes scanline {
          0%   { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes noiseBlock0 { 0%,100%{opacity:0} 50%{opacity:0.6;transform:translateX(-10px)} }
        @keyframes noiseBlock1 { 0%,100%{opacity:0} 30%{opacity:0.5;transform:translateX(15px)} }
        @keyframes noiseBlock2 { 0%,100%{opacity:0} 70%{opacity:0.4;transform:translateX(-5px)} }
      `}</style>
    </div>
  );
}
