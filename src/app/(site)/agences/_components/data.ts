import { cache } from "react";

import { publicApi } from "@/lib/api/server";
import type { Schema } from "@/lib/api/types";

/*
 * Lectures de l'API publique pour les pages « agences ». Les réponses sont mises en cache 60 s
 * par `publicApi` ; `cache()` évite en plus un double appel entre `generateMetadata` et la page.
 * Une panne de l'API ne fait pas tomber la page : les fonctions renvoient `null` et la page
 * affiche un message d'indisponibilité.
 */

export const AGENCIES_PAGE_SIZE = 24;
export const LISTINGS_PAGE_SIZE = 9;

export type ListingTypeFilter = "RENT" | "SALE";

export async function getAgencies(page: number): Promise<Schema<"PaginatedPublicAgencyList"> | "page-not-found" | null> {
  try {
    const { data, response } = await publicApi.GET("/api/v1/public/agencies/", {
      params: { query: { page, page_size: AGENCIES_PAGE_SIZE } },
    });
    if (response.status === 404) return "page-not-found";
    return data ?? null;
  } catch {
    return null;
  }
}

/** Fiche d'une agence : `"not-found"` si elle n'existe pas ou n'a aucune annonce publiée. */
export const getAgency = cache(async (id: number): Promise<Schema<"PublicAgencyDetail"> | "not-found" | null> => {
  try {
    const { data, response } = await publicApi.GET("/api/v1/public/agencies/{id}/", { params: { path: { id } } });
    if (response.status === 404) return "not-found";
    return data ?? null;
  } catch {
    return null;
  }
});

export async function getAgencyListings(
  agency: number,
  page: number,
  listingType?: ListingTypeFilter,
): Promise<Schema<"PaginatedPublicListingList"> | "page-not-found" | null> {
  try {
    const { data, response } = await publicApi.GET("/api/v1/public/listings/", {
      params: { query: { agency, page, page_size: LISTINGS_PAGE_SIZE, listing_type: listingType } },
    });
    if (response.status === 404) return "page-not-found";
    return data ?? null;
  } catch {
    return null;
  }
}
