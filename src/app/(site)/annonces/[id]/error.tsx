"use client";

import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

import { Container } from "@/components/site/layout";
import { Highlight } from "@/components/site/motion";
import { Breadcrumbs } from "@/components/site/PageHero";
import { Eyebrow } from "@/components/site/SectionHeading";

/** Fiche non chargée (API indisponible) : message et nouvel essai, sans perdre l'en-tête du site. */
export default function ListingError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="pt-10 pb-24 sm:pt-14 sm:pb-32">
      <Container>
        <Breadcrumbs crumbs={[{ label: "Annonce indisponible" }]} />

        <div role="alert" className="mt-14 grid gap-10 sm:mt-20 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-8">
            <Eyebrow>Service momentanément interrompu</Eyebrow>
            <h1 className="font-display text-text-strong m-0 text-[3.1rem] leading-[0.94] font-normal tracking-[-0.03em] text-balance sm:text-7xl lg:text-[6.75rem]">
              Annonce momentanément <Highlight>indisponible</Highlight>
            </h1>
          </div>
          <div className="flex flex-col gap-8 lg:col-span-4 lg:pb-3">
            <p className="text-text-muted m-0 text-base leading-relaxed text-pretty sm:text-lg">
              Nous n&apos;arrivons pas à charger cette annonce pour le moment. Réessayez dans quelques instants.
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <button type="button" className="ax-btn ax-btn--primary ax-btn--lg" onClick={() => retry()}>
                <span className="ax-btn__label">Réessayer</span>
              </button>
              <Link href="/louer" className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
                Voir les annonces <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
