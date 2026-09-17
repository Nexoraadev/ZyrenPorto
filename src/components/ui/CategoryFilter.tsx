"use client";

import { cn } from "@/lib/utils";
import type { ProjectCategory } from "@/types/database";

interface CategoryFilterProps {
  categories: ProjectCategory[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {/* "Semua" button */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors",
          activeCategory === null
            ? "bg-blood-600/10 border border-blood-700 text-blood-400"
            : "border border-dark-800 text-dark-500 hover:border-dark-700 hover:text-dark-400"
        )}
      >
        Semua
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors",
            activeCategory === cat.id
              ? "bg-blood-600/10 border border-blood-700 text-blood-400"
              : "border border-dark-800 text-dark-500 hover:border-dark-700 hover:text-dark-400"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
