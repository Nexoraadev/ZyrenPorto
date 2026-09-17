"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { isValidYouTubeUrl } from "@/types/database";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { CategoryCombobox } from "@/components/admin/CategoryCombobox";
import type {
  ProjectWithRelations,
  ProjectCategory,
  ProjectImage,
  Skill,
  ContentBlock,
} from "@/types/database";

// ------ Inline helper ------
function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// ------ Types ------
interface ProjectFormProps {
  project?: ProjectWithRelations;
  categories: ProjectCategory[];
  existingImages?: ProjectImage[];
  allSkills?: Skill[];
}

// ------ Content Block Editor Component ------
function ContentBlockEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const inputCls =
    "w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-200 placeholder-dark-700 text-sm focus:outline-none focus:border-blood-700 transition-colors";

  function addBlock(type: ContentBlock["type"]) {
    onChange([...blocks, { id: generateId(), type }]);
  }

  function updateBlock(id: string, patch: Partial<ContentBlock>) {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function removeBlock(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    const newBlocks = [...blocks];
    const target = idx + dir;
    if (target < 0 || target >= newBlocks.length) return;
    [newBlocks[idx], newBlocks[target]] = [newBlocks[target], newBlocks[idx]];
    onChange(newBlocks);
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => (
        <div
          key={block.id}
          className="border border-dark-800 rounded-lg p-3 bg-dark-950/50 space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-blood-400 uppercase tracking-wider">
              {block.type}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveBlock(idx, -1)}
                disabled={idx === 0}
                className="px-2 py-1 text-xs text-dark-500 hover:text-dark-200 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBlock(idx, 1)}
                disabled={idx === blocks.length - 1}
                className="px-2 py-1 text-xs text-dark-500 hover:text-dark-200 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                className="px-2 py-1 text-xs text-blood-500 hover:text-blood-300"
              >
                ✕
              </button>
            </div>
          </div>

          {block.type !== "divider" && (
            <input
              placeholder="Judul blok (opsional, misal: Tujuan, Problem Solving)"
              value={block.title ?? ""}
              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
              className={inputCls}
            />
          )}

          {block.type === "text" && (
            <textarea
              rows={3}
              placeholder="Isi deskripsi / narasi..."
              value={block.content ?? ""}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          )}

          {block.type === "image" && (
            <>
              <input
                placeholder="URL Gambar"
                value={block.url ?? ""}
                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                className={inputCls}
              />
              <input
                placeholder="Caption gambar (opsional)"
                value={block.caption ?? ""}
                onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                className={inputCls}
              />
            </>
          )}

          {block.type === "embed" && (
            <input
              placeholder="URL Embed (Figma, Behance, YouTube...)"
              value={block.url ?? ""}
              onChange={(e) => updateBlock(block.id, { url: e.target.value })}
              className={inputCls}
            />
          )}

          {block.type === "divider" && (
            <div className="border-t border-dark-700 my-1" />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2 pt-1">
        <span className="text-xs font-mono text-dark-600 self-center">+ Tambah Blok:</span>
        {(["text", "image", "embed", "divider"] as ContentBlock["type"][]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => addBlock(t)}
            className="px-3 py-1 text-xs rounded-md border border-dark-700 text-dark-400 hover:border-blood-700 hover:text-blood-400 transition-colors font-mono"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

// ------ Main Form ------
export function ProjectForm({
  project,
  categories,
  existingImages = [],
  allSkills = [],
}: ProjectFormProps) {
  const router = useRouter();
  const isEdit = !!project;

  const initialSkillIds = project?.project_skills?.map((ps) => ps.skill_id) ?? [];

  const [form, setForm] = useState({
    title: project?.title ?? "",
    description: project?.description ?? "",
    long_description: project?.long_description ?? "",
    tech_stack: project?.tech_stack?.join(", ") ?? "",
    live_url: project?.live_url ?? "",
    github_url: project?.github_url ?? "",
    video_url: project?.video_url ?? "",
    featured: project?.featured ?? false,
    nda_mode: project?.nda_mode ?? false,
    order_index: project?.order_index ?? 0,
  });

  const [categoryId, setCategoryId] = useState<string | null>(
    project?.category_id ?? null
  );
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(
    (project?.content_blocks as ContentBlock[]) ?? []
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(initialSkillIds);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "media" | "blocks" | "skills">("info");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    if (name === "video_url") setVideoError(null);
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleVideoBlur() {
    if (form.video_url && !isValidYouTubeUrl(form.video_url)) {
      setVideoError("URL video tidak valid. Gunakan format YouTube: watch?v=... atau youtu.be/...");
    } else {
      setVideoError(null);
    }
  }

  function toggleSkill(skillId: string) {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  }

  async function uploadFiles(projectId: string, files: File[]) {
    const supabase = createAdminClient();
    const uploaded: Array<{ storage_path: string; url: string }> = [];

    for (const file of files) {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `projects/${projectId}/${timestamp}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(storagePath, file, { upsert: true });

      if (uploadError) { console.error("Upload error:", uploadError.message); continue; }

      const { data: urlData } = supabase.storage.from("project-images").getPublicUrl(storagePath);
      uploaded.push({ storage_path: storagePath, url: urlData.publicUrl });
    }
    return uploaded;
  }

  async function callApi(action: string, payload: Record<string, unknown>) {
    const res = await fetch("/api/project-save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "API error");
    return json;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.video_url && !isValidYouTubeUrl(form.video_url)) {
      setVideoError("URL video tidak valid. Gunakan format YouTube: watch?v=... atau youtu.be/...");
      return;
    }
    if (!categoryId) {
      setError("Pilih atau buat category terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);

    const projectData = {
      title:            form.title,
      description:      form.description,
      long_description: form.long_description || null,
      tech_stack:       form.tech_stack.split(",").map((t: string) => t.trim()).filter(Boolean),
      live_url:         form.live_url   || null,
      github_url:       form.github_url || null,
      video_url:        form.video_url  || null,
      featured:         form.featured,
      nda_mode:         form.nda_mode,
      content_blocks:   contentBlocks,
      order_index:      Number(form.order_index),
      category_id:      categoryId,
    };

    try {
      let projectId = project?.id ?? "";

      if (isEdit && project) {
        await callApi("upsert_project", {
          projectId: project.id,
          projectData,
          skillIds: selectedSkillIds,
        });
        for (const img of imagesToDelete) {
          await callApi("delete_image", { imageId: img.id, storagePath: img.storage_path });
        }
      } else {
        const result = await callApi("upsert_project", {
          projectId: null,
          projectData,
          skillIds: selectedSkillIds,
        });
        projectId = result.id;
      }

      if (pendingFiles.length > 0 && projectId) {
        const uploaded = await uploadFiles(projectId, pendingFiles);
        for (const u of uploaded) {
          await callApi("insert_image", {
            projectId,
            storagePath: u.storage_path,
            url: u.url,
          });
        }
      }

      router.push("/nexoraa/dashboard/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg bg-dark-900 border border-dark-800 text-dark-200 placeholder-dark-700 text-sm focus:outline-none focus:border-blood-700 transition-colors";
  const labelClass = "block text-xs font-mono text-dark-500 mb-1.5";
  const tabCls = (active: boolean) =>
    `px-4 py-2 text-xs font-mono rounded-t-lg transition-colors ${
      active
        ? "bg-dark-900 text-blood-400 border border-b-0 border-dark-800"
        : "text-dark-500 hover:text-dark-300"
    }`;

  const deleteIds = new Set(imagesToDelete.map((i) => i.id));
  const displayedExisting = existingImages.filter((img) => !deleteIds.has(img.id));

  // Group skills by category
  const skillsByCategory = allSkills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-dark-800">
        <button type="button" className={tabCls(activeTab === "info")}  onClick={() => setActiveTab("info")}>Info Dasar</button>
        <button type="button" className={tabCls(activeTab === "media")} onClick={() => setActiveTab("media")}>Media</button>
        <button type="button" className={tabCls(activeTab === "blocks")}onClick={() => setActiveTab("blocks")}>Case Study</button>
        <button type="button" className={tabCls(activeTab === "skills")}onClick={() => setActiveTab("skills")}>
          Skills & Tools
          {selectedSkillIds.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blood-800 text-blood-200 rounded-full">
              {selectedSkillIds.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Tab: Info Dasar ── */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className={labelClass}>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="Nama project" className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Description * <span className="text-dark-600">(tampil di card)</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={2} placeholder="Deskripsi singkat yang tampil di card portfolio" className={`${inputClass} resize-none`} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Long Description <span className="text-dark-600">(opsional)</span></label>
            <textarea name="long_description" value={form.long_description} onChange={handleChange} rows={4} placeholder="Detail lengkap project (tampil di halaman detail)" className={`${inputClass} resize-none`} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Tech Stack <span className="text-dark-600">(pisahkan koma)</span></label>
            <input name="tech_stack" value={form.tech_stack} onChange={handleChange} placeholder="Next.js, TypeScript, Tailwind CSS" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Category *</label>
            <CategoryCombobox categories={categories} value={categoryId} onChange={setCategoryId} />
          </div>

          <div>
            <label className={labelClass}>Order Index</label>
            <input name="order_index" type="number" value={form.order_index} onChange={handleChange} min={0} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Live URL</label>
            <input name="live_url" type="url" value={form.live_url} onChange={handleChange} placeholder="https://..." className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>GitHub URL</label>
            <input name="github_url" type="url" value={form.github_url} onChange={handleChange} placeholder="https://github.com/..." className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Video URL (YouTube)</label>
            <input name="video_url" type="text" value={form.video_url} onChange={handleChange} onBlur={handleVideoBlur} placeholder="https://www.youtube.com/watch?v=... (opsional)" className={`${inputClass}${videoError ? " border-blood-700" : ""}`} />
            {videoError && <p className="text-xs text-blood-400 font-mono mt-1">{videoError}</p>}
          </div>

          {/* Toggles */}
          <div className="sm:col-span-2 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input id="featured" name="featured" type="checkbox" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-blood-600 rounded" />
              <span className="text-sm text-dark-300">Featured — tampilkan di homepage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input id="nda_mode" name="nda_mode" type="checkbox" checked={form.nda_mode} onChange={handleChange} className="w-4 h-4 accent-yellow-600 rounded" />
              <span className="text-sm text-yellow-400">🔒 NDA Mode — sembunyikan detail sensitif</span>
            </label>
          </div>
        </div>
      )}

      {/* ── Tab: Media ── */}
      {activeTab === "media" && (
        <div>
          <ImageUploader
            projectId={project?.id}
            existingImages={displayedExisting}
            onPendingFilesChange={setPendingFiles}
            onDeleteExisting={(img) => setImagesToDelete((prev) => [...prev, img])}
          />
        </div>
      )}

      {/* ── Tab: Case Study (Content Blocks) ── */}
      {activeTab === "blocks" && (
        <div className="space-y-3">
          <p className="text-xs font-mono text-dark-500">
            {"// Tambahkan blok konten seperti Tujuan, Problem Solving, Hasil, atau embed Figma."}
          </p>
          <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
        </div>
      )}

      {/* ── Tab: Skills & Tools ── */}
      {activeTab === "skills" && (
        <div className="space-y-4">
          <p className="text-xs font-mono text-dark-500">
            {"// Pilih skills yang digunakan pada project ini. Terhubung ke data skills globalmu."}
          </p>
          {Object.keys(skillsByCategory).length === 0 ? (
            <p className="text-sm text-dark-600">Belum ada skill. Tambahkan di menu Skills terlebih dahulu.</p>
          ) : (
            Object.entries(skillsByCategory).map(([cat, skills]) => (
              <div key={cat}>
                <p className="text-xs font-mono text-dark-600 mb-2 uppercase tracking-widest">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => {
                    const selected = selectedSkillIds.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selected
                            ? "bg-blood-700 border-blood-600 text-white"
                            : "bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600 hover:text-dark-200"
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-blood-400 font-mono bg-blood-950/50 border border-blood-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-blood-700 hover:bg-blood-600 disabled:opacity-50 text-white font-medium text-sm transition-colors"
        >
          {loading ? "Menyimpan..." : isEdit ? "Update Project" : "Simpan Project"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/nexoraa/dashboard/projects")}
          className="px-6 py-2.5 rounded-lg border border-dark-700 hover:border-dark-600 text-dark-400 hover:text-dark-200 font-medium text-sm transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
