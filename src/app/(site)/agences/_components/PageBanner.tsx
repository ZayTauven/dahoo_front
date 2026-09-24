import { IconChevronRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/site/layout";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Bandeau de titre des pages intérieures du site (agences, à propos, contact) :
 * photo en fond voilée d'indigo, sur-titre, unique <h1> de la page, chapeau et fil d'Ariane.
 * Reprend l'en-tête des pages « agents / about / contact » de Crafto, dont le grand mot détouré.
 * Pas d'animation d'apparition ici : le titre est le premier contenu visible (LCP).
 */
export function PageBanner({
  eyebrow,
  title,
  lede,
  crumbs,
  image,
  watermark,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Fil d'Ariane sans l'accueil (ajouté automatiquement) ; le dernier élément est la page courante. */
  crumbs: Crumb[];
  image: string;
  /** Grand mot décoratif détouré, en bas à droite (masqué aux lecteurs d'écran). */
  watermark?: string;
}) {
  const trail: Crumb[] = [{ label: "Accueil", href: "/" }, ...crumbs];

  return (
    <div className="bg-brand-900 relative isolate overflow-hidden text-white">
      <Image src={image} alt="" fill preload sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden="true" className="from-brand-900/95 via-brand-900/85 to-brand-900/60 absolute inset-0 -z-10 bg-gradient-to-r" />
      {watermark && (
        <span
          aria-hidden="true"
          className="font-display pointer-events-none absolute right-0 -bottom-[0.22em] -z-10 hidden text-[9rem] leading-none font-bold tracking-tight text-transparent select-none [-webkit-text-stroke:1.5px_rgb(255_255_255/0.22)] md:block lg:text-[12rem]"
        >
          {watermark}
        </span>
      )}

      <Container className="flex flex-col gap-6 py-16 sm:py-20 lg:py-28">
        <div className="flex max-w-3xl flex-col gap-4">
          {eyebrow && <p className="text-accent-300 m-0 text-sm font-semibold tracking-wide">{eyebrow}</p>}
          <h1 className="font-display m-0 text-4xl leading-[1.1] font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {lede && <div className="m-0 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{lede}</div>}
        </div>

        <nav aria-label="Fil d'Ariane">
          <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-sm text-white/75">
            {trail.map((crumb, index) => {
              const current = index === trail.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 && <IconChevronRight size={14} stroke={2} aria-hidden="true" className="text-white/50" />}
                  {current || !crumb.href ? (
                    <span aria-current={current ? "page" : undefined} className={current ? "font-semibold text-white" : undefined}>
                      {crumb.label}
                    </span>
                  ) : (
                    <Link href={crumb.href} className="text-white/75 no-underline transition-colors hover:text-white hover:underline">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </Container>
    </div>
  );
}
