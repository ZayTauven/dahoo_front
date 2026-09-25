import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./layout";
import { Parallax, RevealImage, RevealLines } from "./motion";
import { Eyebrow } from "./SectionHeading";

export interface Crumb {
  label: string;
  href?: string;
}

/** Fil d'Ariane du site, en étiquettes séparées par des barres obliques. L'accueil est ajouté d'office. */
export function Breadcrumbs({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  const trail: Crumb[] = [{ label: "Accueil", href: "/" }, ...crumbs];
  return (
    <nav aria-label="Fil d'Ariane" className={className}>
      <ol className="site-label text-text-muted m-0 flex list-none flex-wrap items-center gap-2 p-0">
        {trail.map((crumb, index) => {
          const current = index === trail.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {current || !crumb.href ? (
                <span aria-current={current ? "page" : undefined} className={current ? "text-text-strong" : undefined}>
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="site-link text-inherit">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * En-tête des pages intérieures du site : fil d'Ariane, sur-titre, unique <h1> de la page en très
 * grand serif (révélé au chargement), chapeau et actions dans la colonne de droite, puis une grande
 * photo facultative en parallaxe. Remplace les bandeaux photo indigo du gabarit Crafto.
 */
export function PageHero({
  crumbs,
  eyebrow,
  index,
  title,
  lede,
  children,
  image,
  imageAlt = "",
  className,
}: {
  /** Fil d'Ariane sans l'accueil (ajouté automatiquement) ; le dernier élément est la page courante. */
  crumbs: Crumb[];
  eyebrow?: string;
  index?: string;
  /** Contenu du <h1> (utiliser <Highlight> pour le mot en italique). */
  title: ReactNode;
  lede?: ReactNode;
  /** Actions ou informations sous le chapeau (boutons, chiffres). */
  children?: ReactNode;
  /** Photo pleine largeur sous le titre. */
  image?: string;
  /** Texte alternatif ; vide si la photo est décorative. */
  imageAlt?: string;
  className?: string;
}) {
  return (
    <div className={cn("pt-8 pb-12 sm:pt-10 sm:pb-14 lg:pb-16", className)}>
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <div className="mt-10 grid gap-8 sm:mt-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-8">
            {eyebrow && <Eyebrow index={index}>{eyebrow}</Eyebrow>}
            <h1 className="font-display text-text-strong m-0 text-[2.9rem] leading-[0.94] font-normal tracking-[-0.03em] text-balance sm:text-6xl lg:text-[5.5rem]">
              <RevealLines play="mount" delay={0.1} lines={[<Fragment key="titre">{title}</Fragment>]} />
            </h1>
          </div>
          {(lede || children) && (
            <div className="flex flex-col gap-8 lg:col-span-4 lg:pb-3">
              {lede && <div className="text-text-muted m-0 text-base leading-relaxed text-pretty sm:text-lg">{lede}</div>}
              {children}
            </div>
          )}
        </div>
      </Container>

      {image && (
        <Container className="mt-10 sm:mt-12">
          <RevealImage className="aspect-4/5 rounded-md sm:aspect-video lg:aspect-[21/8]">
            <Parallax distance={50} className="absolute -inset-y-14 inset-x-0">
              <Image src={image} alt={imageAlt} fill preload sizes="(min-width: 1360px) 1264px, 100vw" className="object-cover" />
            </Parallax>
          </RevealImage>
        </Container>
      )}
    </div>
  );
}
