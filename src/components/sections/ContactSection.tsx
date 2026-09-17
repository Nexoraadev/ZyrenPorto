"use client";

import { useState } from "react";
import {
  Mail, Github, Linkedin, Instagram, Twitter, Youtube, Globe,
  Phone, MessageSquare, MapPin, Check, Loader2, ExternalLink,
  Facebook, Twitch, Music2, Dribbble, Figma, Link,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Country codes list ────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "62",  flag: "🇮🇩", name: "Indonesia"    },
  { code: "1",   flag: "🇺🇸", name: "USA/Canada"   },
  { code: "44",  flag: "🇬🇧", name: "UK"           },
  { code: "61",  flag: "🇦🇺", name: "Australia"    },
  { code: "65",  flag: "🇸🇬", name: "Singapore"    },
  { code: "60",  flag: "🇲🇾", name: "Malaysia"     },
  { code: "66",  flag: "🇹🇭", name: "Thailand"     },
  { code: "63",  flag: "🇵🇭", name: "Philippines"  },
  { code: "84",  flag: "🇻🇳", name: "Vietnam"      },
  { code: "82",  flag: "🇰🇷", name: "South Korea"  },
  { code: "81",  flag: "🇯🇵", name: "Japan"        },
  { code: "86",  flag: "🇨🇳", name: "China"        },
  { code: "91",  flag: "🇮🇳", name: "India"        },
  { code: "49",  flag: "🇩🇪", name: "Germany"      },
  { code: "33",  flag: "🇫🇷", name: "France"       },
  { code: "55",  flag: "🇧🇷", name: "Brazil"       },
  { code: "971", flag: "🇦🇪", name: "UAE"          },
  { code: "966", flag: "🇸🇦", name: "Saudi Arabia" },
];

// ── Icon map — maps icon key to Lucide component ──────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  mail:      Mail,
  github:    Github,
  linkedin:  Linkedin,
  instagram: Instagram,
  twitter:   Twitter,
  youtube:   Youtube,
  facebook:  Facebook,
  twitch:    Twitch,
  tiktok:    Music2,
  dribbble:  Dribbble,
  figma:     Figma,
  phone:     Phone,
  globe:     Globe,
  link:      Link,
};

export interface SocialLink {
  id:       string;
  label:    string;
  icon:     string;
  href:     string;
  value:    string;
  visible?: boolean;  // undefined = visible by default
}

export interface ContactSectionData {
  socialLinks?:  SocialLink[];
  location?:     string;
  mapsUrl?:      string;
  showLocation?: boolean;
  showMaps?:     boolean;
  // heading
  headingLabel?:   string;  // "— Get In Touch —"
  headingMain?:    string;  // "Let's"
  headingAccent?:  string;  // "Connect"
  headingSubtitle?: string; // deskripsi bawah judul
}

interface ContactSectionProps {
  contactData?: ContactSectionData;
  /** legacy fallback */
  contactInfo?: Record<string, string>;
}

// ── Default social links (fallback) ──────────────────────────────────────────
const DEFAULT_LINKS: SocialLink[] = [
  { id: "1", label: "Email",     icon: "mail",      href: "mailto:ohmyliinnn@gmail.com", value: "ohmyliinnn@gmail.com"       },
  { id: "2", label: "GitHub",    icon: "github",    href: "https://github.com/Rheaglitch",  value: "github.com/Rheaglitch"     },
  { id: "3", label: "LinkedIn",  icon: "linkedin",  href: "https://linkedin.com/",           value: "linkedin.com/"             },
  { id: "4", label: "Instagram", icon: "instagram", href: "https://instagram.com/",          value: "instagram.com/"            },
];

