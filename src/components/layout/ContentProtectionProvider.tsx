"use client";

import { useContentProtection } from "@/hooks/useContentProtection";

export function ContentProtectionProvider({ children }: { children: React.ReactNode }) {
  useContentProtection();
  return <>{children}</>;
}
