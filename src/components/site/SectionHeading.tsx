import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Sur-titre du site : pastille orange + étiquette en chasse fixe, précédé d'un numéro de section
 * facultatif (« 01 »), comme un sommaire de magazine.
 */
export function Eyebrow({
  children,
  index,
  className,
  as: Tag = "p",
  id,
}: {
  children: ReactNode;
  index?: string;
  className?: string;
  /** `h2` quand l'étiquette sert de titre à une section sans grand titre (manifeste, index). */
  as?: "p" | "h2";
  id?: string;
}) {
  return (
    <Tag id={id} className={cn("site-label text-text-muted m-0 flex items-center gap-3", className)}>
      {index && <span className="text-text-strong">{index}</span>}
      <span aria-hidden="true" className="bg-accent size-1.5 shrink-0 rounded-full" />
      {children}
    </Tag>
  );
}

/**
 * Titre de section du site public : sur-titre, grand titre en serif (utiliser <Highlight> pour
 * le mot en italique), texte d'introduction facultatif.
 */
export function SectionHeading({
  eyebrow,
  index,
  title,
  children,
  align = "left",
  id,
  className,
  invert = false,
}: {
  eyebrow?: string;
  /** Numéro de section affiché devant le sur-titre (« 01 »). */
  index?: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
  id?: string;
  className?: string;
  /** Texte clair sur une photo ou un fond sombre sans portée `.site-dark`. */
  invert?: boolean;
}) {
  return (
    <div className={cn("flex max-w-3xl flex-col gap-5", align === "center" && "mx-auto items-center text-center", className)}>
      {eyebrow && (
        <Eyebrow index={index} className={cn(invert && "text-white/75 [&>span:first-child]:text-white")}>
          {eyebrow}
        </Eyebrow>
      )}
      <h2
        id={id}
        className={cn(
          "font-display m-0 text-[2.4rem] leading-[0.98] font-normal tracking-tight text-balance sm:text-5xl lg:text-[3.75rem]",
          invert ? "text-white" : "text-text-strong",
        )}
      >
        {title}
      </h2>
      {children && (
        <div className={cn("max-w-xl text-base leading-relaxed text-pretty sm:text-lg", invert ? "text-white/75" : "text-text-muted")}>
          {children}
        </div>
      )}
    </div>
  );
}
