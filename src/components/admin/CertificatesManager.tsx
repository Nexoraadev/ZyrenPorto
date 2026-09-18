"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Trash2, ExternalLink, Plus, X, Check, Loader2,
  Award, BadgeCheck, Link as LinkIcon, Upload, FileText,
  Image as ImageIcon, File,
} from "lucide-react";
import type { Certificate } from "@/types/database";

interface CertificatesManagerProps {
  initialCerts: Certificate[];
}

type InputMode = "upload" | "link";

const EMPTY_FORM = {
  title: "",
  issuer: "",
  issue_date: "",
  description: "",
  linkedin_url: "",
};

async function callApi(action: string, payload: Record<string, unknown>) {
  const res = await fetch("/api/certificates-save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "API error");
  return json;
}

async function uploadFile(file: File): Promise<{ url: string; path: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("bucket", "certificates");
  const res = await fetch("/api/upload-asset", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Upload failed");
  return { url: json.url, path: json.path };
}

function detectFileType(file: File): "image" | "pdf" | "other" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  return "other";
}

function detectPlatform(url: string): "linkedin" | "credly" | "coursera" | "google" | "dicoding" | "other" {
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("credly.com")) return "credly";
  if (url.includes("coursera.org")) return "coursera";
  if (url.includes("google.com") || url.includes("grow.google") || url.includes("cloud.google")) return "google";
  if (url.includes("dicoding.com")) return "dicoding";
  return "other";
}

const PLATFORM_META: Record<string, { label: string; color: string; border: string; dot: string; bg: string }> = {
  linkedin:  { label: "LinkedIn",   color: "text-[#0A66C2]",  border: "border-[#0A66C2]/30",  dot: "bg-[#0A66C2]",  bg: "from-[#0A66C2]/10" },
  credly:    { label: "Credly",     color: "text-[#FF6B00]",  border: "border-[#FF6B00]/30",  dot: "bg-[#FF6B00]",  bg: "from-[#FF6B00]/10" },
  coursera:  { label: "Coursera",   color: "text-[#0056D2]",  border: "border-[#0056D2]/30",  dot: "bg-[#0056D2]",  bg: "from-[#0056D2]/10" },
  google:    { label: "Google",     color: "text-[#4285F4]",  border: "border-[#4285F4]/30",  dot: "bg-[#4285F4]",  bg: "from-[#4285F4]/10" },
  dicoding:  { label: "Dicoding",   color: "text-[#4FC3F7]",  border: "border-[#4FC3F7]/30",  dot: "bg-[#4FC3F7]",  bg: "from-[#4FC3F7]/10" },
  other:     { label: "Sertifikat", color: "text-blood-500",  border: "border-blood-900/30",   dot: "bg-blood-500",  bg: "from-blood-900/15" },
};

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch { return false; }
}

