import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { PropertyCard } from "@/components/site/PropertyCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { cn } from "@/lib/utils";

import type { HomeListing } from "./data";

/**
 * Placement des cartes dans la grille de 12 colonnes (bureau) : une annonce à la une, puis des
 * cartes légèrement décalées en hauteur. Sur mobile, les cartes forment un ruban qu'on fait glisser.
 */
const LAYOUT = [
  "sm:col-span-2 lg:col-span-7",
  "lg:col-span-5 lg:mt-20",
  "lg:col-span-4",
  "lg:col-span-4 lg:mt-12",
  "lg:col-span-4",
];

/** Les dernières annonces publiées, en mise en page de magazine. */
export function LatestListings({ listings, total }: { listings: HomeListing[]; total: number }) {
  // Les annonces avec photo d'abord (l'annonce à la une en a toujours une), les autres à la fin.
  const ordered = [...listings.filter((listing) => listing.cover), ...listings.filter((listing) => !listing.cover)];

  return (
    <Section tone="subtle" labelledBy="accueil-annonces">
      <Container className="flex flex-col gap-10 lg:gap-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="accueil-annonces"
            index="02"
            eyebrow="Fraîchement publiées"
            title={
              <>
                Biens à louer <Highlight>et à vendre</Highlight>
              </>
            }
          />
          <Link
            href="/louer"
            className="site-link text-text-strong inline-flex shrink-0 items-center gap-2 self-start font-medium lg:self-auto"
          >
            Toutes les annonces{total > 0 && <span className="text-text-muted font-mono text-sm">({total})</span>}
            <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
          </Link>
        </div>

        {ordered.length > 0 ? (
          <ul
            aria-label="Dernières annonces"
            className="-mx-5 flex list-none snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 sm:overflow-visible sm:p-0 lg:grid-cols-12"
          >
            {ordered.map((listing, index) => (
              <Reveal
                as="li"
                key={listing.id}
                delay={(index % 3) * 0.08}
                className={cn("w-[78vw] shrink-0 snap-start sm:w-auto", LAYOUT[index % LAYOUT.length])}
              >
                <PropertyCard listing={listing} size={index === 0 ? "feature" : "default"} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <div className="border-border-default flex flex-col items-start gap-6 border-t pt-10">
            <p className="font-display text-text-strong m-0 max-w-2xl text-4xl leading-tight">
              Aucune annonce en ligne pour le moment.
            </p>
            <p className="text-text-muted m-0 max-w-md">
              Les agences partenaires publieront bientôt leurs biens ici. En attendant, découvrez-les et contactez-les
              directement.
            </p>
            <Link href="/agences" className="ax-btn ax-btn--secondary ax-btn--lg">
              <span className="ax-btn__label">Voir les agences partenaires</span>
            </Link>
          </div>
        )}
      </Container>
    </Section>
  );
}
