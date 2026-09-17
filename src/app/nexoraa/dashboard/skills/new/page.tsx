import { SkillForm } from "@/components/admin/SkillForm";

export default function NewSkillPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">Tambah Skill</h1>
        <p className="text-sm text-dark-500 mt-1 font-mono">
          {`// tambah teknologi baru ke stack kamu`}
        </p>
      </div>
      <SkillForm />
    </div>
  );
}
