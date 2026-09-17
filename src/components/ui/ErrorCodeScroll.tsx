"use client";

import { useEffect, useRef } from "react";

const FATAL_LINES = [
  "FATAL ERROR: SYSTEM COMPROMISED",
  "ACCESS DENIED — 0x000DEAD",
  "MEMORY CORRUPTED [0xFFFFFF]",
  "KERNEL PANIC — NOT SYNCING",
  "CRITICAL: STACK OVERFLOW",
  "ERROR 404: IDENTITY NOT FOUND",
  "BREACH DETECTED — FIREWALL DOWN",
  "SEGMENTATION FAULT (core dumped)",
  "UNAUTHORIZED ACCESS DETECTED",
  "NULL POINTER DEREFERENCE",
  "SYSTEM FAILURE — REBOOT FAILED",
  "ROOT ACCESS GRANTED [HACK]",
  "DATA EXFILTRATION IN PROGRESS...",
  "ENCRYPTION KEY COMPROMISED",
  "FATAL: pid 0x1337 killed",
  "INTRUSION DETECTED — IP BLOCKED",
  "BUFFER OVERFLOW EXPLOITED",
  "CRITICAL VULNERABILITY CVE-2024",
  "CONNECTION HIJACKED",
  "CERTIFICATE INVALID — MITM ATTACK",
  "PROCESS TERMINATED: SIGKILL",
  "DATABASE CORRUPTED — 0 ROWS LEFT",
  "SSH BRUTE FORCE DETECTED",
  "MALWARE SIGNATURE FOUND",
  "SYSTEM INTEGRITY VIOLATION",
  "ROOTKIT INSTALLED — HIDING...",
  "WATCHDOG: TIMER EXPIRED",
  "HEAP CORRUPTION DETECTED",
  "0xDEADBEEF — TRACE LOST",
  "PANIC: unable to handle page",
  "FIREWALL BYPASSED",
  "PAYLOAD INJECTED — ROOTSHELL",
  "EXPLOIT SUCCESSFUL: CVE-0xDEAD",
  "REMOTE CODE EXECUTION DETECTED",
  "BACKDOOR ESTABLISHED",
  "PRIVILEGE ESCALATION: root",
  "ARP POISONING ACTIVE",
  "DNS HIJACK IN PROGRESS",
  "KERNEL MODULE LOADED: HIDDEN",
  "PROCESS HOLLOW: PID 0x0",
];

function ScrollColumn({
  lines, speed, startOffset, fontSize, opacity,
}: {
  lines: string[]; speed: number; startOffset: number;
  fontSize: number; opacity: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef   = useRef(startOffset);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    posRef.current = startOffset;
    const animate = () => {
      posRef.current -= speed;
      const halfH = track.scrollHeight / 2;
      if (Math.abs(posRef.current) >= halfH) posRef.current += halfH;
      track.style.transform = `translateY(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, startOffset]);

  const doubled = [...lines, ...lines];
  return (
    <div ref={trackRef} className="flex flex-col pt-4" style={{ willChange: "transform" }}>
      {doubled.map((line, i) => {
        const isMain  = i % 4 === 0;
        const isFatal = /^(FATAL|CRITICAL|PANIC|ROOTKIT|SYSTEM F|EXPLOIT)/.test(line);
        const a = isMain ? opacity + 0.22 : opacity * 0.55;
        const color = isFatal
          ? `rgba(34,211,238,${a + 0.12})`
          : isMain ? `rgba(14,116,144,${a + 0.1})` : `rgba(100,140,160,${a * 0.85})`;
        return (
          <div key={i} className="font-mono leading-snug whitespace-nowrap"
            style={{ fontSize: `${fontSize}px`, color, marginBottom: isMain ? "7px" : "2px",
              letterSpacing: "0.04em", fontWeight: isMain ? 700 : 400 }}>
            {line}
          </div>
        );
      })}
    </div>
  );
}

export function ErrorCodeScroll({ side = "right" }: { side?: "left" | "right" }) {
  if (side === "left") return null;

  const columns = [
    { lines: FATAL_LINES,                                              speed: 0.70, startOffset: 0,    fontSize: 14, opacity: 0.50 },
    { lines: [...FATAL_LINES.slice(12), ...FATAL_LINES.slice(0, 12)], speed: 0.50, startOffset: -150, fontSize: 12, opacity: 0.32 },
    { lines: [...FATAL_LINES.slice(25), ...FATAL_LINES.slice(0, 25)], speed: 0.85, startOffset: -80,  fontSize: 15, opacity: 0.42 },
  ];

  // Each column positioned absolutely, extending to right edge
  const positions = [
    { left: "0%",   width: "70%" },
    { left: "20%",  width: "70%" },
    { left: "38%",  width: "62%" }, // rightmost reaches 100%
  ];

  return (
    // Container covers entire right 60% of hero, no overflow hidden on container
    <div
      className="absolute z-[2] pointer-events-none select-none"
      style={{
        right:  0,
        top:    0,
        bottom: 0,
        left:   "40%", // start at 40% from left = right 60%
        // Fade only on left edge and top/bottom
        maskImage:       "linear-gradient(to right, transparent 0%, black 8%, black 100%), linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 100%), linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)",
        maskComposite:       "intersect",
        WebkitMaskComposite: "destination-in",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <div className="relative w-full h-full">
        {columns.map((col, idx) => (
          <div key={idx} className="absolute top-0 bottom-0 overflow-hidden"
            style={{ left: positions[idx].left, width: positions[idx].width }}>
            <ScrollColumn {...col} />
          </div>
        ))}
      </div>
    </div>
  );
}
