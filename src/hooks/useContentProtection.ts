"use client";

import { useEffect, useRef } from "react";

interface ProtectionSettings {
  masterEnabled: boolean;
  disableRightClick: boolean;
  blurOnLeave: boolean;
  disableSelection: boolean;
  blockDevTools: boolean;
  disableImageInteraction: boolean;
}

// Active cleanup functions — global so applyProtection can reset them
let activeCleanups: (() => void)[] = [];

function applyProtection(settings: ProtectionSettings) {
  // Clear all existing handlers
  activeCleanups.forEach((fn) => fn());
  activeCleanups = [];

  if (!settings.masterEnabled) return;

  // 1. Disable right click
  if (settings.disableRightClick) {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    };
    document.addEventListener("contextmenu", handler, true);
    activeCleanups.push(() =>
      document.removeEventListener("contextmenu", handler, true)
    );
  }

  // 2. Blur overlay when cursor leaves window
  if (settings.blurOnLeave) {
    let overlay = document.getElementById("__zhiyy_blur__") as HTMLDivElement | null;
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "__zhiyy_blur__";
      Object.assign(overlay.style, {
        position:           "fixed",
        inset:              "0",
        zIndex:             "999998",
        backdropFilter:     "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background:         "rgba(5,5,5,0.65)",
        display:            "none",
        pointerEvents:      "none",
        transition:         "opacity 0.2s ease",
      });
      document.body.appendChild(overlay);
    }
    const el = overlay;

    const show = () => { el.style.display = "block"; };
    const hide = () => { el.style.display = "none"; };

    // Kursor keluar dari window browser
    const onMouseLeave = (e: MouseEvent) => {
      // pastikan benar-benar keluar dari document (bukan masuk elemen lain)
      if (e.relatedTarget === null) show();
    };
    const onMouseEnter = () => hide();

    // Tab switch / minimize
    const onVisibility = () => {
      if (document.hidden) show();
      else hide();
    };

    // Window blur (alt+tab, click outside browser)
    const onWindowBlur  = () => show();
    const onWindowFocus = () => hide();

    document.addEventListener("mouseleave",        onMouseLeave);
    document.addEventListener("mouseenter",        onMouseEnter);
    document.addEventListener("visibilitychange",  onVisibility);
    window.addEventListener("blur",                onWindowBlur);
    window.addEventListener("focus",               onWindowFocus);

    activeCleanups.push(() => {
      document.removeEventListener("mouseleave",       onMouseLeave);
      document.removeEventListener("mouseenter",       onMouseEnter);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur",               onWindowBlur);
      window.removeEventListener("focus",              onWindowFocus);
      el.style.display = "none";
    });
  } else {
    const el = document.getElementById("__zhiyy_blur__");
    if (el) el.style.display = "none";
  }

  // 3. Disable text selection & copy/cut
  if (settings.disableSelection) {
    let style = document.getElementById("__zhiyy_nosel__") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = "__zhiyy_nosel__";
      document.head.appendChild(style);
    }
    style.textContent =
      "* { user-select: none !important; -webkit-user-select: none !important; }";

    const onCopy = (e: ClipboardEvent) => e.preventDefault();
    const onCut = (e: ClipboardEvent) => e.preventDefault();
    document.addEventListener("copy", onCopy, true);
    document.addEventListener("cut", onCut, true);

    activeCleanups.push(() => {
      const s = document.getElementById("__zhiyy_nosel__");
      if (s) s.textContent = "";
      document.removeEventListener("copy", onCopy, true);
      document.removeEventListener("cut", onCut, true);
    });
  } else {
    const s = document.getElementById("__zhiyy_nosel__");
    if (s) s.textContent = "";
  }

  // 4. Block DevTools shortcuts
  if (settings.blockDevTools) {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toUpperCase();
      const blocked =
        e.key === "F12" ||
        (ctrl && e.shiftKey && ["I", "J", "C"].includes(key)) ||
        (ctrl && !e.shiftKey && ["U", "S", "P"].includes(key));
      if (blocked) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    document.addEventListener("keydown", onKey, true);
    activeCleanups.push(() =>
      document.removeEventListener("keydown", onKey, true)
    );
  }

  // 5. Disable image interaction (drag, right-click, Edge visual search)
  if (settings.disableImageInteraction) {
    let style = document.getElementById("__zhiyy_noimg__") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = "__zhiyy_noimg__";
      document.head.appendChild(style);
    }
    style.textContent = `
      img, video {
        -webkit-user-drag: none !important;
        user-drag: none !important;
        -webkit-touch-callout: none !important;
        pointer-events: none !important;
      }
      /* Re-enable pointer-events for links containing images */
      a img { pointer-events: none !important; }
      a { pointer-events: auto !important; }
    `;

    // Block contextmenu on images specifically
    const onImgCtx = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === "IMG") {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    // Block dragstart on images
    const onDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === "IMG") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", onImgCtx,   true);
    document.addEventListener("dragstart",   onDragStart, true);

    activeCleanups.push(() => {
      const s = document.getElementById("__zhiyy_noimg__");
      if (s) s.textContent = "";
      document.removeEventListener("contextmenu", onImgCtx,   true);
      document.removeEventListener("dragstart",   onDragStart, true);
    });
  } else {
    const s = document.getElementById("__zhiyy_noimg__");
    if (s) s.textContent = "";
  }
}

async function fetchAndApply() {
  try {
    const res = await fetch("/api/protection-settings", { cache: "no-store" });
    const settings: ProtectionSettings = await res.json();
    applyProtection(settings);
  } catch {
    // silently fail — don't break the page
  }
}

export function useContentProtection() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Apply immediately on mount
    fetchAndApply();

    // Poll every 5 seconds to pick up changes made from dashboard
    intervalRef.current = setInterval(fetchAndApply, 5000);

    // Also re-apply when tab regains focus
    const onFocus = () => fetchAndApply();
    window.addEventListener("focus", onFocus);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("focus", onFocus);
      activeCleanups.forEach((fn) => fn());
      activeCleanups = [];
    };
  }, []);
}
