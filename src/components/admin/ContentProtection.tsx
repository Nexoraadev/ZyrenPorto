"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MousePointerBan,
  EyeOff,
  TextSelect,
  Terminal,
  ShieldCheck,
  ShieldOff,
  Loader2,
  ImageOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

interface ProtectionSettings {
  masterEnabled: boolean;
  disableRightClick: boolean;
  blurOnLeave: boolean;
  disableSelection: boolean;
  blockDevTools: boolean;
  disableImageInteraction: boolean;
}

const defaultSettings: ProtectionSettings = {
  masterEnabled: false,
  disableRightClick: false,
  blurOnLeave: false,
  disableSelection: false,
  blockDevTools: false,
  disableImageInteraction: false,
};

const features = [
  {
    key: "disableRightClick" as const,
    icon: MousePointerBan,
    label: "Nonaktifkan klik kanan",
    desc: "Mencegah menu konteks muncul saat pengunjung klik kanan.",
  },
  {
    key: "blurOnLeave" as const,
    icon: EyeOff,
    label: "Blur saat kursor keluar",
    desc: "Halaman otomatis diblur ketika kursor meninggalkan jendela browser.",
  },
  {
    key: "disableImageInteraction" as const,
    icon: ImageOff,
    label: "Proteksi gambar (anti drag & search)",
    desc: "Mencegah gambar di-drag, di-klik kanan, dan tombol 'Search image' Edge/Chrome.",
  },
  {
    key: "disableSelection" as const,
    icon: TextSelect,
    label: "Nonaktifkan seleksi teks",
    desc: "Konten tidak bisa diseleksi, disalin, atau dipotong.",
  },
  {
    key: "blockDevTools" as const,
    icon: Terminal,
    label: "Blokir shortcut DevTools",
    desc: "Memblokir F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P.",
  },
];

export function ContentProtection() {
  const [settings, setSettings] = useState<ProtectionSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load dari Supabase
  useEffect(() => {
    fetch("/api/protection-settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = useCallback(async (updated: ProtectionSettings) => {
    setSettings(updated);
    setSaving(true);
    const supabase = createAdminClient();
    await supabase
      .from("site_settings")
      .upsert({ key: "content_protection", value: updated }, { onConflict: "key" });
    setSaving(false);
  }, []);

  async function toggleMaster() {
    const next = !settings.masterEnabled;
    await save({
      ...settings,
      masterEnabled: next,
      disableRightClick: next,
      blurOnLeave: next,
      disableSelection: next,
      blockDevTools: next,
      disableImageInteraction: next,
    });
  }

  async function toggleFeature(
    key: keyof Omit<ProtectionSettings, "masterEnabled">
  ) {
    const updated = { ...settings, [key]: !settings[key] };
    const anyOn = features.some((f) => updated[f.key]);
    updated.masterEnabled = anyOn;
    await save(updated);
  }

  if (loading) {
    return (
      <div className="mt-10 flex items-center gap-2 text-dark-600 text-sm font-mono">
        <Loader2 size={14} className="animate-spin" />
        Memuat settings...
      </div>
    );
  }

  const activeCount = features.filter((f) => settings[f.key]).length;

  return (
    <div className="mt-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-mono text-dark-500 uppercase tracking-widest flex items-center gap-2">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              settings.masterEnabled
                ? "bg-blood-500 animate-pulse"
                : "bg-dark-700"
            )}
          />
          Content Protection
        </h2>
        <span className="text-[10px] font-mono text-dark-600 flex items-center gap-1">
          {saving && <Loader2 size={10} className="animate-spin" />}
          {activeCount}/{features.length} aktif
        </span>
      </div>

      <div className="card-dark rounded-xl border border-dark-800 overflow-hidden">
        {/* Master toggle */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800 bg-dark-900/40">
          <div className="flex items-center gap-3">
            {settings.masterEnabled ? (
              <ShieldCheck size={16} className="text-blood-400" />
            ) : (
              <ShieldOff size={16} className="text-dark-600" />
            )}
            <div>
              <p className="text-sm font-medium text-dark-200">
                Kontrol semua fitur
              </p>
              <p className="text-xs text-dark-600">
                Aktifkan atau matikan semua proteksi sekaligus
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-dark-600">
              {settings.masterEnabled ? "Aktif" : "Nonaktif"}
            </span>
            <button
              onClick={toggleMaster}
              disabled={saving}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all disabled:opacity-50",
                settings.masterEnabled
                  ? "bg-blood-700 hover:bg-blood-600 text-white"
                  : "bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-dark-200"
              )}
            >
              {settings.masterEnabled ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>
        </div>

        {/* Individual toggles */}
        {features.map(({ key, icon: Icon, label, desc }, i) => (
          <div
            key={key}
            className={cn(
              "flex items-center justify-between px-5 py-4 transition-colors hover:bg-dark-900/30",
              i < features.length - 1 && "border-b border-dark-900"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center border transition-colors",
                  settings[key]
                    ? "bg-blood-950 border-blood-900"
                    : "bg-dark-900 border-dark-800"
                )}
              >
                <Icon
                  size={14}
                  className={settings[key] ? "text-blood-400" : "text-dark-600"}
                />
              </div>
              <div>
                <p
                  className={cn(
                    "text-sm font-medium transition-colors",
                    settings[key] ? "text-dark-100" : "text-dark-400"
                  )}
                >
                  {label}
                </p>
                <p className="text-xs text-dark-600 mt-0.5">{desc}</p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              role="switch"
              aria-checked={settings[key]}
              disabled={saving}
              onClick={() => toggleFeature(key)}
              className={cn(
                "relative w-10 h-5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blood-500 disabled:opacity-50",
                settings[key] ? "bg-blood-600" : "bg-dark-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
                  settings[key] ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        ))}

        {/* Footer note */}
        <div className="px-5 py-3 border-t border-dark-900 bg-dark-900/20">
          <p className="text-[10px] text-dark-700 font-mono">
            {`// Settings disimpan ke database — aktif di semua browser & device.`}
          </p>
          <p className="text-[10px] text-dark-700 font-mono mt-0.5">
            {`// Screenshot via OS tetap tidak bisa dicegah.`}
          </p>
        </div>
      </div>
    </div>
  );
}
