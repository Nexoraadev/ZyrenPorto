"use client";

import { useEffect, useRef } from "react";

export type SecuritySettings = {
  disable_right_click: boolean;
  blur_on_mouse_leave: boolean;
  disable_text_select: boolean;
  disable_devtools_shortcuts: boolean;
};

export const DEFAULT_SECURITY: SecuritySettings = {
  disable_right_click: false,
  blur_on_mouse_leave: false,
  disable_text_select: false,
  disable_devtools_shortcuts: false,
};

export const STORAGE_KEY = "zhiyy_security_settings";

export function loadSecuritySettings(): SecuritySettings {
  if (typeof window === "undefined") return DEFAULT_SECURITY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SECURITY;
    return { ...DEFAULT_SECURITY, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SECURITY;
  }
}

export function saveSecuritySettings(s: SecuritySettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

type Props = { settings: SecuritySettings };

export default function SecurityGuard({ settings }: Props) {
  const cleanupRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    // clear previous listeners
    cleanupRef.current.forEach((fn) => fn());
    cleanupRef.current = [];

    // 1. Disable klik kanan
    if (settings.disable_right_click) {
      const handle = (e: MouseEvent) => {
        e.preventDefault();
        e.stopImmediatePropagation();
      };
      document.addEventListener("contextmenu", handle, true);
      cleanupRef.current.push(() =>
        document.removeEventListener("contextmenu", handle, true)
      );
    }

    // 2. Blur saat kursor keluar dari halaman
    if (settings.blur_on_mouse_leave) {
      const handleLeave = () => {
        document.body.style.filter = "blur(14px)";
        document.body.style.pointerEvents = "none";
      };
      const handleEnter = () => {
        document.body.style.filter = "";
        document.body.style.pointerEvents = "";
      };
      document.addEventListener("mouseleave", handleLeave);
      document.addEventListener("mouseenter", handleEnter);
      cleanupRef.current.push(() => {
        document.removeEventListener("mouseleave", handleLeave);
        document.removeEventListener("mouseenter", handleEnter);
        // ensure restored on cleanup
        document.body.style.filter = "";
        document.body.style.pointerEvents = "";
      });
    }

    // 3. Disable seleksi teks + copy/cut
    if (settings.disable_text_select) {
      const style = document.createElement("style");
      style.id = "zhiyy-no-select";
      style.textContent = `* { user-select: none !important; -webkit-user-select: none !important; }`;
      document.head.appendChild(style);
      cleanupRef.current.push(() =>
        document.getElementById("zhiyy-no-select")?.remove()
      );

      const handleClip = (e: ClipboardEvent) => {
        e.preventDefault();
        e.stopImmediatePropagation();
      };
      document.addEventListener("copy", handleClip, true);
      document.addEventListener("cut", handleClip, true);
      cleanupRef.current.push(() => {
        document.removeEventListener("copy", handleClip, true);
        document.removeEventListener("cut", handleClip, true);
      });
    }

    // 4. Blokir shortcut DevTools
    if (settings.disable_devtools_shortcuts) {
      const handle = (e: KeyboardEvent) => {
        const k = e.key.toUpperCase();
        // F12
        if (e.key === "F12") {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
        // Ctrl/Meta + Shift + I/J/C/K
        if (
          (e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          ["I", "J", "C", "K"].includes(k)
        ) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
        // Ctrl+U (view source)
        if ((e.ctrlKey || e.metaKey) && k === "U") {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
        // Ctrl+S (save page)
        if ((e.ctrlKey || e.metaKey) && k === "S") {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
        // Ctrl+P (print)
        if ((e.ctrlKey || e.metaKey) && k === "P") {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
        // Ctrl+A/C/X jika text select juga dimatikan
        if (
          settings.disable_text_select &&
          (e.ctrlKey || e.metaKey) &&
          ["A", "C", "X"].includes(k)
        ) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
      };
      document.addEventListener("keydown", handle, true);
      cleanupRef.current.push(() =>
        document.removeEventListener("keydown", handle, true)
      );
    }

    return () => {
      cleanupRef.current.forEach((fn) => fn());
      cleanupRef.current = [];
    };
  }, [
    settings.disable_right_click,
    settings.blur_on_mouse_leave,
    settings.disable_text_select,
    settings.disable_devtools_shortcuts,
  ]);

  return null;
}
