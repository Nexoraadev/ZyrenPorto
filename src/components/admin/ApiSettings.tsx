"use client";

import { useState } from "react";
import { Eye, EyeOff, Save, Loader2, Check, ExternalLink } from "lucide-react";

interface ApiEntry {
  key:         string;          // env var name
  label:       string;          // display name
  description: string;          // what it does
  docsUrl:     string;          // where to get a new key
  placeholder: string;
  current:     string;          // masked value from env
}

// These are the API keys used in this project
const API_ENTRIES: ApiEntry[] = [
  {
    key:         "NEXT_PUBLIC_SUPABASE_URL",
    label:       "Supabase URL",
    description: "URL project Supabase kamu. Digunakan untuk koneksi database dan storage.",
    docsUrl:     "https://supabase.com/dashboard/project/_/settings/api",
    placeholder: "https://xxxx.supabase.co",
    current:     process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  },
  {
    key:         "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    label:       "Supabase Publishable Key",
    description: "Kunci publik Supabase. Aman ditampilkan di client-side.",
    docsUrl:     "https://supabase.com/dashboard/project/_/settings/api",
    placeholder: "sb_publishable_...",
    current:     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  },
  {
    key:         "REMOVEBG_API_KEY",
    label:       "Remove.bg API Key",
    description: "Digunakan untuk menghapus background foto di image editor saat upload project.",
    docsUrl:     "https://www.remove.bg/api",
    placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    current:     "••••••••••••••••••••••••",  // server-only, tidak expose ke client
  },
];

function maskValue(val: string): string {
  if (!val || val.startsWith("••")) return val;
  if (val.length <= 8) return "••••••••";
  return val.slice(0, 6) + "••••••••" + val.slice(-4);
}

function ApiCard({ entry }: { entry: ApiEntry }) {
  const [show,   setShow  ] = useState(false);
  const [value,  setValue ] = useState(entry.current);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved ] = useState(false);

  const displayValue = show ? value : maskValue(value);

  async function handleSave() {
    setSaving(true);
    // API keys harus di-update via Vercel dashboard (environment variables)
    // Di sini kita simpan ke site_settings sebagai referensi untuk admin
    try {
      await fetch("/api/update-setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: `api_key_${entry.key}`, value: { value } }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // silently fail
    }
    setSaving(false);
  }

  return (
    <div className="card-dark rounded-xl border border-dark-800 p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-dark-100">{entry.label}</h3>
          <p className="text-[10px] font-mono text-blood-700 mt-0.5">{entry.key}</p>
        </div>
        <a href={entry.docsUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-dark-600 hover:text-blood-400 font-mono transition-colors shrink-0">
          Dapatkan Key <ExternalLink size={10} />
        </a>
      </div>

      <p className="text-xs text-dark-500 mb-3">{entry.description}</p>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={show ? "text" : "password"}
            value={displayValue}
            onChange={e => setValue(e.target.value)}
            placeholder={entry.placeholder}
            className="w-full px-3 py-2 pr-9 rounded-lg bg-dark-900 border border-dark-800 text-dark-200 text-xs font-mono focus:outline-none focus:border-blood-700 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-600 hover:text-dark-400 transition-colors"
          >
            {show ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blood-700 hover:bg-blood-600 disabled:opacity-50 text-white text-xs font-medium transition-colors shrink-0"
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : saved ? <Check size={11} /> : <Save size={11} />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      {entry.key === "REMOVEBG_API_KEY" && (
        <p className="text-[10px] text-dark-700 font-mono mt-2">
          {`// Server-side key. Update via Vercel Dashboard → Settings → Environment Variables`}
        </p>
      )}
    </div>
  );
}

export function ApiSettings() {
  return (
    <div className="max-w-2xl space-y-4">
      {/* Info banner */}
      <div className="px-4 py-3 rounded-lg border border-dark-700 bg-dark-900/50 text-xs text-dark-400 font-mono">
        {`// Untuk update API key yang aktif, perlu update di `}
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer"
          className="text-blood-500 hover:text-blood-400 underline">Vercel Dashboard</a>
        {` → Settings → Environment Variables, lalu redeploy.`}
      </div>

      {API_ENTRIES.map(entry => (
        <ApiCard key={entry.key} entry={entry} />
      ))}

      {/* Project info */}
      <div className="card-dark rounded-xl border border-dark-800 p-5">
        <h3 className="text-xs font-mono text-dark-500 uppercase tracking-widest mb-4">Info Project</h3>
        <div className="space-y-2 text-xs font-mono">
          {[
            { label: "Framework",  value: "Next.js 15.5.x" },
            { label: "Database",   value: "Supabase (PostgreSQL)" },
            { label: "Hosting",    value: "Vercel" },
            { label: "Remove BG",  value: "remove.bg API" },
            { label: "Musik",      value: "Supabase Storage (bucket: music)" },
            { label: "Foto Hero",  value: "Supabase Storage (bucket: hero)" },
            { label: "Project Img","value": "Supabase Storage (bucket: project-images)" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-dark-600 w-28 shrink-0">{label}</span>
              <span className="text-dark-300">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
