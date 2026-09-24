"use client";

import { IconCloudOff, IconRefresh } from "@tabler/icons-react";
import Link from "next/link";

import { Container } from "@/components/site/layout";

/** Fiche d'agence non chargée (API indisponible) : message et nouvel essai, sans perdre l'en-tête du site. */
export default function AgencyError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container className="py-20 sm:py-28">
      <div role="alert" className="ax-empty mx-auto max-w-xl">
        <IconCloudOff className="ax-empty__icon" stroke={1.5} aria-hidden="true" />
        <h1 className="font-display text-text-strong m-0 text-2xl font-semibold">Fiche momentanément indisponible</h1>
        <p className="m-0">Nous n&apos;arrivons pas à charger cette agence pour le moment. Réessayez dans quelques instants.</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button type="button" className="ax-btn ax-btn--primary" onClick={() => retry()}>
            <IconRefresh className="ax-btn__icon" stroke={2} aria-hidden="true" />
            <span className="ax-btn__label">Réessayer</span>
          </button>
          <Link href="/agences" className="ax-btn ax-btn--secondary">
            <span className="ax-btn__label">Toutes les agences</span>
          </Link>
        </div>
      </div>
    </Container>
  );
}
