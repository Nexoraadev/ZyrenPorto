"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin-client";
import type { Skill } from "@/types/database";

interface SkillFormProps {
  skill?: Skill;
}

export function SkillForm({ skill }: SkillFormProps) {
  const router = useRouter();
  const isEdit = !!skill;

  const [form, setForm] = useState({
    name:        skill?.name        ?? "",
    category:    skill?.category    ?? "Frontend",
    icon:        skill?.icon        ?? "",
    icon_size:   Number(skill?.icon_size ?? 70),
    order_index: skill?.order_index ?? 0,
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "range" || type === "number" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createAdminClient();
    const payload = {
      name:        form.name,
      category:    form.category,
      icon:        form.icon || null,
      icon_size:   Number(form.icon_size),
      order_index: Number(form.order_index),
      level:       0,
    };

    const saveSkill = async (withSize: boolean) => {
      const data = withSize ? payload : { name: payload.name, category: payload.category, icon: payload.icon, order_index: payload.order_index, level: payload.level };
      if (isEdit) return supabase.from("skills").update(data).eq("id", skill.id);
      return supabase.from("skills").insert(data);
    };

    let { error } = await saveSkill(true);
    if (error?.message?.includes("icon_size")) {
      ({ error } = await saveSkill(false));
    }
    if (error) { setError(error.message); setLoading(false); return; }

    router.push("/nexoraa/dashboard/skills");
    router.refresh();
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg bg-dark-900 border border-dark-800 text-dark-200 placeholder-dark-700 text-sm focus:outline-none focus:border-blood-700 transition-colors";
  const labelClass = "block text-xs font-mono text-dark-500 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      {/* Name */}
      <div>
        <label className={labelClass}>Nama Skill *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Next.js"
          className={inputClass}
        />
      </div>

      {/* Category */}
      <div>
        <label className={labelClass}>Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className={inputClass}
        >
          {["Frontend", "Backend", "Tools", "Creative", "Mobile", "Other"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Icon URL + size — side by side */}
      <div>
        <label className={labelClass}>Icon URL</label>
        <input
          name="icon"
          type="url"
          value={form.icon}
          onChange={handleChange}
          placeholder="https://cdn.simpleicons.org/nextdotjs/ffffff"
          className={inputClass}
        />
        <p className="text-[10px] text-dark-600 font-mono mt-1.5">
          {`// simpleicons.org — contoh: https://cdn.simpleicons.org/figma/F24E1E`}
        </p>
      </div>

      {/* Icon size slider + live preview */}
      <div>
        <label className={labelClass}>
          Ukuran Icon — <span className="text-blood-500 font-semibold">{form.icon_size}%</span>
        </label>

        {/* Preview box — transparent bg, just show the icon */}
        <div className="flex items-center gap-5 mb-3 mt-1">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0 rounded-xl border border-dark-800 overflow-hidden">
            {form.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.icon}
                alt="preview"
                style={{
                  width:     `${form.icon_size}%`,
                  height:    `${form.icon_size}%`,
                  objectFit: "contain",
                }}
              />
            ) : (
              <span className="text-dark-700 text-[10px] font-mono text-center">no icon</span>
            )}
          </div>
          <div className="flex-1">
            <input
              name="icon_size"
              type="range"
              min={20}
              max={100}
              step={5}
              value={form.icon_size}
              onChange={handleChange}
              className="w-full accent-blood-600 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-dark-700 mt-1">
              <span>20% kecil</span>
              <span>60% sedang</span>
              <span>100% penuh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order */}
      <div>
        <label className={labelClass}>Order Index</label>
        <input
          name="order_index"
          type="number"
          value={form.order_index}
          onChange={handleChange}
          min={0}
          className={inputClass}
        />
      </div>

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
          {loading ? "Menyimpan..." : isEdit ? "Update Skill" : "Simpan Skill"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/nexoraa/dashboard/skills")}
          className="px-6 py-2.5 rounded-lg border border-dark-700 hover:border-dark-600 text-dark-400 hover:text-dark-200 font-medium text-sm transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
