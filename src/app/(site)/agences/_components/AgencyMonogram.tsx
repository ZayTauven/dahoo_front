import { cn } from "@/lib/utils";

import { agencyInitials } from "./agency";

/** Trois déclinaisons de la charte, attribuées de façon stable selon l'identifiant de l'agence. */
const TONES = [
  "bg-brand-600 text-white",
  "bg-accent text-on-accent",
  "bg-brand-100 text-brand-800",
] as const;

/**
 * Pastille aux initiales de l'agence : l'API publique ne fournit pas (encore) de logo.
 * Décorative : le nom de l'agence est toujours écrit à côté.
 */
export function AgencyMonogram({ id, name, className }: { id: number; name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "font-display inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide select-none",
        TONES[id % TONES.length],
        className,
      )}
    >
      {agencyInitials(name)}
    </span>
  );
}
