"use client";

import { useState, useRef } from "react";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { Plus, X, Upload, Loader2, Check, Eye, EyeOff,
  Mail, Github, Linkedin, Instagram, Twitter, Youtube,
  Facebook, Twitch, Music2, Dribbble, Figma, Phone, Globe, Link as LinkIcon,
} from "lucide-react";
import Image from "next/image";
import { ImageEditor } from "@/components/admin/ImageEditor";
import { cn } from "@/lib/utils";

// ── Icon catalogue ─────────────────────────────────────────────────────────────
const ICON_OPTIONS = [
  { key: "mail",      label: "Email",     Icon: Mail      },
  { key: "github",    label: "GitHub",    Icon: Github    },
  { key: "linkedin",  label: "LinkedIn",  Icon: Linkedin  },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "twitter",   label: "Twitter/X", Icon: Twitter   },
  { key: "youtube",   label: "YouTube",   Icon: Youtube   },
  { key: "facebook",  label: "Facebook",  Icon: Facebook  },
  { key: "twitch",    label: "Twitch",    Icon: Twitch    },
  { key: "tiktok",    label: "TikTok",    Icon: Music2    },
  { key: "dribbble",  label: "Dribbble",  Icon: Dribbble  },
  { key: "figma",     label: "Figma",     Icon: Figma     },
  { key: "phone",     label: "Phone",     Icon: Phone     },
  { key: "globe",     label: "Website",   Icon: Globe     },
  { key: "link",      label: "Link",      Icon: LinkIcon  },
] as const;

interface ContentEditorProps {
  initialSettings: Record<string, Record<string, unknown>>;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

// ─── Reusable field components ────────────────────────────────────────────────
const inputCls = "w-full px-4 py-2.5 rounded-lg bg-dark-900 border border-dark-800 text-dark-200 placeholder-dark-700 text-sm focus:outline-none focus:border-blood-700 transition-colors";
const labelCls = "block text-xs font-mono text-dark-500 mb-1.5";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-dark rounded-xl border border-dark-800 overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-dark-800 bg-dark-900/40">
        <h2 className="text-xs font-mono text-blood-600 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ContentEditor({ initialSettings }: ContentEditorProps) {
  const s = initialSettings;

  // ── Hero name ──
  const [heroFirst, setHeroFirst] = useState<string>((s.hero_name?.first as string) ?? "REAVLENIA");
  const [heroLast,  setHeroLast ] = useState<string>((s.hero_name?.last  as string) ?? "AREZHA");

  // ── Hero roles ──
  const [roles, setRoles] = useState<string[]>(
    (s.hero_roles?.roles as string[]) ?? ["Web Developer","Animator","UI/UX Designer","Illustrator"]
  );

  // ── Hero bio ──
  const [heroBio, setHeroBio] = useState<string>((s.hero_bio?.text as string) ?? "");

  // ── Hero stats ──
  const [stats, setStats] = useState<{ value: string; label: string }[]>(
    (s.hero_stats?.items as { value: string; label: string }[]) ??
    [{ value: "10+", label: "Projects" }, { value: "3+", label: "Years" }, { value: "5+", label: "Disciplines" }]
  );

