"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker() {
  const pathname  = usePathname();
  const lastPath  = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    if (pathname.startsWith("/nexoraa")) return; // skip admin
    lastPath.current = pathname;

    fetch("/api/track-view", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
