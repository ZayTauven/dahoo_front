import { IconBath, IconBed, IconMapPin, IconPhoto, IconRuler2 } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Données minimales d'une annonce publique affichée en carte (compatibles avec l'API /public/listings/). */
export interface ListingCardData {
  id: number;
  title: string;
  listing_type: "RENT" | "SALE" | string;
  price: string | number;
  city?: string | null;
  neighborhood?: string | null;
  cover?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  surface?: number | null;
}

export function listingPrice(listing: Pick<ListingCardData, "listing_type" | "price">): string {
  return listing.listing_type === "RENT" ? `${formatMoney(listing.price)} / mois` : formatMoney(listing.price);
}

/** Carte d'annonce du portail (reprend la carte « property » de Crafto). */
export function PropertyCard({ listing, priority = false }: { listing: ListingCardData; priority?: boolean }) {
  const isRent = listing.listing_type === "RENT";
  const place = [listing.neighborhood, listing.city].filter(Boolean).join(", ");
  const href = `/annonces/${listing.id}`;

  return (
    <article className="bg-surface-solid border-border-default group relative flex h-full flex-col overflow-hidden rounded-xl border shadow-[0_18px_40px_-28px_rgba(20,27,71,0.35)] transition-transform duration-300 hover:-translate-y-1">
      <Link href={href} className="relative block aspect-[600/415] overflow-hidden" tabIndex={-1} aria-hidden="true">
        {listing.cover ? (
          <Image
            src={listing.cover}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1200px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="bg-surface-subtle text-text-subtle flex h-full items-center justify-center">
            <IconPhoto size={40} stroke={1.25} />
          </span>
        )}
        <span
          className={cn(
            "absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase",
            isRent ? "bg-accent text-on-accent" : "bg-brand text-on-brand",
          )}
        >
          {isRent ? "À louer" : "À vendre"}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-text-strong m-0 text-lg leading-snug font-semibold">
            <Link href={href} className="text-inherit no-underline after:absolute after:inset-0 hover:underline">
              {listing.title}
            </Link>
          </h3>
          {place && (
            <p className="text-text-muted m-0 flex items-center gap-1 text-sm">
              <IconMapPin size={16} stroke={1.75} aria-hidden="true" /> {place}
            </p>
          )}
        </div>

        <ul className="text-text-muted m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-sm">
          {listing.bedrooms != null && (
            <li className="flex items-center gap-1.5">
              <IconBed size={18} stroke={1.5} aria-hidden="true" />
              <span>
                <b className="text-text-strong">{listing.bedrooms}</b> ch.
              </span>
            </li>
          )}
          {listing.bathrooms != null && (
            <li className="flex items-center gap-1.5">
              <IconBath size={18} stroke={1.5} aria-hidden="true" />
              <span>
                <b className="text-text-strong">{listing.bathrooms}</b> sdb
              </span>
            </li>
          )}
          {listing.surface != null && (
            <li className="flex items-center gap-1.5">
              <IconRuler2 size={18} stroke={1.5} aria-hidden="true" />
              <span>
                <b className="text-text-strong">{listing.surface}</b> m²
              </span>
            </li>
          )}
        </ul>

        <div className="border-border-default mt-auto flex items-center justify-between gap-3 border-t pt-4">
          <span className="text-text-muted text-xs font-semibold tracking-wide uppercase">Voir le bien</span>
          <span className="font-display text-text-strong text-lg font-bold">{listingPrice(listing)}</span>
        </div>
      </div>
    </article>
  );
}
