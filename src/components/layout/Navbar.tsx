"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Home, User, Wrench, FolderOpen, Mail,
  Sun, Moon, Pause, Play,
} from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { NavLogo } from "@/components/layout/NavLogo";
import { cn } from "@/lib/utils";

const desktopLinks = [
  { href: "/#about",    label: "About"    },
  { href: "/#skills",   label: "Skills"   },
  { href: "/#projects", label: "Projects" },
  { href: "/projects",  label: "All Work" },
  { href: "/#contact",  label: "Contact"  },
];

// Mobile bottom nav — 5 tabs max
const mobileNavItems = [
  { href: "/",          label: "Home",     icon: Home       },
  { href: "/#about",    label: "About",    icon: User       },
  { href: "/#skills",   label: "Skills",   icon: Wrench     },
  { href: "/#projects", label: "Projects", icon: FolderOpen },
  { href: "/#contact",  label: "Contact",  icon: Mail       },
];

// ─── Music control ────────────────────────────────────────────────────────────
function MusicControl() {
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const [url,     setUrl    ] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready,   setReady  ] = useState(false);

  useEffect(() => {
    fetch("/api/music").then(r => r.json()).then(d => {
      if (d.url) setUrl(d.url);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!url) return;
    const a = new Audio(url);
    a.loop    = true;
    a.preload = "metadata";
    audioRef.current = a;
    a.addEventListener("canplay", () => setReady(true));
    a.addEventListener("ended",   () => setPlaying(false));
    return () => { a.pause(); a.src = ""; setReady(false); };
  }, [url]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a || !ready) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => {}); }
  }

  if (!url) return null;

  return (
    <button
      onClick={togglePlay}
      title={playing ? "Pause music" : "Play music"}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
        playing
          ? "border-blood-700/60 bg-blood-950/60 text-blood-400"
          : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]",
        !ready && "opacity-50 cursor-not-allowed"
      )}
      aria-label={playing ? "Pause" : "Play music"}
      disabled={!ready}
    >
      {playing ? <Pause size={13} /> : <Play size={13} />}
    </button>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Bottom nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[50] md:hidden border-t"
        style={{
          background: "var(--bg-primary)",
          borderColor: "var(--border)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
          {mobileNavItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href.split("#")[0]));
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-xl transition-all active:scale-90"
                aria-label={label}
              >
                <Icon
                  size={isActive ? 20 : 18}
                  className={cn("transition-all", isActive ? "text-blood-500" : "text-dark-500")}
                />
                <span className={cn("text-[9px] font-mono transition-colors", isActive ? "text-blood-500" : "text-dark-600")} aria-hidden="true">
                  {label}
                </span>
                {isActive && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blood-500" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// ─── Desktop Navbar ───────────────────────────────────────────────────────────
export function Navbar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      // Navbar transitions to top when user scrolls past 30% of viewport height
      // This matches when About section starts covering the hero
      setScrolled(window.scrollY > window.innerHeight * 0.3);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isBottom = isHome && !scrolled;

  return (
    <>
      {/* ── Desktop navbar ── */}
      <header
        className={cn(
          "fixed z-50 left-0 right-0 transition-all duration-500",
          "hidden md:block",
        )}
        style={isBottom ? {
          bottom: 0,
          top: "auto",
          background: "var(--bg-primary)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid var(--border)",
        } : {
          top: 0,
          bottom: "auto",
          background: "var(--bg-primary)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <NavLogo />

          <ul className="flex items-center gap-5 flex-1 justify-center">
            {desktopLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href}
                  className="text-xs font-mono hover:text-blood-400 transition-colors tracking-wide"
                  style={{ color: "var(--text-secondary)" }}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <MusicControl />
            <button
              onClick={toggle}
              className="w-8 h-8 rounded-full flex items-center justify-center border transition-all"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-muted)" }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </nav>
      </header>

      <header className="fixed top-0 left-0 right-0 z-50 md:hidden flex items-center justify-between px-4 h-12"
        style={{
          background: "var(--bg-primary)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <NavLogo />
        <div className="flex items-center gap-2">
          <MusicControl />
          <button onClick={toggle}
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-all"
            style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-muted)" }}>
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
      <MobileBottomNav />
    </>
  );
}
