"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FolderOpen, Wrench, LogOut, ExternalLink,
  FileText, Eye, Settings, Shield, Music, MessageSquare, Award
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/nexoraa/dashboard",              label: "Dashboard",    icon: LayoutDashboard, exact: true  },
  { href: "/nexoraa/dashboard/messages",     label: "Messages",     icon: MessageSquare,   exact: false, badge: true },
  { href: "/nexoraa/dashboard/content",      label: "Content",      icon: FileText,        exact: false },
  { href: "/nexoraa/dashboard/projects",     label: "Projects",     icon: FolderOpen,      exact: false },
  { href: "/nexoraa/dashboard/certificates", label: "Certificates", icon: Award,           exact: false },
  { href: "/nexoraa/dashboard/skills",       label: "Skills",       icon: Wrench,          exact: false },
  { href: "/nexoraa/dashboard/music",        label: "Music",        icon: Music,           exact: false },
  { href: "/nexoraa/dashboard/protection",   label: "Protection",   icon: Shield,          exact: false },
  { href: "/nexoraa/dashboard/settings",     label: "Settings",     icon: Settings,        exact: false },
  { href: "/nexoraa/dashboard/preview",      label: "Preview",      icon: Eye,             exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [unread, setUnread] = useState(0);

  // Poll unread count every 30s
  useEffect(() => {
    async function fetchUnread() {
      try {
        const supabase = createAdminClient();
        const [{ count: emailCount }, { count: waCount }] = await Promise.all([
          supabase.from("messages").select("*", { count: "exact", head: true }).eq("read", false),
          supabase.from("messages_wa").select("*", { count: "exact", head: true }).eq("read", false),
        ]);
        setUnread((emailCount ?? 0) + (waCount ?? 0));
      } catch {}
    }
    fetchUnread();
    const id = setInterval(fetchUnread, 30_000);
    return () => clearInterval(id);
  }, []);

  async function handleLogout() {
    const supabase = createAdminClient();
    await supabase.auth.signOut();
    router.push("/nexoraa");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 bg-[#0d0d0d] border-r border-dark-800 flex flex-col min-h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-dark-800">
        <span className="font-mono font-black text-base text-dark-100">
          <span className="text-blood-600">&lt;</span>
          Zyrenn
          <span className="text-blood-600">/&gt;</span>
        </span>
        <p className="text-[10px] text-dark-600 font-mono mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact, badge }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          const showBadge = badge && unread > 0;
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative",
                isActive
                  ? "bg-blood-950 border border-blood-900 text-blood-400"
                  : "text-dark-500 hover:text-dark-200 hover:bg-dark-900"
              )}>
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blood-600 text-white text-[9px] font-mono font-bold">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-dark-800 space-y-1">
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-dark-500 hover:text-dark-200 hover:bg-dark-900 transition-colors">
          <ExternalLink size={15} />
          View Site
        </a>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-dark-500 hover:text-blood-400 hover:bg-blood-950/50 transition-colors">
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
