"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, Music2, Play, Pause, Loader2, Check } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin-client";

interface MusicManagerProps {
  currentUrl: string;
}

export function MusicManager({ currentUrl }: MusicManagerProps) {
  const [url,       setUrl      ] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting ] = useState(false);
  const [status,    setStatus   ] = useState<"idle"|"saved"|"error">("idle");
  const [playing,   setPlaying  ] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) { alert("File harus audio (MP3, WAV, dll)"); return; }
    if (file.size > 20 * 1024 * 1024) { alert("Maks 20MB"); return; }

    setUploading(true);
    const supabase = createAdminClient();

    // Delete old file
    if (url) {
      const oldPath = url.split("/music/")[1];
      if (oldPath) await supabase.storage.from("music").remove([oldPath]);
    }

    const ext  = file.name.split(".").pop();
    const path = `bgm-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("music").upload(path, file, { upsert: true });
    if (uploadErr) { alert("Upload gagal: " + uploadErr.message); setUploading(false); return; }

    const { data: pub } = supabase.storage.from("music").getPublicUrl(path);
    const newUrl = pub.publicUrl;

    await supabase.from("site_settings").upsert({ key: "music", value: { url: newUrl } }, { onConflict: "key" });

    setUrl(newUrl);
    setUploading(false);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2500);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete() {
    if (!url) return;
    setDeleting(true);
    const supabase = createAdminClient();
    const path = url.split("/music/")[1];
    if (path) await supabase.storage.from("music").remove([path]);
    await supabase.from("site_settings").upsert({ key: "music", value: { url: "" } }, { onConflict: "key" });
    setUrl("");
    setDeleting(false);
    if (audioRef.current) { audioRef.current.pause(); setPlaying(false); }
  }

  function togglePlay() {
    if (!url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.loop = true;
    }
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else         { audioRef.current.play();  setPlaying(true);  }
  }

  const filename = url ? url.split("/").pop() ?? "music file" : null;

  return (
    <div className="max-w-lg space-y-6">
      {/* Current music */}
      <div className="card-dark rounded-xl border border-dark-800 p-5">
        <h2 className="text-xs font-mono text-dark-500 uppercase tracking-widest mb-4">
          File Saat Ini
        </h2>

        {url ? (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blood-950 border border-blood-900 flex items-center justify-center shrink-0">
              <Music2 size={16} className="text-blood-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-dark-200 font-medium truncate">{filename}</p>
              <p className="text-[10px] text-dark-600 font-mono mt-0.5">Aktif — diputar di website</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-blood-700 hover:bg-blood-600 flex items-center justify-center text-white transition-colors"
                aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="w-8 h-8 rounded-full bg-dark-800 hover:bg-blood-950 hover:border-blood-800 border border-dark-700 flex items-center justify-center text-dark-500 hover:text-blood-400 transition-colors">
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-dark-600">
            <Music2 size={16} />
            <span className="text-sm font-mono">{`// belum ada musik yang diupload`}</span>
          </div>
        )}
      </div>

      {/* Upload new */}
      <div className="card-dark rounded-xl border border-dark-800 p-5">
        <h2 className="text-xs font-mono text-dark-500 uppercase tracking-widest mb-4">
          {url ? "Ganti Musik" : "Upload Musik"}
        </h2>
        <p className="text-xs text-dark-600 mb-4">
          Format: MP3, WAV, OGG · Maks 20MB · File lama akan otomatis terhapus
        </p>
        <label className="flex items-center gap-2 w-fit px-5 py-2.5 rounded-lg bg-blood-700 hover:bg-blood-600 text-white text-sm font-medium cursor-pointer transition-colors">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? "Uploading..." : url ? "Ganti File" : "Pilih File MP3"}
          <input ref={fileRef} type="file" accept="audio/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
        {status === "saved" && (
          <div className="flex items-center gap-2 mt-3 text-xs text-green-400 font-mono">
            <Check size={12} /> Musik berhasil diupdate!
          </div>
        )}
      </div>

      <p className="text-xs text-dark-600 font-mono">
        {`// musik diputar otomatis (muted) saat halaman dibuka. User bisa klik play di navbar.`}
      </p>
    </div>
  );
}
