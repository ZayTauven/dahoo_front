import { IconChevronRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/site/layout";

import { LISTING_PAGES, type ListingType } from "./filters";

const VISUALS: Record<ListingType, { image: string; eyebrow: string; lede: string; watermark: string }> = {
  RENT: {
    image: "/images/site/slider-03.webp",
    eyebrow: "Trouvez votre prochain logement",
    lede: "Appartements, villas, studios et locaux professionnels proposés par des agences immobilières partenaires, de Dakar à la Petite-Côte.",
    watermark: "location",
  },
  SALE: {
    image: "/images/site/slider-01.webp",
    eyebrow: "Investissez en toute confiance",
    lede: "Maisons, appartements et terrains à vendre, présentés par des agences immobilières vérifiées. Prix affichés en FCFA.",
    watermark: "vente",
  },
};

/**
 * Bandeau de titre des listes d'annonces (reprend l'en-tête de « demo-real-estate-rent / sell » de Crafto) :
 * photo voilée d'indigo, grand mot détouré, unique <h1> de la page et fil d'Ariane.
 * Réserve de l'espace en bas (pb-*) : le panneau de filtres vient le chevaucher.
 */
export function ListingsBanner({ listingType, heading }: { listingType: ListingType; heading: string }) {
  const visual = VISUALS[listingType];
  const page = LISTING_PAGES[listingType];

  return (
    <div className="bg-brand-900 relative isolate overflow-hidden text-white">
      <Image src={visual.image} alt="" fill preload sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden="true" className="from-brand-900/95 via-brand-900/85 to-brand-900/55 absolute inset-0 -z-10 bg-gradient-to-r" />
      <span
        aria-hidden="true"
        className="font-display pointer-events-none absolute right-0 -bottom-[0.2em] -z-10 hidden text-[9rem] leading-none font-bold tracking-tight text-transparent select-none [-webkit-text-stroke:1.5px_rgb(255_255_255/0.22)] md:block lg:text-[12rem]"
      >
        {visual.watermark}
      </span>

      <Container className="flex flex-col gap-6 pt-14 pb-24 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <nav aria-label="Fil d'Ariane">
          <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-sm text-white/75">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="text-white/75 no-underline transition-colors hover:text-white hover:underline">
                Accueil
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <IconChevronRight size={14} stroke={2} aria-hidden="true" className="text-white/50" />
              <span aria-current="page" className="font-semibold text-white">
                {page.crumb}
              </span>
            </li>
          </ol>
        </nav>

        <div className="flex max-w-3xl flex-col gap-4">
          <p className="text-accent-300 m-0 text-sm font-semibold tracking-wide">{visual.eyebrow}</p>
          <h1 className="font-display m-0 text-4xl leading-[1.1] font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <p className="m-0 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{visual.lede}</p>
        </div>
      </Container>
    </div>
  );
}
