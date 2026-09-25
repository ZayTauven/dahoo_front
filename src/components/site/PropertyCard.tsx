import { IconArrowUpRight } from "@tabler/icons-react";
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

/** Caractéristiques courtes (« 3 ch. · 2 sdb · 95 m² »). */
function specs(listing: ListingCardData): string[] {
  const items: string[] = [];
  if (listing.bedrooms != null) items.push(`${listing.bedrooms} ch.`);
  if (listing.bathrooms != null) items.push(`${listing.bathrooms} sdb`);
  if (listing.surface != null) items.push(`${listing.surface} m²`);
  return items;
}

/**
 * Carte d'annonce du portail, en mise en page de magazine : photo sans cadre, lieu en étiquette,
 * titre en serif, caractéristiques et prix sur un filet. Toute la carte est cliquable.
 * `size="feature"` agrandit la photo et le titre (annonce mise en avant).
 */
export function PropertyCard({
  listing,
  preload = false,
  size = "default",
  className,
}: {
  listing: ListingCardData;
  preload?: boolean;
  size?: "default" | "feature";
  className?: string;
}) {
  const isRent = listing.listing_type === "RENT";
  const place = [listing.neighborhood, listing.city].filter(Boolean).join(", ");
  const href = `/annonces/${listing.id}`;
  const feature = size === "feature";
  const details = specs(listing);

  return (
    <article className={cn("group relative flex flex-col gap-5", className)}>
      <div
        className={cn(
          "bg-surface-subtle relative overflow-hidden rounded-md",
          feature ? "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[5/4]" : "aspect-[4/5]",
        )}
      >
        {listing.cover ? (
          <Image
            src={listing.cover}
            alt=""
            fill
            preload={preload}
            sizes={feature ? "(min-width: 992px) 55vw, 100vw" : "(min-width: 1200px) 420px, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        ) : (
          // Pas encore de photo : hachures fines et mention en italique, lisibles sur tous les fonds.
          <span className="border-border-strong text-text-muted font-display flex h-full items-center justify-center rounded-md border bg-[repeating-linear-gradient(135deg,transparent_0_14px,var(--ax-border)_14px_15px)] p-8 text-center text-3xl italic">
            Photos à venir
          </span>
        )}
        <span className="site-label bg-surface-solid text-text-strong absolute top-4 left-4 rounded-full px-3 py-1.5">
          {isRent ? "À louer" : "À vendre"}
        </span>
        <span
          aria-hidden="true"
          className="bg-accent text-on-accent absolute right-4 bottom-4 flex size-12 scale-50 items-center justify-center rounded-full opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100"
        >
          <IconArrowUpRight size={22} stroke={1.75} />
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {place && <p className="site-label text-text-muted m-0">{place}</p>}
        <h3
          className={cn(
            "font-display text-text-strong m-0 leading-[1.05] font-normal tracking-[-0.015em] text-balance",
            feature ? "text-3xl sm:text-4xl" : "text-[1.7rem]",
          )}
        >
          <Link href={href} className="text-inherit no-underline after:absolute after:inset-0">
            {listing.title}
          </Link>
        </h3>
        <div className="border-border-default flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t pt-3">
          <span className="text-text-muted font-mono text-[0.8rem]">{details.length > 0 ? details.join(" · ") : "—"}</span>
          <span className="text-text-strong text-[0.95rem] font-medium tabular-nums">{listingPrice(listing)}</span>
        </div>
      </div>
    </article>
  );
}
