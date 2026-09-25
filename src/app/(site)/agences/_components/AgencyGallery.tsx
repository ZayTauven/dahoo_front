import Image from "next/image";
import Link from "next/link";

import { listingPrice } from "@/components/site/PropertyCard";
import { cn } from "@/lib/utils";

import type { AgencyListing } from "./data";

/** Photos affichées en tête de fiche. */
export const GALLERY_PHOTOS = 5;

/**
 * Placement de chaque photo : sur ordinateur, une grande à gauche (moitié de la largeur, deux rangées)
 * et les autres en damier ; sur mobile, la grande puis deux petites au plus.
 */
function tileClass(index: number, count: number): string {
  const mobile = index === 0 ? "col-span-2 row-span-2" : count === 2 ? "col-span-2" : index >= 3 ? "hidden lg:block" : "";
  let desktop: string;
  if (count === 1) desktop = "lg:col-span-4 lg:row-span-2";
  else if (count === 2) desktop = "lg:col-span-2 lg:row-span-2";
  else if (index === 0) desktop = "lg:col-span-2 lg:row-span-2";
  else if (count === 3) desktop = "lg:col-span-2 lg:row-span-1";
  else if (count === 4) desktop = index === 1 ? "lg:col-span-2 lg:row-span-1" : "lg:col-span-1 lg:row-span-1";
  else desktop = "lg:col-span-1 lg:row-span-1";
  return cn(mobile, desktop);
}

/**
 * Mosaïque d'ouverture de la fiche : les photos des dernières annonces de l'agence. Chaque photo mène
 * à son annonce ; titre et prix se dévoilent au survol ou au focus (ils sont aussi dans la liste des biens).
 */
export function AgencyGallery({ listings, className }: { listings: AgencyListing[]; className?: string }) {
  const shown = listings.slice(0, GALLERY_PHOTOS);
  if (shown.length === 0) return null;

  return (
    <ul
      aria-label="Photos de ses dernières annonces"
      className={cn(
        "m-0 grid list-none auto-rows-[9rem] grid-cols-2 gap-2 p-0 sm:auto-rows-[13rem] lg:h-[30rem] lg:auto-rows-auto lg:grid-cols-4 lg:grid-rows-2",
        className,
      )}
    >
      {shown.map((listing, index) => (
        <li key={listing.id} className={cn("min-h-0", tileClass(index, shown.length))}>
          <Link
            href={`/annonces/${listing.id}`}
            aria-label={`${listing.title}, ${listingPrice(listing)}`}
            className="group bg-surface-subtle relative block h-full overflow-hidden rounded-md text-white no-underline"
          >
            <Image
              src={listing.cover}
              alt=""
              fill
              preload={index === 0}
              sizes={index === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
              className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            />
            <span
              aria-hidden="true"
              className="from-brand-900/85 absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
            />
            <span className="absolute inset-x-0 bottom-0 flex translate-y-3 flex-col gap-1 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:p-5">
              <span className="site-label text-white/80">{listingPrice(listing)}</span>
              <span className={cn("font-display leading-tight tracking-tight", index === 0 ? "text-3xl" : "line-clamp-2 text-xl")}>
                {listing.title}
              </span>
            </span>
            <span className="site-label bg-surface-solid text-text-strong absolute top-3 left-3 rounded-full px-3 py-1.5">
              {listing.listing_type === "RENT" ? "À louer" : "À vendre"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
