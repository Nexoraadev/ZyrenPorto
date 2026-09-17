import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteSkillButton } from "@/components/admin/DeleteSkillButton";
import type { Skill } from "@/types/database";

export default async function AdminSkillsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .order("order_index", { ascending: true });

  const skills     = (data ?? []) as Skill[];
  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Skills & Tools</h1>
          <p className="text-sm text-dark-500 mt-1 font-mono">
            {skills.length} skill · {categories.length} kategori
          </p>
        </div>
        <Link
          href="/nexoraa/dashboard/skills/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blood-700 hover:bg-blood-600 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} /> Tambah Skill
        </Link>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-dark-800 rounded-xl">
          <p className="font-mono text-sm text-dark-600">{`// belum ada skill — tambah sekarang`}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {categories.map((cat) => {
            const catSkills = skills.filter(s => s.category === cat);
            return (
              <div key={cat}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex-1 h-px bg-dark-800" />
                  <span className="text-xs font-mono text-blood-600 uppercase tracking-widest">{cat}</span>
                  <span className="text-[10px] font-mono text-dark-700">{catSkills.length}</span>
                  <span className="flex-1 h-px bg-dark-800" />
                </div>

                {/* Skill cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {catSkills.map((skill) => {
                    const iconSize = skill.icon_size ?? 70;
                    const pad = Math.round((100 - iconSize) / 2 * 0.4);
                    return (
                      <div key={skill.id}
                        className="group card-dark rounded-xl border border-dark-800 p-3 hover:border-blood-900/60 hover:bg-dark-900/50 transition-all duration-200 flex flex-col items-center gap-2.5 text-center relative">

                        {/* Icon */}
                        {skill.icon ? (
                          <div
                            className="w-14 h-14 rounded-xl border border-dark-800/50 flex items-center justify-center group-hover:border-blood-900/40 transition-colors overflow-hidden"
                            style={{ padding: `${pad}px` }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={skill.icon}
                              alt={skill.name}
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl border border-dark-800 flex items-center justify-center">
                            <span className="text-blood-600 text-sm font-mono font-bold">
                              {skill.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Name */}
                        <p className="text-xs font-medium text-dark-300 leading-tight">{skill.name}</p>

                        {/* Actions — visible on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/nexoraa/dashboard/skills/${skill.id}`}
                            className="px-2 py-1 rounded-lg text-[10px] font-mono text-dark-400 hover:text-blood-400 hover:bg-blood-950/50 border border-transparent hover:border-blood-900/40 transition-colors"
                          >
                            Edit
                          </Link>
                          <DeleteSkillButton id={skill.id} name={skill.name} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
