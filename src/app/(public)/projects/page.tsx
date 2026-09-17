import { createClient } from "@/lib/supabase/server";
import { ProjectsClientPage } from "@/app/(public)/projects/ProjectsClientPage";
import type { Metadata } from "next";
import type { ProjectWithRelations, ProjectCategory } from "@/types/database";

export const metadata: Metadata = {
  title: "Projects",
  description: "All projects by Reavlenia Arezha",
};

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projectsData } = await supabase
    .from("projects")
    .select("*, project_categories(*), project_images(id, url, storage_path, order_index)")
    .order("order_index", { ascending: true });

  const projects = ((projectsData ?? []) as ProjectWithRelations[]).map((p) => ({
    ...p,
    project_images: p.project_images ?? [],
    project_categories: p.project_categories ?? { id: "", name: "—", order_index: 0 },
  }));

  // Fetch only categories that have at least one project
  const usedCategoryIds = [...new Set(projects.map((p) => p.category_id))];

  let categories: ProjectCategory[] = [];
  if (usedCategoryIds.length > 0) {
    const { data: catData } = await supabase
      .from("project_categories")
      .select("*")
      .in("id", usedCategoryIds)
      .order("order_index", { ascending: true });
    categories = (catData ?? []) as ProjectCategory[];
  }

  return (
    <section className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="text-blood-600 font-mono text-sm tracking-widest uppercase">
            — Work —
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-dark-100">
            All <span className="text-gradient-blood">Projects</span>
          </h1>
          <p className="mt-4 text-dark-400 max-w-xl mx-auto">
            Kumpulan proyek yang pernah aku bangun — dari side project kecil
            sampai produk yang beneran dipakai orang.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-24 text-dark-500">
            <p className="font-mono text-sm">{`// belum ada project nih`}</p>
          </div>
        ) : (
          <ProjectsClientPage projects={projects} categories={categories} />
        )}
      </div>
    </section>
  );
}