export function ContactSection({ contactData, contactInfo = {} }: ContactSectionProps) {
  // Support legacy contactInfo shape
  const legacyLinks: SocialLink[] = [
    { id: "1", label: "Email",     icon: "mail",      href: `mailto:${contactInfo.email || "ohmyliinnn@gmail.com"}`, value: contactInfo.email || "ohmyliinnn@gmail.com" },
    { id: "2", label: "GitHub",    icon: "github",    href: contactInfo.github    || "https://github.com/Rheaglitch", value: (contactInfo.github    || "").replace("https://","") },
    { id: "3", label: "LinkedIn",  icon: "linkedin",  href: contactInfo.linkedin  || "https://linkedin.com/",         value: (contactInfo.linkedin  || "").replace("https://","") },
    { id: "4", label: "Instagram", icon: "instagram", href: contactInfo.instagram || "https://instagram.com/",        value: (contactInfo.instagram || "").replace("https://","") },
  ];

  const links       = (contactData?.socialLinks ?? (Object.keys(contactInfo).length ? legacyLinks : DEFAULT_LINKS))
    .filter(l => l.visible !== false);
  const location    = contactData?.location    ?? contactInfo.location ?? "Indonesia";
  const mapsUrl     = contactData?.mapsUrl     ?? "";
  const showLocation = contactData?.showLocation !== false;
  const showMaps     = contactData?.showMaps    === true && !!mapsUrl;
  const compact      = links.length > 4;

  // heading
  const headingLabel    = contactData?.headingLabel    ?? "— Get In Touch —";
  const headingMain     = contactData?.headingMain     ?? "Let\u2019s";
  const headingAccent   = contactData?.headingAccent   ?? "Connect";
  const headingSubtitle = contactData?.headingSubtitle ?? "Ada project menarik, mau kolaborasi, atau sekadar ngobrol? Aku selalu terbuka — reach out kapan saja.";

  return (
    <section id="contact" className="py-16 px-4 sm:px-6" style={{ background: "var(--section-alt)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-blood-600 font-mono text-sm tracking-widest uppercase">{headingLabel}</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
            {headingMain} <span className="text-gradient-blood">{headingAccent}</span>
          </h2>
          <p className="mt-3 text-sm max-w-md mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {headingSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── Left: social links + location ── */}
          <div className="space-y-3">

            {/* ≤4 links: full card; >4 links: icon-only grid */}
            {compact ? (
              <div className="flex flex-wrap gap-3">
                {links.map((lnk) => {
                  const Icon = ICON_MAP[lnk.icon] ?? Link;
                  return (
                    <a key={lnk.id} href={lnk.href}
                      target={lnk.href.startsWith("mailto") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      title={lnk.label}
                      className="group relative w-11 h-11 rounded-xl bg-blood-950 border border-blood-900/60 flex items-center justify-center hover:bg-blood-900/60 hover:border-blood-700 transition-all duration-200">
                      <Icon size={17} className="text-blood-400" />
                      {/* Tooltip on hover */}
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-dark-950 border border-dark-800 text-[10px] text-dark-300 font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {lnk.label}
                      </span>
                    </a>
                  );
                })}
              </div>
            ) : (
              links.map((lnk) => {
                const Icon = ICON_MAP[lnk.icon] ?? Link;
                const isExternal = !lnk.href.startsWith("mailto");
                return (
                  <a key={lnk.id} href={lnk.href}
                    target={isExternal ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-dark-800/60 bg-dark-900/20 hover:border-blood-900/60 hover:bg-dark-900/50 group transition-all duration-200">
                    <div className="w-9 h-9 rounded-lg bg-blood-950 border border-blood-900/60 flex items-center justify-center shrink-0 group-hover:bg-blood-900/60 transition-colors">
                      <Icon size={16} className="text-blood-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-dark-600 font-mono">{lnk.label}</p>
                      <p className="text-sm text-dark-300 group-hover:text-blood-400 transition-colors truncate">{lnk.value}</p>
                    </div>
                    {isExternal && <ExternalLink size={12} className="text-dark-700 group-hover:text-blood-700 shrink-0" />}
                  </a>
                );
              })
            )}

            {/* Location */}
            {showLocation && (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-dark-800/60 bg-dark-900/20">
                <div className="w-9 h-9 rounded-lg bg-blood-950 border border-blood-900/60 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-blood-400" />
                </div>
                <div>
                  <p className="text-[11px] text-dark-600 font-mono">Location</p>
                  <p className="text-sm text-dark-300">{location}</p>
                </div>
              </div>
            )}

            {/* Google Maps embed */}
            {showMaps && mapsUrl && (
              <div className="rounded-xl overflow-hidden border border-dark-800/60 bg-dark-900/20 mt-1">
                <iframe
                  src={mapsUrl}
                  width="100%"
                  height="200"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) saturate(0.8)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location map"
                />
              </div>
            )}
          </div>

          {/* ── Right: contact form ── */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

// ── Contact Form ──────────────────────────────────────────────────────────────
type ContactMethod = "email" | "whatsapp";

function ContactForm() {
  const [method,   setMethod  ] = useState<ContactMethod>("email");
  const [name,     setName    ] = useState("");
  const [contact,  setContact ] = useState("");
  const [dialCode, setDialCode] = useState("62");
  const [message,  setMessage ] = useState("");
  const [errors,   setErrors  ] = useState<Record<string, string>>({});
  const [status,   setStatus  ] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const [errMsg,   setErrMsg  ] = useState("");
  const [ccOpen,   setCcOpen  ] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nama wajib diisi.";
    if (!contact.trim()) {
      e.contact = method === "email" ? "Email wajib diisi." : "Nomor WhatsApp wajib diisi.";
    } else if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      e.contact = "Format email tidak valid.";
    } else if (method === "whatsapp" && !/^\d{6,15}$/.test(contact.replace(/\s/g, ""))) {
      e.contact = "Nomor WhatsApp tidak valid (hanya angka, 6-15 digit).";
    }
    if (!message.trim()) e.message = "Pesan wajib diisi.";
    else if (message.trim().length < 10) e.message = "Pesan minimal 10 karakter.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("sending");
    setErrMsg("");
    try {
      const payload = method === "email"
        ? { method: "email",    name, email: contact, message }
        : { method: "whatsapp", name, phone: `${dialCode}${contact.replace(/^0/, "").replace(/\s/g, "")}`, message };

      const res  = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setErrMsg(json.error ?? "Terjadi kesalahan."); setStatus("error"); return; }
      setStatus("sent");
      setName(""); setContact(""); setMessage("");
    } catch {
      setErrMsg("Gagal mengirim pesan. Coba lagi.");
      setStatus("error");
    }
  }

  const iCls = (field: string) => cn(
    "w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none transition-colors resize-none",
    errors[field]
      ? "border-2 border-blood-700 bg-dark-900/60 text-dark-200 placeholder-dark-700"
      : "border border-dark-800 bg-dark-900/60 text-dark-200 placeholder-dark-600 focus:border-blood-800"
  );

  const selectedCountry = COUNTRIES.find(c => c.code === dialCode) ?? COUNTRIES[0];

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-blood-950 border border-blood-900 flex items-center justify-center">
          <Check size={24} className="text-blood-400" />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Pesan Terkirim!</h3>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Terima kasih telah menghubungi. Aku akan segera membalas.
        </p>
        <button onClick={() => setStatus("idle")}
          className="mt-2 px-5 py-2 rounded-full border border-dark-700 hover:border-blood-700 text-dark-400 hover:text-blood-400 text-xs font-mono transition-colors">
          Kirim pesan lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Method toggle */}
      <div className="flex gap-2 p-1 rounded-xl bg-dark-900/50 border border-dark-800">
        {([
          { id: "email",    label: "Email",    icon: Mail          },
          { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button key={id} type="button"
            onClick={() => { setMethod(id); setContact(""); setErrors({}); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono transition-all",
              method === id ? "bg-blood-700 text-white shadow-sm" : "text-dark-500 hover:text-dark-300"
            )}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      {/* Name */}
      <div>
        <label className="block text-[11px] font-mono text-dark-600 mb-1.5">Nama <span className="text-blood-500">*</span></label>
        <input type="text" value={name}
          onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: "" })); }}
          placeholder="Your name" className={iCls("name")} />
        {errors.name && <p className="text-[10px] text-blood-400 mt-1 font-mono">{errors.name}</p>}
      </div>

      {/* Email or WhatsApp */}
      <div>
        <label className="block text-[11px] font-mono text-dark-600 mb-1.5">
          {method === "email" ? "Email" : "Nomor WhatsApp"} <span className="text-blood-500">*</span>
        </label>
        {method === "email" ? (
          <input type="email" value={contact}
            onChange={e => { setContact(e.target.value); setErrors(er => ({ ...er, contact: "" })); }}
            placeholder="your@email.com" className={iCls("contact")} />
        ) : (
          <div className="flex gap-2">
            <div className="relative shrink-0">
              <button type="button" onClick={() => setCcOpen(!ccOpen)}
                className={cn("flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm border transition-colors",
                  "bg-dark-900/60 border-dark-800 text-dark-200 hover:border-blood-800 focus:outline-none",
                  errors.contact && "border-blood-700")}>
                <span>{selectedCountry.flag}</span>
                <span className="font-mono text-xs">+{dialCode}</span>
                <span className="text-dark-600 text-[10px]">▾</span>
              </button>
              {ccOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 w-52 max-h-60 overflow-y-auto rounded-xl border border-dark-700 bg-dark-950 shadow-2xl shadow-black/60">
                  {COUNTRIES.map(c => (
                    <button key={c.code} type="button"
                      onClick={() => { setDialCode(c.code); setCcOpen(false); }}
                      className={cn("w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors",
                        dialCode === c.code ? "bg-blood-950 text-blood-400" : "text-dark-400 hover:bg-dark-900 hover:text-dark-200")}>
                      <span>{c.flag}</span>
                      <span className="font-mono text-dark-500">+{c.code}</span>
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input type="tel" value={contact}
              onChange={e => { setContact(e.target.value.replace(/[^\d\s]/g, "")); setErrors(er => ({ ...er, contact: "" })); }}
              placeholder="8xxxxxxxxxx" className={cn(iCls("contact"), "flex-1")} />
          </div>
        )}
        {errors.contact && <p className="text-[10px] text-blood-400 mt-1 font-mono">{errors.contact}</p>}
        {method === "whatsapp" && !errors.contact && (
          <p className="text-[10px] text-dark-700 font-mono mt-1">Tanpa angka 0 di depan. Contoh: 81234567890</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="block text-[11px] font-mono text-dark-600 mb-1.5">Pesan <span className="text-blood-500">*</span></label>
        <textarea rows={5} value={message}
          onChange={e => { setMessage(e.target.value); setErrors(er => ({ ...er, message: "" })); }}
          placeholder="Hei, aku mau ngobrol soal..."
          className={iCls("message")} />
        {errors.message && <p className="text-[10px] text-blood-400 mt-1 font-mono">{errors.message}</p>}
      </div>

      {errMsg && (
        <p className="text-xs text-blood-400 font-mono bg-blood-950/30 border border-blood-900 rounded-lg px-3 py-2">{errMsg}</p>
      )}

      <button type="submit" disabled={status === "sending"}
        className="w-full py-3 rounded-lg bg-blood-700 hover:bg-blood-600 disabled:opacity-60 text-white font-medium text-sm transition-all flex items-center justify-center gap-2">
        {status === "sending"
          ? <><Loader2 size={14} className="animate-spin" /> Mengirim...</>
          : method === "email"
            ? <><Mail size={14} /> Kirim via Email</>
            : <><Phone size={14} /> Kirim via WhatsApp</>
        }
      </button>
      <p className="text-[10px] text-dark-700 font-mono text-center">
        <span className="text-blood-800">*</span> Semua field wajib diisi
      </p>
    </form>
  );
}
