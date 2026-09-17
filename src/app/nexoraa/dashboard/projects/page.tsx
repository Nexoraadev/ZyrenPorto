import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";
import type { ProjectWithCategory } from "@/types/database";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*, project_categories(name)")
    .order("order_index", { ascending: true });

  const projects = (data ?? []) as ProjectWithCategory[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Projects</h1>
          <p className="text-sm text-dark-500 mt-1 font-mono">
            {projects.length} project
          </p>
        </div>
        <Link
          href="/nexoraa/dashboard/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blood-700 hover:bg-blood-600 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          Tambah Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-dark-800 rounded-xl">
          <p className="font-mono text-sm text-dark-600">
            {`// belum ada project`}
          </p>
          <Link
            href="/nexoraa/dashboard/projects/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-blood-700 hover:bg-blood-600 text-white text-sm transition-colors"
          >
            <Plus size={14} /> Tambah Pertama
          </Link>
        </div>
      ) : (
        <div className="card-dark rounded-xl border border-dark-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-800 text-xs font-mono text-dark-600 uppercase tracking-wider">
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Featured</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Order</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, i) => (
                <tr
                  key={project.id}
                  className={`${i < projects.length - 1 ? "border-b border-dark-900" : ""} hover:bg-dark-900/30 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <p className="text-dark-200 font-medium">{project.title}</p>
                    <p className="text-xs text-dark-600 mt-0.5 line-clamp-1">
                      {project.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs font-mono text-dark-500 bg-dark-900 border border-dark-800 px-2 py-0.5 rounded">
                      {project.project_categories?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {project.featured ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blood-950 border border-blood-900 text-blood-400">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-dark-900 border border-dark-800 text-dark-600">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-dark-600 font-mono text-xs">
                    {project.order_index}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/nexoraa/dashboard/projects/${project.id}`}
                        className="text-xs text-dark-400 hover:text-blood-400 font-mono transition-colors px-2 py-1 rounded hover:bg-dark-900"
                      >
                        Edit
                      </Link>
                      <DeleteProjectButton id={project.id} title={project.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
