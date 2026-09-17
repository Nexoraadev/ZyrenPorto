"use client";

import { useState } from "react";
import { createAdminClient } from "@/lib/supabase/admin-client";
import {
  Mail, MessageSquare, CheckCircle, XCircle,
  Loader2, Send, Settings, Key, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageSettingsProps {
  initialEmail: string;
  initialWa:    string;
}

type TestStatus = "idle" | "testing" | "ok" | "fail";

export function MessageSettings({ initialEmail, initialWa }: MessageSettingsProps) {
  const [email,        setEmail       ] = useState(initialEmail);
  const [waNumber,     setWaNumber    ] = useState(initialWa);
  const [saving,       setSaving      ] = useState(false);
  const [saved,        setSaved       ] = useState(false);

  const [emailTest,    setEmailTest   ] = useState("");
  const [waTest,       setWaTest      ] = useState("");
  const [emailStatus,  setEmailStatus ] = useState<TestStatus>("idle");
  const [waStatus,     setWaStatus    ] = useState<TestStatus>("idle");
  const [emailMsg,     setEmailMsg    ] = useState("");
  const [waMsg,        setWaMsg       ] = useState("");

  const inputCls = "w-full px-4 py-2.5 rounded-lg bg-dark-900 border border-dark-800 text-dark-200 placeholder-dark-700 text-sm focus:outline-none focus:border-blood-700 transition-colors";
  const labelCls = "block text-xs font-mono text-dark-500 mb-1.5";

  // Save settings to Supabase
  async function handleSave() {
    setSaving(true);
    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("site_settings").select("value").eq("key", "contact_info").single() as { data: { value: Record<string, string> } | null };
    const current = existing?.value ?? {};
    await supabase.from("site_settings").upsert({
      key:   "contact_info",
      value: { ...current, email, wa_number: waNumber },
    }, { onConflict: "key" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // Test notification
  async function handleTest(channel: "email" | "wa") {
    const target = channel === "email" ? emailTest : waTest;
    if (!target.trim()) {
      if (channel === "email") { setEmailMsg("Masukkan email tujuan test."); setEmailStatus("fail"); }
      else                     { setWaMsg("Masukkan nomor WA tujuan test.");  setWaStatus("fail");  }
      return;
    }

    if (channel === "email") { setEmailStatus("testing"); setEmailMsg(""); }
    else                     { setWaStatus("testing");    setWaMsg("");    }

    try {
      const res  = await fetch("/api/test-notification", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ channel, target: target.trim() }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        if (channel === "email") { setEmailStatus("fail"); setEmailMsg(json.error); }
        else                     { setWaStatus("fail");    setWaMsg(json.error);    }
      } else {
        if (channel === "email") { setEmailStatus("ok"); setEmailMsg(json.message); }
        else                     { setWaStatus("ok");    setWaMsg(json.message);    }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      if (channel === "email") { setEmailStatus("fail"); setEmailMsg(msg); }
      else                     { setWaStatus("fail");    setWaMsg(msg);    }
    }

    setTimeout(() => {
      if (channel === "email") setEmailStatus("idle");
      else                     setWaStatus("idle");
    }, 5000);
  }

  function StatusIcon({ status }: { status: TestStatus }) {
    if (status === "testing") return <Loader2 size={14} className="animate-spin text-dark-500" />;
    if (status === "ok")      return <CheckCircle size={14} className="text-green-500" />;
    if (status === "fail")    return <XCircle size={14} className="text-blood-500" />;
    return null;
  }

  return (
    <div className="max-w-2xl space-y-6">

      {/* ── Info ── */}
      <div className="card-dark rounded-xl border border-dark-800 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-blood-600 uppercase tracking-widest">
          <Info size={13} /> Cara Kerja
        </div>
        <div className="space-y-2 text-xs text-dark-500 leading-relaxed">
          <p>• Setiap pesan dari form contact akan disimpan ke database dan bisa dilihat di <span className="text-dark-300">Messages → Inbox</span></p>
          <p>• Notifikasi dikirim ke <span className="text-dark-300">email</span> (via Resend) dan <span className="text-dark-300">WhatsApp</span> (via Fonnte) secara bersamaan</p>
          <p>• Gunakan tombol <span className="text-dark-300">Test</span> di bawah untuk memastikan notifikasi berfungsi sebelum publik</p>
        </div>
      </div>

      {/* ── API Keys Info ── */}
      <div className="card-dark rounded-xl border border-dark-800 p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-blood-600 uppercase tracking-widest">
          <Key size={13} /> API Keys & Status
        </div>
        {[
          { label: "Resend API Key",  envKey: "RESEND_API_KEY",  hint: "resend.com — untuk kirim email notifikasi"                    },
          { label: "Fonnte Token",    envKey: "FONNTE_TOKEN",    hint: "fonnte.com — untuk kirim WA notifikasi"                       },
        ].map(({ label, envKey, hint }) => (
          <div key={envKey} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blood-600 mt-1.5 shrink-0" />
            <div>
              <p className="text-sm text-dark-200 font-medium">{label}</p>
              <p className="text-[10px] font-mono text-dark-600 mt-0.5">{envKey} — {hint}</p>
              <p className="text-[10px] text-dark-700 font-mono mt-0.5">
                Tambahkan di Vercel → Settings → Environment Variables
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Email Settings ── */}
      <div className="card-dark rounded-xl border border-dark-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-800 bg-dark-900/40 flex items-center gap-2">
          <Mail size={14} className="text-blood-500" />
          <h2 className="text-xs font-mono text-blood-600 uppercase tracking-widest">Email Notifikasi</h2>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className={labelCls}>Email penerima notifikasi</label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              className={inputCls} placeholder="ohmyliinnn@gmail.com" type="email" />
            <p className="text-[10px] text-dark-600 font-mono mt-1.5">
              Email ini yang akan menerima notifikasi setiap ada pesan baru
            </p>
          </div>

          {/* Test email */}
          <div className="border-t border-dark-800 pt-4">
            <label className={labelCls}>Test kirim ke email</label>
            <div className="flex gap-2">
              <input value={emailTest} onChange={e => setEmailTest(e.target.value)}
                className={`${inputCls} flex-1`} placeholder="email@contoh.com" type="email"
                onKeyDown={e => e.key === "Enter" && handleTest("email")} />
              <button onClick={() => handleTest("email")}
                disabled={emailStatus === "testing"}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blood-700 hover:bg-blood-600 disabled:opacity-50 text-white text-xs font-medium transition-colors shrink-0">
                {emailStatus === "testing"
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Send size={12} />
                }
                Test
              </button>
            </div>
            {emailMsg && (
              <div className={cn("flex items-center gap-2 mt-2 text-xs font-mono",
                emailStatus === "ok" ? "text-green-400" : "text-blood-400")}>
                <StatusIcon status={emailStatus} />
                {emailMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── WhatsApp Settings ── */}
      <div className="card-dark rounded-xl border border-dark-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-800 bg-dark-900/40 flex items-center gap-2">
          <MessageSquare size={14} className="text-blood-500" />
          <h2 className="text-xs font-mono text-blood-600 uppercase tracking-widest">WhatsApp Notifikasi</h2>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className={labelCls}>Nomor WA penerima notifikasi</label>
            <input value={waNumber} onChange={e => setWaNumber(e.target.value)}
              className={inputCls} placeholder="628xxxxxxxxxx" />
            <p className="text-[10px] text-dark-600 font-mono mt-1.5">
              Format: 628xxxxxxxxxx (tanpa + atau 0 di depan). Contoh: 6281234567890
            </p>
          </div>

          {/* Test WA */}
          <div className="border-t border-dark-800 pt-4">
            <label className={labelCls}>Test kirim ke nomor WA</label>
            <div className="flex gap-2">
              <input value={waTest} onChange={e => setWaTest(e.target.value)}
                className={`${inputCls} flex-1`} placeholder="628xxxxxxxxxx"
                onKeyDown={e => e.key === "Enter" && handleTest("wa")} />
              <button onClick={() => handleTest("wa")}
                disabled={waStatus === "testing"}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blood-700 hover:bg-blood-600 disabled:opacity-50 text-white text-xs font-medium transition-colors shrink-0">
                {waStatus === "testing"
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Send size={12} />
                }
                Test
              </button>
            </div>
            {waMsg && (
              <div className={cn("flex items-center gap-2 mt-2 text-xs font-mono",
                waStatus === "ok" ? "text-green-400" : "text-blood-400")}>
                <StatusIcon status={waStatus} />
                {waMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blood-700 hover:bg-blood-600 disabled:opacity-50 text-white font-medium text-sm transition-colors">
        {saving ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                : saved ? <><Settings size={14} /> Tersimpan!</>
                : <><Settings size={14} /> Simpan Pengaturan</>}
      </button>
    </div>
  );
}
