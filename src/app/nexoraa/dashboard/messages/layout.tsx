"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/nexoraa/dashboard/messages",          label: "Email Inbox", icon: Mail,          exact: true  },
  { href: "/nexoraa/dashboard/messages/wa",        label: "WA Inbox",    icon: MessageSquare, exact: false },
  { href: "/nexoraa/dashboard/messages/settings",  label: "Settings",    icon: Settings,      exact: false },
];

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      {/* Sub-navbar — tabs only, no non-clickable title */}
      <div className="flex items-center gap-1 mb-6 border-b border-dark-800 pb-0 overflow-x-auto">
        {tabs.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-mono transition-colors border-b-2 -mb-px whitespace-nowrap shrink-0",
                isActive
                  ? "border-blood-600 text-blood-400"
                  : "border-transparent text-dark-500 hover:text-dark-300"
              )}
            >
              <Icon size={13} />
              {label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
