"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export function NavLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/footer-settings")
      .then(r => r.json())
      .then(d => { if (d.logo_url) setLogoUrl(d.logo_url); })
      .catch(() => {});
  }, []);

  return (
    <Link href="/" aria-label="Beranda" className="flex items-center gap-2 shrink-0 group">
      {logoUrl ? (
        <Image src={logoUrl} alt="Logo" width={32} height={32}
          className="w-8 h-8 object-contain" unoptimized />
      ) : (
        <span className="font-mono font-bold text-lg group-hover:text-blood-500 transition-colors"
          style={{ color: "var(--text-primary)" }}>
          <span className="text-blood-600">&lt;</span>Zyrenn<span className="text-blood-600">/&gt;</span>
        </span>
      )}
    </Link>
  );
}
