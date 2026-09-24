import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Titre de section du site public : sur-titre en accent, titre en police display
 * (utiliser <Highlight> pour le mot fort), texte d'introduction facultatif.
 */
export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "left",
  id,
  className,
  invert = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
  id?: string;
  className?: string;
  /** Texte clair, pour une section sur fond indigo. */
  invert?: boolean;
}) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-3", align === "center" && "mx-auto items-center text-center", className)}>
      {eyebrow && (
        <p className={cn("m-0 text-sm font-semibold tracking-wide", invert ? "text-accent-300" : "text-accent-text")}>{eyebrow}</p>
      )}
      <h2
        id={id}
        className={cn(
          "font-display m-0 text-3xl leading-[1.15] font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem]",
          invert ? "text-white" : "text-text-strong",
        )}
      >
        {title}
      </h2>
      {children && <div className={cn("text-base leading-relaxed", invert ? "text-white/75" : "text-text-muted")}>{children}</div>}
    </div>
  );
}
