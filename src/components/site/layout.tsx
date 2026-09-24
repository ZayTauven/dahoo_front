import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Largeur de lecture du site public (1200 px, marges latérales adaptatives). */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6", className)}>{children}</div>;
}

/**
 * Bloc vertical d'une page du site. `tone="subtle"` alterne le fond (comme les sections grises de Crafto),
 * `tone="brand"` pose un fond indigo de marque avec texte clair.
 */
export function Section({
  children,
  className,
  tone = "default",
  id,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "subtle" | "brand";
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "py-16 sm:py-20 lg:py-24",
        tone === "subtle" && "bg-surface-subtle",
        tone === "brand" && "bg-brand-900 text-white",
        className,
      )}
    >
      {children}
    </section>
  );
}
