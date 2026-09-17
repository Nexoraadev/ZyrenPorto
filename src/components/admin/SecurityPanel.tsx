"use client";

import { useState, useEffect } from "react";
import {
  MousePointerBan,
  EyeOff,
  TextSelect,
  Terminal,
  ShieldCheck,
  ShieldOff,
  Shield,
} from "lucide-react";
import SecurityGuard, {
  type SecuritySettings,
  DEFAULT_SECURITY,
  STORAGE_KEY,
  loadSecuritySettings,
  saveSecuritySettings,
} from "./SecurityGuard";

const FEATURES: {
  key: keyof SecuritySettings;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    key: "disable_right_click",
    label: "Nonaktifkan klik kanan",
    description: "Mencegah menu konteks muncul saat pengunjung klik kanan.",
    icon: MousePointerBan,
  },
  {
    key: "blur_on_mouse_leave",
    label: "Blur saat kursor keluar",
    description: "Halaman otomatis diblur ketika kursor meninggalkan jendela browser.",
    icon: EyeOff,
  },
  {
    key: "disable_text_select",
    label: "Nonaktifkan seleksi teks",
    description: "Konten tidak bisa diseleksi, disalin, atau dipotong.",
    icon: TextSelect,
  },
  {
    key: "disable_devtools_shortcuts",
    label: "Blokir shortcut DevTools",
    description: "Memblokir F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P.",
    icon: Terminal,
  },
];

export default function SecurityPanel() {
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SECURITY);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage after mount (avoid SSR mismatch)
  useEffect(() => {
    setSettings(loadSecuritySettings());
    setMounted(true);

    // Listen for changes from other tabs/components
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSettings(loadSecuritySettings());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const activeCount = Object.values(settings).filter(Boolean).length;
  const totalCount = FEATURES.length;
  const allActive = activeCount === totalCount;
  const noneActive = activeCount === 0;

  const handleToggle = (key: keyof SecuritySettings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSecuritySettings(next);
  };

  const handleToggleAll = (enable: boolean) => {
    const next = Object.fromEntries(
      Object.keys(settings).map((k) => [k, enable])
    ) as SecuritySettings;
    setSettings(next);
    saveSecuritySettings(next);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mount the guard — applies settings to the current page */}
      <SecurityGuard settings={settings} />

      <section className="mt-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-blood-500" />
            <h2 className="text-sm font-mono text-dark-500 uppercase tracking-widest">
              Content Protection
            </h2>
          </div>
          <span
            className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
              noneActive
                ? "bg-dark-900 border-dark-800 text-dark-600"
                : allActive
                ? "bg-blood-950 border-blood-900 text-blood-400"
                : "bg-dark-900 border-dark-800 text-dark-400"
            }`}
          >
            {noneActive
              ? "Semua nonaktif"
              : allActive
              ? "Semua aktif"
              : `${activeCount}/${totalCount} aktif`}
          </span>
        </div>

        {/* Toggle all bar */}
        <div className="card-dark rounded-xl border border-dark-800 px-5 py-4 flex items-center justify-between gap-4 mb-3">
          <div>
            <p className="text-sm font-medium text-dark-200">Kontrol semua fitur</p>
            <p className="text-xs text-dark-600 font-mono mt-0.5">
              Aktifkan atau matikan semua proteksi sekaligus
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleToggleAll(false)}
              disabled={noneActive}
              className="flex items-center gap-1.5 rounded-lg border border-dark-700 px-3 py-1.5 text-xs font-medium text-dark-500 hover:text-dark-200 hover:border-dark-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ShieldOff size={12} />
              Matikan
            </button>
            <button
              onClick={() => handleToggleAll(true)}
              disabled={allActive}
              className="flex items-center gap-1.5 rounded-lg bg-blood-700 hover:bg-blood-600 px-3 py-1.5 text-xs font-medium text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ShieldCheck size={12} />
              Aktifkan
            </button>
          </div>
        </div>

        {/* Individual feature toggles */}
        <div className="grid grid-cols-1 gap-3">
          {FEATURES.map(({ key, label, description, icon: Icon }) => {
            const isActive = settings[key];
            return (
              <div
                key={key}
                className={`card-dark rounded-xl border px-5 py-4 flex items-center gap-4 transition-all ${
                  isActive ? "border-blood-900 bg-blood-950/30" : "border-dark-800"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? "bg-blood-950 border-blood-900"
                      : "bg-dark-900 border-dark-800"
                  }`}
                >
                  <Icon
                    size={15}
                    className={isActive ? "text-blood-400" : "text-dark-500"}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium transition-colors ${
                      isActive ? "text-dark-100" : "text-dark-400"
                    }`}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-dark-600 mt-0.5 leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => handleToggle(key, !isActive)}
                  role="switch"
                  aria-checked={isActive}
                  aria-label={`Toggle ${label}`}
                  className={`relative shrink-0 h-6 w-11 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blood-700/40 ${
                    isActive ? "bg-blood-700" : "bg-dark-800"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                      isActive ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <p className="mt-3 text-[11px] text-dark-700 font-mono leading-relaxed">
          <span>{"// Proteksi berjalan di sisi client. Screenshot via OS tetap tidak bisa dicegah."}</span>
          <br />
          <span>{"// Settings disimpan di browser ini (localStorage)."}</span>
        </p>
      </section>
    </>
  );
}
