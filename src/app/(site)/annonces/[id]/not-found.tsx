import { IconHomeSearch } from "@tabler/icons-react";
import Link from "next/link";

import { Container } from "@/components/site/layout";

/** Annonce inexistante, retirée ou louée entre-temps (404 de l'API ou identifiant invalide). */
export default function ListingNotFound() {
  return (
    <Container className="py-20 sm:py-28">
      <div className="ax-empty mx-auto max-w-xl">
        <IconHomeSearch className="ax-empty__icon" stroke={1.5} aria-hidden="true" />
        <h1 className="font-display text-text-strong m-0 text-2xl font-semibold sm:text-3xl">Cette annonce n&apos;est plus disponible</h1>
        <p className="m-0">
          Le bien a peut-être déjà été loué ou vendu, ou l&apos;agence a retiré son annonce. D&apos;autres biens vous attendent
          sur Dahoo.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link href="/louer" className="ax-btn ax-btn--primary">
            <span className="ax-btn__label">Voir les biens à louer</span>
          </Link>
          <Link href="/acheter" className="ax-btn ax-btn--secondary">
            <span className="ax-btn__label">Voir les biens à vendre</span>
          </Link>
        </div>
      </div>
    </Container>
  );
}
