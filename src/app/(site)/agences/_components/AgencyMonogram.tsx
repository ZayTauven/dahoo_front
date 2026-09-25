import Image from "next/image";

import { cn } from "@/lib/utils";

import { agencyInitials } from "./agency";

/**
 * Marque typographique d'une agence sans logo : ses initiales en serif dans un carré papier à filet
 * fin, comme un ex-libris. Décorative : le nom est toujours écrit à côté.
 */
export function AgencyMonogram({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "font-display border-border-strong bg-surface-solid text-text-strong inline-flex shrink-0 items-center justify-center rounded-sm border leading-none tracking-tight select-none",
        className,
      )}
    >
      {agencyInitials(name)}
    </span>
  );
}

/**
 * Identité visuelle d'une agence : son logo (carré, fourni par l'API) ou, à défaut, son monogramme.
 * Décorative dans les deux cas (`alt=""`) : le nom de l'agence est toujours écrit à côté.
 * `className` fixe la taille (et la taille du texte du monogramme).
 */
export function AgencyMark({
  name,
  logo,
  className,
  sizes = "96px",
}: {
  name: string;
  logo: string | null;
  className?: string;
  sizes?: string;
}) {
  if (!logo) return <AgencyMonogram name={name} className={className} />;
  return (
    <span
      aria-hidden="true"
      className={cn("border-border-default bg-surface-solid relative inline-block shrink-0 overflow-hidden rounded-sm border", className)}
    >
      <Image src={logo} alt="" fill sizes={sizes} className="object-cover" />
    </span>
  );
}
