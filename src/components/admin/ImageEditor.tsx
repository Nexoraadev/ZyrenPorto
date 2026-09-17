"use client";

import { useState, useRef, useEffect } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { RotateCcw, RotateCw, Sparkles, Check, X, Loader2, RefreshCw, Crop as CropIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageEditorProps {
  file: File;
  onDone: (result: File) => void;
  onCancel: () => void;
  existingUrl?: string;
}

// ── Apply crop from pixel coords ──────────────────────────────────────────────
function cropCanvas(img: HTMLImageElement, pixelCrop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX  = img.naturalWidth  / img.width;
  const scaleY  = img.naturalHeight / img.height;
  canvas.width  = pixelCrop.width  * scaleX;
  canvas.height = pixelCrop.height * scaleY;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img,
    pixelCrop.x * scaleX, pixelCrop.y * scaleY,
    pixelCrop.width * scaleX, pixelCrop.height * scaleY,
    0, 0, canvas.width, canvas.height);
  return new Promise(res => canvas.toBlob(b => res(b!), "image/png", 0.95));
}

// ── Rotate image URL ──────────────────────────────────────────────────────────
function rotateDataUrl(src: string, deg: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const rad = (deg * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const c   = document.createElement("canvas");
      c.width   = img.width * cos + img.height * sin;
      c.height  = img.width * sin + img.height * cos;
      const ctx = c.getContext("2d")!;
      ctx.translate(c.width / 2, c.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
}

// ── Remove BG via API ─────────────────────────────────────────────────────────
async function callRemoveBg(src: string): Promise<string> {
  let blob: Blob;
  if (src.startsWith("blob:") || src.startsWith("data:")) {
    blob = await fetch(src).then(r => r.blob());
  } else {
    const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(src)}`);
    blob = await res.blob();
  }
  const fd = new FormData();
  fd.append("image", blob, "image.png");
  const res  = await fetch("/api/remove-bg", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error ?? "Gagal hapus background");
  return json.result;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ImageEditor({ file, onDone, onCancel, existingUrl }: ImageEditorProps) {
  const [imgSrc,    setImgSrc  ] = useState("");   // current working image src
  const [loading,   setLoading ] = useState(true);
  const [activeTab, setActiveTab] = useState<"crop"|"rotate"|"removebg">("crop");

  // Crop state
  const [crop,      setCrop     ] = useState<Crop>();
  const [pixelCrop, setPixelCrop] = useState<PixelCrop>();
  const [applying,  setApplying ] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Remove BG state
  const [bgResult, setBgResult] = useState<string|null>(null);
  const [bgLoading,setBgLoading] = useState(false);
  const [bgError,  setBgError  ] = useState<string|null>(null);

  const [saving, setSaving] = useState(false);

  // ── Load image ──
  useEffect(() => {
    let objectUrl: string | null = null;
    async function load() {
      setLoading(true);
      try {
        if (existingUrl) {
          // Proxy to avoid CORS
          const res  = await fetch(`/api/image-proxy?url=${encodeURIComponent(existingUrl)}`);
          if (!res.ok) throw new Error("Proxy failed");
          const blob = await res.blob();
          objectUrl  = URL.createObjectURL(blob);
          setImgSrc(objectUrl);
        } else {
          objectUrl = URL.createObjectURL(file);
          setImgSrc(objectUrl);
        }
      } catch {
        // Fallback: try direct URL
        setImgSrc(existingUrl ?? URL.createObjectURL(file));
      }
      setLoading(false);
    }
    load();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Init crop when image loads
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    // Free crop — center 90% of the image
    const c = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, width / height, width, height),
      width, height
    );
    setCrop(c);
  }

  // ── Save crop ──
  async function handleSaveCrop() {
    if (!imgRef.current || !pixelCrop) return;
    setApplying(true);
    try {
      const blob = await cropCanvas(imgRef.current, pixelCrop);
      const url  = URL.createObjectURL(blob);
      setImgSrc(url);
      setCrop(undefined);
      setPixelCrop(undefined);
      setBgResult(null);
    } catch (e) { console.error(e); }
    setApplying(false);
  }

  // ── Rotate ──
  async function handleRotate(deg: number) {
    const rotated = await rotateDataUrl(imgSrc, deg);
    setImgSrc(rotated);
    setBgResult(null);
    setCrop(undefined);
  }

  // ── Remove BG ──
  async function handleRemoveBg() {
    setBgLoading(true);
    setBgError(null);
    try {
      const result = await callRemoveBg(imgSrc);
      setBgResult(result);
    } catch (e) {
      setBgError(e instanceof Error ? e.message : "Error");
    }
    setBgLoading(false);
  }

  function handleApplyBg() {
    if (!bgResult) return;
    setImgSrc(bgResult);
    setBgResult(null);
  }

  // ── Final save ──
  async function handleDone() {
    setSaving(true);
    try {
      let blob: Blob;
      if (imgSrc.startsWith("data:")) {
        blob = await fetch(imgSrc).then(r => r.blob());
      } else if (imgSrc.startsWith("blob:")) {
        blob = await fetch(imgSrc).then(r => r.blob());
      } else {
        const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(imgSrc)}`);
        blob = await res.blob();
      }
      const name = existingUrl ? (existingUrl.split("/").pop() ?? "edited.png") : `edited-${file.name}`;
      onDone(new File([blob], name, { type: blob.type || "image/png" }));
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  const tabs = [
    { id: "crop",     label: "Crop",     icon: CropIcon  },
    { id: "rotate",   label: "Rotate",   icon: RotateCw  },
    { id: "removebg", label: "Hapus BG", icon: Sparkles  },
  ] as const;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-2xl bg-dark-950 border border-dark-800 rounded-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800 shrink-0">
          <h3 className="font-semibold text-dark-100 text-sm">Edit Foto</h3>
          <button onClick={onCancel} className="text-dark-600 hover:text-dark-300" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-800 shrink-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn("flex items-center gap-2 px-5 py-3 text-xs font-mono transition-colors border-b-2 -mb-px",
                activeTab === id ? "border-blood-600 text-blood-400" : "border-transparent text-dark-500 hover:text-dark-300")}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        {/* Image area */}
        <div className="flex-1 overflow-auto bg-[#0a0a0a] flex items-center justify-center p-4 min-h-[280px]">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-dark-500">
              <Loader2 size={28} className="animate-spin text-blood-500" />
              <span className="text-xs font-mono">Memuat gambar...</span>
            </div>
          ) : !imgSrc ? (
            <div className="text-dark-600 text-xs font-mono">Gagal memuat gambar</div>
          ) : activeTab === "crop" ? (
            <ReactCrop
              crop={crop}
              onChange={(c)   => setCrop(c)}
              onComplete={(c) => setPixelCrop(c)}
              className="max-w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt="edit"
                onLoad={onImageLoad}
                className="max-w-full max-h-[380px] object-contain"
                style={{ display: "block" }}
              />
            </ReactCrop>
          ) : activeTab === "removebg" && bgResult ? (
            <div className="flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bgResult} alt="preview bg removed"
                className="max-w-full max-h-[300px] object-contain rounded"
                style={{ background: "repeating-conic-gradient(#1a1a1a 0% 25%,#111 0% 50%) 0 0/16px 16px" }}
              />
              <p className="text-xs text-dark-500 font-mono">Preview hasil hapus background</p>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={imgSrc} alt="preview"
              className="max-w-full max-h-[380px] object-contain"
              style={{
                display: "block",
                background: activeTab === "removebg"
                  ? "repeating-conic-gradient(#1a1a1a 0% 25%,#111 0% 50%) 0 0/16px 16px"
                  : undefined,
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="px-5 py-4 border-t border-dark-800 shrink-0">
          {activeTab === "crop" && (
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={handleSaveCrop} disabled={applying || !pixelCrop}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blood-700 hover:bg-blood-600 disabled:opacity-40 text-white text-xs font-medium transition-colors">
                {applying ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                {applying ? "Menerapkan..." : "Simpan Crop"}
              </button>
              <button onClick={() => { setCrop(undefined); setPixelCrop(undefined); }}
                className="px-4 py-2 rounded-lg bg-dark-900 border border-dark-700 text-dark-400 text-xs font-mono transition-colors hover:border-dark-600">
                Reset Crop
              </button>
              <span className="text-[10px] text-dark-600 font-mono">
                Drag sudut/pinggir area untuk crop
              </span>
            </div>
          )}

          {activeTab === "rotate" && (
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: "90° Kiri",  icon: RotateCcw, deg: -90  },
                { label: "90° Kanan", icon: RotateCw,  deg:  90  },
                { label: "180°",      icon: RefreshCw, deg:  180 },
              ].map(({ label, icon: Icon, deg }) => (
                <button key={label} onClick={() => handleRotate(deg)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-900 border border-dark-800 hover:border-dark-700 text-dark-300 text-xs font-mono transition-colors">
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          )}

          {activeTab === "removebg" && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={handleRemoveBg} disabled={bgLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blood-700 hover:bg-blood-600 disabled:opacity-50 text-white text-xs font-medium transition-colors">
                  {bgLoading ? <><Loader2 size={12} className="animate-spin" /> Memproses...</> : <><Sparkles size={12} /> Hapus Background</>}
                </button>
                {bgResult && (
                  <button onClick={handleApplyBg}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 border border-blood-800 hover:border-blood-600 text-blood-400 text-xs font-mono transition-colors">
                    <Check size={12} /> Terapkan
                  </button>
                )}
              </div>
              {bgError && <p className="text-xs text-blood-400 font-mono">{bgError}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-dark-800 bg-dark-900/30 shrink-0">
          <button onClick={onCancel}
            className="px-5 py-2 rounded-lg border border-dark-700 hover:border-dark-600 text-dark-400 text-sm font-medium transition-colors">
            Batal
          </button>
          <button onClick={handleDone} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blood-700 hover:bg-blood-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Gunakan Foto
          </button>
        </div>
      </div>
    </div>
  );
}
