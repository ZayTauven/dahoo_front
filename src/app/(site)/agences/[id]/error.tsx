"use client";

import { IconArrowRight, IconRefresh } from "@tabler/icons-react";
import Link from "next/link";

import { Container } from "@/components/site/layout";
import { Highlight } from "@/components/site/motion";
import { Breadcrumbs } from "@/components/site/PageHero";
import { Eyebrow } from "@/components/site/SectionHeading";

/** Fiche d'agence non chargée (API indisponible) : message et nouvel essai, sans perdre l'en-tête du site. */
export default function AgencyError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container className="pt-10 pb-24 sm:pt-14 sm:pb-32 lg:pb-40">
      <Breadcrumbs crumbs={[{ label: "Agences", href: "/agences" }, { label: "Fiche indisponible" }]} />
      <div role="alert" className="mt-14 flex max-w-4xl flex-col items-start gap-8 sm:mt-20">
        <Eyebrow>Erreur de chargement</Eyebrow>
        <h1 className="font-display text-text-strong m-0 text-[3.1rem] leading-[0.94] font-normal tracking-[-0.03em] text-balance sm:text-7xl lg:text-[6rem]">
          Fiche momentanément <Highlight>indisponible</Highlight>
        </h1>
        <p className="text-text-muted m-0 max-w-xl text-base leading-relaxed sm:text-lg">
          Nous n&apos;arrivons pas à charger cette agence pour le moment. Réessayez dans quelques instants.
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <button type="button" className="ax-btn ax-btn--primary ax-btn--lg" onClick={() => retry()}>
            <IconRefresh className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            <span className="ax-btn__label">Réessayer</span>
          </button>
          <Link href="/agences" className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
            Toutes les agences <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Container>
  );
}
