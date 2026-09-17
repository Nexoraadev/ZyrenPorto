import { createClient } from "@/lib/supabase/server";
import { SkillForm } from "@/components/admin/SkillForm";
import { notFound } from "next/navigation";
import type { Skill } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSkillPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const skill = data as Skill;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">Edit Skill</h1>
        <p className="text-sm text-dark-500 mt-1 font-mono">
          {`// ${skill.name}`}
        </p>
      </div>
      <SkillForm skill={skill} />
    </div>
  );
}
