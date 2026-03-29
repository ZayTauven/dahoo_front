import { cn } from "@/lib/utils";
import React from "react";

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: "lowest" | "low" | "container" | "high" | "highest" | "bright";
  raised?: boolean;
  recessed?: boolean;
  glass?: boolean;
  animate?: boolean;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, level = "container", raised, recessed, glass, animate, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md transition-all duration-300 ease-out",
          {
            "bg-surface-lowest": level === "lowest",
            "bg-surface-low": level === "low",
            "bg-surface-container": level === "container",
            "bg-surface-high": level === "high",
            "bg-surface-highest": level === "highest",
            "bg-surface-bright": level === "bright",
            "shadow-premium": raised,
            "shadow-inner bg-opacity-50": recessed,
            "glass bg-opacity-60 backdrop-blur-xl": glass,
            "animate-bloom": animate,
            "hover:bg-opacity-90": !glass && !recessed,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Surface.displayName = "Surface";