  // ── Hero image ──
  const [heroImgUrl,    setHeroImgUrl  ] = useState<string>((s.hero_image?.url as string) ?? "");
  const [uploadingImg,  setUploadingImg] = useState(false);
  const [editingHero,   setEditingHero ] = useState<File | null>(null);
  const [editingHeroUrl,setEditingHeroUrl] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Site logo ──
  const [logoUrl,       setLogoUrl     ] = useState<string>((s.site_logo?.url as string) ?? "");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editingLogo,   setEditingLogo ] = useState<File | null>(null);
  const [editingLogoUrl,setEditingLogoUrl] = useState<string | undefined>(undefined);
  const logoRef = useRef<HTMLInputElement>(null);

  // ── About stats ──
  const [aboutStats, setAboutStats] = useState<{ value: string; label: string }[]>(
    (s.about_stats?.items as { value: string; label: string }[]) ??
    [{ value: "10+", label: "Projects" }, { value: "15+", label: "Technologies" },
     { value: "5+",  label: "Design Tools" }, { value: "3+", label: "Years Active" }]
  );

  // ── About traits ──
  const [aboutTraits, setAboutTraits] = useState<{ icon: string; title: string; desc: string }[]>(
    (s.about_traits?.items as { icon: string; title: string; desc: string }[]) ??
    [
      { icon: "Code2",     title: "Web Development",      desc: "Next.js, TypeScript, Supabase — bikin web yang cepat, clean, dan beneran jalan." },
      { icon: "Palette",   title: "Design & Illustration", desc: "UI/UX dengan Figma, ilustrasi digital & tradisional, desain logo dan branding."  },
      { icon: "Camera",    title: "Visual Creative",       desc: "Animasi 2D, motion graphics, fotografi — storytelling lewat visual."             },
      { icon: "Lightbulb", title: "Problem Solver",        desc: "Senang ngulik masalah kompleks dan nyari solusi yang paling elegan."             },
    ]
  );
  const [aboutParas, setAboutParas] = useState<string[]>(
    (s.about_bio?.paragraphs as string[]) ??
    ["Halo! Aku Reavlenia Arezha, seorang creative multidisiplin yang bergerak di dunia digital."]
  );

  // ── About — Dossier Profile (5 fields: name, role, location, status, env) ──
  const ap = s.about_profile as Record<string, string> ?? {};
  const [profileName,     setProfileName]     = useState<string>(ap.name     ?? "Reavlenia Arezha");
  const [profileRole,     setProfileRole]     = useState<string>(ap.role     ?? "Creative Multidisciplinary");
  const [profileLocation, setProfileLocation] = useState<string>(ap.location ?? "Indonesia");
  const [profileStatus,   setProfileStatus]   = useState<string>(ap.status   ?? "OPEN_FOR_COLLAB");
  const [profileEnv,      setProfileEnv]      = useState<string>(ap.env      ?? "VS Code · Figma · Adobe CC");

  // ── About — Personality Tags (dynamic chips) ──
  const apTags = s.about_personality?.tags as string[] | undefined;
  const [personalityTags, setPersonalityTags] = useState<string[]>(
    apTags && apTags.length > 0
      ? apTags
      : ["Perfectionist","Night Owl","Coffee-Driven","Multitasker","Detail Oriented","Creative Thinker"]
  );
  const [newTagInput, setNewTagInput] = useState<string>("");

  // ── Skills heading ──
  const sh = s.skills_heading as Record<string, string> ?? {};
  const [skillsLabel,       setSkillsLabel      ] = useState(sh.label       ?? "— Expertise —");
  const [skillsTitleMain,   setSkillsTitleMain  ] = useState(sh.titleMain   ?? "Skills &");
  const [skillsTitleAccent, setSkillsTitleAccent] = useState(sh.titleAccent ?? "Tools");
  const [skillsSubtitle,    setSkillsSubtitle   ] = useState(sh.subtitle    ?? "Dari kode sampai kanvas — tools yang aku kuasai.");

  // ── Contact — semua state ──
  const ci = s.contact_info as Record<string, unknown> ?? {};

  // ── Contact heading ──
  const [contactHeadingLabel,    setContactHeadingLabel   ] = useState<string>((ci.headingLabel    as string) ?? "— Get In Touch —");
  const [contactHeadingMain,     setContactHeadingMain    ] = useState<string>((ci.headingMain     as string) ?? "Let\u2019s");
  const [contactHeadingAccent,   setContactHeadingAccent  ] = useState<string>((ci.headingAccent   as string) ?? "Connect");
  const [contactHeadingSubtitle, setContactHeadingSubtitle] = useState<string>((ci.headingSubtitle as string) ?? "Ada project menarik, mau kolaborasi, atau sekadar ngobrol? Aku selalu terbuka — reach out kapan saja.");

  // ── Contact — social links (dynamic) ──
  // Migrate legacy flat structure → new socialLinks array
  const defaultLinks = [
    { id: "1", label: "Email",     icon: "mail",      href: `mailto:${(ci.email as string) ?? ""}`,              value: (ci.email     as string) ?? "",                                  visible: true },
    { id: "2", label: "GitHub",    icon: "github",    href: (ci.github    as string) ?? "https://github.com/",   value: ((ci.github    as string) ?? "").replace("https://",""),          visible: true },
    { id: "3", label: "LinkedIn",  icon: "linkedin",  href: (ci.linkedin  as string) ?? "https://linkedin.com/", value: ((ci.linkedin  as string) ?? "").replace("https://",""),          visible: true },
    { id: "4", label: "Instagram", icon: "instagram", href: (ci.instagram as string) ?? "https://instagram.com/",value: ((ci.instagram as string) ?? "").replace("https://",""),          visible: true },
  ];
  const [socialLinks, setSocialLinks] = useState<{ id: string; label: string; icon: string; href: string; value: string; visible: boolean }[]>(
    (ci.socialLinks as { id: string; label: string; icon: string; href: string; value: string; visible: boolean }[]) ?? defaultLinks
  );
  const [location,     setLocation    ] = useState<string>((ci.location     as string)  ?? "Indonesia");
  const [showLocation, setShowLocation] = useState<boolean>((ci.showLocation as boolean) !== false);
  const [mapsUrl,      setMapsUrl     ] = useState<string>((ci.mapsUrl      as string)  ?? "");
  const [showMaps,     setShowMaps    ] = useState<boolean>((ci.showMaps     as boolean) === true);
  const [waNumber,     setWaNumber    ] = useState<string>((ci.wa_number     as string)  ?? "");

  const [status, setStatus] = useState<SaveStatus>("idle");

  // ── Upload helper via server API ──
  async function uploadViaServer(file: File, bucket: string, oldUrl?: string): Promise<string> {
    const oldPath = oldUrl ? oldUrl.split(`/${bucket}/`)[1] : undefined;
    const fd = new FormData();
    fd.append("file",   file);
    fd.append("bucket", bucket);
    if (oldPath) fd.append("oldPath", oldPath);

    const res  = await fetch("/api/upload-asset", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error ?? "Upload gagal");
    return json.url as string;
  }

  // ── Upload hero image ──
  function handleHeroFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Maks 10MB"); return; }
    setEditingHero(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleHeroEditorDone(editedFile: File) {
    setEditingHero(null);
    setUploadingImg(true);
    try {
      const url = await uploadViaServer(editedFile, "hero", heroImgUrl || undefined);
      setHeroImgUrl(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload gagal");
    }
    setUploadingImg(false);
  }

  // ── Upload site logo ──
  function handleLogoFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Maks 5MB"); return; }
    setEditingLogo(file);
    if (logoRef.current) logoRef.current.value = "";
  }

  async function handleLogoEditorDone(editedFile: File) {
    setEditingLogo(null);
    setUploadingLogo(true);
    try {
      const url = await uploadViaServer(editedFile, "logos", logoUrl || undefined);
      setLogoUrl(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload logo gagal");
    }
    setUploadingLogo(false);
  }

  // ── Save all ──
  async function handleSave() {
    setStatus("saving");
    const supabase = createAdminClient();

    const updates = [
      { key: "hero_name",   value: { first: heroFirst, last: heroLast } },
      { key: "hero_roles",  value: { roles } },
      { key: "hero_bio",    value: { text: heroBio } },
      { key: "hero_stats",  value: { items: stats } },
      { key: "hero_image",    value: { url: heroImgUrl } },
      { key: "site_logo",     value: { url: logoUrl } },
      { key: "about_profile", value: { name: profileName, role: profileRole, location: profileLocation, status: profileStatus, env: profileEnv } },
      { key: "about_personality", value: { tags: personalityTags } },
      { key: "about_bio",     value: { paragraphs: aboutParas } },
      { key: "about_stats",   value: { items: aboutStats } },
      { key: "about_traits",  value: { items: aboutTraits } },
      { key: "contact_info", value: {
          socialLinks, location, showLocation, mapsUrl, showMaps, wa_number: waNumber,
          headingLabel: contactHeadingLabel, headingMain: contactHeadingMain,
          headingAccent: contactHeadingAccent, headingSubtitle: contactHeadingSubtitle,
        }
      },
      { key: "skills_heading", value: { label: skillsLabel, titleMain: skillsTitleMain, titleAccent: skillsTitleAccent, subtitle: skillsSubtitle } },
    ];

    for (const u of updates) {
      await supabase.from("site_settings").upsert({ key: u.key, value: u.value }, { onConflict: "key" });
    }

    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div className="max-w-2xl space-y-0">
      {/* ── Image Editor Modals ── */}
      {editingHero && (
        <ImageEditor
          file={editingHero}
          existingUrl={editingHeroUrl}
          onDone={(f) => { setEditingHero(null); setEditingHeroUrl(undefined); handleHeroEditorDone(f); }}
          onCancel={() => { setEditingHero(null); setEditingHeroUrl(undefined); }}
        />
      )}
      {editingLogo && (
        <ImageEditor
          file={editingLogo}
          existingUrl={editingLogoUrl}
          onDone={(f) => { setEditingLogo(null); setEditingLogoUrl(undefined); handleLogoEditorDone(f); }}
          onCancel={() => { setEditingLogo(null); setEditingLogoUrl(undefined); }}
        />
      )}

      {/* ── Site Logo ── */}
      <Section title="Site Logo (Navbar & Footer)">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-dark-900 border border-dark-800 shrink-0 flex items-center justify-center">
              <Image src={logoUrl} alt="Logo" width={48} height={48} className="w-12 h-12 object-contain" unoptimized />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-dark-900 border border-dashed border-dark-700 flex items-center justify-center shrink-0">
              <span className="text-dark-700 font-mono text-xs text-center">no logo</span>
            </div>
          )}
          <div className="flex-1 space-y-2">
            <label className={labelCls}>Upload logo (PNG/SVG, maks 2MB)</label>
            <p className="text-[10px] text-dark-600 font-mono">
              Logo ini akan tampil di navbar dan footer. Gunakan format PNG transparan atau SVG.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-2 w-fit px-4 py-2 rounded-lg bg-dark-900 border border-dark-800 hover:border-dark-700 text-dark-400 text-xs font-mono cursor-pointer transition-colors">
                {uploadingLogo ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {uploadingLogo ? "Uploading..." : "Pilih logo"}
                <input ref={logoRef} type="file" accept="image/png,image/svg+xml,image/webp"
                  onChange={handleLogoFileSelect} className="hidden" />
              </label>
              {logoUrl && (
                <button type="button"
                  onClick={() => {
                    setEditingLogo(new File([], "logo-edit.png", { type: "image/png" }));
                    setEditingLogoUrl(logoUrl);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-900 border border-blood-900/60 hover:border-blood-700 text-blood-500 hover:text-blood-400 text-xs font-mono transition-colors">
                  ✏️ Edit logo
                </button>
              )}
            </div>
            {logoUrl && (
              <button onClick={() => setLogoUrl("")}
                className="text-[10px] text-dark-600 hover:text-blood-400 font-mono transition-colors">
                Hapus logo (kembali ke teks)
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* ── Hero Section ── */}
      <Section title="Hero — Nama">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nama Depan</label>
            <input value={heroFirst} onChange={e => setHeroFirst(e.target.value)} className={inputCls} placeholder="REAVLENIA" />
          </div>
          <div>
            <label className={labelCls}>Nama Belakang</label>
            <input value={heroLast} onChange={e => setHeroLast(e.target.value)} className={inputCls} placeholder="AREZHA" />
          </div>
        </div>
      </Section>

      <Section title="Hero — Role Ticker">
        <div className="space-y-2">
          {roles.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={r}
                onChange={e => setRoles(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                className={`${inputCls} flex-1`}
                placeholder={`Role ${i + 1}`}
              />
              <button type="button"
                onClick={() => setRoles(prev => prev.filter((_, idx) => idx !== i))}
                className="text-dark-600 hover:text-blood-400 p-1.5 rounded hover:bg-blood-950/50 transition-colors">
                <X size={13} />
              </button>
            </div>
          ))}
          <button type="button"
            onClick={() => setRoles(prev => [...prev, ""])}
            className="flex items-center gap-2 text-xs text-dark-500 hover:text-blood-400 font-mono transition-colors">
            <Plus size={12} /> Tambah role
          </button>
        </div>
      </Section>

      <Section title="Hero — Bio">
        <div>
          <label className={labelCls}>Teks bio singkat</label>
          <textarea value={heroBio} onChange={e => setHeroBio(e.target.value)} rows={2}
            className={`${inputCls} resize-none`} placeholder="Menciptakan karya yang fungsional sekaligus indah..." />
        </div>
      </Section>

      <Section title="Hero — Stats (Angka di hero section)">
        <p className="text-[10px] text-dark-600 font-mono mb-3">
          {`// Contoh: Value = "10+" | Label = "Projects" → tampil sebagai "10+ / PROJECTS" di hero`}
        </p>
        <div className="space-y-3">
          {stats.map((st, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-none w-28">
                {i === 0 && <label className={labelCls}>Angka / Value</label>}
                <input value={st.value}
                  onChange={e => setStats(prev => prev.map((v, idx) => idx === i ? { ...v, value: e.target.value } : v))}
                  className={inputCls} placeholder='mis: &quot;10+&quot; atau &quot;3 Tahun&quot;' />
              </div>
              <div className="flex-1">
                {i === 0 && <label className={labelCls}>Label / Keterangan</label>}
                <input value={st.label}
                  onChange={e => setStats(prev => prev.map((v, idx) => idx === i ? { ...v, label: e.target.value } : v))}
                  className={inputCls} placeholder='mis: &quot;Projects&quot;, &quot;Years&quot;, &quot;Skills&quot;' />
              </div>
              <button type="button" onClick={() => setStats(prev => prev.filter((_, idx) => idx !== i))}
                className="text-dark-600 hover:text-blood-400 p-2 rounded hover:bg-blood-950/50 transition-colors mb-0.5">
                <X size={13} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setStats(prev => [...prev, { value: "", label: "" }])}
            className="flex items-center gap-2 text-xs text-dark-500 hover:text-blood-400 font-mono transition-colors">
            <Plus size={12} /> Tambah stat baru
          </button>
        </div>
      </Section>

      <Section title="Hero — Foto">
        <div className="flex items-center gap-4">
          {heroImgUrl ? (
            <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-dark-900 shrink-0">
              <Image src={heroImgUrl} alt="Hero" fill className="object-cover object-top" unoptimized />
            </div>
          ) : (
            <div className="w-20 h-24 rounded-lg bg-dark-900 border border-dashed border-dark-700 flex items-center justify-center shrink-0">
              <span className="text-dark-700 text-xs font-mono">no img</span>
            </div>
          )}
          <div className="flex-1 space-y-2">
            <label className={labelCls}>Upload foto baru (PNG tanpa bg, maks 10MB)</label>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-2 w-fit px-4 py-2 rounded-lg bg-dark-900 border border-dark-800 hover:border-dark-700 text-dark-400 text-xs font-mono cursor-pointer transition-colors">
                {uploadingImg ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {uploadingImg ? "Uploading..." : "Pilih foto"}
                <input ref={fileRef} type="file" accept="image/png,image/webp,image/jpeg"
                  onChange={handleHeroFileSelect} className="hidden" />
              </label>
              {heroImgUrl && (
                <button type="button"
                  onClick={() => {
                    // Pass URL directly — ImageEditor will use it as workingUrl
                    setEditingHero(new File([], "hero-edit.png", { type: "image/png" }));
                    setEditingHeroUrl(heroImgUrl);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-900 border border-blood-900/60 hover:border-blood-700 text-blood-500 hover:text-blood-400 text-xs font-mono transition-colors">
                  ✏️ Edit foto
                </button>
              )}
            </div>
            {heroImgUrl && (
              <p className="text-[10px] text-dark-700 font-mono break-all">{heroImgUrl.split("/").pop()}</p>
            )}
          </div>
        </div>
      </Section>

      <Section title="About — Stats (Angka di section Siapa Aku)">
        <p className="text-[10px] text-dark-600 font-mono mb-3">
          {`// Contoh: Value = "15+" | Label = "Technologies" → tampil sebagai kotak stat di About section`}
        </p>
        <div className="space-y-3">
          {aboutStats.map((st, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-none w-28">
                {i === 0 && <label className={labelCls}>Angka / Value</label>}
                <input value={st.value}
                  onChange={e => setAboutStats(prev => prev.map((v, idx) => idx === i ? { ...v, value: e.target.value } : v))}
                  className={inputCls} placeholder='mis: &quot;15+&quot; atau &quot;5 Tools&quot;' />
              </div>
              <div className="flex-1">
                {i === 0 && <label className={labelCls}>Label / Keterangan</label>}
                <input value={st.label}
                  onChange={e => setAboutStats(prev => prev.map((v, idx) => idx === i ? { ...v, label: e.target.value } : v))}
                  className={inputCls} placeholder='mis: &quot;Technologies&quot;, &quot;Design Tools&quot;' />
              </div>
              <button type="button" onClick={() => setAboutStats(prev => prev.filter((_, idx) => idx !== i))}
                className="text-dark-600 hover:text-blood-400 p-2 rounded hover:bg-blood-950/50 transition-colors mb-0.5">
                <X size={13} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setAboutStats(prev => [...prev, { value: "", label: "" }])}
            className="flex items-center gap-2 text-xs text-dark-500 hover:text-blood-400 font-mono transition-colors">
            <Plus size={12} /> Tambah stat baru
          </button>
        </div>
      </Section>

      <Section title="About — Keahlian (Trait Cards)">
        <p className="text-[10px] text-dark-600 font-mono mb-2">
          {`// Card keahlian yang tampil di section "Siapa Aku?" — icon, judul, deskripsi`}
        </p>
        <p className="text-[10px] text-dark-600 font-mono mb-3">
          {`// Icon tersedia: Code2, Palette, Camera, Lightbulb, Brush, Music, Film, Globe, Cpu, Star, Heart, Zap, BookOpen, Layers, Monitor, Smartphone, Package, Pen`}
        </p>
        <div className="space-y-4">
          {aboutTraits.map((tr, i) => (
            <div key={i} className="card-dark rounded-xl p-4 border border-dark-800 space-y-2">
              <div className="flex items-center gap-2 justify-between">
                <span className="text-[10px] font-mono text-dark-600">Trait #{i + 1}</span>
                <button type="button" onClick={() => setAboutTraits(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-dark-600 hover:text-blood-400 p-1 rounded transition-colors">
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Icon Name</label>
                  <input value={tr.icon}
                    onChange={e => setAboutTraits(prev => prev.map((v, idx) => idx === i ? { ...v, icon: e.target.value } : v))}
                    className={inputCls} placeholder="Code2" />
                </div>
                <div>
                  <label className={labelCls}>Judul</label>
                  <input value={tr.title}
                    onChange={e => setAboutTraits(prev => prev.map((v, idx) => idx === i ? { ...v, title: e.target.value } : v))}
                    className={inputCls} placeholder="Web Development" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Deskripsi</label>
                <textarea value={tr.desc} rows={2}
                  onChange={e => setAboutTraits(prev => prev.map((v, idx) => idx === i ? { ...v, desc: e.target.value } : v))}
                  className={`${inputCls} resize-none`} placeholder="Deskripsi singkat keahlian..." />
              </div>
            </div>
          ))}
          <button type="button"
            onClick={() => setAboutTraits(prev => [...prev, { icon: "Star", title: "", desc: "" }])}
            className="flex items-center gap-2 text-xs text-dark-500 hover:text-blood-400 font-mono transition-colors">
            <Plus size={12} /> Tambah trait
          </button>
        </div>
      </Section>

      <Section title="About — Bio">
        <div className="space-y-2">
          {aboutParas.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <textarea value={p} onChange={e => setAboutParas(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                rows={2} className={`${inputCls} flex-1 resize-none`} placeholder={`Paragraf ${i + 1}`} />
              <button type="button" onClick={() => setAboutParas(prev => prev.filter((_, idx) => idx !== i))}
                className="text-dark-600 hover:text-blood-400 p-1.5 mt-1 rounded hover:bg-blood-950/50 transition-colors">
                <X size={13} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setAboutParas(prev => [...prev, ""])}
            className="flex items-center gap-2 text-xs text-dark-500 hover:text-blood-400 font-mono transition-colors">
            <Plus size={12} /> Tambah paragraf
          </button>
        </div>
      </Section>

      <Section title="About — Dossier Profile (Terminal Window)">
        <p className="text-[10px] text-dark-600 font-mono mb-3">
          {`// Data yang tampil di "user_dossier" terminal: NAME, ROLE, LOCATION, STATUS, ENV`}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>NAME</label>
            <input value={profileName} onChange={e => setProfileName(e.target.value)}
              className={inputCls} placeholder="Reavlenia Arezha" />
          </div>
          <div>
            <label className={labelCls}>ROLE</label>
            <input value={profileRole} onChange={e => setProfileRole(e.target.value)}
              className={inputCls} placeholder="Creative Multidisciplinary" />
          </div>
          <div>
            <label className={labelCls}>LOCATION</label>
            <input value={profileLocation} onChange={e => setProfileLocation(e.target.value)}
              className={inputCls} placeholder="Indonesia" />
          </div>
          <div>
            <label className={labelCls}>STATUS</label>
            <input value={profileStatus} onChange={e => setProfileStatus(e.target.value)}
              className={inputCls} placeholder="OPEN_FOR_COLLAB" />
            <p className="text-[10px] text-dark-600 font-mono mt-1">
              Contoh: OPEN_FOR_COLLAB, AVAILABLE, BUSY, dll
            </p>
          </div>
        </div>
        <div>
          <label className={labelCls}>ENV (Tools / Environment)</label>
          <input value={profileEnv} onChange={e => setProfileEnv(e.target.value)}
            className={inputCls} placeholder="VS Code · Figma · Adobe CC" />
          <p className="text-[10px] text-dark-600 font-mono mt-1">
            Pisahkan dengan <code className="font-mono">&quot; · &quot;</code> (space dot space) untuk multi item
          </p>
        </div>
      </Section>

      <Section title="About — Personality Tags (grep PERSONALITY config.json)">
        <p className="text-[10px] text-dark-600 font-mono mb-3">
          {`// Tag/tag personality yang tampil sebagai chip di bawah "grep PERSONALITY config.json"`}
        </p>
        {/* Preview */}
        <div className="mb-4 px-4 py-3 rounded-xl bg-dark-950 border border-dark-800">
          <p className="text-[10px] font-mono text-dark-600 mb-2">Preview:</p>
          <div className="flex flex-wrap gap-2">
            {personalityTags.length === 0 ? (
              <p className="text-[10px] text-dark-700 font-mono italic">— Belum ada tag —</p>
            ) : (
              personalityTags.map(tag => (
                <span key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] tracking-wide border"
                  style={{
                    borderColor: "rgba(34,211,238,0.25)",
                    background: "rgba(34,211,238,0.06)",
                    color: "#5EEAD4",
                  }}
                >
                  <span className="w-1 h-1 rounded-full bg-current opacity-70" />
                  #{tag.toLowerCase().replace(/\s+/g, "_")}
                </span>
              ))
            )}
          </div>
        </div>
        {/* Tag list editor */}
        <div className="space-y-2 mb-3">
          {personalityTags.map((tag, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={tag}
                onChange={e => setPersonalityTags(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                className={`${inputCls} flex-1`}
                placeholder={`Personality ${i + 1}`}
              />
              <button type="button"
                onClick={() => setPersonalityTags(prev => prev.filter((_, idx) => idx !== i))}
                className="text-dark-600 hover:text-blood-400 p-1.5 rounded hover:bg-blood-950/50 transition-colors">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        {/* Add tag input */}
        <div className="flex items-center gap-2">
          <input
            value={newTagInput}
            onChange={e => setNewTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                const v = newTagInput.trim();
                if (v) {
                  setPersonalityTags(prev => [...prev, v]);
                  setNewTagInput("");
                }
              }
            }}
            className={`${inputCls} flex-1`}
            placeholder="Ketik tag baru lalu Enter atau klik Tambah"
          />
          <button type="button"
            onClick={() => {
              const v = newTagInput.trim();
              if (v) {
                setPersonalityTags(prev => [...prev, v]);
                setNewTagInput("");
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-dark-900 border border-dark-800 hover:border-dark-700 text-dark-400 hover:text-dark-200 text-xs font-mono transition-colors">
            <Plus size={12} /> Tambah
          </button>
        </div>
      </Section>

      <Section title="Skills — Heading Section">
        <p className="text-[10px] text-dark-600 font-mono mb-1">
          {`// Teks heading pada section "Skills & Tools" di landing page`}
        </p>
        <div>
          <label className={labelCls}>Label kecil (merah, atas judul)</label>
          <input value={skillsLabel} onChange={e => setSkillsLabel(e.target.value)}
            className={inputCls} placeholder="— Expertise —" />
          <p className="text-[10px] text-blood-700 font-mono mt-1">Tampil merah di atas judul</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Judul — bagian putih</label>
            <input value={skillsTitleMain} onChange={e => setSkillsTitleMain(e.target.value)}
              className={inputCls} placeholder="Skills &" />
            <p className="text-[10px] text-dark-600 font-mono mt-1">Tampil putih (warna biasa)</p>
          </div>
          <div>
            <label className={labelCls}>Judul — bagian merah (aksen)</label>
            <input value={skillsTitleAccent} onChange={e => setSkillsTitleAccent(e.target.value)}
              className={`${inputCls} border-blood-900/60 focus:border-blood-600`} placeholder="Tools" />
            <p className="text-[10px] text-blood-700 font-mono mt-1">Tampil merah/gradient</p>
          </div>
        </div>
        <div>
          <label className={labelCls}>Subjudul / deskripsi</label>
          <input value={skillsSubtitle} onChange={e => setSkillsSubtitle(e.target.value)}
            className={inputCls} placeholder="Dari kode sampai kanvas — tools yang aku kuasai." />
        </div>
        {/* Preview */}
        <div className="mt-3 px-5 py-4 rounded-xl bg-dark-950 border border-dark-800 text-center space-y-1">
          <p className="text-blood-600 font-mono text-xs tracking-widest uppercase">{skillsLabel || "— Expertise —"}</p>
          <p className="text-lg font-bold text-dark-100">
            {skillsTitleMain || "Skills &"}{" "}
            <span className="text-gradient-blood">{skillsTitleAccent || "Tools"}</span>
          </p>
          <p className="text-xs text-dark-500">{skillsSubtitle || "Dari kode sampai kanvas..."}</p>
        </div>
      </Section>

      <Section title="Contact — Heading Section">
        <div>
          <label className={labelCls}>Label kecil (merah, atas judul)</label>
          <input value={contactHeadingLabel} onChange={e => setContactHeadingLabel(e.target.value)}
            className={inputCls} placeholder="— Get In Touch —" />
          <p className="text-[10px] text-blood-700 font-mono mt-1">Tampil merah di atas judul</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Judul — bagian putih</label>
            <input value={contactHeadingMain} onChange={e => setContactHeadingMain(e.target.value)}
              className={inputCls} placeholder="Let's" />
          </div>
          <div>
            <label className={labelCls}>Judul — bagian merah (aksen)</label>
            <input value={contactHeadingAccent} onChange={e => setContactHeadingAccent(e.target.value)}
              className={`${inputCls} border-blood-900/60 focus:border-blood-600`} placeholder="Connect" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Subjudul / deskripsi</label>
          <textarea value={contactHeadingSubtitle} onChange={e => setContactHeadingSubtitle(e.target.value)}
            rows={2} className={`${inputCls} resize-none`}
            placeholder="Ada project menarik, mau kolaborasi, atau sekadar ngobrol?" />
        </div>
        {/* Preview */}
        <div className="mt-2 px-5 py-4 rounded-xl bg-dark-950 border border-dark-800 text-center space-y-1">
          <p className="text-blood-600 font-mono text-xs tracking-widest uppercase">{contactHeadingLabel || "— Get In Touch —"}</p>
          <p className="text-lg font-bold" style={{ color: "var(--text-primary, #e8e8e8)" }}>
            {contactHeadingMain || "Let\u2019s"}{" "}
            <span className="text-gradient-blood">{contactHeadingAccent || "Connect"}</span>
          </p>
          <p className="text-xs text-dark-500 max-w-xs mx-auto">{contactHeadingSubtitle || "Deskripsi singkat..."}</p>
        </div>
      </Section>

      <Section title="Contact — Social Links">
        {/* ── Live preview ── */}
        <div className="mb-4">
          <p className="text-[10px] font-mono text-dark-600 mb-2">Preview tampilan di landing page:</p>
          <div className="px-4 py-3 rounded-xl bg-dark-950 border border-dark-800 space-y-2">
            {/* >4 = icon only */}
            {socialLinks.filter(l => l.visible !== false).length > 4 ? (
              <div className="flex flex-wrap gap-2">
                {socialLinks.filter(l => l.visible !== false).map(lnk => {
                  const opt = ICON_OPTIONS.find(o => o.key === lnk.icon);
                  const Icon = opt?.Icon ?? LinkIcon;
                  return (
                    <div key={lnk.id} title={lnk.label}
                      className="w-8 h-8 rounded-lg bg-blood-950 border border-blood-900/60 flex items-center justify-center">
                      <Icon size={14} className="text-blood-400" />
                    </div>
                  );
                })}
                <p className="w-full text-[9px] font-mono text-dark-700 mt-1">
                  {socialLinks.filter(l => l.visible !== false).length} link — icon only mode
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {socialLinks.filter(l => l.visible !== false).map(lnk => {
                  const opt = ICON_OPTIONS.find(o => o.key === lnk.icon);
                  const Icon = opt?.Icon ?? LinkIcon;
                  return (
                    <div key={lnk.id} className="flex items-center gap-3 p-2 rounded-lg bg-dark-900/50 border border-dark-800/50">
                      <div className="w-7 h-7 rounded-md bg-blood-950 border border-blood-900/50 flex items-center justify-center shrink-0">
                        <Icon size={13} className="text-blood-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-mono text-dark-600">{lnk.label || "Label"}</p>
                        <p className="text-xs text-dark-400 truncate">{lnk.value || lnk.href || "—"}</p>
                      </div>
                    </div>
                  );
                })}
                {socialLinks.filter(l => l.visible !== false).length === 0 && (
                  <p className="text-[10px] text-dark-700 font-mono">Tidak ada link yang ditampilkan</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Link editor list ── */}
        <div className="space-y-3">
          {socialLinks.map((lnk, i) => {
            const opt = ICON_OPTIONS.find(o => o.key === lnk.icon);
            const PreviewIcon = opt?.Icon ?? LinkIcon;
            const isVisible = lnk.visible !== false;
            return (
              <div key={lnk.id} className={cn(
                "rounded-xl border transition-colors",
                isVisible ? "border-dark-800 bg-dark-900/20" : "border-dark-900 bg-dark-950/50 opacity-60"
              )}>
                {/* Row header */}
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-dark-800/50">
                  <div className="w-7 h-7 rounded-lg bg-blood-950 border border-blood-900/40 flex items-center justify-center shrink-0">
                    <PreviewIcon size={13} className="text-blood-400" />
                  </div>
                  <span className="text-xs font-medium text-dark-300 flex-1">{lnk.label || `Link #${i + 1}`}</span>
                  <div className="flex items-center gap-1">
                    {/* Visibility toggle */}
                    <button type="button" title={isVisible ? "Sembunyikan" : "Tampilkan"}
                      onClick={() => setSocialLinks(prev => prev.map((v, idx) => idx === i ? { ...v, visible: !isVisible } : v))}
                      className={cn("p-1.5 rounded-lg transition-colors",
                        isVisible ? "text-dark-400 hover:text-blood-400 hover:bg-blood-950/40" : "text-dark-700 hover:text-dark-400 hover:bg-dark-800/50")}>
                      {isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    {/* Delete */}
                    <button type="button"
                      onClick={() => setSocialLinks(prev => prev.filter((_, idx) => idx !== i))}
                      className="p-1.5 rounded-lg text-dark-700 hover:text-blood-400 hover:bg-blood-950/40 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* Fields */}
                <div className="px-4 py-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Nama sosmed</label>
                      <input value={lnk.label}
                        onChange={e => setSocialLinks(prev => prev.map((v, idx) => idx === i ? { ...v, label: e.target.value } : v))}
                        className={inputCls} placeholder="TikTok" />
                    </div>
                    <div>
                      <label className={labelCls}>Icon</label>
                      {/* Visual icon picker */}
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {ICON_OPTIONS.map(({ key, label, Icon }) => (
                          <button key={key} type="button" title={label}
                            onClick={() => setSocialLinks(prev => prev.map((v, idx) => idx === i ? { ...v, icon: key } : v))}
                            className={cn("w-8 h-8 rounded-lg border flex items-center justify-center transition-all",
                              lnk.icon === key
                                ? "bg-blood-700 border-blood-600 text-white"
                                : "bg-dark-900 border-dark-800 text-dark-500 hover:border-dark-600 hover:text-dark-300")}>
                            <Icon size={13} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>URL / Link</label>
                    <input value={lnk.href}
                      onChange={e => {
                        const href = e.target.value;
                        const display = href.replace(/^mailto:/, "").replace(/^https?:\/\//, "");
                        setSocialLinks(prev => prev.map((v, idx) => idx === i ? { ...v, href, value: display } : v));
                      }}
                      className={inputCls} placeholder="https://tiktok.com/@username atau mailto:email@gmail.com" />
                  </div>
                  <div>
                    <label className={labelCls}>Teks yang ditampilkan</label>
                    <input value={lnk.value}
                      onChange={e => setSocialLinks(prev => prev.map((v, idx) => idx === i ? { ...v, value: e.target.value } : v))}
                      className={inputCls} placeholder="tiktok.com/@username" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add button — max 10 */}
        {socialLinks.length < 10 ? (
          <button type="button"
            onClick={() => setSocialLinks(prev => [...prev, { id: String(Date.now()), label: "", icon: "link", href: "", value: "", visible: true }])}
            className="flex items-center gap-2 text-xs text-dark-500 hover:text-blood-400 font-mono transition-colors mt-3">
            <Plus size={12} /> Tambah sosmed ({socialLinks.length}/10)
          </button>
        ) : (
          <p className="text-[10px] text-dark-600 font-mono mt-3">Maksimal 10 sosmed tercapai</p>
        )}

        {socialLinks.filter(l => l.visible !== false).length > 4 && (
          <p className="text-[10px] text-blood-700 font-mono mt-2">
            ⚡ {socialLinks.filter(l => l.visible !== false).length} link aktif → tampil icon-only dengan tooltip hover
          </p>
        )}
      </Section>

      <Section title="Contact — Lokasi">
        <div className="flex items-center gap-3 mb-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setShowLocation(v => !v)}
              className={cn("w-9 h-5 rounded-full transition-colors relative cursor-pointer",
                showLocation ? "bg-blood-700" : "bg-dark-800")}>
              <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                showLocation ? "left-4" : "left-0.5")} />
            </div>
            <span className="text-xs font-mono text-dark-400">Tampilkan lokasi</span>
          </label>
        </div>
        {showLocation && (
          <div>
            <label className={labelCls}>Nama lokasi</label>
            <input value={location} onChange={e => setLocation(e.target.value)}
              className={inputCls} placeholder="Indonesia" />
          </div>
        )}

        <div className="border-t border-dark-800 mt-4 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setShowMaps(v => !v)}
                className={cn("w-9 h-5 rounded-full transition-colors relative cursor-pointer",
                  showMaps ? "bg-blood-700" : "bg-dark-800")}>
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                  showMaps ? "left-4" : "left-0.5")} />
              </div>
              <span className="text-xs font-mono text-dark-400">Tampilkan Google Maps embed</span>
            </label>
          </div>
          {showMaps && (
            <div className="space-y-2">
              <div>
                <label className={labelCls}>Google Maps Embed URL</label>
                <input value={mapsUrl} onChange={e => setMapsUrl(e.target.value)}
                  className={inputCls}
                  placeholder="https://www.google.com/maps/embed?pb=..." />
                <p className="text-[10px] text-dark-700 font-mono mt-1">
                  Cara dapat URL: Google Maps → Share → Embed a map → salin src dari iframe
                </p>
              </div>
              {mapsUrl && (
                <div className="rounded-lg overflow-hidden border border-dark-800 mt-2">
                  <iframe src={mapsUrl} width="100%" height="150" style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) saturate(0.8)" }}
                    allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Maps preview" />
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      <Section title="Contact — WA Notifikasi">
        <div>
          <label className={labelCls}>No. WA untuk terima notifikasi pesan masuk</label>
          <input value={waNumber} onChange={e => setWaNumber(e.target.value)}
            className={inputCls} placeholder="628xxxxxxxxxx (tanpa + atau 0)" />
        </div>
      </Section>

      {/* Save button */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blood-700 hover:bg-blood-600 disabled:opacity-50 text-white font-medium text-sm transition-colors"
        >
          {status === "saving" && <Loader2 size={14} className="animate-spin" />}
          {status === "saved"  && <Check size={14} />}
          {status === "saving" ? "Menyimpan..." : status === "saved" ? "Tersimpan!" : "Simpan Semua"}
        </button>
        {status === "error" && (
          <p className="text-xs text-blood-400 font-mono">Gagal menyimpan, coba lagi.</p>
        )}
      </div>
    </div>
  );
}
