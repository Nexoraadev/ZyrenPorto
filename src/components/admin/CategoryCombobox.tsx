"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin-client";
import type { ProjectCategory } from "@/types/database";

interface CategoryComboboxProps {
  categories: ProjectCategory[];
  value: string | null;
  onChange: (id: string) => void;
}

export function CategoryCombobox({
  categories,
  value,
  onChange,
}: CategoryComboboxProps) {
  const [inputValue, setInputValue] = useState(() => {
    const found = categories.find((c) => c.id === value);
    return found ? found.name : "";
  });
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync display when value changes externally
  useEffect(() => {
    const found = categories.find((c) => c.id === value);
    if (found) setInputValue(found.name);
  }, [value, categories]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const exactMatch = categories.find(
    (c) => c.name.toLowerCase() === inputValue.toLowerCase()
  );

  const showCreate = inputValue.trim() !== "" && !exactMatch;

  async function handleSelect(cat: ProjectCategory) {
    setInputValue(cat.name);
    setIsOpen(false);
    onChange(cat.id);
  }

  async function handleCreate() {
    if (!inputValue.trim() || creating) return;
    setCreating(true);
    const supabase = createAdminClient();

    // Check for duplicate (race condition guard)
    const { data: existing } = await supabase
      .from("project_categories")
      .select("id, name")
      .ilike("name", inputValue.trim())
      .maybeSingle();

    if (existing) {
      setInputValue(existing.name);
      setIsOpen(false);
      onChange(existing.id);
      setCreating(false);
      return;
    }

    const { data: newCat, error } = await supabase
      .from("project_categories")
      .insert({ name: inputValue.trim() })
      .select("id, name")
      .single();

    if (!error && newCat) {
      setInputValue(newCat.name);
      setIsOpen(false);
      onChange(newCat.id);
    }
    setCreating(false);
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg bg-dark-900 border border-dark-800 text-dark-200 placeholder-dark-700 text-sm focus:outline-none focus:border-blood-700 transition-colors";

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Pilih atau ketik category baru..."
          className={`${inputClass} pr-10`}
        />
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-600 pointer-events-none"
        />
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 rounded-lg bg-dark-900 border border-dark-800 shadow-xl overflow-hidden">
          {filtered.length > 0 && (
            <ul className="max-h-48 overflow-y-auto">
              {filtered.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(cat)}
                    className="w-full text-left px-4 py-2.5 text-sm text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition-colors font-mono"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showCreate && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blood-400 hover:bg-blood-950/50 transition-colors font-mono border-t border-dark-800"
            >
              <Plus size={12} />
              {creating ? "Membuat..." : `Tambah category: "${inputValue.trim()}"`}
            </button>
          )}

          {filtered.length === 0 && !showCreate && (
            <p className="px-4 py-3 text-xs text-dark-600 font-mono">
              Tidak ada category ditemukan
            </p>
          )}
        </div>
      )}
    </div>
  );
}
