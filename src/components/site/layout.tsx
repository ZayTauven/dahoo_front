import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Largeur du site public (1360 px) avec des marges latérales généreuses. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12", className)}>{children}</div>;
}

/**
 * Bloc vertical d'une page du site. `tone="subtle"` pose un sable plus soutenu,
 * `tone="brand"` une section sombre à l'encre (texte clair, boutons orangés).
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
        "pt-14 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28",
        tone === "subtle" && "bg-surface-subtle",
        tone === "brand" && "site-dark",
        className,
      )}
    >
      {children}
    </section>
  );
}