export function CertificatesManager({ initialCerts }: CertificatesManagerProps) {
  const [certs, setCerts] = useState<Certificate[]>(initialCerts);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<InputMode>("link");
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputCls =
    "w-full px-3 py-2 rounded-lg bg-dark-950 border border-dark-800 text-dark-200 placeholder-dark-700 text-sm focus:outline-none focus:border-blood-700 transition-colors";
  const labelCls = "block text-xs font-mono text-dark-500 mb-1";

  const urlPlatform = form.linkedin_url && isValidUrl(form.linkedin_url)
    ? detectPlatform(form.linkedin_url) : null;
  const urlMeta = urlPlatform ? PLATFORM_META[urlPlatform] : null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && f.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setFile(null);
    setFilePreview(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.issuer) {
      setError("Judul dan Issuer wajib diisi.");
      return;
    }
    if (mode === "link" && form.linkedin_url && !isValidUrl(form.linkedin_url)) {
      setError("URL tidak valid. Pastikan diawali https://");
      return;
    }
    if (mode === "upload" && !file) {
      setError("Pilih file untuk diupload.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let file_url: string | null = null;
      let file_storage_path: string | null = null;
      let file_type: string | null = null;

      if (mode === "upload" && file) {
        const { url, path } = await uploadFile(file);
        file_url = url;
        file_storage_path = path;
        file_type = detectFileType(file);
      }

      const certData = {
        title: form.title,
        issuer: form.issuer,
        issue_date: form.issue_date || null,
        description: form.description.trim() || null,
        file_url,
        file_storage_path,
        file_type,
        linkedin_url: mode === "link" ? (form.linkedin_url.trim() || null) : null,
        order_index: certs.length,
        category: null as string | null,
      };

      const result = await callApi("upsert_certificate", { certData, certId: null });

      const newCert: Certificate = {
        id: result.id,
        created_at: new Date().toISOString(),
        ...certData,
      };

      setCerts((prev) => [newCert, ...prev]);
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(cert: Certificate) {
    if (!confirm(`Hapus sertifikat "${cert.title}"?`)) return;
    try {
      await callApi("delete_certificate", { certId: cert.id });
      setCerts((prev) => prev.filter((c) => c.id !== cert.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-dark-100">Sertifikat</h2>
          <p className="text-xs font-mono text-dark-500 mt-0.5">{`// ${certs.length} sertifikat tersimpan`}</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blood-700 hover:bg-blood-600 text-white text-sm font-medium transition-colors"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Batal" : "Tambah Sertifikat"}
        </button>
      </div>

      {/* ─── ADD FORM ─────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-dark-800 rounded-xl overflow-hidden bg-dark-900/50">
          {/* Mode toggle */}
          <div className="flex border-b border-dark-800">
            <button
              type="button"
              onClick={() => { setMode("link"); resetForm(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono font-semibold transition-colors ${
                mode === "link"
                  ? "bg-dark-800 text-dark-100 border-b-2 border-blood-600"
                  : "text-dark-500 hover:text-dark-300"
              }`}
            >
              <LinkIcon size={13} />
              Pakai Link
            </button>
            <button
              type="button"
              onClick={() => { setMode("upload"); resetForm(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono font-semibold transition-colors ${
                mode === "upload"
                  ? "bg-dark-800 text-dark-100 border-b-2 border-blood-600"
                  : "text-dark-500 hover:text-dark-300"
              }`}
            >
              <Upload size={13} />
              Upload File
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Shared fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Judul Sertifikat *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="contoh: AWS Certified Solutions Architect"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Issued by *</label>
                <input
                  value={form.issuer}
                  onChange={(e) => setForm((p) => ({ ...p, issuer: e.target.value }))}
                  placeholder="contoh: Amazon Web Services"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Tanggal Terbit</label>
                <input
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setForm((p) => ({ ...p, issue_date: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            {/* ── MODE: LINK ─────────────────────────────── */}
            {mode === "link" && (
              <div>
                <label className={labelCls}>
                  Link Sertifikat
                  <span className="text-dark-700 ml-2">— LinkedIn, Credly, Dicoding, dsb.</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={form.linkedin_url}
                    onChange={(e) => setForm((p) => ({ ...p, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/.../details/certifications/..."
                    className={`${inputCls} ${urlMeta ? `${urlMeta.border} pr-28` : ""}`}
                  />
                  {urlMeta && (
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-dark-900 border ${urlMeta.border} pointer-events-none`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${urlMeta.dot}`} />
                      <span className={`text-[10px] font-mono font-semibold ${urlMeta.color}`}>{urlMeta.label}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-dark-600 mt-1.5 font-mono">
                  Ditampilkan sebagai tombol verifikasi. Tidak ada file diupload.
                </p>
              </div>
            )}

            {/* ── MODE: UPLOAD ───────────────────────────── */}
            {mode === "upload" && (
              <div className="space-y-4">
                {/* Drop zone */}
                <div>
                  <label className={labelCls}>File Sertifikat * <span className="text-dark-700">(foto, PDF, atau file lain)</span></label>
                  <label
                    className={`group flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed border-dark-800 hover:border-blood-700/50 bg-dark-950/50 hover:bg-dark-950 transition-colors cursor-pointer px-4 py-6 ${file ? "border-blood-800/50" : ""}`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {/* Preview */}
                    {filePreview ? (
                      <div className="relative w-full h-36 rounded-lg overflow-hidden">
                        <Image src={filePreview} alt="preview" fill className="object-contain" />
                      </div>
                    ) : file ? (
                      <div className="flex items-center gap-3 text-dark-400">
                        {file.type === "application/pdf" ? (
                          <FileText size={28} className="text-blood-400" />
                        ) : (
                          <File size={28} className="text-dark-500" />
                        )}
                        <div>
                          <p className="text-sm font-mono text-dark-200">{file.name}</p>
                          <p className="text-xs text-dark-600">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-3 text-dark-600 group-hover:text-dark-500 transition-colors">
                          <ImageIcon size={22} />
                          <FileText size={22} />
                          <File size={22} />
                        </div>
                        <p className="text-xs font-mono text-dark-500 text-center">
                          Klik untuk pilih file <br />
                          <span className="text-dark-700">JPG, PNG, WebP, PDF, DOCX, PPT</span>
                        </p>
                      </>
                    )}
                    {file && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setFile(null); setFilePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                        className="text-[10px] font-mono text-dark-600 hover:text-blood-400 transition-colors"
                      >
                        Ganti file
                      </button>
                    )}
                  </label>
                </div>

                {/* Juga boleh tambah link verifikasi */}
                <div>
                  <label className={labelCls}>
                    Link Verifikasi <span className="text-dark-700">(opsional — LinkedIn, Credly, dsb.)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={form.linkedin_url}
                      onChange={(e) => setForm((p) => ({ ...p, linkedin_url: e.target.value }))}
                      placeholder="https://linkedin.com/in/..."
                      className={`${inputCls} ${urlMeta ? `${urlMeta.border} pr-28` : ""}`}
                    />
                    {urlMeta && (
                      <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-dark-900 border ${urlMeta.border} pointer-events-none`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${urlMeta.dot}`} />
                        <span className={`text-[10px] font-mono font-semibold ${urlMeta.color}`}>{urlMeta.label}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Deskripsi <span className="text-dark-700">(opsional)</span></label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Contoh: Sertifikat ini diperoleh setelah menyelesaikan kursus UI/UX intensif selama 3 bulan..."
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-blood-400 font-mono bg-blood-950/50 border border-blood-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blood-700 hover:bg-blood-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {loading ? (mode === "upload" ? "Mengupload..." : "Menyimpan...") : "Simpan Sertifikat"}
            </button>
          </div>
        </form>
      )}

      {/* ─── CERT LIST ────────────────────────────────────────── */}
      {certs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-dark-800 rounded-xl">
          <Award size={32} className="text-dark-700 mx-auto mb-3" />
          <p className="text-sm text-dark-600">Belum ada sertifikat. Tambahkan satu!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {certs.map((cert) => {
            const platform = cert.linkedin_url ? detectPlatform(cert.linkedin_url) : "other";
            const meta = PLATFORM_META[platform];
            const hasFile = !!cert.file_url;
            const hasLink = !!cert.linkedin_url;

            return (
              <div
                key={cert.id}
                className={`flex flex-col gap-2 p-4 rounded-xl border ${hasFile ? "border-dark-700" : meta.border} bg-dark-900/30 hover:bg-dark-900/60 transition-colors`}
              >
                {/* Thumbnail kecil kalau ada file gambar */}
                {hasFile && cert.file_type === "image" && (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden bg-dark-800">
                    <Image src={cert.file_url!} alt={cert.title} fill className="object-cover" />
                  </div>
                )}
                {hasFile && cert.file_type === "pdf" && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800/60 border border-dark-700">
                    <FileText size={14} className="text-blood-400 flex-shrink-0" />
                    <span className="text-xs font-mono text-dark-300 truncate">PDF tersimpan</span>
                  </div>
                )}
                {hasFile && cert.file_type === "other" && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800/60 border border-dark-700">
                    <File size={14} className="text-dark-400 flex-shrink-0" />
                    <span className="text-xs font-mono text-dark-300 truncate">File tersimpan</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasFile ? "bg-blood-500" : meta.dot}`} />
                      <p className="text-sm font-medium text-dark-100 truncate">{cert.title}</p>
                    </div>
                    <p className={`text-xs font-mono ${hasFile ? "text-blood-500" : meta.color} ml-3.5`}>
                      {cert.issuer}
                      {cert.issue_date && (
                        <span className="text-dark-600 ml-1">
                          · {new Date(cert.issue_date).toLocaleDateString("id-ID", { year: "numeric", month: "short" })}
                        </span>
                      )}
                    </p>
                    {cert.description && (
                      <p className="text-xs text-dark-600 ml-3.5 mt-1 line-clamp-2">{cert.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(cert)}
                    className="text-dark-600 hover:text-blood-400 transition-colors flex-shrink-0 p-1"
                    aria-label={`Hapus ${cert.title}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {hasFile && (
                    <a
                      href={cert.file_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] font-mono text-dark-400 hover:text-blood-400 border border-dark-800 hover:border-blood-800 rounded-lg px-2 py-1 transition-colors"
                    >
                      <ExternalLink size={10} /> Lihat File
                    </a>
                  )}
                  {hasLink && (
                    <a
                      href={cert.linkedin_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 text-[10px] font-mono ${meta.color} hover:opacity-80 border ${meta.border} rounded-lg px-2 py-1 transition-colors`}
                    >
                      <BadgeCheck size={10} className="text-emerald-500" />
                      Verified · {meta.label}
                    </a>
                  )}
                  {!hasFile && !hasLink && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-dark-700">
                      <LinkIcon size={10} /> Belum ada link atau file
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
