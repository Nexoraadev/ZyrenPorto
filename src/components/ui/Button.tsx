import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blood-500",
          variant === "primary" &&
            "bg-blood-700 hover:bg-blood-600 text-white hover:shadow-lg hover:shadow-blood-900/40",
          variant === "ghost" &&
            "text-dark-400 hover:text-blood-400 hover:bg-dark-900",
          variant === "outline" &&
            "border border-dark-700 hover:border-blood-700 text-dark-300 hover:text-blood-400",
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-5 py-2.5 text-sm",
          size === "lg" && "px-8 py-3.5 text-base",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
