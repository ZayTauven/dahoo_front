import { IconArrowRight, IconHomeSearch } from "@tabler/icons-react";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { PropertyCard } from "@/components/site/PropertyCard";
import { SectionHeading } from "@/components/site/SectionHeading";

import type { HomeListing } from "./data";

/** « Property for sell and rent » de Crafto : les 6 dernières annonces publiées. */
export function LatestListings({ listings }: { listings: HomeListing[] }) {
  return (
    <Section tone="subtle" labelledBy="accueil-annonces">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            id="accueil-annonces"
            eyebrow="Fraîchement publiées"
            title={
              <>
                Biens à louer <Highlight>et à vendre</Highlight>
              </>
            }
          />
          <Link
            href="/louer"
            className="group text-text-strong hover:text-brand inline-flex shrink-0 items-center gap-3 font-semibold no-underline"
          >
            Voir toutes les annonces
            <span className="bg-brand text-on-brand flex size-10 items-center justify-center rounded-full transition-transform group-hover:translate-x-1">
              <IconArrowRight size={18} stroke={2} aria-hidden="true" />
            </span>
          </Link>
        </div>

        {listings.length > 0 ? (
          <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {listings.map((listing, index) => (
              <Reveal as="li" key={listing.id} delay={(index % 3) * 0.08}>
                <PropertyCard listing={listing} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <div className="ax-empty bg-surface-solid border-border-default rounded-xl border">
            <IconHomeSearch className="ax-empty__icon" stroke={1.5} aria-hidden="true" />
            <h3 className="ax-empty__title">Aucune annonce en ligne pour le moment</h3>
            <p className="m-0 max-w-md">
              Les agences partenaires publieront bientôt leurs biens ici. En attendant, découvrez-les et
              contactez-les directement.
            </p>
            <Link href="/agences" className="ax-btn ax-btn--secondary">
              <span className="ax-btn__label">Voir les agences partenaires</span>
            </Link>
          </div>
        )}
      </Container>
    </Section>
  );
}
