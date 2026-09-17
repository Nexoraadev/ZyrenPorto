import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/ProjectForm";
import type { ProjectCategory, Skill } from "@/types/database";

export default async function NewProjectPage() {
  const supabase = await createClient();

  const [{ data: categoriesData }, { data: skillsData }] = await Promise.all([
    supabase.from("project_categories").select("*").order("order_index", { ascending: true }),
    supabase.from("skills").select("*").order("order_index", { ascending: true }),
  ]);

  const categories = (categoriesData ?? []) as ProjectCategory[];
  const allSkills = (skillsData ?? []) as Skill[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">Tambah Project</h1>
        <p className="text-sm text-dark-500 mt-1 font-mono">
          {`// isi detail project baru`}
        </p>
      </div>
      <ProjectForm categories={categories} allSkills={allSkills} />
    </div>
  );
}
