import { createClient } from "@/lib/supabase/server";
import { FolderOpen, Wrench, Users, TrendingUp, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { ProjectWithCategory, Skill } from "@/types/database";
import { ContentProtection } from "@/components/admin/ContentProtection";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";

export default async function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any;

  const [
    { data: projectsData },
    { data: skillsData },
    { data: messagesData },
    { data: waData },
    { data: allViewsData },
    { count: totalViews },
  ] = await Promise.all([
    sb.from("projects").select("*, project_categories(name)"),
    sb.from("skills").select("*"),
    sb.from("messages").select("id, read, created_at").order("created_at", { ascending: false }),
    sb.from("messages_wa").select("id, read, created_at").order("created_at", { ascending: false }),
    sb.from("page_views").select("created_at, path").order("created_at", { ascending: false }),
    sb.from("page_views").select("*", { count: "exact", head: true }),
  ]);

  const projects   = (projectsData ?? []) as ProjectWithCategory[];
  const skills     = (skillsData   ?? []) as Skill[];
  const messages   = (messagesData ?? []) as { id: string; read: boolean; created_at: string }[];
  const waMessages = (waData       ?? []) as { id: string; read: boolean; created_at: string }[];
  const allViews   = (allViewsData ?? []) as { created_at: string; path: string }[];

  const featured    = projects.filter(p => p.featured).length;
  const unreadEmail = messages.filter(m => !m.read).length;
  const unreadWa    = waMessages.filter(m => !m.read).length;
  const totalUnread = unreadEmail + unreadWa;

  // Group views by year + month
  const monthMap: Record<string, { count: number; paths: Record<string, number> }> = {};
  for (const v of allViews) {
    const d    = new Date(v.created_at);
    const key  = `${d.getFullYear()}-${d.getMonth() + 1}`;
    if (!monthMap[key]) monthMap[key] = { count: 0, paths: {} };
    monthMap[key].count++;
    const p = v.path || "/";
    monthMap[key].paths[p] = (monthMap[key].paths[p] ?? 0) + 1;
  }
  const monthlyData = Object.entries(monthMap).map(([key, val]) => {
    const [y, m] = key.split("-").map(Number);
    return { year: y, month: m, count: val.count, paths: val.paths };
  });
  const availableYears = [...new Set(monthlyData.map(d => d.year))].sort();

  // This month views
  const now = new Date();
  const thisMonthViews = allViews.filter(v => {
    const d = new Date(v.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: FolderOpen,
      href: "/nexoraa/dashboard/projects",
      sub: `${featured} featured`,
    },
    {
      label: "Skills",
      value: skills.length,
      icon: Wrench,
      href: "/nexoraa/dashboard/skills",
      sub: `${[...new Set(skills.map(s => s.category))].length} kategori`,
    },
    {
      label: "Total Views",
      value: totalViews ?? 0,
      icon: Users,
      href: "#analytics",
      sub: `+${thisMonthViews} bulan ini`,
    },
    {
      label: "Pesan Masuk",
      value: messages.length + waMessages.length,
      icon: Mail,
      href: "/nexoraa/dashboard/messages",
      sub: totalUnread > 0 ? `${totalUnread} belum dibaca` : "semua sudah dibaca",
      alert: totalUnread > 0,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">Dashboard</h1>
        <p className="text-sm text-dark-500 mt-1 font-mono">
          {`// welcome back, Reavlenia`}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href, sub, alert }) => (
          <Link key={label} href={href}
            className="card-dark rounded-xl p-5 border border-dark-800 hover:border-blood-800 transition-colors group relative">
            {alert && (
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blood-500 animate-pulse" />
            )}
            <div className="w-9 h-9 rounded-lg border bg-blood-950 border-blood-900 flex items-center justify-center mb-3">
              <Icon size={16} className="text-blood-400" />
            </div>
            <div className="text-3xl font-black text-dark-100">{typeof value === "number" ? value.toLocaleString() : value}</div>
            <div className="text-xs text-dark-500 font-mono mt-1">{label}</div>
            {sub && <div className={`text-[10px] font-mono mt-0.5 ${alert ? "text-blood-500" : "text-dark-700"}`}>{sub}</div>}
          </Link>
        ))}
      </div>

      {/* ── Analytics chart ── */}
      <AnalyticsChart
        data={monthlyData}
        availableYears={availableYears}
        totalViews={totalViews ?? 0}
      />

      {/* ── Messages preview ── */}
      {(messages.length > 0 || waMessages.length > 0) && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono text-dark-500 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={13} className="text-blood-600" />
              Pesan Terbaru
              {totalUnread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-blood-700 text-white text-[9px] font-mono">
                  {totalUnread} baru
                </span>
              )}
            </h2>
            <Link href="/nexoraa/dashboard/messages"
              className="text-xs text-blood-600 hover:text-blood-400 font-mono transition-colors">
              Lihat semua →
            </Link>
          </div>
          <div className="card-dark rounded-xl border border-dark-800 overflow-hidden divide-y divide-dark-900">
            {[
              ...messages.slice(0, 3).map(m => ({ ...m, type: "email" as const })),
              ...waMessages.slice(0, 2).map(m => ({ ...m, type: "wa" as const })),
            ]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 4)
              .map(msg => (
                <Link key={msg.id} href="/nexoraa/dashboard/messages"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-dark-900/40 transition-colors">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${msg.type === "wa" ? "bg-green-950 border-green-900" : "bg-blood-950 border-blood-900"}`}>
                    {msg.type === "wa"
                      ? <MessageSquare size={11} className="text-green-400" />
                      : <Mail size={11} className="text-blood-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-dark-500">
                      {msg.type === "wa" ? "WhatsApp" : "Email"} ·{" "}
                      {new Date(msg.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!msg.read && <span className="w-2 h-2 rounded-full bg-blood-500 shrink-0" />}
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <h2 className="text-sm font-mono text-dark-500 uppercase tracking-widest mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        <Link href="/nexoraa/dashboard/projects/new"
          className="flex items-center gap-3 p-4 card-dark rounded-xl border border-dashed border-dark-700 hover:border-blood-700 text-dark-400 hover:text-blood-400 transition-colors">
          <span className="text-xl font-black">+</span>
          <div>
            <p className="text-sm font-medium">Tambah Project Baru</p>
            <p className="text-xs text-dark-600">Tambahkan ke portfolio</p>
          </div>
        </Link>
        <Link href="/nexoraa/dashboard/skills/new"
          className="flex items-center gap-3 p-4 card-dark rounded-xl border border-dashed border-dark-700 hover:border-blood-700 text-dark-400 hover:text-blood-400 transition-colors">
          <span className="text-xl font-black">+</span>
          <div>
            <p className="text-sm font-medium">Tambah Skill Baru</p>
            <p className="text-xs text-dark-600">Update tech stack kamu</p>
          </div>
        </Link>
      </div>

      {/* Recent projects */}
      {projects.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono text-dark-500 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={13} className="text-blood-600" />
              Recent Projects
            </h2>
            <Link href="/nexoraa/dashboard/projects"
              className="text-xs text-blood-600 hover:text-blood-400 font-mono transition-colors">
              View all →
            </Link>
          </div>
          <div className="card-dark rounded-xl border border-dark-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-800 text-xs font-mono text-dark-600 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Featured</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((p, i) => (
                  <tr key={p.id}
                    className={`${i < Math.min(projects.length, 5) - 1 ? "border-b border-dark-900" : ""} hover:bg-dark-900/50 transition-colors`}>
                    <td className="px-4 py-3 text-dark-200 font-medium">
                      <Link href={`/nexoraa/dashboard/projects/${p.id}`}
                        className="hover:text-blood-400 transition-colors">{p.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-dark-500 hidden sm:table-cell font-mono text-xs">
                      {p.project_categories?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {p.featured
                        ? <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blood-950 border border-blood-900 text-blood-400">Yes</span>
                        : <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-dark-900 border border-dark-800 text-dark-600">No</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Protection */}
      <ContentProtection />
    </div>
  );
}
