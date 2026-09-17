"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import type { ProjectImage } from "@/types/database";
import { ImageEditor } from "@/components/admin/ImageEditor";

interface ImageUploaderProps {
  projectId?: string;
  existingImages: ProjectImage[];
  onPendingFilesChange: (files: File[]) => void;
  onDeleteExisting: (image: ProjectImage) => void;
}

interface PendingPreview {
  file: File;
  previewUrl: string;
}

export function ImageUploader({
  existingImages,
  onPendingFilesChange,
  onDeleteExisting,
}: ImageUploaderProps) {
  const [pendingPreviews, setPendingPreviews] = useState<PendingPreview[]>([]);
  const [sizeError, setSizeError]             = useState<string | null>(null);
  const [editingFile, setEditingFile]         = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      pendingPreviews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setSizeError(null);

    const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      setSizeError(
        `File berikut melebihi batas 5MB: ${oversized.map((f) => f.name).join(", ")}`
      );
    }

    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024);
    if (valid.length === 0) return;

    // Buka editor untuk file pertama — jika ada lebih dari 1, queue sisanya
    // (simpel: buka satu per satu)
    if (valid.length === 1) {
      setEditingFile(valid[0]);
    } else {
      // Multi file: langsung tambah tanpa editor
      addFiles(valid);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function addFiles(files: File[]) {
    const newPreviews: PendingPreview[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPendingPreviews((prev) => {
      const next = [...prev, ...newPreviews];
      onPendingFilesChange(next.map((p) => p.file));
      return next;
    });
  }

  function handleEditorDone(result: File) {
    setEditingFile(null);
    addFiles([result]);
  }

  function removePending(index: number) {
    setPendingPreviews((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.previewUrl);
      const next = prev.filter((_, i) => i !== index);
      onPendingFilesChange(next.map((p) => p.file));
      return next;
    });
  }

  const labelClass = "block text-xs font-mono text-dark-500 mb-1.5";

  return (
    <div className="space-y-4">
      <label className={labelClass}>Gambar Project</label>

      {/* Image editor modal */}
      {editingFile && (
        <ImageEditor
          file={editingFile}
          onDone={handleEditorDone}
          onCancel={() => setEditingFile(null)}
        />
      )}

      {/* Existing images */}
      {existingImages.length > 0 && (
        <div>
          <p className="text-[11px] font-mono text-dark-600 mb-2">
            Gambar tersimpan:
          </p>
          <div className="grid grid-cols-4 gap-2">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-dark-900">
                  <Image
                    src={img.url}
                    alt="Existing image"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteExisting(img)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blood-700 hover:bg-blood-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Hapus gambar"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending previews */}
      {pendingPreviews.length > 0 && (
        <div>
          <p className="text-[11px] font-mono text-dark-600 mb-2">
            Akan diupload:
          </p>
          <div className="grid grid-cols-4 gap-2">
            {pendingPreviews.map((p, i) => (
              <div key={i} className="relative group">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-dark-900">
                  <Image
                    src={p.previewUrl}
                    alt={p.file.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePending(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blood-700 hover:bg-blood-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Hapus file"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      <label className="flex items-center gap-2 w-fit px-4 py-2.5 rounded-lg bg-dark-900 border border-dark-800 border-dashed text-dark-400 hover:border-dark-700 hover:text-dark-300 cursor-pointer transition-colors text-sm">
        <Upload size={14} />
        <span className="font-mono text-xs">Pilih gambar</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFiles}
          className="hidden"
        />
      </label>

      <p className="text-[11px] font-mono text-dark-700">
        JPEG, PNG, WebP, GIF — maks. 5MB · pilih 1 file untuk buka editor
      </p>

      {sizeError && (
        <p className="text-xs text-blood-400 font-mono bg-blood-950/50 border border-blood-900 rounded-lg px-3 py-2">
          {sizeError}
        </p>
      )}
    </div>
  );
}
