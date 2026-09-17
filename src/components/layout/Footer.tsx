"use client";

import Link from "next/link";
import { Github, Linkedin, Instagram, Mail } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// removed unused socialIcons
export function Footer() {
  const [logoUrl,   setLogoUrl  ] = useState<string | null>(null);
  const [copyright, setCopyright] = useState("Reavlenia Arezha");
  const [socials,   setSocials  ] = useState({
    github:    "https://github.com/Rheaglitch",
    linkedin:  "https://linkedin.com/",
    instagram: "https://instagram.com/",
    email:     "ohmyliinnn@gmail.com",
  });

  useEffect(() => {
    fetch("/api/footer-settings")
      .then(r => r.json())
      .then(d => {
        if (d.logo_url)  setLogoUrl(d.logo_url);
        if (d.copyright) setCopyright(d.copyright);
        if (d.socials)   setSocials(d.socials);
      })
      .catch(() => {});
  }, []);

  const socialLinks = [
    { href: socials.github,              icon: Github,    label: "GitHub"    },
    { href: socials.linkedin,            icon: Linkedin,  label: "LinkedIn"  },
    { href: socials.instagram,           icon: Instagram, label: "Instagram" },
    { href: `mailto:${socials.email}`,   icon: Mail,      label: "Email"     },
  ];

  return (
    <footer className="border-t py-10 px-6" style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">

        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain rounded"
              unoptimized
            />
          ) : (
            <span className="font-mono font-bold text-lg group-hover:text-blood-500 transition-colors"
              style={{ color: "var(--text-primary)" }}>
              <span className="text-blood-600">&lt;</span>Zyrenn<span className="text-blood-600">/&gt;</span>
            </span>
          )}
        </Link>

        {/* Socials */}
        <div className="flex items-center gap-4">
          {socialLinks.map(({ href, icon: Icon, label }) => (
            <a key={label} href={href} target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer" aria-label={label}
              className="text-dark-500 hover:text-blood-400 transition-colors">
              <Icon size={17} />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} {copyright}
        </p>
      </div>
    </footer>
  );
}
