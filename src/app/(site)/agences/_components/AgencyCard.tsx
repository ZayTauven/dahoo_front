import { IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import type { Schema } from "@/lib/api/types";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import { AgencyMark } from "./AgencyMonogram";
import type { AgencyListing } from "./data";

/** Photos affichées dans la mosaïque d'une carte. */
export const CARD_PHOTOS = 3;

/** Placement des photos selon leur nombre : une grande à gauche et deux petites, ou deux moitiés, ou une seule. */
function tileClass(index: number, count: number): string {
  if (count === 1) return "col-span-6 row-span-2";
  if (count === 2) return "col-span-3 row-span-2";
  return index === 0 ? "col-span-4 row-span-2" : "col-span-2";
}

/**
 * Mosaïque de l'offre d'une agence : les couvertures de ses dernières annonces. La dernière tuile
 * indique combien d'autres biens attendent sur la fiche.
 */
function CardMosaic({ listings, total }: { listings: AgencyListing[]; total: number }) {
  const shown = listings.slice(0, CARD_PHOTOS);
  const more = total - shown.length;

  if (shown.length === 0) {
    return (
      <div className="border-border-strong text-text-muted font-display flex aspect-[4/3] items-center sm:aspect-[16/10] justify-center rounded-sm border bg-[repeating-linear-gradient(135deg,transparent_0_14px,var(--ax-border)_14px_15px)] text-2xl italic">
        Photos à venir
      </div>
    );
  }

  return (
    <div className="grid aspect-[4/3] grid-cols-6 sm:aspect-[16/10] grid-rows-2 gap-1 overflow-hidden rounded-sm">
      {shown.map((listing, index) => (
        <span key={listing.id} className={cn("bg-surface-subtle relative overflow-hidden", tileClass(index, shown.length))}>
          <Image
            src={listing.cover}
            alt=""
            fill
            sizes={index === 0 ? "(min-width: 1024px) 300px, (min-width: 640px) 34vw, 66vw" : "(min-width: 1024px) 150px, 34vw"}
            className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
          {more > 0 && index === shown.length - 1 && shown.length > 1 && (
            <span className="bg-brand-900/55 absolute inset-0 flex items-center justify-center font-mono text-sm font-medium text-white">
              +{formatNumber(more)}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/**
 * Carte d'une agence dans l'annuaire (d'après le « Team Profile Grid » de 21st) : la photo du profil
 * devient une mosaïque de ses biens, le logo (ou le monogramme) chevauche la mosaïque, puis le nom,
 * la ville et les compteurs, et la barre d'encre « Voir l'agence » en pied. Toute la carte mène à la fiche.
 */
export function AgencyCard({
  agency,
  listings,
}: {
  agency: Schema<"PublicAgency">;
  listings: AgencyListing[];
}) {
  const latest = listings[0]?.published_at;
  const facts = [
    { label: agency.listings_count > 1 ? "Annonces" : "Annonce", value: formatNumber(agency.listings_count) },
    ...(latest ? [{ label: "Dernière publiée", value: formatDate(latest, "short") }] : []),
  ];

  return (
    <article className="group bg-surface-solid relative flex h-full flex-col overflow-hidden rounded-md">
      <div className="p-1 pb-0 sm:p-1.5 sm:pb-0">
        <CardMosaic listings={listings} total={agency.listings_count} />
      </div>

      <div className="flex flex-1 flex-col gap-3 px-3 pt-0 pb-4 sm:gap-5 sm:px-6 sm:pb-5">
        <div className="flex items-end gap-2.5 sm:gap-4">
          <AgencyMark
            name={agency.name}
            logo={agency.logo}
            sizes="80px"
            className="ring-surface-solid relative z-10 -mt-6 size-12 text-lg ring-4 sm:-mt-8 sm:size-18 sm:text-[1.7rem]"
          />
          <p className="site-label text-text-muted m-0 min-w-0 truncate pb-0.5 sm:pb-1">{agency.city || "Sénégal"}</p>
        </div>

        <h3 className="font-display text-text-strong m-0 text-[1.45rem] leading-[1] font-normal sm:text-[2rem] tracking-tight text-balance">
          <Link
            href={`/agences/${agency.id}`}
            className="text-inherit no-underline outline-none after:absolute after:inset-0 after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-(--ax-accent)"
          >
            {agency.name}
          </Link>
        </h3>

        <dl className="border-border-default m-0 mt-auto grid gap-4 border-t pt-3 sm:grid-cols-2 sm:pt-4">
          {facts.map((fact, index) => (
            <div key={fact.label} className={cn("flex-col gap-1", index === 0 ? "flex" : "hidden sm:flex")}>
              <dt className="site-label text-text-muted">{fact.label}</dt>
              <dd className="text-text-strong m-0 font-mono text-sm">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <span
        aria-hidden="true"
        className="bg-text-strong text-canvas group-hover:bg-accent group-hover:text-on-accent flex h-10 items-center justify-center gap-2 text-xs font-medium sm:h-12 sm:text-sm transition-colors duration-500"
      >
        Voir l&apos;agence
        <IconArrowUpRight size={16} stroke={1.75} className="transition-transform duration-500 group-hover:rotate-45" />
      </span>
    </article>
  );
}
