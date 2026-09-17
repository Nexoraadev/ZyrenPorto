"use client";

import { useState } from "react";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { ProjectCard } from "@/components/ui/ProjectCard";
import type { ProjectWithRelations, ProjectCategory } from "@/types/database";

interface ProjectsClientPageProps {
  projects: ProjectWithRelations[];
  categories: ProjectCategory[];
}

export function ProjectsClientPage({
  projects,
  categories,
}: ProjectsClientPageProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredProjects = activeCategory
    ? projects.filter((p) => p.category_id === activeCategory)
    : projects;

  return (
    <>
      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mb-12">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      )}

      {/* Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-dark-500">
          <p className="font-mono text-sm">{`// tidak ada project dalam kategori ini`}</p>
        </div>
      )}
    </>
  );
}
