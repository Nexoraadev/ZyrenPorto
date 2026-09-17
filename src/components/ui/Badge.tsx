import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "blood" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono",
        variant === "default" && "bg-dark-900 border border-dark-800 text-dark-400",
        variant === "blood" && "bg-blood-950 border border-blood-800 text-blood-400",
        variant === "outline" && "border border-dark-700 text-dark-400",
        className
      )}
    >
      {children}
    </span>
  );
}
