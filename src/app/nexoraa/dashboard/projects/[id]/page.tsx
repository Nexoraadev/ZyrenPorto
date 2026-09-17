import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { notFound } from "next/navigation";
import type { ProjectWithRelations, ProjectCategory, ProjectImage, Skill } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: projectData }, { data: categoriesData }, { data: skillsData }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, project_categories(*), project_images(*), project_skills(skill_id, skills(*))")
      .eq("id", id)
      .single(),
    supabase
      .from("project_categories")
      .select("*")
      .order("order_index", { ascending: true }),
    supabase
      .from("skills")
      .select("*")
      .order("order_index", { ascending: true }),
  ]);

  if (!projectData) notFound();

  const project = projectData as ProjectWithRelations;
  const categories = (categoriesData ?? []) as ProjectCategory[];
  const existingImages = (project.project_images ?? []) as ProjectImage[];
  const allSkills = (skillsData ?? []) as Skill[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">Edit Project</h1>
        <p className="text-sm text-dark-500 mt-1 font-mono">
          {`// ${project.title}`}
        </p>
      </div>
      <ProjectForm
        project={project}
        categories={categories}
        existingImages={existingImages}
        allSkills={allSkills}
      />
    </div>
  );
}
